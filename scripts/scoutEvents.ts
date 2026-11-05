/**
 * scoutEvents.ts — timeline event candidates from aib vote news.
 *
 * The History view's events stop in 2023. aib vote publishes curated AI news
 * every day in en/ko/ja. This script:
 *   1. fetches aib vote's PUBLIC RSS feeds (/feed.xml?lang=en|ko|ja — CDN
 *      cached, the same URLs any feed reader uses; 3 requests per run, no aib
 *      database access, nothing written to aib),
 *   2. asks TypeSafe Jev, per story, P(a history of computing written ten
 *      years from now would record this) — calibrated, no text generation,
 *   3. links related graph nodes in CODE (label / keyword matching — Jev cannot
 *      compare lists reliably), and
 *   4. queues candidates ≥ --min in siliconage `event_candidates` (0009) for
 *      /admin review. Approved ones flow into the site via export-approved.
 *
 * The feed holds only the latest ~30 stories, so run it regularly
 * (e.g. daily or weekly) — already-seen articles (queued, decided, or
 * auto-skipped below --min) are skipped by id; --rescore re-judges the
 * auto-skipped ones.
 *
 * Usage:
 *   npm run scout-events -- --dry-run
 *   npm run scout-events -- --min 0.6
 *
 * Env: OPENROUTER_API_KEY (Jev), VITE_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (siliconage writes).
 */

import 'dotenv/config';
import crypto from 'crypto';
import { getServiceClient } from '../services/supabaseClient';
import { jevDecide, noulOf, JEV_MODEL, type JevQuestion } from '../services/jevClient';
import { GRAPH_DATA } from '../data/graphData';
import { AIB_BASE_URL, AIB_NODE_MAP } from '../config/aibLinks';

const argv = process.argv.slice(2);
const DRY = argv.includes('--dry-run');
const MIN = (() => { const i = argv.indexOf('--min'); return i >= 0 ? Number(argv[i + 1]) : 0.6; })();
const BATCH = 10;
// Stories below --min are stored as status='rejected' with decided_at NULL
// (auto-skipped, never shown in /admin) so they are not re-scored every run.
// --rescore re-judges those auto-skipped rows.
const RESCORE = argv.includes('--rescore');
// aib vote's firewall rate-limits generic HTTP-library user agents per IP;
// a distinctive UA without "bot"/"crawl" keeps a 3-request run well clear.
const UA = 'SiliconAge-EventScout/1.0 (+https://siliconage.org)';

type Locale = 'en' | 'ko' | 'ja';

interface FeedItem { slug: string; url: string; title: string; description: string; pubDate: Date; keywords: string[] }

const decode = (s: string) => s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .trim();
const tag = (block: string, name: string) => {
    const m = new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`).exec(block);
    return m ? decode(m[1]) : '';
};

async function fetchFeed(locale: Locale): Promise<FeedItem[]> {
    const res = await fetch(`${AIB_BASE_URL}/feed.xml?lang=${locale}`, { headers: { 'User-Agent': UA, 'Accept': 'application/rss+xml' } });
    if (!res.ok) throw new Error(`feed ${locale}: HTTP ${res.status}`);
    const xml = await res.text();
    const items: FeedItem[] = [];
    for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
        const block = m[1];
        const url = tag(block, 'link');
        const slug = /\/news\/([^/?#]+)/.exec(url)?.[1];
        if (!slug) continue;
        items.push({
            slug,
            url,
            title: tag(block, 'title'),
            description: tag(block, 'description'),
            pubDate: new Date(tag(block, 'pubDate')),
            keywords: [...block.matchAll(/<category>([\s\S]*?)<\/category>/g)].map(c => decode(c[1]).toLowerCase()),
        });
    }
    return items;
}

// Related nodes, matched in code: whole-word label / id / aib keyword hits.
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const matchers = GRAPH_DATA.nodes
    .map(n => {
        const terms = new Set<string>([n.label.toLowerCase()]);
        const kw = AIB_NODE_MAP[n.id]?.keyword;
        if (kw) terms.add(kw.toLowerCase());
        return { id: n.id, terms: [...terms].filter(t => t.length >= 3) };
    })
    .filter(m => m.terms.length > 0);

function relatedNodes(item: FeedItem): string[] {
    const text = `${item.title} ${item.description}`.toLowerCase();
    const hits = matchers
        .map(m => ({ id: m.id, score: m.terms.reduce((acc, t) =>
            acc + (new RegExp(`(^|[^a-z0-9])${escapeRe(t)}([^a-z0-9]|$)`).test(text) ? 2 : 0) + (item.keywords.includes(t) ? 1 : 0), 0) }))
        .filter(h => h.score > 0)
        .sort((a, b) => b.score - a.score);
    return hits.slice(0, 5).map(h => h.id);
}

const MILESTONE = (k: string) =>
    `Story ${k}: would a history of computing and AI written ten years from now record this as a milestone ` +
    `(a landmark release, founding, acquisition, regulation, breakthrough or turning point)? ` +
    `False for routine updates, rumors, opinion, funding rounds without lasting impact, benchmarks, pricing changes, minor launches.`;

async function main() {
    const feeds = await Promise.all((['en', 'ko', 'ja'] as const).map(async l => [l, await fetchFeed(l)] as const));
    const byLocale = Object.fromEntries(feeds) as Record<Locale, FeedItem[]>;
    const ko = new Map(byLocale.ko.map(i => [i.slug, i]));
    const ja = new Map(byLocale.ja.map(i => [i.slug, i]));
    const items = byLocale.en.filter(i => i.title && !Number.isNaN(i.pubDate.getTime()));
    console.log(`[scout-events] feed items: en=${byLocale.en.length} ko=${byLocale.ko.length} ja=${byLocale.ja.length}`);

    const idFor = (i: FeedItem) => `ev_${crypto.createHash('sha1').update(`aib:${i.slug}`).digest('hex').slice(0, 12)}`;
    const sb = DRY ? null : getServiceClient();
    let seen = new Set<string>();
    if (sb) {
        const ids = items.map(idFor);
        const { data, error } = await sb.from('event_candidates').select('id, status, decided_at').in('id', ids);
        if (error) throw new Error(`event_candidates read failed: ${error.message} (is migration 0009 applied?)`);
        seen = new Set(((data as Array<{ id: string; status: string; decided_at: string | null }>) ?? [])
            .filter(r => !(RESCORE && r.status === 'rejected' && r.decided_at === null))
            .map(r => r.id));
    }
    const fresh = items.filter(i => !seen.has(idFor(i)));
    console.log(`[scout-events] ${fresh.length} new stories (model=${JEV_MODEL}, min=${MIN}, dry=${DRY})`);

    let queued = 0, cost = 0;
    for (let b = 0; b < fresh.length; b += BATCH) {
        const batch = fresh.slice(b, b + BATCH);
        const questions: Record<string, JevQuestion> = {};
        batch.forEach((_, j) => { questions[`s${j}`] = { type: 'noul', instructions: MILESTONE(`s${j}`) }; });
        let res;
        try {
            res = await jevDecide({
                task: 'Pick news stories that belong on a long-term timeline of digital history',
                stories: batch.map((i, j) => ({ key: `s${j}`, title: i.title, summary: i.description.slice(0, 400), date: i.pubDate.toISOString().slice(0, 10) })),
            }, questions);
        } catch (err) {
            console.warn(`[scout-events] batch ${b} failed: ${(err as Error).message}`);
            continue;
        }
        cost += res.usage?.cost ?? 0;

        for (let j = 0; j < batch.length; j++) {
            const item = batch[j];
            const p = noulOf(res, `s${j}`) ?? 0;
            const related = relatedNodes(item);
            console.log(`  ${p >= MIN ? '✓' : '·'} ${p.toFixed(2)} ${item.pubDate.toISOString().slice(0, 10)} ${item.title.slice(0, 70)}${related.length ? `  [${related.join(', ')}]` : ''}`);
            if (!sb) continue;
            const { error } = await sb.from('event_candidates').upsert({
                id: idFor(item),
                year: item.pubDate.getUTCFullYear(),
                story_en: item.title,
                story_ko: ko.get(item.slug)?.title ?? null,
                story_ja: ja.get(item.slug)?.title ?? null,
                related_nodes: related,
                source_url: item.url,
                published_at: item.pubDate.toISOString(),
                jev_milestone: p,
                jev_model: res.model,
                // Below threshold → auto-skipped (rejected, decided_at NULL).
                status: p >= MIN ? 'pending' : 'rejected',
            } as never, { onConflict: 'id', ignoreDuplicates: !RESCORE });
            if (error) { console.warn(`    queue failed: ${error.message}`); continue; }
            if (p >= MIN) queued++;
        }
    }
    console.log(`[scout-events] queued=${queued} cost≈$${cost.toFixed(4)}${DRY ? ' (dry run — nothing written)' : ''}`);
}

main().catch(err => { console.error('[scout-events] FAILED:', err); process.exit(1); });
