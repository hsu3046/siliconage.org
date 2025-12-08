import React from 'react';
import { NodeData } from '../../../types';
import { CATEGORY_COLORS } from '../../../constants';
import { getLinkTypeCounts } from '../../../utils/debug/graphTraversal';
import { GraphData } from '../../../types';

interface NodeDetailPanelProps {
  node: NodeData;
  data: GraphData;
}

const NodeDetailPanel: React.FC<NodeDetailPanelProps> = ({ node, data }) => {
  const linkCounts = getLinkTypeCounts(node.id, data);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'COMPANY':
        return '🏢';
      case 'PERSON':
        return '👤';
      case 'TECHNOLOGY':
        return '⚙️';
      default:
        return '📦';
    }
  };

  const getStatusBadge = () => {
    const totalConnections =
      linkCounts.creates.incoming + linkCounts.creates.outgoing +
      linkCounts.powers.incoming + linkCounts.powers.outgoing +
      linkCounts.contributes.incoming + linkCounts.contributes.outgoing +
      linkCounts.engages.incoming + linkCounts.engages.outgoing;

    if (totalConnections === 0) {
      return { label: 'Orphan', color: 'bg-red-500/20 text-red-400 border-red-500/30', emoji: '⚠️' };
    } else if (totalConnections < 3) {
      return { label: 'Low Activity', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', emoji: '📉' };
    } else if (totalConnections > 10) {
      return { label: 'Highly Connected', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', emoji: '⭐' };
    } else {
      return { label: 'Healthy', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', emoji: '✅' };
    }
  };

  const status = getStatusBadge();

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div
        className="p-6 rounded-t-xl border-2 relative overflow-hidden"
        style={{
          borderColor: CATEGORY_COLORS[node.category],
          background: `linear-gradient(135deg, ${CATEGORY_COLORS[node.category]}18 0%, ${CATEGORY_COLORS[node.category]}08 50%, transparent 100%)`
        }}
      >
        <div className="absolute inset-0 opacity-10" style={{ background: `radial-gradient(circle at 50% 30%, ${CATEGORY_COLORS[node.category]}40 0%, transparent 65%)` }} />

        <div className="relative z-10">
          {/* Icon + Category Badge */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-4xl">{getCategoryIcon(node.category)}</span>
            <div className="flex gap-2">
              <span className={`text-[9px] font-bold px-2 py-1 rounded border ${status.color}`}>
                {status.emoji} {status.label}
              </span>
              <span
                className="text-[9px] font-bold px-2 py-1 rounded border"
                style={{
                  backgroundColor: `${CATEGORY_COLORS[node.category]}20`,
                  color: CATEGORY_COLORS[node.category],
                  borderColor: `${CATEGORY_COLORS[node.category]}50`
                }}
              >
                {node.category}
              </span>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white mb-2 leading-tight">{node.label}</h2>

          {/* Metadata */}
          <div className="flex gap-4 text-sm text-slate-300">
            {node.year && <span className="font-medium">{node.year}</span>}
            {node.category === 'COMPANY' && node.companyCategories && (
              <span className="text-xs bg-slate-900/50 px-2 py-0.5 rounded">
                {node.companyCategories[0]}
              </span>
            )}
            {node.category === 'PERSON' && node.primaryRole && (
              <span className="text-xs bg-slate-900/50 px-2 py-0.5 rounded">
                {node.primaryRole}
              </span>
            )}
            {node.category === 'TECHNOLOGY' && node.techCategoryL2 && (
              <span className="text-xs bg-slate-900/50 px-2 py-0.5 rounded">
                {node.techCategoryL2}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="flex-1 p-6 bg-slate-800/30 overflow-y-auto">
        <div className="mb-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Description</h3>
          <p className="text-sm text-slate-300 leading-relaxed">{node.description}</p>
        </div>

        {/* Link Type Breakdown */}
        <div className="mb-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Connection Breakdown</h3>
          <div className="grid grid-cols-2 gap-2">
            {/* CREATES */}
            {(linkCounts.creates.incoming > 0 || linkCounts.creates.outgoing > 0) && (
              <div className="p-2 bg-slate-900/50 rounded border border-cyan-500/30">
                <div className="text-[10px] text-cyan-400 font-bold mb-1">CREATES</div>
                <div className="flex justify-between text-xs text-slate-300">
                  <span>In: {linkCounts.creates.incoming}</span>
                  <span>Out: {linkCounts.creates.outgoing}</span>
                </div>
              </div>
            )}

            {/* POWERS */}
            {(linkCounts.powers.incoming > 0 || linkCounts.powers.outgoing > 0) && (
              <div className="p-2 bg-slate-900/50 rounded border border-orange-500/30">
                <div className="text-[10px] text-orange-400 font-bold mb-1">POWERS</div>
                <div className="flex justify-between text-xs text-slate-300">
                  <span>In: {linkCounts.powers.incoming}</span>
                  <span>Out: {linkCounts.powers.outgoing}</span>
                </div>
              </div>
            )}

            {/* CONTRIBUTES */}
            {(linkCounts.contributes.incoming > 0 || linkCounts.contributes.outgoing > 0) && (
              <div className="p-2 bg-slate-900/50 rounded border border-purple-500/30">
                <div className="text-[10px] text-purple-400 font-bold mb-1">CONTRIBUTES</div>
                <div className="flex justify-between text-xs text-slate-300">
                  <span>In: {linkCounts.contributes.incoming}</span>
                  <span>Out: {linkCounts.contributes.outgoing}</span>
                </div>
              </div>
            )}

            {/* ENGAGES */}
            {(linkCounts.engages.incoming > 0 || linkCounts.engages.outgoing > 0) && (
              <div className="p-2 bg-slate-900/50 rounded border border-slate-500/30">
                <div className="text-[10px] text-slate-400 font-bold mb-1">ENGAGES</div>
                <div className="flex justify-between text-xs text-slate-300">
                  <span>In: {linkCounts.engages.incoming}</span>
                  <span>Out: {linkCounts.engages.outgoing}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Raw Data (Collapsible) */}
        <details className="group">
          <summary className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 cursor-pointer hover:text-slate-300 transition-colors">
            Raw Data ▾
          </summary>
          <pre className="text-[10px] text-slate-400 bg-slate-900/50 p-3 rounded overflow-x-auto mt-2">
            {JSON.stringify(node, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
};

export default NodeDetailPanel;
