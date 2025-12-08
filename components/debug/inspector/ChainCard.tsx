import React from 'react';
import { ChainNode } from '../../../utils/debug/graphTraversal';
import { CATEGORY_COLORS } from '../../../constants';
import { getConnectionLabel } from '../../../utils/labels';
import { getLinkIcon } from '../../../utils/icons';

interface ChainCardProps {
  chain: ChainNode[];
  focusNodeId: string;
  onNodeClick: (nodeId: string) => void;
  direction: 'upstream' | 'downstream';
  maxDepth?: number;
}

const ChainCard: React.FC<ChainCardProps> = ({
  chain,
  focusNodeId,
  onNodeClick,
  direction,
  maxDepth = 3
}) => {
  if (chain.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-500 opacity-50">
        <p className="text-sm font-medium">No {direction === 'upstream' ? 'origins' : 'impact'} found</p>
      </div>
    );
  }

  const renderNode = (chainNode: ChainNode, level: number = 0) => {
    const node = chainNode.node;
    const indentClass = level > 0 ? `ml-${Math.min(level * 4, 12)}` : '';
    const depthBadgeColor =
      chainNode.depth === 1 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
      chainNode.depth === 2 ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' :
      'bg-purple-500/20 text-purple-400 border-purple-500/30';

    // Get label description for the link
    const focusNode = { id: focusNodeId } as any; // Simplified for label generation
    const linkLabel = chainNode.link
      ? getConnectionLabel(
          direction === 'upstream' ? node : focusNode,
          direction === 'upstream' ? focusNode : node,
          chainNode.link,
          direction === 'downstream'
        )
      : '';

    return (
      <div key={node.id} className={`${indentClass} mb-2`}>
        {/* Connection Arrow */}
        {level > 0 && (
          <div className="flex items-center gap-2 ml-2 mb-1">
            <div className="w-4 h-px bg-slate-600"></div>
            <span className="text-[10px] text-slate-500">
              {direction === 'upstream' ? '↑' : '↓'}
            </span>
          </div>
        )}

        {/* Node Card */}
        <button
          onClick={() => onNodeClick(node.id)}
          className="w-full p-3 bg-slate-800/60 hover:bg-slate-700/70 border border-slate-700/50 hover:border-slate-600 rounded-lg transition-all text-left group relative overflow-hidden hover:scale-[1.01]"
          style={{ borderLeftWidth: '4px', borderLeftColor: CATEGORY_COLORS[node.category] }}
        >
          {/* Depth Badge */}
          <div className="absolute top-2 right-2">
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${depthBadgeColor}`}>
              D{chainNode.depth}
            </span>
          </div>

          {/* Node Info */}
          <div className="flex items-start gap-2 pr-12">
            {/* Category Icon */}
            <div className="flex-shrink-0 mt-0.5">
              {node.category === 'COMPANY' && (
                <svg className="w-4 h-4" fill="none" stroke={CATEGORY_COLORS[node.category]} viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              )}
              {node.category === 'PERSON' && (
                <svg className="w-4 h-4" fill="none" stroke={CATEGORY_COLORS[node.category]} viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
              {node.category === 'TECHNOLOGY' && (
                <svg className="w-4 h-4" fill="none" stroke={CATEGORY_COLORS[node.category]} viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              )}
            </div>

            {/* Label & Link Info */}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-white text-sm leading-tight group-hover:text-cyan-300 transition-colors">
                {node.label}
              </div>
              {linkLabel && chainNode.link && (
                <div className="flex items-center gap-1.5 mt-1">
                  {getLinkIcon(
                    chainNode.link.type,
                    direction === 'upstream' ? node.category : { id: focusNodeId } as any,
                    direction === 'upstream' ? { id: focusNodeId } as any : node.category,
                    chainNode.link.icon,
                    'w-3 h-3'
                  )}
                  <span className="text-[10px] text-slate-400">{linkLabel}</span>
                </div>
              )}
              {node.year && (
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {node.year}
                </div>
              )}
            </div>
          </div>
        </button>

        {/* Recursive Children */}
        {chainNode.children && chainNode.children.length > 0 && (
          <div className="mt-2 ml-4 border-l-2 border-slate-700/50 pl-2">
            {chainNode.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {chain.map(chainNode => renderNode(chainNode, 0))}
    </div>
  );
};

export default ChainCard;
