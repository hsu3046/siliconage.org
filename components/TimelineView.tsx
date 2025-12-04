
import React, { useEffect } from 'react';
import { GraphData, NodeData, Category } from '../types';
import { CATEGORY_COLORS } from '../constants';

interface TimelineViewProps {
  data: GraphData;
  onNodeClick: (node: NodeData) => void;
  scrollToNodeId?: string | null;
}

const TimelineView: React.FC<TimelineViewProps> = ({ data, onNodeClick, scrollToNodeId }) => {
  // Sort nodes by year
  const sortedNodes = [...data.nodes].sort((a, b) => a.year - b.year);

  // Group by year to handle multiple events in one year
  const groupedByYear: Record<number, NodeData[]> = {};
  sortedNodes.forEach(node => {
    if (!groupedByYear[node.year]) groupedByYear[node.year] = [];
    groupedByYear[node.year].push(node);
  });

  const years = Object.keys(groupedByYear).map(Number).sort((a, b) => a - b);

  // Helper to handle internal scrolling
  const scrollToNode = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const element = document.getElementById(`timeline-node-${nodeId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const targetNode = data.nodes.find(n => n.id === nodeId);
      if (targetNode) onNodeClick(targetNode);
    }
  };

  // Effect to scroll to specific node when prop changes (external navigation)
  useEffect(() => {
    if (scrollToNodeId) {
      const element = document.getElementById(`timeline-node-${scrollToNodeId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [scrollToNodeId]);

  // Helper to formulate the Sub-Label matching Map/List view
  const getSubLabel = (node: NodeData) => {
    if (node.category === Category.COMPANY) {
      return `${node.year} - Current`;
    }
    if (node.category === Category.PERSON) {
      return node.role || null;
    }
    return `${node.year}`;
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-background p-4 md:p-8 custom-scrollbar scroll-smooth">
      <div className="max-w-6xl mx-auto relative">
        {/* Central Line */}
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-slate-800 transform md:-translate-x-1/2"></div>

        {years.map((year) => (
          <div key={year} className="mb-8 relative">

            {/* Year Badge */}
            <div className="flex items-center justify-start md:justify-center mb-6 pl-10 md:pl-0 pt-4">
              <span className="bg-slate-900 text-slate-300 font-mono font-bold text-lg px-4 py-1 rounded-full border border-slate-700 z-10 shadow-xl">
                {year}
              </span>
            </div>

            {/* Container for the year's events - Flex Wrap allows side-by-side */}
            <div className="relative flex flex-col md:flex-row md:flex-wrap w-full">
              {groupedByYear[year].map((node, i) => {
                // Calculate connections for hashtags
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

                // Determine Layout: Left (Even index) vs Right (Odd index)
                const isLeft = i % 2 === 0;
                const subLabel = getSubLabel(node);

                return (
                  <div
                    key={node.id}
                    id={`timeline-node-${node.id}`}
                    className={`
                            relative w-full md:w-1/2 mb-8 flex
                            pl-12 md:pl-0
                            ${isLeft ? 'md:justify-end md:pr-12' : 'md:justify-start md:pl-12'}
                        `}
                  >
                    {/* Connector Line */}
                    <div
                      className={`
                                absolute top-6 h-0.5 bg-slate-700
                                ${isLeft ? 'left-4 right-full md:left-auto md:-right-0 md:w-12' : 'left-4 w-8 md:w-12 md:-left-0'}
                            `}
                    ></div>

                    {/* Card */}
                    <div
                      onClick={() => onNodeClick(node)}
                      className={`
                                bg-surface p-5 rounded-xl border border-slate-700/50 shadow-lg 
                                cursor-pointer hover:border-slate-500 hover:shadow-2xl transition-all duration-300
                                group relative overflow-hidden w-full max-w-lg
                            `}
                    >
                      {/* Category Accent Bar */}
                      <div
                        className={`absolute top-0 bottom-0 w-1 ${isLeft ? 'right-0' : 'left-0'}`}
                        style={{ backgroundColor: CATEGORY_COLORS[node.category] }}
                      ></div>

                      <div className={`flex flex-col ${isLeft ? 'md:items-end' : 'md:items-start'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 border border-slate-700"
                            style={{ color: CATEGORY_COLORS[node.category] }}
                          >
                            {node.category}
                          </span>

                          {/* Exact Score Display */}
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

                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors leading-tight text-left md:text-inherit">
                          {node.label}
                        </h3>

                        {/* Sub Label (Year/Role) */}
                        {subLabel && (
                          <span className={`text-xs font-mono text-slate-400 mb-3 block text-left ${isLeft ? 'md:text-right' : 'md:text-left'}`}>
                            {subLabel}
                          </span>
                        )}

                        <p className={`text-sm text-slate-400 leading-relaxed mb-4 text-left ${isLeft ? 'md:text-right' : 'md:text-left'}`}>
                          {node.description}
                        </p>

                        {/* Interactive Hashtags */}
                        {hashtags.length > 0 && (
                          <div className={`flex flex-wrap gap-2 justify-start ${isLeft ? 'md:justify-end' : 'md:justify-start'}`}>
                            {hashtags.map((tag, idx) => (
                              <span
                                key={`${node.id}-tag-${idx}`}
                                onClick={(e) => tag && scrollToNode(e, tag.id)}
                                className="text-xs font-mono text-blue-400 hover:text-blue-300 hover:underline bg-blue-500/10 px-2 py-1 rounded cursor-pointer transition-colors"
                              >
                                #{tag?.label.replace(/\s+/g, '')}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* End Cap */}
        <div className="flex justify-center mt-8 pb-12">
          <div className="w-3 h-3 rounded-full bg-slate-800 border border-slate-600"></div>
        </div>
      </div>
    </div>
  );
};

export default TimelineView;
