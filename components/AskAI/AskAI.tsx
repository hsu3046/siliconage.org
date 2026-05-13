import React, { useCallback, useEffect, useRef, useState } from 'react';
import { askGraphRag, type QAResult } from '../../services/qaService';
import { getApiKey, setApiKey } from '../../services/geminiService';
import type { Locale } from '../../services/qaService';

interface Props {
    locale: Locale;
    onSourcesChange: (ids: string[]) => void;
    onNodeRefClick: (nodeId: string) => void;
    initialQuery?: string;          // when set, the panel opens + auto-submits
    onQueryConsumed?: () => void;   // so the URL/state owner can clear initialQuery
}

const STORAGE_KEY = 'silicon_age_askai_open';

const AskAI: React.FC<Props> = ({ locale, onSourcesChange, onNodeRefClick, initialQuery, onQueryConsumed }) => {
    const [open, setOpen] = useState<boolean>(() => {
        try { return localStorage.getItem(STORAGE_KEY) === '1'; } catch { return false; }
    });
    const [query, setQuery] = useState('');
    const [result, setResult] = useState<QAResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [needKey, setNeedKey] = useState(false);
    const [keyDraft, setKeyDraft] = useState('');
    const taRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        try { localStorage.setItem(STORAGE_KEY, open ? '1' : '0'); } catch { /* ignore */ }
    }, [open]);

    const submit = useCallback(async (q: string) => {
        const text = q.trim();
        if (!text || loading) return;
        // Pre-check: if there's no BYOK key yet, surface the prompt
        // immediately without bothering the Edge Function.
        if (!getApiKey() || (getApiKey() ?? '').trim().length < 10) {
            setNeedKey(true);
            setResult({ status: 'no_key', message: 'Gemini API key required. Paste a free key below — it stays in your browser.' });
            return;
        }
        setLoading(true);
        setResult(null);
        setNeedKey(false);
        try {
            const r = await askGraphRag(text, locale);
            setResult(r);
            if (r.status === 'no_key') {
                setNeedKey(true);
            } else if (r.status === 'ok' && r.source_node_ids) {
                onSourcesChange(r.source_node_ids);
            }
        } finally {
            setLoading(false);
        }
    }, [loading, locale, onSourcesChange]);

    // initialQuery from URL → open panel + auto-run once
    useEffect(() => {
        if (initialQuery && initialQuery.length > 0) {
            setOpen(true);
            setQuery(initialQuery);
            void submit(initialQuery);
            onQueryConsumed?.();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialQuery]);

    const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        const composing = e.nativeEvent.isComposing || e.keyCode === 229;
        if (e.key === 'Enter' && !e.shiftKey && !composing) {
            e.preventDefault();
            void submit(query);
        }
    };

    // Render the answer with [ref:id] tokens turned into clickable chips.
    const renderAnswerBody = (text: string) => {
        const parts = text.split(/(\[[a-z0-9_]+\])/gi);
        return parts.map((p, i) => {
            const m = p.match(/^\[([a-z0-9_]+)\]$/i);
            if (!m) return <span key={i}>{p}</span>;
            const id = m[1];
            return (
                <button
                    key={i}
                    type="button"
                    onClick={() => onNodeRefClick(id)}
                    className="inline-flex items-center px-1.5 py-0 mx-0.5 rounded-sm bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-200 text-xs font-mono cursor-pointer align-baseline"
                >
                    {id}
                </button>
            );
        });
    };

    return (
        <>
            {/* Floating Ask button — always visible bottom-right */}
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg flex items-center justify-center transition-all duration-200"
                aria-label="Ask the Silicon Age"
                title="Ask the Silicon Age"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
            </button>

            {/* Slide-in panel */}
            <div
                className={`fixed inset-y-0 left-0 w-full md:w-[420px] bg-slate-900/95 backdrop-blur-xl border-r border-slate-700 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${open ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <div className="text-slate-100 font-semibold">Ask the Silicon Age</div>
                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="text-slate-400 hover:text-slate-100 p-1 rounded-sm hover:bg-slate-800"
                        aria-label="Close"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-4 border-b border-slate-700">
                    <textarea
                        ref={taRef}
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={onKey}
                        placeholder={
                            locale === 'ko' ? '예: 왜 transformer 가 iPhone 에 영향을 주었나요?'
                            : locale === 'ja' ? '例: なぜ transformer は iPhone に影響を与えたのか?'
                            : 'e.g. Why did the transformer influence the iPhone era?'
                        }
                        rows={3}
                        className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-sm p-2 text-base focus:outline-none focus:border-emerald-500 resize-none"
                    />
                    <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-slate-500">Enter to send · Shift+Enter for newline</span>
                        <button
                            type="button"
                            onClick={() => void submit(query)}
                            disabled={loading || !query.trim()}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm rounded-sm transition-colors"
                        >
                            {loading ? 'Thinking…' : 'Ask'}
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {loading && (
                        <div className="text-slate-400 text-sm">
                            Searching the graph for relevant nodes, then asking Gemini…
                        </div>
                    )}
                    {!loading && needKey && (
                        <div className="bg-amber-900/40 border border-amber-700/60 rounded-sm p-3 text-amber-100 text-sm">
                            <p className="font-medium mb-1">Gemini API key required</p>
                            <p className="text-amber-200/80 text-xs mb-2">
                                AskAI uses the same Gemini key as Deep Dive. Paste a free key from <a className="underline" href="https://ai.google.dev/" target="_blank" rel="noreferrer">ai.google.dev</a>. Your key stays in this browser only — it is never sent to our servers.
                            </p>
                            <div className="flex gap-2 mt-2">
                                <input
                                    type="password"
                                    value={keyDraft}
                                    onChange={e => setKeyDraft(e.target.value)}
                                    placeholder="AIza..."
                                    className="flex-1 bg-slate-900 border border-slate-700 text-slate-100 rounded-sm px-2 py-1 text-sm focus:outline-none focus:border-emerald-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (keyDraft.trim().length > 10) {
                                            setApiKey(keyDraft.trim());
                                            setNeedKey(false);
                                            setKeyDraft('');
                                            void submit(query);
                                        }
                                    }}
                                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-sm"
                                >
                                    Save & retry
                                </button>
                            </div>
                        </div>
                    )}
                    {!loading && result?.status === 'ok' && result.answer && (
                        <div className="space-y-3">
                            <div className="text-slate-100 text-base leading-relaxed">
                                {renderAnswerBody(result.answer)}
                            </div>
                            {result.source_node_ids && result.source_node_ids.length > 0 && (
                                <div>
                                    <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">Sources</div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {result.source_node_ids.map(id => (
                                            <button
                                                key={id}
                                                type="button"
                                                onClick={() => onNodeRefClick(id)}
                                                className="px-2 py-0.5 rounded-sm bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-200 text-xs font-mono"
                                            >
                                                {id}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {result.cached && (
                                <div className="text-[11px] text-slate-500">Served from cache.</div>
                            )}
                        </div>
                    )}
                    {!loading && result?.status === 'error' && (
                        <div className="bg-rose-900/40 border border-rose-700/60 rounded-sm p-3 text-rose-100 text-sm">
                            <p className="font-medium mb-1">Couldn't get an answer</p>
                            <p className="text-rose-200/80 text-xs break-all">{result.error}</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default AskAI;
