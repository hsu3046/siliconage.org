import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useDebugContext } from '../DebugContext';
import { NodeData } from '../../../types';
import { getUpstreamChain, getDownstreamChain, detectCycles, countNodesInChain } from '../../../utils/debug/graphTraversal';
import ChainCard from './ChainCard';
import NodeDetailPanel from './NodeDetailPanel';
import AlertBanner from './AlertBanner';
import { Search } from 'lucide-react';

const RelationshipView: React.FC = () => {
  const { data } = useDebugContext();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<NodeData[]>([]);
  const [maxDepth, setMaxDepth] = useState(1); // Default depth: 1
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Detect cycles in entire graph
  const cycleDetection = useMemo(() => {
    return detectCycles(data);
  }, [data]);

  // Get selected node
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return data.nodes.find(n => n.id === selectedNodeId) || null;
  }, [selectedNodeId, data]);

  // Get upstream and downstream chains
  const { upstream, downstream } = useMemo(() => {
    if (!selectedNodeId) {
      return { upstream: [], downstream: [] };
    }

    const upstreamChain = getUpstreamChain(selectedNodeId, data, maxDepth);
    const downstreamChain = getDownstreamChain(selectedNodeId, data, maxDepth);

    return {
      upstream: upstreamChain,
      downstream: downstreamChain
    };
  }, [selectedNodeId, data, maxDepth]);

  // Count nodes in chains
  const upstreamCount = countNodesInChain(upstream);
  const downstreamCount = countNodesInChain(downstream);

  // Check if selected node is part of any cycle
  const isNodeInCycle = useMemo(() => {
    if (!selectedNodeId || !cycleDetection.hasCycle) return false;
    return cycleDetection.cycles.some(cycle => cycle.includes(selectedNodeId));
  }, [selectedNodeId, cycleDetection]);

  // Handle search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.length > 0) {
      const matches = data.nodes
        .filter(n => n.label.toLowerCase().includes(term.toLowerCase()) || n.id.toLowerCase().includes(term.toLowerCase()))
        .sort((a, b) => a.label.localeCompare(b.label))
        .slice(0, 8);
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  };

  const handleNodeSelect = (node: NodeData) => {
    setSelectedNodeId(node.id);
    setSearchTerm('');
    setSuggestions([]);
  };

  const handleNodeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    // Scroll to top of center panel
    const centerPanel = document.getElementById('relationship-center-panel');
    if (centerPanel) {
      centerPanel.scrollTop = 0;
    }
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && suggestions.length > 0) {
      handleNodeSelect(suggestions[0]);
    }
  };

  // Global Cmd+F / Ctrl+F shortcut
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header with Search */}
      <div className="p-4 bg-slate-900/50 border-b border-slate-700">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search node to inspect... (Cmd+F)"
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-600 rounded-lg shadow-2xl overflow-hidden z-50 max-h-64 overflow-y-auto">
                  {suggestions.map(node => (
                    <button
                      key={node.id}
                      onClick={() => handleNodeSelect(node)}
                      className="w-full px-4 py-2 text-left hover:bg-slate-800 transition-colors flex items-center gap-2"
                    >
                      <span className="text-sm text-white">{node.label}</span>
                      <span className="text-xs text-slate-500">({node.category})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Depth Control */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Depth:</span>
              {[1, 2, 3].map(depth => (
                <button
                  key={depth}
                  onClick={() => setMaxDepth(depth)}
                  className={`px-3 py-1 text-xs font-bold rounded transition-colors ${
                    maxDepth === depth
                      ? 'bg-cyan-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {depth}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          {selectedNode && (
            <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
              <span>Origins: <strong className="text-emerald-400">{upstreamCount}</strong></span>
              <span>Impact: <strong className="text-cyan-400">{downstreamCount}</strong></span>
              <span>Total: <strong className="text-white">{upstreamCount + downstreamCount}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      {!selectedNode ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">🕸️</div>
            <h2 className="text-xl font-bold text-white mb-2">Relationship Inspector</h2>
            <p className="text-slate-400">Search for a node to explore its connections.</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          {/* Alerts */}
          {isNodeInCycle && (
            <div className="p-4">
              <AlertBanner
                type="cycle"
                message={`"${selectedNode.label}" is part of a circular dependency!`}
                details={cycleDetection.cycles
                  .filter(cycle => cycle.includes(selectedNodeId!))
                  .map(cycle => cycle.join(' → '))}
              />
            </div>
          )}

          {/* 3-Column Layout */}
          <div className="h-full grid grid-cols-3 gap-4 p-4 overflow-hidden">
            {/* LEFT: Origins (Upstream) */}
            <div className="flex flex-col overflow-hidden">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-lg">◀️</span>
                <div>
                  <h3 className="text-sm font-bold text-white">ORIGINS</h3>
                  <p className="text-[10px] text-slate-500">Roots & Inspiration</p>
                </div>
                <span className="ml-auto text-xs font-bold text-emerald-400">
                  {upstreamCount}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <ChainCard
                  chain={upstream}
                  focusNodeId={selectedNodeId!}
                  onNodeClick={handleNodeClick}
                  direction="upstream"
                  maxDepth={maxDepth}
                />
              </div>
            </div>

            {/* CENTER: Focus Node */}
            <div className="flex flex-col overflow-hidden" id="relationship-center-panel">
              <div className="mb-3 flex items-center justify-center gap-2">
                <span className="text-lg">🎯</span>
                <div className="text-center">
                  <h3 className="text-sm font-bold text-white">FOCUS</h3>
                  <p className="text-[10px] text-slate-500">Current Node</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-800/30 rounded-lg border border-slate-700">
                <NodeDetailPanel node={selectedNode} data={data} />
              </div>
            </div>

            {/* RIGHT: Impact (Downstream) */}
            <div className="flex flex-col overflow-hidden">
              <div className="mb-3 flex items-center gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white">IMPACT</h3>
                  <p className="text-[10px] text-slate-500">Legacy & Usage</p>
                </div>
                <span className="text-lg">▶️</span>
                <span className="ml-auto text-xs font-bold text-cyan-400">
                  {downstreamCount}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <ChainCard
                  chain={downstream}
                  focusNodeId={selectedNodeId!}
                  onNodeClick={handleNodeClick}
                  direction="downstream"
                  maxDepth={maxDepth}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RelationshipView;
