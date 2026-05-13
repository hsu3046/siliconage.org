/// <reference types="vite/client" />
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    listPending, adminStats, approveNodes, rejectNodes,
    getAdminPassword, setAdminPassword, clearAdminPassword,
    type PendingNode, type AdminStats,
} from '../../services/adminService';

type Tab = 'pending-nodes' | 'stats';

const CATEGORY_TINT: Record<PendingNode['category'], string> = {
    COMPANY: 'bg-cyan-500/15 text-cyan-200 border-cyan-700/50',
    PERSON: 'bg-amber-500/15 text-amber-200 border-amber-700/50',
    TECHNOLOGY: 'bg-emerald-500/15 text-emerald-200 border-emerald-700/50',
};

const SIDEBAR_KEY = 'silicon_age_admin_sidebar';

const AdminDashboard: React.FC = () => {
    const [authed, setAuthed] = useState<boolean>(() => !!getAdminPassword());
    const [pwDraft, setPwDraft] = useState('');
    const [tab, setTab] = useState<Tab>('pending-nodes');
    const [rows, setRows] = useState<PendingNode[]>([]);
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [filter, setFilter] = useState<'all' | 'COMPANY' | 'PERSON' | 'TECHNOLOGY'>('all');
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
        try { return localStorage.getItem(SIDEBAR_KEY) !== '0'; } catch { return true; }
    });
    useEffect(() => {
        try { localStorage.setItem(SIDEBAR_KEY, sidebarOpen ? '1' : '0'); } catch { /* ignore */ }
    }, [sidebarOpen]);

    const refresh = useCallback(async () => {
        if (!authed) return;
        setLoading(true);
        setError(null);
        const [pendingRes, statsRes] = await Promise.all([listPending(), adminStats()]);
        if (pendingRes.status === 'unauthorized' || statsRes.status === 'unauthorized') {
            clearAdminPassword();
            setAuthed(false);
            setError('Wrong password — try again.');
            setLoading(false);
            return;
        }
        if (pendingRes.status === 'error') { setError(pendingRes.error ?? 'list_pending failed'); setLoading(false); return; }
        if (statsRes.status === 'error')   { setError(statsRes.error   ?? 'stats failed');        setLoading(false); return; }
        setRows(pendingRes.data?.rows ?? []);
        setStats(statsRes.data ?? null);
        setLoading(false);
    }, [authed]);

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
        if (selected.size === 0 || busy) return;
        if (!confirm(`Approve ${selected.size} nodes? They will become visible on the site.`)) return;
        setBusy(true);
        setError(null);
        const res = await approveNodes([...selected]);
        setBusy(false);
        if (res.status === 'ok') {
            setSelected(new Set());
            await refresh();
        } else if (res.status === 'unauthorized') {
            clearAdminPassword();
            setAuthed(false);
            setError('Session expired — re-enter password.');
        } else {
            setError(res.error ?? 'approve failed');
        }
    }, [busy, refresh, selected]);

    const reject = useCallback(async () => {
        if (selected.size === 0 || busy) return;
        if (!confirm(`Reject and DELETE ${selected.size} nodes? Their wikidata_qid will be added to the negative cache.`)) return;
        setBusy(true);
        setError(null);
        const res = await rejectNodes([...selected]);
        setBusy(false);
        if (res.status === 'ok') {
            setSelected(new Set());
            await refresh();
        } else if (res.status === 'unauthorized') {
            clearAdminPassword();
            setAuthed(false);
            setError('Session expired — re-enter password.');
        } else {
            setError(res.error ?? 'reject failed');
        }
    }, [busy, refresh, selected]);

    // ─── Login screen ──────────────────────────────────────────────────────
    if (!authed) {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans flex items-center justify-center">
                <div className="max-w-sm w-full">
                    <h1 className="text-xl font-semibold mb-2">Silicon Age — Admin</h1>
                    <p className="text-slate-400 text-sm mb-4">
                        Enter the admin password. The password is checked by the Supabase Edge Function;
                        the service-role key never leaves the server.
                    </p>
                    {error && (
                        <div className="mb-3 p-2 bg-rose-900/40 border border-rose-700/60 text-rose-200 rounded-sm text-sm">{error}</div>
                    )}
                    <input
                        type="password"
                        value={pwDraft}
                        onChange={e => setPwDraft(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && pwDraft.length > 0) { setAdminPassword(pwDraft); setAuthed(true); } }}
                        placeholder="admin password"
                        className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-sm px-3 py-2 text-base focus:outline-none focus:border-emerald-500"
                        autoFocus
                    />
                    <button
                        type="button"
                        disabled={pwDraft.length === 0}
                        onClick={() => { setAdminPassword(pwDraft); setAuthed(true); }}
                        className="mt-3 w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 rounded-sm text-sm"
                    >
                        Sign in
                    </button>
                </div>
            </div>
        );
    }

    // ─── Dashboard ─────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
            <div className="border-b border-slate-800 px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setSidebarOpen(o => !o)}
                        className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-sm"
                        aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                        title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {sidebarOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-xl font-semibold">Silicon Age — Admin</h1>
                        <p className="text-xs text-slate-500">Edge Function · service_role · Phase 5 MVP</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button type="button" onClick={() => { void refresh(); }} className="px-3 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 rounded-sm">
                        Refresh
                    </button>
                    <button type="button" onClick={() => { clearAdminPassword(); setAuthed(false); }} className="px-3 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 rounded-sm">
                        Log out
                    </button>
                </div>
            </div>

            <div className="flex">
                <nav
                    className={`border-r border-slate-800 overflow-hidden transition-[width] duration-200 ease-in-out ${sidebarOpen ? 'w-48 p-3' : 'w-0 p-0'}`}
                >
                    <div className="space-y-1 min-w-[160px]">
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
                    </div>
                </nav>

                <main className="flex-1 p-4">
                    {error && (
                        <div className="mb-3 p-3 bg-rose-900/40 border border-rose-700/60 text-rose-100 rounded-sm text-sm">
                            {error}
                        </div>
                    )}

                    {tab === 'stats' && stats && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-3xl">
                            {([
                                ['Pending', stats.pending],
                                ['Approved', stats.approved],
                                ['Excluded Q-ids', stats.excluded],
                                ['QA cache', stats.qa_cache],
                                ['Embedded translations', stats.embedded],
                                ['Missing embedding', stats.missing_embed],
                            ] as const).map(([k, v]) => (
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
                                    <option value="all">All ({rows.length})</option>
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
                                    <div className="grid grid-cols-[32px_minmax(140px,1.1fr)_72px_52px_64px_minmax(200px,2fr)_minmax(80px,90px)] gap-2 px-3 py-2 bg-slate-900 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-800 sticky top-0">
                                        <div>
                                            <input type="checkbox" checked={allSelected} onChange={toggleAll} className="accent-emerald-500" />
                                        </div>
                                        <div>Label / role</div>
                                        <div>Category</div>
                                        <div>Year</div>
                                        <div>Score · SL</div>
                                        <div>Description</div>
                                        <div>Wiki</div>
                                    </div>
                                    <div className="max-h-[calc(100vh-220px)] overflow-y-auto">
                                        {filtered.map(r => (
                                            <label
                                                key={r.id}
                                                className={`grid grid-cols-[32px_minmax(140px,1.1fr)_72px_52px_64px_minmax(200px,2fr)_minmax(80px,90px)] gap-2 px-3 py-2 border-b border-slate-800/50 text-sm cursor-pointer hover:bg-slate-900/50 ${selected.has(r.id) ? 'bg-emerald-900/15' : ''}`}
                                            >
                                                <div>
                                                    <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleOne(r.id)} className="accent-emerald-500" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-slate-100 truncate">{r.label}</div>
                                                    <div className="text-xs text-slate-500 font-mono truncate">{r.id}</div>
                                                    {r.impact_role && <div className="text-[11px] text-slate-400 mt-0.5 truncate">{r.impact_role}{r.tech_l2 ? ` · ${r.tech_l2}` : ''}</div>}
                                                </div>
                                                <div>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-sm border ${CATEGORY_TINT[r.category]}`}>{r.category}</span>
                                                </div>
                                                <div className="text-slate-300">{r.year || '—'}</div>
                                                <div className="text-slate-300 text-xs">
                                                    <div>{(r.relevance_score ?? 0).toFixed(1)}</div>
                                                    <div className="text-slate-500">{r.sitelinks_count ?? 0}</div>
                                                </div>
                                                <div className="text-slate-400 text-xs line-clamp-2 min-w-0 break-words">{r.description ?? '—'}</div>
                                                <div className="text-xs min-w-0 truncate">
                                                    {r.wikipedia_urls && r.wikipedia_urls.en ? (
                                                        <a href={r.wikipedia_urls.en} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-cyan-400 hover:underline">en</a>
                                                    ) : (
                                                        <span className="text-slate-600">—</span>
                                                    )}
                                                    {r.wikidata_qid && (
                                                        <a href={`https://www.wikidata.org/wiki/${r.wikidata_qid}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="ml-1 text-purple-400 hover:underline">{r.wikidata_qid}</a>
                                                    )}
                                                </div>
                                            </label>
                                        ))}
                                        {filtered.length === 0 && (
                                            <div className="px-4 py-8 text-center text-slate-500 text-sm">
                                                No pending nodes in this filter.
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
