/**
 * graphData.ts — the graph the site actually renders.
 *
 *   constants.ts (INITIAL_DATA)   hand-curated SOT — seedSupabase.ts seeds it
 *                                 as provenance='curated'; never mix other
 *                                 data into it.
 *   data/approved.json            nodes/links an editor approved in /admin
 *                                 (Wikidata BFS, aib vote imports …), exported
 *                                 by scripts/exportApproved.ts and committed.
 *
 * GRAPH_DATA = curated ∪ approved. Curated always wins on an id clash, and
 * approved links are kept only when both ends exist, so a bad export can never
 * break or overwrite the curated graph. Builds stay deterministic and offline:
 * nothing is fetched at build or run time.
 */

import { INITIAL_DATA } from '../constants';
import type { GraphData, LinkData, NodeData, EventData } from '../types';
import { registerExtraTranslations } from '../utils/i18n';
import approvedJson from './approved.json';

export interface ApprovedExport {
    generated_at: string | null;
    nodes: NodeData[];
    links: LinkData[];
    events?: EventData[];
}

const approved = approvedJson as unknown as ApprovedExport;

const endId = (e: LinkData['source']) => (typeof e === 'string' ? e : e.id);

function merge(base: GraphData, extra: ApprovedExport): GraphData {
    const ids = new Set(base.nodes.map(n => n.id));
    const nodes = [...base.nodes];
    for (const n of extra.nodes ?? []) {
        if (ids.has(n.id)) continue;
        ids.add(n.id);
        nodes.push({ ...n });
    }

    const linkKey = (l: LinkData) => `${endId(l.source)}__${endId(l.target)}__${l.type}`;
    const seen = new Set(base.links.map(linkKey));
    const links = [...base.links];
    for (const l of extra.links ?? []) {
        if (!ids.has(endId(l.source)) || !ids.has(endId(l.target))) continue;
        const k = linkKey(l);
        if (seen.has(k)) continue;
        seen.add(k);
        links.push({ ...l });
    }

    const eventIds = new Set((base.events ?? []).map(e => e.id));
    const events = [...(base.events ?? [])];
    for (const e of extra.events ?? []) {
        if (eventIds.has(e.id)) continue;
        eventIds.add(e.id);
        events.push({ ...e, relatedNodes: (e.relatedNodes ?? []).filter(id => ids.has(id)) });
    }

    return { nodes, links, events };
}

export const GRAPH_DATA: GraphData = merge(INITIAL_DATA, approved);
export const APPROVED_COUNT = {
    nodes: GRAPH_DATA.nodes.length - INITIAL_DATA.nodes.length,
    links: GRAPH_DATA.links.length - INITIAL_DATA.links.length,
    events: (GRAPH_DATA.events?.length ?? 0) - (INITIAL_DATA.events?.length ?? 0),
};

// Make ko/ja labels of approved additions visible to translateNode/translateLink.
for (const loc of ['ko', 'ja'] as const) {
    const nodeTr: Record<string, { label?: string; description?: string }> = {};
    for (const n of approved.nodes ?? []) if (n.i18n?.[loc]) nodeTr[n.id] = n.i18n[loc]!;
    const linkTr: Record<string, { story?: string }> = {};
    for (const l of approved.links ?? []) if (l.i18n?.[loc]) linkTr[`${endId(l.source)}__${endId(l.target)}`] = l.i18n[loc]!;
    const eventTr: Record<string, { story?: string }> = {};
    for (const e of approved.events ?? []) if (e.i18n?.[loc]) eventTr[e.id] = e.i18n[loc]!;
    registerExtraTranslations(loc, nodeTr, linkTr, eventTr);
}
