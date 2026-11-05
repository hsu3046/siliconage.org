/**
 * prerender.ts — post-build static pages + open data export.
 *
 * The app is a client-only SPA: before this step every URL (/company/apple,
 * /tech/transistor …) served the same empty <div id="root">, so search engines
 * and AI crawlers saw one page with no entity content at all.
 *
 * After `vite build` this script writes, for every node × locale:
 *   dist/company/apple.html                (en, canonical)
 *   dist/ko/company/apple.html             (ko)
 *   dist/ja/company/apple.html             (ja)
 * Each page carries a localized <title>/description, canonical + hreflang,
 * JSON-LD (Organization / Person / DefinedTerm + BreadcrumbList) and a
 * readable fallback article inside #root (name, description, connections with
 * their stories). React's createRoot replaces that markup on boot, so users
 * get the normal app; crawlers and no-JS readers get real content. Vercel
 * serves these files before the SPA rewrite (filesystem first).
 *
 * It also emits:
 *   dist/sitemap.xml                 all pages with xhtml:link hreflang alternates
 *   dist/llms.txt                    plain-language site map for AI agents
 *   dist/data/graph.json             compact graph (open data, CORS-enabled)
 *   dist/data/lineage/<id>.json      "what led to this" chains — consumed by
 *                                    aib vote model/lab pages (sister site)
 *
 * Usage: runs automatically from `npm run build`. Standalone: npx tsx scripts/prerender.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GRAPH_DATA as INITIAL_DATA } from '../data/graphData';
import { Category, LinkType, type NodeData, type LinkData } from '../types';
import { getAibLinks } from '../config/aibLinks';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const BASE_URL = 'https://siliconage.org';
const TODAY = new Date().toISOString().split('T')[0];

type Locale = 'en' | 'ko' | 'ja';
const LOCALES: Locale[] = ['en', 'ko', 'ja'];

const CATEGORY_PATH: Record<Category, string> = {
    [Category.COMPANY]: 'company',
    [Category.PERSON]: 'person',
    [Category.TECHNOLOGY]: 'tech',
};

const T: Record<Locale, {
    cat: Record<Category, string>;
    linkType: Record<LinkType, string>;
    connections: string;
    explore: string;
    since: string;
    siteTitle: string;
    siteDescription: string;
    allEntities: string;
    aibTitle: string;
    aibLab: string;
    aibRanking: string;
    aibNews: string;
    ogLocale: string;
    whyItMatters: string;
    keyFacts: string;
    aiNote: string;
}> = {
    en: {
        cat: { [Category.COMPANY]: 'Company', [Category.PERSON]: 'Person', [Category.TECHNOLOGY]: 'Technology' },
        linkType: { [LinkType.POWERS]: 'Powers', [LinkType.CREATES]: 'Created', [LinkType.CONTRIBUTES]: 'Influenced', [LinkType.ENGAGES]: 'Rivalry / partnership' },
        connections: 'Connections',
        explore: 'Explore the interactive map',
        since: 'since',
        siteTitle: 'The Silicon Age | Interactive Map of AI History',
        siteDescription: 'Explore 100 years of digital history as a web of cause and effect — the companies, people and technologies that led to the AI era.',
        allEntities: 'All entities',
        aibTitle: 'Now on aib vote',
        aibLab: 'Current models & rankings',
        aibRanking: 'AI model rankings',
        aibNews: 'Latest news',
        ogLocale: 'en_US',
        whyItMatters: 'Why it matters',
        keyFacts: 'Key facts',
        aiNote: 'AI-generated overview, checked against the curated graph.',
    },
    ko: {
        cat: { [Category.COMPANY]: '기업', [Category.PERSON]: '인물', [Category.TECHNOLOGY]: '기술' },
        linkType: { [LinkType.POWERS]: '기반 제공', [LinkType.CREATES]: '창조', [LinkType.CONTRIBUTES]: '영향', [LinkType.ENGAGES]: '경쟁 / 협력' },
        connections: '연결 관계',
        explore: '인터랙티브 지도에서 보기',
        since: '시작',
        siteTitle: 'The Silicon Age | 인터랙티브 AI 역사 지도',
        siteDescription: '100년 디지털 역사를 인과관계의 네트워크로 — AI 시대를 만든 기업·인물·기술을 한눈에 탐구하세요.',
        allEntities: '전체 항목',
        aibTitle: '지금 aib vote에서',
        aibLab: '현재 모델과 순위',
        aibRanking: 'AI 모델 순위',
        aibNews: '최신 뉴스',
        ogLocale: 'ko_KR',
        whyItMatters: '왜 중요한가',
        keyFacts: '핵심 사실',
        aiNote: 'AI가 작성하고 큐레이션된 그래프와 대조해 검사한 개요입니다.',
    },
    ja: {
        cat: { [Category.COMPANY]: '企業', [Category.PERSON]: '人物', [Category.TECHNOLOGY]: '技術' },
        linkType: { [LinkType.POWERS]: '基盤', [LinkType.CREATES]: '創出', [LinkType.CONTRIBUTES]: '影響', [LinkType.ENGAGES]: '競争 / 協力' },
        connections: 'つながり',
        explore: 'インタラクティブマップで見る',
        since: '開始',
        siteTitle: 'The Silicon Age | インタラクティブAI史マップ',
        siteDescription: '100年のデジタル史を因果関係のネットワークで — AI時代を生んだ企業・人物・技術を探求しよう。',
        allEntities: 'すべての項目',
        aibTitle: 'いま aib vote で',
        aibLab: '現在のモデルとランキング',
        aibRanking: 'AIモデルランキング',
        aibNews: '最新ニュース',
        ogLocale: 'ja_JP',
        whyItMatters: 'なぜ重要か',
        keyFacts: '主な事実',
        aiNote: 'AIが作成し、キュレーションされたグラフと照合した概要です。',
    },
};

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
type NodeTr = Record<string, { label?: string; description?: string; primaryRole?: string }>;
type LinkTr = Record<string, { story?: string }>;

function readJson<T>(file: string): T {
    try { return JSON.parse(fs.readFileSync(file, 'utf-8')) as T; } catch { return {} as T; }
}

const nodeTr: Record<Locale, NodeTr> = { en: {}, ko: {}, ja: {} };
const linkTr: Record<Locale, LinkTr> = { en: {}, ko: {}, ja: {} };
for (const loc of ['ko', 'ja'] as const) {
    nodeTr[loc] = readJson<NodeTr>(path.join(ROOT, 'locales', loc, 'nodes.json'));
    linkTr[loc] = readJson<LinkTr>(path.join(ROOT, 'locales', loc, 'links.json'));
}

const nodes: NodeData[] = INITIAL_DATA.nodes;
const byId = new Map(nodes.map(n => [n.id, n]));
const endId = (e: LinkData['source']) => (typeof e === 'string' ? e : e.id);

const nodeI18n = (n: NodeData, loc: Locale) => (loc === 'en' ? undefined : n.i18n?.[loc]);
const label = (n: NodeData, loc: Locale) => nodeTr[loc][n.id]?.label || nodeI18n(n, loc)?.label || n.label;
const description = (n: NodeData, loc: Locale) =>
    nodeTr[loc][n.id]?.description || nodeI18n(n, loc)?.description || n.description || '';
const story = (l: LinkData, loc: Locale) => {
    const key = `${endId(l.source)}__${endId(l.target)}`;
    return linkTr[loc][key]?.story || (loc === 'en' ? undefined : l.i18n?.[loc]?.story) || l.story || '';
};

const pathFor = (n: NodeData, loc: Locale) =>
    `${loc === 'en' ? '' : `/${loc}`}/${CATEGORY_PATH[n.category]}/${n.id}`;
const urlFor = (n: NodeData, loc: Locale) => `${BASE_URL}${pathFor(n, loc)}`;
const homeUrl = (loc: Locale) => `${BASE_URL}${loc === 'en' ? '/' : `/${loc}/`}`;

const esc = (s: string) => s
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
// JSON inside <script>: neutralize "</script>" and HTML comment openers.
const jsonLd = (obj: unknown) => JSON.stringify(obj).replace(/</g, '\\u003c');

const truncate = (s: string, max: number) => (s.length <= max ? s : `${s.slice(0, max - 1).trimEnd()}…`);

// ---------------------------------------------------------------------------
// Template surgery
// ---------------------------------------------------------------------------
const templatePath = path.join(DIST, 'index.html');
if (!fs.existsSync(templatePath)) {
    console.error('[prerender] dist/index.html missing — run `vite build` first.');
    process.exit(1);
}
const TEMPLATE = fs.readFileSync(templatePath, 'utf-8');

function setMeta(html: string, attr: 'name' | 'property', key: string, value: string): string {
    const re = new RegExp(`(<meta\\s+${attr}="${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"\\s+content=")[^"]*(")`, 's');
    return re.test(html) ? html.replace(re, `$1${esc(value)}$2`) : html;
}

interface PageSpec {
    loc: Locale;
    title: string;
    description: string;
    canonical: string;
    alternates: Record<Locale, string>;
    ldJson: unknown[];
    body: string;
}

const FALLBACK_STYLE = `<style>.sa-ssr{max-width:760px;margin:0 auto;padding:40px 16px 64px;font-family:Inter,system-ui,sans-serif;line-height:1.65;color:#e2e8f0}.sa-ssr a{color:#93c5fd}.sa-ssr h1{font-size:2rem;margin:0 0 4px}.sa-ssr .meta{color:#94a3b8;font-size:.9rem;margin:0 0 20px}.sa-ssr h2{font-size:1.05rem;margin:28px 0 8px;color:#cbd5e1}.sa-ssr ul{padding-left:1.1rem}.sa-ssr li{margin:6px 0}.sa-ssr .story{color:#94a3b8}.sa-ssr nav{margin-bottom:24px;font-size:.9rem}</style>`;

function renderPage(spec: PageSpec): string {
    let html = TEMPLATE;
    html = html.replace(/<html lang="[^"]*">/, `<html lang="${spec.loc}">`);
    html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(spec.title)}</title>`);
    html = setMeta(html, 'name', 'title', spec.title);
    html = setMeta(html, 'name', 'description', spec.description);
    html = setMeta(html, 'property', 'og:title', spec.title);
    html = setMeta(html, 'property', 'og:description', spec.description);
    html = setMeta(html, 'property', 'og:url', spec.canonical);
    html = setMeta(html, 'property', 'og:locale', T[spec.loc].ogLocale);
    html = setMeta(html, 'property', 'twitter:title', spec.title);
    html = setMeta(html, 'property', 'twitter:description', spec.description);
    html = setMeta(html, 'property', 'twitter:url', spec.canonical);
    // The template states language="English" for the whole site — drop it on
    // localized pages (html[lang] + hreflang are the real signals).
    html = html.replace(/\s*<meta name="language" content="[^"]*">/, '');

    const head = [
        `<link rel="canonical" href="${esc(spec.canonical)}">`,
        ...LOCALES.map(l => `<link rel="alternate" hreflang="${l}" href="${esc(spec.alternates[l])}">`),
        `<link rel="alternate" hreflang="x-default" href="${esc(spec.alternates.en)}">`,
        ...spec.ldJson.map(obj => `<script type="application/ld+json">${jsonLd(obj)}</script>`),
        FALLBACK_STYLE,
    ].join('\n  ');
    html = html.replace('</head>', `  ${head}\n</head>`);
    html = html.replace('<div id="root"></div>', `<div id="root">${spec.body}</div>`);
    return html;
}

// `/ko/company/apple` → dist/ko/company/apple.html. vercel.json sets
// cleanUrls, which serves `x.html` at `/x` (documented behaviour), and static
// files take precedence over the SPA rewrite.
function writePage(urlPath: string, html: string) {
    const file = path.join(DIST, `${urlPath.replace(/\/$/, '')}.html`);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, html);
}

// ---------------------------------------------------------------------------
// Node pages
// ---------------------------------------------------------------------------
function connectionsOf(n: NodeData) {
    return INITIAL_DATA.links
        .filter(l => endId(l.source) === n.id || endId(l.target) === n.id)
        .map(l => {
            const otherId = endId(l.source) === n.id ? endId(l.target) : endId(l.source);
            return { link: l, other: byId.get(otherId) };
        })
        .filter((c): c is { link: LinkData; other: NodeData } => !!c.other)
        .sort((a, b) => (b.link.strength - a.link.strength) || (a.other.year - b.other.year));
}

function entityLd(n: NodeData, loc: Locale) {
    const common = {
        '@context': 'https://schema.org',
        name: label(n, loc),
        description: description(n, loc),
        url: urlFor(n, loc),
        inLanguage: loc,
        ...(n.keywords?.length ? { keywords: n.keywords.join(', ') } : {}),
    };
    if (n.category === Category.COMPANY) {
        return { ...common, '@type': 'Organization', foundingDate: String(n.year) };
    }
    if (n.category === Category.PERSON) {
        return {
            ...common,
            '@type': 'Person',
            ...(n.birthYear ? { birthDate: String(n.birthYear) } : {}),
            ...(n.deathYear ? { deathDate: String(n.deathYear) } : {}),
            ...(n.primaryRole ? { jobTitle: nodeTr[loc][n.id]?.primaryRole || n.primaryRole } : {}),
        };
    }
    return {
        ...common,
        '@type': 'DefinedTerm',
        inDefinedTermSet: { '@type': 'DefinedTermSet', name: 'The Silicon Age', url: homeUrl(loc) },
        termCode: n.id,
    };
}

// Pre-generated Deep Dives (scripts/generateDeepDive.ts) — copied to dist by
// Vite from public/deepdive. Only files that passed the Jev check exist.
interface DeepDive { summary: string; significance: string; keyFacts: string[]; entity: string }
function deepDiveFor(id: string, loc: Locale): DeepDive | null {
    try {
        const d = JSON.parse(fs.readFileSync(path.join(DIST, 'deepdive', loc, `${id}.json`), 'utf-8')) as DeepDive;
        return d.entity === id && d.summary ? d : null;
    } catch { return null; }
}

function nodeBody(n: NodeData, loc: Locale): string {
    const t = T[loc];
    const conns = connectionsOf(n).slice(0, 40);
    const meta = [t.cat[n.category], n.category === Category.PERSON && n.birthYear
        ? `${n.birthYear}${n.deathYear ? `–${n.deathYear}` : ''}`
        : `${n.year}${n.endYear ? `–${n.endYear}` : ''}`]
        .join(' · ');
    const aib = getAibLinks(n, loc);
    const aibLabel = { lab: t.aibLab, ranking: t.aibRanking, news: t.aibNews } as const;
    return `<main class="sa-ssr">
<nav><a href="${homeUrl(loc)}">The Silicon Age</a> › ${esc(t.cat[n.category])}</nav>
<article>
<h1>${esc(label(n, loc))}</h1>
<p class="meta">${esc(meta)}</p>
<p>${esc(description(n, loc))}</p>
${(() => {
    const dd = deepDiveFor(n.id, loc);
    if (!dd) return '';
    return `<section>
<p>${esc(dd.summary)}</p>
<h2>${esc(t.whyItMatters)}</h2>
<p>${esc(dd.significance)}</p>
${dd.keyFacts.length ? `<h2>${esc(t.keyFacts)}</h2><ul>${dd.keyFacts.map(f => `<li>${esc(f)}</li>`).join('')}</ul>` : ''}
<p class="story"><small>${esc(t.aiNote)}</small></p>
</section>`;
})()}
${conns.length ? `<h2>${esc(t.connections)}</h2>
<ul>
${conns.map(({ link, other }) => {
    const s = story(link, loc);
    const years = link.startYear ? ` (${link.startYear}${link.endYear ? `–${link.endYear}` : ''})` : '';
    return `<li><a href="${pathFor(other, loc)}">${esc(label(other, loc))}</a> — ${esc(t.linkType[link.type])}${esc(years)}${s ? `<br><span class="story">${esc(s)}</span>` : ''}</li>`;
}).join('\n')}
</ul>` : ''}
${aib.length ? `<h2>${esc(t.aibTitle)}</h2>
<ul>${aib.map(a => `<li><a href="${esc(a.url)}" rel="noopener">${esc(aibLabel[a.kind])}</a></li>`).join('')}</ul>` : ''}
<p><a href="${pathFor(n, loc)}">${esc(t.explore)} →</a></p>
</article>
</main>`;
}

let pageCount = 0;
for (const n of nodes) {
    const alternates = Object.fromEntries(LOCALES.map(l => [l, urlFor(n, l)])) as Record<Locale, string>;
    for (const loc of LOCALES) {
        const name = label(n, loc);
        const t = T[loc];
        const title = `${name} (${n.category === Category.PERSON && n.birthYear ? n.birthYear : n.year}) — ${t.cat[n.category]} | The Silicon Age`;
        const html = renderPage({
            loc,
            title,
            description: truncate(description(n, loc), 158),
            canonical: urlFor(n, loc),
            alternates,
            ldJson: [
                entityLd(n, loc),
                {
                    '@context': 'https://schema.org',
                    '@type': 'BreadcrumbList',
                    itemListElement: [
                        { '@type': 'ListItem', position: 1, name: 'The Silicon Age', item: homeUrl(loc) },
                        { '@type': 'ListItem', position: 2, name, item: urlFor(n, loc) },
                    ],
                },
            ],
            body: nodeBody(n, loc),
        });
        writePage(pathFor(n, loc), html);
        pageCount++;
    }
}

// ---------------------------------------------------------------------------
// Home pages (crawlable index of every entity)
// ---------------------------------------------------------------------------
const CAT_ORDER = [Category.TECHNOLOGY, Category.COMPANY, Category.PERSON];
for (const loc of LOCALES) {
    const t = T[loc];
    const sections = CAT_ORDER.map(cat => {
        const items = nodes.filter(n => n.category === cat).sort((a, b) => a.year - b.year);
        return `<h2>${esc(t.cat[cat])} (${items.length})</h2>
<ul>${items.map(n => `<li><a href="${pathFor(n, loc)}">${esc(label(n, loc))}</a> <span class="story">${n.year}</span></li>`).join('')}</ul>`;
    }).join('\n');
    const body = `<main class="sa-ssr"><h1>The Silicon Age</h1><p>${esc(t.siteDescription)}</p><h2>${esc(t.allEntities)}</h2>${sections}</main>`;
    const html = renderPage({
        loc,
        title: t.siteTitle,
        description: t.siteDescription,
        canonical: homeUrl(loc),
        alternates: { en: homeUrl('en'), ko: homeUrl('ko'), ja: homeUrl('ja') },
        ldJson: [{
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'The Silicon Age',
            url: homeUrl(loc),
            inLanguage: loc,
            description: t.siteDescription,
            publisher: { '@type': 'Organization', name: 'KnowAI', url: 'https://www.aib.vote' },
        }],
        body,
    });
    if (loc === 'en') fs.writeFileSync(templatePath, html);
    else writePage(`/${loc}`, html);
    pageCount++;
}

// ---------------------------------------------------------------------------
// Sitemap with hreflang alternates
// ---------------------------------------------------------------------------
const altLinks = (alts: Record<Locale, string>) =>
    [...LOCALES.map(l => `    <xhtml:link rel="alternate" hreflang="${l}" href="${alts[l]}"/>`),
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${alts.en}"/>`].join('\n');

const sitemapEntries: string[] = [];
const homeAlts = { en: homeUrl('en'), ko: homeUrl('ko'), ja: homeUrl('ja') };
for (const loc of LOCALES) {
    sitemapEntries.push(`  <url>\n    <loc>${homeUrl(loc)}</loc>\n    <lastmod>${TODAY}</lastmod>\n${altLinks(homeAlts)}\n  </url>`);
}
for (const view of ['history', 'cards', 'links']) {
    sitemapEntries.push(`  <url>\n    <loc>${BASE_URL}/${view}</loc>\n    <lastmod>${TODAY}</lastmod>\n  </url>`);
}
for (const n of nodes) {
    const alts = Object.fromEntries(LOCALES.map(l => [l, urlFor(n, l)])) as Record<Locale, string>;
    for (const loc of LOCALES) {
        sitemapEntries.push(`  <url>\n    <loc>${alts[loc]}</loc>\n    <lastmod>${TODAY}</lastmod>\n${altLinks(alts)}\n  </url>`);
    }
}
fs.writeFileSync(path.join(DIST, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${sitemapEntries.join('\n')}\n</urlset>\n`);

// ---------------------------------------------------------------------------
// Open data: graph + lineage (consumed by aib vote)
// ---------------------------------------------------------------------------
const DATA = path.join(DIST, 'data');
fs.mkdirSync(path.join(DATA, 'lineage'), { recursive: true });

const multiLabel = (n: NodeData) => ({ en: n.label, ko: label(n, 'ko'), ja: label(n, 'ja') });

fs.writeFileSync(path.join(DATA, 'graph.json'), JSON.stringify({
    generated_at: new Date().toISOString(),
    license: 'GPL-3.0 (The Silicon Age, © KnowAI)',
    nodes: nodes.map(n => ({ id: n.id, label: multiLabel(n), category: n.category, year: n.year, url: urlFor(n, 'en') })),
    links: INITIAL_DATA.links.map(l => ({
        source: endId(l.source), target: endId(l.target), type: l.type,
        ...(l.startYear ? { startYear: l.startYear } : {}), ...(l.endYear ? { endYear: l.endYear } : {}),
    })),
}));

// "What led to X": walk incoming CREATES / POWERS / CONTRIBUTES edges.
// (ENGAGES = rivalry/partnership is lateral, not causal — excluded.)
const CAUSAL = new Set<LinkType>([LinkType.CREATES, LinkType.POWERS, LinkType.CONTRIBUTES]);
const incoming = new Map<string, LinkData[]>();
const outgoing = new Map<string, LinkData[]>();
for (const l of INITIAL_DATA.links) {
    if (!CAUSAL.has(l.type)) continue;
    const s = endId(l.source), t = endId(l.target);
    (incoming.get(t) ?? incoming.set(t, []).get(t)!).push(l);
    (outgoing.get(s) ?? outgoing.set(s, []).get(s)!).push(l);
}

function lineage(rootId: string, maxDepth = 3, maxNodes = 30) {
    const seen = new Set([rootId]);
    const out: Array<{ id: string; label: ReturnType<typeof multiLabel>; category: Category; year: number; depth: number; via: { type: LinkType; to: string; story?: string }; url: string }> = [];
    let frontier = [rootId];
    for (let depth = 1; depth <= maxDepth && frontier.length && out.length < maxNodes; depth++) {
        const next: string[] = [];
        for (const id of frontier) {
            const ins = (incoming.get(id) ?? []).slice().sort((a, b) => b.strength - a.strength);
            for (const l of ins) {
                const src = endId(l.source);
                const n = byId.get(src);
                if (!n || seen.has(src)) continue;
                seen.add(src);
                out.push({
                    id: n.id, label: multiLabel(n), category: n.category, year: n.year, depth,
                    via: { type: l.type, to: id, ...(l.story ? { story: l.story } : {}) },
                    url: urlFor(n, 'en'),
                });
                next.push(src);
                if (out.length >= maxNodes) break;
            }
        }
        frontier = next;
    }
    return out;
}

for (const n of nodes) {
    const descendants = (outgoing.get(n.id) ?? [])
        .map(l => byId.get(endId(l.target)))
        .filter((x): x is NodeData => !!x)
        .map(x => ({ id: x.id, label: multiLabel(x), category: x.category, year: x.year, url: urlFor(x, 'en') }));
    fs.writeFileSync(path.join(DATA, 'lineage', `${n.id}.json`), JSON.stringify({
        id: n.id,
        label: multiLabel(n),
        category: n.category,
        year: n.year,
        urls: { en: urlFor(n, 'en'), ko: urlFor(n, 'ko'), ja: urlFor(n, 'ja') },
        ancestors: lineage(n.id),
        descendants,
    }));
}

// ---------------------------------------------------------------------------
// llms.txt — a plain map for AI agents (https://llmstxt.org)
// ---------------------------------------------------------------------------
const llms = [
    '# The Silicon Age',
    '',
    `> ${T.en.siteDescription} ${nodes.length} curated entities (companies, people, technologies) linked by ${INITIAL_DATA.links.length} typed, dated relationships. Available in English, Korean and Japanese. Sister site: aib vote (https://www.aib.vote) — live AI model rankings, prices and news.`,
    '',
    '## Data',
    `- [Graph JSON](${BASE_URL}/data/graph.json): every node and relationship (POWERS, CREATES, CONTRIBUTES, ENGAGES)`,
    `- Lineage JSON: ${BASE_URL}/data/lineage/<node-id>.json — what led to an entity, up to 3 hops`,
    '',
    ...CAT_ORDER.flatMap(cat => [
        `## ${T.en.cat[cat]}`,
        ...nodes.filter(n => n.category === cat).sort((a, b) => a.year - b.year)
            .map(n => `- [${n.label} (${n.year})](${urlFor(n, 'en')}): ${truncate(n.description ?? '', 140)}`),
        '',
    ]),
].join('\n');
fs.writeFileSync(path.join(DIST, 'llms.txt'), llms);

console.log(`[prerender] ${pageCount} pages, sitemap (${sitemapEntries.length} urls), ${nodes.length} lineage files, graph.json, llms.txt`);
