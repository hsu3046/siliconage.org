import React, { useCallback, useEffect, useState } from 'react';
import { listEventCandidates, approveEvents, rejectEvents, type EventCandidate } from '../../services/adminService';

/**
 * Timeline event candidates scouted from aib vote news (scripts/scoutEvents.ts).
 * Approve → events + event_translations (ev_* ids) → `npm run export-approved`.
 */
const EventCandidatesPanel: React.FC<{ onUnauthorized: () => void }> = ({ onUnauthorized }) => {
    const [rows, setRows] = useState<EventCandidate[]>([]);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);
        const res = await listEventCandidates();
        setLoading(false);
        if (res.status === 'unauthorized') { onUnauthorized(); return; }
        if (res.status === 'error') { setError(res.error ?? 'list_events failed (is migration 0009 applied?)'); return; }
        setRows(res.data?.rows ?? []);
        setSelected(new Set());
    }, [onUnauthorized]);

    useEffect(() => { void refresh(); }, [refresh]);

    const toggle = (id: string) => setSelected(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
    });

    const act = async (kind: 'approve' | 'reject') => {
        if (selected.size === 0 || busy) return;
        const verb = kind === 'approve' ? 'Approve' : 'Reject';
        if (!confirm(`${verb} ${selected.size} event(s)?${kind === 'approve' ? ' Run `npm run export-approved` afterwards to publish them.' : ''}`)) return;
        setBusy(true);
        const res = kind === 'approve' ? await approveEvents([...selected]) : await rejectEvents([...selected]);
        setBusy(false);
        if (res.status === 'unauthorized') { onUnauthorized(); return; }
        if (res.status === 'error') { setError(res.error ?? `${kind} failed`); return; }
        setNotice(kind === 'approve' ? 'Approved — run `npm run export-approved` and rebuild to publish.' : 'Rejected.');
        await refresh();
    };

    return (
        <div>
            <div className="flex items-center gap-3 mb-3">
                <div className="text-sm text-slate-300">Event candidates ({rows.length})</div>
                <div className="text-xs text-slate-500">{selected.size} selected</div>
                <div className="flex-1" />
                <button type="button" disabled={busy || selected.size === 0} onClick={() => { void act('approve'); }}
                    className="px-3 py-1.5 text-sm bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 rounded-sm">
                    Approve ({selected.size})
                </button>
                <button type="button" disabled={busy || selected.size === 0} onClick={() => { void act('reject'); }}
                    className="px-3 py-1.5 text-sm bg-rose-700 hover:bg-rose-600 disabled:bg-slate-700 disabled:text-slate-500 rounded-sm">
                    Reject ({selected.size})
                </button>
            </div>
            {error && <div className="mb-3 p-3 bg-rose-900/40 border border-rose-700/60 text-rose-100 rounded-sm text-sm">{error}</div>}
            {notice && <div className="mb-3 p-3 bg-emerald-900/30 border border-emerald-700/50 text-emerald-100 rounded-sm text-sm">{notice}</div>}
            {loading ? <div className="text-slate-400 text-sm">Loading…</div> : (
                <div className="border border-slate-800 rounded-sm divide-y divide-slate-800 max-h-[calc(100vh-220px)] overflow-y-auto">
                    {rows.map(r => (
                        <label key={r.id} className={`flex gap-3 px-3 py-2 text-sm cursor-pointer ${selected.has(r.id) ? 'bg-emerald-900/20' : 'hover:bg-slate-900'}`}>
                            <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggle(r.id)} className="accent-emerald-500 mt-1" />
                            <div className="w-12 text-slate-300">{r.year}</div>
                            <div className={`w-12 text-xs mt-0.5 ${(r.jev_milestone ?? 0) >= 0.8 ? 'text-emerald-300' : 'text-amber-200'}`} title="Jev P(lasting milestone)">
                                {r.jev_milestone == null ? '—' : `${Math.round(r.jev_milestone * 100)}%`}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-slate-100">{r.story_en}</div>
                                {r.story_ko && <div className="text-xs text-slate-400">{r.story_ko}</div>}
                                <div className="text-[11px] text-slate-500 mt-0.5">
                                    {r.related_nodes.length ? r.related_nodes.join(', ') : 'no related nodes'} ·{' '}
                                    <a href={r.source_url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="text-sky-300 hover:underline">source</a>
                                </div>
                            </div>
                        </label>
                    ))}
                    {rows.length === 0 && <div className="px-4 py-8 text-center text-slate-500 text-sm">No pending event candidates. Run `npm run scout-events`.</div>}
                </div>
            )}
        </div>
    );
};

export default EventCandidatesPanel;
