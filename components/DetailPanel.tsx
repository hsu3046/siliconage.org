import React, { useEffect, useState, useMemo } from 'react';
import { NodeData, AIResponse, GraphData, LinkDirection, Category } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { fetchNodeDetails } from '../services/geminiService';

interface DetailPanelProps {
  node: NodeData | null;
  data: GraphData; // Need full data to find connections
  onClose: () => void;
  onFocus: () => void;
  onNodeSelect: (node: NodeData) => void; // Navigation handler
}

const DetailPanel: React.FC<DetailPanelProps> = ({ node, data, onClose, onFocus, onNodeSelect }) => {
  const [aiData, setAiData] = useState<AIResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // Calculate connections
  const connections = useMemo(() => {
    if (!node) return [];

    return data.links.map(link => {
      const sId = typeof link.source === 'object' ? (link.source as any).id : link.source;
      const tId = typeof link.target === 'object' ? (link.target as any).id : link.target;

      if (sId !== node.id && tId !== node.id) return null;

      const isSource = sId === node.id;
      const otherId = isSource ? tId : sId;
      const otherNode = data.nodes.find(n => n.id === otherId);

      if (!otherNode) return null;

      return {
        link,
        otherNode,
        relation: isSource ? 'Outbound' : 'Inbound',
        type: link.type
      };
    }).filter(Boolean);
  }, [node, data]);

  const loadAiData = () => {
    if (node) {
      setLoading(true);
      // No force refresh option anymore
      fetchNodeDetails(node)
        .then(data => setAiData(data))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    loadAiData();
  }, [node]);

  if (!node) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-surface/95 backdrop-blur-xl border-l border-slate-700 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-700 flex justify-between items-start bg-slate-900/50">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm bg-slate-800 border border-slate-700"
              style={{ color: CATEGORY_COLORS[node.category] }}
            >
              {node.category}
            </span>
            {/* 1. Impact Factor Score in Header */}
            <div
              className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded-sm border border-slate-700/50"
              title="Impact Factor"
            >
              <svg className="w-3 h-3 text-yellow-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
              <span className="text-[10px] font-mono font-bold text-slate-300">
                {(node._score || 0).toFixed(1)}
              </span>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white mt-3 leading-tight">{node.label}</h2>
          <div className="flex items-center gap-2 mt-2">
            {/* Logic for Year Display: Show Range for Companies, Single Year for Tech/Episodes, Hidden for Persons */}
            {node.category === Category.COMPANY && (
              <span className="text-slate-400 font-mono text-sm">
                {node.year} - Current
              </span>
            )}
            {(node.category === Category.TECHNOLOGY || node.category === Category.EPISODE) && (
              <span className="text-slate-400 font-mono text-sm">
                {node.year}
              </span>
            )}

            {node.role && <span className="text-slate-500 text-xs px-2 py-0.5 bg-slate-800 rounded">{node.role}</span>}
          </div>

          {/* Company Categories */}
          {node.category === Category.COMPANY && node.companyCategories && (
            <div className="flex flex-wrap gap-2 mt-3">
              {node.companyCategories.map((cat) => (
                <span key={cat} className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-900/30 text-emerald-300 border border-emerald-800/50">
                  {cat}
                </span>
              ))}
            </div>
          )}

          {/* Technology Categories */}
          {node.category === Category.TECHNOLOGY && (
            <div className="flex flex-wrap gap-2 mt-3">
              {node.techCategoryL1 && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-900/30 text-blue-300 border border-blue-800/50">
                  {node.techCategoryL1}
                </span>
              )}
              {node.techCategoryL2 && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-indigo-900/30 text-indigo-300 border border-indigo-800/50">
                  {node.techCategoryL2}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {/* Focus Button - Changed Icon to Target/Crosshair */}
          <button
            onClick={onFocus}
            className="text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded p-1.5 transition-all"
            title="Focus View"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-slate-700 rounded p-1.5 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8">

        {/* 1. Gemini AI Analysis (Top) */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-5 border border-slate-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <svg className="w-24 h-24 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
                <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  AI Deep Dive
                </h3>
              </div>
            </div>

            {loading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-slate-700/50 rounded w-3/4"></div>
                <div className="h-4 bg-slate-700/50 rounded w-full"></div>
                <div className="h-4 bg-slate-700/50 rounded w-5/6"></div>
                <div className="pt-4 space-y-2">
                  <div className="h-3 bg-slate-800 rounded w-1/2"></div>
                  <div className="h-3 bg-slate-800 rounded w-1/2"></div>
                </div>
              </div>
            ) : aiData ? (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div>
                  <h4 className="text-[10px] text-slate-500 uppercase font-bold mb-1.5 tracking-wider">Summary</h4>
                  <p className="text-sm text-slate-200 leading-relaxed">{aiData.summary}</p>
                </div>

                <div>
                  <h4 className="text-[10px] text-slate-500 uppercase font-bold mb-1.5 tracking-wider">Significance</h4>
                  <p className="text-sm text-slate-300 italic border-l-2 border-purple-500/50 pl-3 py-1">
                    "{aiData.significance}"
                  </p>
                </div>

                <div>
                  <h4 className="text-[10px] text-slate-500 uppercase font-bold mb-1.5 tracking-wider">Key Facts</h4>
                  <ul className="space-y-2">
                    {aiData.keyFacts.map((fact, idx) => (
                      <li key={idx} className="text-sm text-slate-300 flex items-start gap-2 group">
                        <span className="text-purple-500/50 group-hover:text-purple-400 mt-1.5 transition-colors">•</span>
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-500 italic">Select a node to analyze its history.</div>
            )}
          </div>
        </div>

        {/* 2. Connections Section */}
        {connections && connections.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Relationships</h3>
            <div className="grid grid-cols-1 gap-2">
              {connections.map((conn, idx) => (
                <button
                  key={idx}
                  onClick={() => conn && onNodeSelect(conn.otherNode)}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-slate-500 hover:bg-slate-800 transition-all group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[conn?.otherNode.category || 'COMPANY'] }}
                    ></div>
                    <div>
                      <div className="text-sm font-bold text-slate-200 group-hover:text-white">{conn?.otherNode.label}</div>
                      <div className="text-[10px] text-slate-500 uppercase">{conn?.type} • {conn?.relation}</div>
                    </div>
                  </div>

                  {/* 2. Relationship Score Display */}
                  <div className="flex items-center gap-3">
                    <div
                      className="flex items-center gap-1 bg-slate-900/50 px-1.5 py-0.5 rounded border border-slate-700/50"
                      title={`Impact Factor: ${(conn?.otherNode._score || 0).toFixed(1)}`}
                    >
                      <svg className="w-2.5 h-2.5 text-yellow-500/70" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                      <span className="text-[10px] font-mono text-slate-400 group-hover:text-slate-300">
                        {(conn?.otherNode._score || 0).toFixed(0)}
                      </span>
                    </div>
                    <svg className="w-4 h-4 text-slate-600 group-hover:text-primary transform group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 3. External Links Section (Placeholder UI) */}
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">External Resources</h3>
          <div className="flex flex-wrap gap-3">
            {/* Pre-canned Google Search Link for Demo */}
            <a
              href={`https://www.google.com/search?q=${encodeURIComponent(node.label + " history AI")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 hover:border-slate-500 transition-colors text-xs font-medium text-slate-300"
            >
              <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" /></svg>
              Google Search
            </a>

            {/* Placeholder: Wikipedia */}
            <a
              href={`https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(node.label)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 hover:border-slate-500 transition-colors text-xs font-medium text-slate-300"
            >
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2.2c1.76 0 3.407.467 4.86 1.287l-1.32 3.18H13.8l-1.12-2.68-1.76 4.18H9.38l2.62-5.973A9.76 9.76 0 0 1 12 2.2zm-6.2 3.2l1.98 4.52-2.38 5.62H3.72a9.75 9.75 0 0 1 2.08-10.14zm12.38.34l-2.98 7.02 1.34 3.18h1.66l-2.3-5.34 2.58-6.04c-.08.38-.2.74-.3 1.18zm-2.1 10.74l-1.34-3.18H13.2l1.78 4.22a9.72 9.72 0 0 1-6.96 0L9.8 13.3h1.56l-2.1 4.98h1.52l1.24-2.94 1.24 2.94h1.52l-2.1-4.98h1.56l1.78 4.22z" /></svg>
              Wikipedia
            </a>

            {/* Placeholder: YouTube */}
            <a
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(node.label + " documentary")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 hover:border-slate-500 transition-colors text-xs font-medium text-slate-300"
            >
              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>
              YouTube
            </a>

            {/* Placeholder: Amazon Books */}
            <a
              href={`https://www.amazon.com/s?k=${encodeURIComponent(node.label + " book")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 hover:border-slate-500 transition-colors text-xs font-medium text-slate-300"
            >
              <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95a15.65 15.65 0 0 0-1.38-3.56c1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z" /></svg>
              Books
            </a>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-[10px] text-slate-500 leading-relaxed mt-6 pt-4 border-t border-slate-700/50">
          The content and links provided on this site are aggregated through AI algorithms based on objective technical keywords, rather than personal curation or subjective selection.
        </p>

      </div>
    </div>
  );
};

export default DetailPanel;