/// <reference types="vite/client" />
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getDevAdminClient } from '../../services/supabaseClient';

interface PendingNode {
    id: string;
    label: string;
    category: 'COMPANY' | 'PERSON' | 'TECHNOLOGY';
    year: number;
    description: string | null;
    impact_role: string | null;
    tech_l1: string | null;
    tech_l2: string | null;
    company_categories: string[] | null;
    relevance_score: number | null;
    sitelinks_count: number | null;
    wikidata_qid: string | null;
    discovered_from: string | null;
    discovery_depth: number | null;
    wikipedia_urls: Record<string, string> | null;
}

type Tab = 'pending-nodes' | 'pending-links' | 'stats';

const CATEGORY_TINT: Record<PendingNode['category'], string> = {
    COMPANY: 'bg-cyan-500/15 text-cyan-200 border-cyan-700/50',
    PERSON: 'bg-amber-500/15 text-amber-200 border-amber-700/50',
    TECHNOLOGY: 'bg-emerald-500/15 text-emerald-200 border-emerald-700/50',
};

const AdminDashboard: React.FC = () => {
    const admin = useMemo(() => getDevAdminClient(), []);
    const [tab, setTab] = useState<Tab>('pending-nodes');
    const [rows, setRows] = useState<PendingNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [filter, setFilter] = useState<'all' | 'COMPANY' | 'PERSON' | 'TECHNOLOGY'>('all');
    const [stats, setStats] = useState<{ pending: number; approved: number; excluded: number; qa_cache: number } | null>(null);

    const refresh = useCallback(async () => {
        if (!admin) return;
        setLoading(true);
        setError(null);
        try {
            // Pending nodes
            const { data: pending, error: e1 } = await admin
                .from('nodes')
                .select('id, label, category, year, description, impact_role, tech_l1, tech_l2, company_categories, relevance_score, sitelinks_count, wikidata_qid, discovered_from, discovery_depth, wikipedia_urls')
                .eq('provenance', 'ai_discovered')
                .is('approved_at', null)
                .order('relevance_score', { ascending: false, nullsFirst: false })
                .limit(2000);
            if (e1) throw e1;
            setRows((pending as PendingNode[]) ?? []);

            // Stats (light)
            const [{ count: pendingC }, { count: approvedC }, { count: excludedC }, { count: cacheC }] = await Promise.all([
                admin.from('nodes').select('id', { count: 'exact', head: true }).eq('provenance', 'ai_discovered').is('approved_at', null),
                admin.from('nodes').select('id', { count: 'exact', head: true }).not('approved_at', 'is', null),
                admin.from('wikidata_excluded').select('qid', { count: 'exact', head: true }),
                admin.from('qa_cache').select('query_hash', { count: 'exact', head: true }),
            ]);
            setStats({
                pending: pendingC ?? 0,
                approved: approvedC ?? 0,
                excluded: excludedC ?? 0,
                qa_cache: cacheC ?? 0,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    }, [admin]);

    useEffect(() => { void refresh(); }, [refresh]);

    const filtered = useMemo(() =>
        filter === 'all' ? rows : rows.filter(r => r.category === filter),
        [rows, filter]);

    const allSelected = filtered.length > 0 && filtered.every(r => selected.has(r.id));
    const toggleAll = () => {
        const next = new Set(selected);
        if (allSelected) filtered.forEach(r => next.delete(r.id));
        else filtered.forEach(r => next.add(r.id));
        setSelected(next);
    };
    const toggleOne = (id: string) => {
        const next = new Set(selected);
        if (next.has(id)) next.delete(id); else next.add(id);
        setSelected(next);
    };

    const approve = useCallback(async () => {
        if (!admin || selected.size === 0 || busy) return;
        if (!confirm(`Approve ${selected.size} nodes? They will become visible on the site.`)) return;
        setBusy(true);
        setError(null);
        try {
            const ids = [...selected];
            const { error: e1 } = await admin
                .from('nodes')
                .update({ approved_at: new Date().toISOString() })
                .in('id', ids);
            if (e1) throw e1;
            // Also approve their incoming/outgoing ai_discovered links so the
            // graph stays connected.
            const NOW = new Date().toISOString();
            await admin
                .from('links')
                .update({ approved_at: NOW })
                .eq('provenance', 'ai_discovered')
                .or(`source_id.in.(${ids.map(i => `"${i}"`).join(',')}),target_id.in.(${ids.map(i => `"${i}"`).join(',')})`);
            setSelected(new Set());
            await refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setBusy(false);
        }
    }, [admin, busy, refresh, selected]);

    const reject = useCallback(async () => {
        if (!admin || selected.size === 0 || busy) return;
        if (!confirm(`Reject and DELETE ${selected.size} nodes? Their wikidata_qid will be added to the negative cache.`)) return;
        setBusy(true);
        setError(null);
        try {
            const ids = [...selected];
            const qids = rows.filter(r => ids.includes(r.id) && r.wikidata_qid).map(r => r.wikidata_qid!);
            // Negative-cache the Q-ids so BFS does not surface them again.
            if (qids.length > 0) {
                await admin
                    .from('wikidata_excluded')
                    .upsert(qids.map(qid => ({ qid, reason: 'admin reject' })) as never, { onConflict: 'qid' });
            }
            // Hard delete nodes; ON DELETE CASCADE removes translations + links.
            const { error: e2 } = await admin.from('nodes').delete().in('id', ids);
            if (e2) throw e2;
            setSelected(new Set());
            await refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setBusy(false);
        }
    }, [admin, busy, refresh, rows, selected]);

    if (!admin) {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
                <h1 className="text-2xl font-semibold mb-3">/admin unavailable</h1>
                <p className="text-slate-400 text-sm max-w-xl">
                    The admin client needs <code className="bg-slate-800 px-1.5 py-0.5 rounded-sm">VITE_SUPABASE_SERVICE_ROLE_KEY</code> in <code className="bg-slate-800 px-1.5 py-0.5 rounded-sm">.env.local</code> and a dev build (this route is stripped from production).
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
            <div className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold">Silicon Age — Admin</h1>
                    <p className="text-xs text-slate-500">Dev-only · service_role · Phase 5 MVP</p>
                </div>
                <button
                    type="button"
                    onClick={() => { void refresh(); }}
                    className="px-3 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 rounded-sm"
                >
                    Refresh
                </button>
            </div>

            <div className="flex">
                {/* Sidebar */}
                <nav className="w-48 border-r border-slate-800 p-3 space-y-1">
                    {([
                        ['pending-nodes', `Pending Nodes${stats ? ` (${stats.pending})` : ''}`],
                        ['stats', 'Stats'],
                    ] as Array<[Tab, string]>).map(([key, label]) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setTab(key)}
                            className={`w-full text-left px-3 py-2 text-sm rounded-sm transition-colors ${tab === key ? 'bg-emerald-600/20 text-emerald-200' : 'hover:bg-slate-800 text-slate-300'}`}
                        >
                            {label}
                        </button>
                    ))}
                </nav>

                {/* Main */}
                <main className="flex-1 p-4">
                    {error && (
                        <div className="mb-3 p-3 bg-rose-900/40 border border-rose-700/60 text-rose-100 rounded-sm text-sm">
                            {error}
                        </div>
                    )}

                    {tab === 'stats' && stats && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl">
                            {([['Pending', stats.pending], ['Approved', stats.approved], ['Excluded Q-ids', stats.excluded], ['QA cache rows', stats.qa_cache]] as const).map(([k, v]) => (
                                <div key={k} className="bg-slate-900 border border-slate-800 rounded-sm p-4">
                                    <div className="text-xs uppercase tracking-wider text-slate-500">{k}</div>
                                    <div className="text-2xl font-semibold mt-1">{v}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {tab === 'pending-nodes' && (
                        <>
                            <div className="flex items-center gap-3 mb-3">
                                <select
                                    value={filter}
                                    onChange={e => setFilter(e.target.value as typeof filter)}
                                    className="bg-slate-900 border border-slate-800 text-slate-100 text-sm rounded-sm px-2 py-1.5"
                                >
                                    <option value="all">All categories ({rows.length})</option>
                                    <option value="COMPANY">COMPANY ({rows.filter(r => r.category === 'COMPANY').length})</option>
                                    <option value="PERSON">PERSON ({rows.filter(r => r.category === 'PERSON').length})</option>
                                    <option value="TECHNOLOGY">TECHNOLOGY ({rows.filter(r => r.category === 'TECHNOLOGY').length})</option>
                                </select>
                                <div className="text-xs text-slate-500">{selected.size} selected</div>
                                <div className="flex-1" />
                                <button
                                    type="button"
                                    disabled={busy || selected.size === 0}
                                    onClick={() => { void approve(); }}
                                    className="px-3 py-1.5 text-sm bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 rounded-sm transition-colors"
                                >
                                    Approve ({selected.size})
                                </button>
                                <button
                                    type="button"
                                    disabled={busy || selected.size === 0}
                                    onClick={() => { void reject(); }}
                                    className="px-3 py-1.5 text-sm bg-rose-700 hover:bg-rose-600 disabled:bg-slate-700 disabled:text-slate-500 rounded-sm transition-colors"
                                >
                                    Reject ({selected.size})
                                </button>
                            </div>

                            {loading && <div className="text-slate-400 text-sm">Loading…</div>}

                            {!loading && (
                                <div className="border border-slate-800 rounded-sm overflow-hidden">
                                    <div className="grid grid-cols-[40px_1fr_100px_60px_90px_1fr_60px] gap-2 px-3 py-2 bg-slate-900 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-800 sticky top-0">
                                        <div>
                                            <input
                                                type="checkbox"
                                                checked={allSelected}
                                                onChange={toggleAll}
                                                className="accent-emerald-500"
                                            />
                                        </div>
                                        <div>Label / role</div>
                                        <div>Category</div>
                                        <div>Year</div>
                                        <div>Score · Sitelinks</div>
                                        <div>Description</div>
                                        <div>Wiki</div>
                                    </div>
                                    <div className="max-h-[calc(100vh-220px)] overflow-y-auto">
                                        {filtered.map(r => (
                                            <label
                                                key={r.id}
                                                className={`grid grid-cols-[40px_1fr_100px_60px_90px_1fr_60px] gap-2 px-3 py-2 border-b border-slate-800/50 text-sm cursor-pointer hover:bg-slate-900/50 ${selected.has(r.id) ? 'bg-emerald-900/15' : ''}`}
                                            >
                                                <div>
                                                    <input
                                                        type="checkbox"
                                                        checked={selected.has(r.id)}
                                                        onChange={() => toggleOne(r.id)}
                                                        className="accent-emerald-500"
                                                    />
                                                </div>
                                                <div>
                                                    <div className="text-slate-100">{r.label}</div>
                                                    <div className="text-xs text-slate-500 font-mono truncate">{r.id}</div>
                                                    {r.impact_role && <div className="text-[11px] text-slate-400 mt-0.5">{r.impact_role}{r.tech_l2 ? ` · ${r.tech_l2}` : ''}</div>}
                                                </div>
                                                <div>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-sm border ${CATEGORY_TINT[r.category]}`}>{r.category}</span>
                                                </div>
                                                <div className="text-slate-300">{r.year || '—'}</div>
                                                <div className="text-slate-300 text-xs">
                                                    <div>{(r.relevance_score ?? 0).toFixed(1)}</div>
                                                    <div className="text-slate-500">{r.sitelinks_count ?? 0} sl</div>
                                                </div>
                                                <div className="text-slate-400 text-xs line-clamp-2">{r.description ?? '—'}</div>
                                                <div className="text-xs">
                                                    {r.wikipedia_urls && r.wikipedia_urls.en ? (
                                                        <a
                                                            href={r.wikipedia_urls.en}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="text-cyan-400 hover:underline"
                                                        >
                                                            en
                                                        </a>
                                                    ) : (
                                                        <span className="text-slate-600">—</span>
                                                    )}
                                                    {r.wikidata_qid && (
                                                        <a
                                                            href={`https://www.wikidata.org/wiki/${r.wikidata_qid}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="ml-2 text-purple-400 hover:underline"
                                                        >
                                                            {r.wikidata_qid}
                                                        </a>
                                                    )}
                                                </div>
                                            </label>
                                        ))}
                                        {filtered.length === 0 && (
                                            <div className="px-4 py-8 text-center text-slate-500 text-sm">
                                                No pending nodes in this filter. 🎉
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
