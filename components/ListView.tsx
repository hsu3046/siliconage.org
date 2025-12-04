import React, { useState, useMemo, useEffect } from 'react';
import { GraphData, NodeData, Category } from '../types';
import { CATEGORY_COLORS } from '../constants';

interface ListViewProps {
  data: GraphData;
  onNodeClick: (node: NodeData) => void;
  scrollToNodeId?: string | null;
}

type SortOption = 'CATEGORY' | 'ALPHABETICAL' | 'IMPORTANCE';

const ListView: React.FC<ListViewProps> = ({ data, onNodeClick, scrollToNodeId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('CATEGORY');

  // Sort nodes based on selection
  const sortedNodes = useMemo(() => {
    return [...data.nodes].sort((a, b) => {
      // CATEGORY: Category Group > Importance Score > Year
      if (sortBy === 'CATEGORY') {
        const catPriority = {
          [Category.COMPANY]: 0,
          [Category.PERSON]: 1,
          [Category.TECHNOLOGY]: 2,
          [Category.EPISODE]: 3,
        };
        if (catPriority[a.category] !== catPriority[b.category]) {
          return catPriority[a.category] - catPriority[b.category];
        }
        if ((a._score || 0) !== (b._score || 0)) {
          return (b._score || 0) - (a._score || 0);
        }
        return b.year - a.year;
      }

      // ALPHABETICAL (A-Z)
      if (sortBy === 'ALPHABETICAL') {
        return a.label.localeCompare(b.label);
      }

      // IMPORTANCE (Highest Score First)
      if (sortBy === 'IMPORTANCE') {
        const scoreA = a._score || 0;
        const scoreB = b._score || 0;
        if (scoreA !== scoreB) return scoreB - scoreA;
        return a.label.localeCompare(b.label);
      }

      return 0;
    });
  }, [data.nodes, sortBy]);

  // Local text filter
  const filteredNodes = useMemo(() => {
    if (!searchQuery.trim()) return sortedNodes;
    const lowerQuery = searchQuery.toLowerCase();
    return sortedNodes.filter(node =>
      node.label.toLowerCase().includes(lowerQuery) ||
      node.description.toLowerCase().includes(lowerQuery) ||
      (node.role && node.role.toLowerCase().includes(lowerQuery)) ||
      (node.companyCategories && node.companyCategories.some(cat => cat.toLowerCase().includes(lowerQuery))) ||
      (node.techCategoryL1 && node.techCategoryL1.toLowerCase().includes(lowerQuery)) ||
      (node.techCategoryL2 && node.techCategoryL2.toLowerCase().includes(lowerQuery))
    );
  }, [sortedNodes, searchQuery]);

  // Effect for scrolling
  useEffect(() => {
    if (scrollToNodeId) {
      const element = document.getElementById(`list-node-${scrollToNodeId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [scrollToNodeId]);

  const getSubLabel = (node: NodeData) => {
    if (node.category === Category.COMPANY) return `${node.year} - Present`;
    if (node.category === Category.PERSON) return node.role;
    return `${node.year}`;
  };

  const handleTagClick = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const element = document.getElementById(`list-node-${nodeId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    const targetNode = data.nodes.find(n => n.id === nodeId);
    if (targetNode) onNodeClick(targetNode);
  };

  return (
    <div className="w-full h-full flex flex-col bg-background">
      {/* Search & Sort Bar */}
      <div className="p-4 border-b border-slate-700 bg-surface/50 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4">

          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-slate-600 rounded-lg leading-5 bg-slate-900 text-slate-100 placeholder-slate-400 focus:outline-none focus:bg-slate-800 focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm transition-colors"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Sort Selector */}
          <div className="relative w-full md:w-48">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"></path></svg>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="block w-full pl-10 pr-8 py-2 border border-slate-600 rounded-lg bg-slate-900 text-slate-200 focus:outline-none focus:border-primary text-sm appearance-none cursor-pointer"
            >
              <option value="CATEGORY">Category</option>
              <option value="ALPHABETICAL">Name (A-Z)</option>
              <option value="IMPORTANCE">Importance Score</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredNodes.map(node => {
            const relatedLinks = data.links.filter(l => {
              const s = typeof l.source === 'object' ? (l.source as any).id : l.source;
              const t = typeof l.target === 'object' ? (l.target as any).id : l.target;
              return s === node.id || t === node.id;
            });

            const hashtags = relatedLinks.map(l => {
              const sId = typeof l.source === 'object' ? (l.source as any).id : l.source;
              const tId = typeof l.target === 'object' ? (l.target as any).id : l.target;
              const targetId = sId === node.id ? tId : sId;
              const targetNode = data.nodes.find(n => n.id === targetId);
              return targetNode ? { id: targetId, label: targetNode.label } : null;
            }).filter(Boolean);

            return (
              <div
                key={node.id}
                id={`list-node-${node.id}`}
                onClick={() => onNodeClick(node)}
                className="group relative bg-surface border border-slate-700 rounded-xl overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                <div className="h-1.5 w-full" style={{ backgroundColor: CATEGORY_COLORS[node.category] }}></div>

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 border border-slate-700"
                      style={{ color: CATEGORY_COLORS[node.category] }}
                    >
                      {node.category}
                    </span>

                    {/* Exact Score Display */}
                    <div
                      className="flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded border border-slate-600"
                      title="Impact Factor"
                    >
                      <svg className="w-3 h-3 text-yellow-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                      <span className="text-xs font-mono font-bold text-slate-300">
                        {(node._score || 0).toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* Company Categories */}
                  {node.category === Category.COMPANY && node.companyCategories && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {node.companyCategories.map((cat) => (
                        <span key={cat} className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-emerald-900/30 text-emerald-300 border border-emerald-800/50">
                          {cat}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Technology Categories */}
                  {node.category === Category.TECHNOLOGY && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {node.techCategoryL1 && (
                        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-blue-900/30 text-blue-300 border border-blue-800/50">
                          {node.techCategoryL1}
                        </span>
                      )}
                      {node.techCategoryL2 && (
                        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-indigo-900/30 text-indigo-300 border border-indigo-800/50">
                          {node.techCategoryL2}
                        </span>
                      )}
                    </div>
                  )}

                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-primary transition-colors">{node.label}</h3>

                  <div className="text-xs font-mono text-slate-400 mb-3 flex items-center gap-2">
                    {getSubLabel(node) && (
                      <span className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                        {getSubLabel(node)}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-slate-400 line-clamp-3 mb-4 flex-1">
                    {node.description}
                  </p>

                  {hashtags.length > 0 && (
                    <div className="mt-auto pt-3 border-t border-slate-700/50 flex flex-wrap gap-2">
                      {hashtags.slice(0, 5).map((tag, idx) => (
                        <span
                          key={`${node.id}-tag-${idx}`}
                          onClick={(e) => tag && handleTagClick(e, tag.id)}
                          className="text-xs font-mono text-blue-400 hover:text-blue-300 hover:underline bg-blue-500/10 px-2 py-1 rounded cursor-pointer transition-colors"
                        >
                          #{tag?.label.replace(/\s+/g, '')}
                        </span>
                      ))}
                      {hashtags.length > 5 && (
                        <span className="text-xs text-slate-500 py-1">+{hashtags.length - 5} more</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {filteredNodes.length === 0 && (
            <div className="col-span-full text-center py-20 text-slate-500">
              <svg className="w-12 h-12 mx-auto mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <p>No nodes found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListView;