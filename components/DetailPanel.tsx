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

// === HELPER: Get Section Headers by Category ===
const getSectionHeaders = (category: Category) => {
  switch (category) {
    case Category.COMPANY:
      return {
        summary: 'Corporate Profile',
        significance: 'Market Dominance',
        keyFacts: 'Key Products & Services'
      };
    case Category.PERSON:
      return {
        summary: 'Biography',
        significance: 'Career & Legacy',
        keyFacts: 'Major Achievements'
      };
    case Category.EPISODE:
      return {
        summary: 'Event Overview',
        significance: 'Impact & Aftermath',
        keyFacts: 'Causes & Timeline'
      };
    case Category.TECHNOLOGY:
      return {
        summary: 'Core Concept',
        significance: 'Why it Matters',
        keyFacts: 'Technical Specs'
      };
    default:
      return {
        summary: 'Summary',
        significance: 'Significance',
        keyFacts: 'Key Facts'
      };
  }
};

// === HELPER: Generate Smart External Links ===
const getExternalLinks = (node: NodeData) => {
  const name = node.label;
  const category = node.category;

  // For EPISODE nodes: Show ONLY Web Search
  if (category === Category.EPISODE) {
    return [
      {
        label: 'Web Search',
        url: `https://www.google.com/search?q=${encodeURIComponent(`"${name}" explained history`)}`,
        icon: (
          <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
          </svg>
        ),
        show: true
      }
    ];
  }

  // For all other nodes (Company, Person, Technology)
  const links: Array<{
    label: string;
    url: string;
    icon: React.ReactNode;
    show: boolean;
  }> = [
      // 1. Wikipedia (First for non-EPISODE)
      {
        label: 'Wikipedia',
        url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(name)}`,
        icon: (
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.09 13.119c-.936 1.932-2.217 4.548-2.853 5.728-.616 1.074-1.127.931-1.532.029-1.406-3.321-4.293-9.144-5.651-12.409-.251-.601-.441-.987-.619-1.139-.181-.15-.554-.24-1.122-.271C.12 5.045 0 4.992 0 4.894v-.528c0-.119.068-.189.207-.19h3.852c.118.001.178.062.179.18v.485c0 .11-.061.179-.18.18-.968.042-1.196.344-.701 1.024l4.455 9.195 2.115-4.263-1.836-3.807c-.577-1.132-.975-1.611-1.594-1.754-.229-.049-.593-.092-.684-.243-.06-.112-.074-.178-.074-.332V4.88c0-.107.062-.175.169-.175h4.086c.099 0 .169.068.169.175v.533c0 .105-.079.185-.193.185-.478.008-.847.104-.847.417 0 .158.058.33.174.518l2.155 4.373 2.119-4.243c.117-.235.189-.462.189-.688 0-.375-.384-.447-.847-.447-.11 0-.186-.08-.186-.185v-.537c0-.107.07-.175.17-.175h3.29c.099 0 .168.068.168.175v.519c0 .111-.057.19-.17.19-.544.009-.97.143-1.274.404-.304.259-.658.821-1.065 1.684l-2.47 4.967 2.578 5.339c.634 1.354 1.04 1.607 1.647 1.607.207 0 .394-.027.558-.082.163-.055.336-.134.519-.239.183-.105.352-.171.508-.199.156-.028.306.015.452.128.145.113.218.266.218.459 0 .256-.114.464-.342.622-.229.159-.564.238-1.006.238-1.348 0-2.292-.595-2.834-1.785l-2.91-6.022-2.677 5.39c-.35.712-.632 1.21-.846 1.49-.214.281-.508.422-.883.422-.356 0-.707-.133-1.052-.4-.345-.266-.517-.59-.517-.97 0-.193.052-.357.155-.49.104-.134.285-.271.543-.41.157-.088.275-.159.353-.213.079-.054.195-.15.349-.288.154-.138.289-.31.404-.516.115-.207.25-.472.404-.797l3.142-6.51-2.29-4.686c-.422-.87-.752-1.384-1.088-1.54-.181-.088-.431-.116-.749-.085-.11 0-.186-.08-.186-.185v-.537c0-.107.07-.175.17-.175h4.17c.1 0 .17.068.17.175v.537c0 .105-.08.185-.186.185" />
          </svg>
        ),
        show: true
      },
      // 2. YouTube
      {
        label: 'YouTube',
        url: (() => {
          switch (category) {
            case Category.PERSON:
              return `https://www.youtube.com/results?search_query=${encodeURIComponent(`"${name}" documentary biography interview`)}`;
            case Category.TECHNOLOGY:
              return `https://www.youtube.com/results?search_query=${encodeURIComponent(`How "${name}" works explained`)}`;
            default:
              return `https://www.youtube.com/results?search_query=${encodeURIComponent(`"${name}" overview`)}`;
          }
        })(),
        icon: (
          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
          </svg>
        ),
        show: true
      },
      // 3. Web Search (Google)
      {
        label: 'Web Search',
        url: `https://www.google.com/search?q=${encodeURIComponent(`"${name}" overview`)}`,
        icon: (
          <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
          </svg>
        ),
        show: true
      },
      // 4. Research Paper (arXiv) - Tech & Person only
      {
        label: 'Paper',
        url: (() => {
          if (category === Category.PERSON) {
            return `https://arxiv.org/search/?query=${encodeURIComponent(name)}&searchtype=all`;
          }
          return `https://arxiv.org/search/?query=${encodeURIComponent(name)}&searchtype=all`;
        })(),
        icon: (
          <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
          </svg>
        ),
        show: category === Category.TECHNOLOGY || category === Category.PERSON
      },
      // 5. Books (Amazon)
      {
        label: 'Books',
        url: (() => {
          if (category === Category.PERSON) {
            return `https://www.amazon.com/s?k=${encodeURIComponent(`Books by "${name}"`)}`;
          }
          return `https://www.amazon.com/s?k=${encodeURIComponent(`"${name}" book`)}`;
        })(),
        icon: (
          <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" />
          </svg>
        ),
        show: true
      }
    ];

  return links.filter(link => link.show);
};

const DetailPanel: React.FC<DetailPanelProps> = ({ node, data, onClose, onFocus, onNodeSelect }) => {
  const [aiData, setAiData] = useState<AIResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // Get dynamic section headers
  const sectionHeaders = useMemo(() => {
    return node ? getSectionHeaders(node.category) : getSectionHeaders(Category.TECHNOLOGY);
  }, [node?.category]);

  // Get smart external links
  const externalLinks = useMemo(() => {
    return node ? getExternalLinks(node) : [];
  }, [node]);

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

  // === Dynamic Metadata Rendering ===
  const renderDynamicMetadata = () => {
    switch (node.category) {
      case Category.COMPANY:
        // Market Cap display (if available)
        if (node.marketCap?.current || node.marketCap?.peak) {
          const currentValue = node.marketCap.current || 'N/A';
          const isNonProfit = currentValue.toLowerCase().includes('non-profit') ||
            currentValue.toLowerCase().includes('nonprofit') ||
            currentValue === 'N/A (Gov)' ||
            currentValue === 'N/A (Intl Org)';

          return (
            <div className="flex items-center gap-2 mt-2 text-sm">
              {isNonProfit ? (
                // Case A: Non-profit - show only this label
                <span className="text-slate-400 font-medium">Non-profit</span>
              ) : (
                // Case B: Standard market cap - clickable with peak
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(`${node.label} stock price`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:underline cursor-pointer"
                >
                  <span className="text-emerald-400 font-medium">
                    {currentValue}
                  </span>
                  {node.marketCap.peak && (
                    <span className="text-slate-500">
                      / Peak {node.marketCap.peak}
                    </span>
                  )}
                </a>
              )}
            </div>
          );
        }
        return null;

      case Category.PERSON:
        // Roles + Birth/Death years - VERTICAL LAYOUT
        const roles = [node.primaryRole, node.secondaryRole].filter(Boolean);
        const lifespan = node.birthYear
          ? `${node.birthYear}–${node.deathYear || 'Present'}`
          : null;

        if (roles.length > 0 || lifespan) {
          return (
            <div className="flex flex-col gap-1 mt-2 text-sm">
              {/* Line 1: Role (Bright) */}
              {roles.length > 0 && (
                <span className="text-slate-200">{roles.join(' • ')}</span>
              )}
              {/* Line 2: Lifespan (Dim) */}
              {lifespan && <span className="text-slate-500 font-mono text-xs">{lifespan}</span>}
            </div>
          );
        }
        return null;

      case Category.EPISODE:
        // Event Type + Impact Scale
        if (node.eventType || node.impactScale) {
          return (
            <div className="flex items-center gap-2 mt-2 text-sm">
              {node.eventType && (
                <span className="text-violet-400">{node.eventType}</span>
              )}
              {node.eventType && node.impactScale && <span className="text-slate-500">•</span>}
              {node.impactScale && (
                <span className="text-slate-300">{node.impactScale}</span>
              )}
            </div>
          );
        }
        return null;

      case Category.TECHNOLOGY:
        // Lifecycle display
        const lifecycle = node.endYear
          ? `${node.year} – ${node.endYear}`
          : `${node.year} – Present`;
        return (
          <div className="flex items-center gap-2 mt-2 text-sm text-slate-400 font-mono">
            {lifecycle}
          </div>
        );

      default:
        return null;
    }
  };

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

          {/* Dynamic Metadata based on node type */}
          {renderDynamicMetadata()}

          {/* Fallback: Original year display (only if no dynamic metadata) */}
          {!renderDynamicMetadata() && (
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
          )}

          {/* Role badge (for Person, if no primaryRole) */}
          {node.category === Category.PERSON && !node.primaryRole && node.role && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-slate-500 text-xs px-2 py-0.5 bg-slate-800 rounded">{node.role}</span>
            </div>
          )}

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
          {/* Focus Button - Map Icon */}
          <button
            onClick={onFocus}
            className="text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded p-1.5 transition-all"
            title="Enter Focus View"
          >
            {/* Map Icon */}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
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
                  <h4 className="text-[10px] text-slate-500 uppercase font-bold mb-1.5 tracking-wider">{sectionHeaders.summary}</h4>
                  <p className="text-sm text-slate-200 leading-relaxed">{aiData.summary}</p>
                </div>

                <div>
                  <h4 className="text-[10px] text-slate-500 uppercase font-bold mb-1.5 tracking-wider flex items-center gap-1">
                    {sectionHeaders.significance}
                    <span className="text-yellow-500">💡</span>
                  </h4>
                  <p className="text-sm text-slate-300 italic border-l-2 border-purple-500/50 pl-3 py-1">
                    "{aiData.significance}"
                  </p>
                </div>

                <div>
                  <h4 className="text-[10px] text-slate-500 uppercase font-bold mb-1.5 tracking-wider">{sectionHeaders.keyFacts}</h4>
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

        {/* 2. Connections Section (renamed from Relationships) */}
        {connections && connections.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Connections</h3>
            <div className="grid grid-cols-1 gap-2">
              {connections.map((conn, idx) => {
                // Get appropriate icon for connection type
                const getConnectionIcon = () => {
                  switch (conn?.otherNode.category) {
                    case Category.COMPANY:
                      return (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      );
                    case Category.PERSON:
                      return (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      );
                    case Category.TECHNOLOGY:
                      return (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                        </svg>
                      );
                    case Category.EPISODE:
                      return (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                      );
                    default:
                      return (
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[conn?.otherNode.category || 'COMPANY'] }}></div>
                      );
                  }
                };

                return (
                  <button
                    key={idx}
                    onClick={() => conn && onNodeSelect(conn.otherNode)}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-slate-500 hover:bg-slate-800 transition-all group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex items-center justify-center"
                        style={{ color: CATEGORY_COLORS[conn?.otherNode.category || 'COMPANY'] }}
                      >
                        {getConnectionIcon()}
                      </div>
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
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Learn More Section (renamed from External Resources) */}
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Learn More</h3>
          <div className="flex flex-wrap gap-3">
            {externalLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 hover:border-slate-500 transition-colors text-xs font-medium text-slate-300"
              >
                {link.icon}
                {link.label}
              </a>
            ))}
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