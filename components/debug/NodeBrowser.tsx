import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useDebugContext } from './DebugContext';
import { NodeData, Category } from '../../types';
import { CATEGORY_COLORS } from '../../constants';
import { Search, ArrowUpDown } from 'lucide-react';

type SortField = 'label' | 'category' | 'year' | 'incoming' | 'outgoing';
type SortDirection = 'asc' | 'desc';

const NodeBrowser: React.FC = () => {
  const { data } = useDebugContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'ALL'>('ALL');
  const [sortField, setSortField] = useState<SortField>('label');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  // Calculate link counts for each node
  const nodeLinkCounts = useMemo(() => {
    const counts = new Map<string, { incoming: number; outgoing: number }>();

    data.nodes.forEach(node => {
      counts.set(node.id, { incoming: 0, outgoing: 0 });
    });

    data.links.forEach(link => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
      const targetId = typeof link.target === 'string' ? link.target : link.target.id;

      const sourceCount = counts.get(sourceId);
      const targetCount = counts.get(targetId);

      if (sourceCount) sourceCount.outgoing++;
      if (targetCount) targetCount.incoming++;
    });

    return counts;
  }, [data]);

  // Filter and sort nodes
  const filteredNodes = useMemo(() => {
    let result = [...data.nodes];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(node =>
        node.label.toLowerCase().includes(term) ||
        node.id.toLowerCase().includes(term) ||
        node.description?.toLowerCase().includes(term)
      );
    }

    // Category filter
    if (categoryFilter !== 'ALL') {
      result = result.filter(node => node.category === categoryFilter);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'label':
          comparison = a.label.localeCompare(b.label);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'year':
          comparison = (a.year || 0) - (b.year || 0);
          break;
        case 'incoming': {
          const aCount = nodeLinkCounts.get(a.id)?.incoming || 0;
          const bCount = nodeLinkCounts.get(b.id)?.incoming || 0;
          comparison = aCount - bCount;
          break;
        }
        case 'outgoing': {
          const aCount = nodeLinkCounts.get(a.id)?.outgoing || 0;
          const bCount = nodeLinkCounts.get(b.id)?.outgoing || 0;
          comparison = aCount - bCount;
          break;
        }
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [data.nodes, searchTerm, categoryFilter, sortField, sortDirection, nodeLinkCounts]);

  // Pagination
  const totalPages = Math.ceil(filteredNodes.length / itemsPerPage);
  const paginatedNodes = filteredNodes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getCategoryIcon = (category: Category) => {
    switch (category) {
      case Category.COMPANY:
        return '🏢';
      case Category.PERSON:
        return '👤';
      case Category.TECHNOLOGY:
        return '⚙️';
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header with Filters */}
      <div className="p-4 bg-slate-900/50 border-b border-slate-700">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search nodes... (Cmd+F)"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => { setCategoryFilter('ALL'); setCurrentPage(1); }}
                className={`px-3 py-2 text-xs font-bold rounded-lg transition-colors ${
                  categoryFilter === 'ALL'
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                ALL ({data.nodes.length})
              </button>
              {Object.keys(CATEGORY_COLORS).map(cat => {
                const category = cat as Category;
                const count = data.nodes.filter(n => n.category === category).length;
                return (
                  <button
                    key={category}
                    onClick={() => { setCategoryFilter(category); setCurrentPage(1); }}
                    className={`px-3 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 ${
                      categoryFilter === category
                        ? 'bg-slate-700 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                    style={{
                      borderLeft: `3px solid ${categoryFilter === category ? CATEGORY_COLORS[category] : 'transparent'}`
                    }}
                  >
                    <span>{getCategoryIcon(category)}</span>
                    <span>{category} ({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results count */}
          <div className="mt-3 text-sm text-slate-400">
            Showing {paginatedNodes.length} of {filteredNodes.length} nodes
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-4">
          <div className="bg-slate-800/40 border border-slate-700 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-900/60 border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('label')}
                      className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition-colors"
                    >
                      <span>LABEL</span>
                      {sortField === 'label' && <ArrowUpDown className="w-3 h-3" />}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('category')}
                      className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition-colors"
                    >
                      <span>CATEGORY</span>
                      {sortField === 'category' && <ArrowUpDown className="w-3 h-3" />}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('year')}
                      className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition-colors"
                    >
                      <span>YEAR</span>
                      {sortField === 'year' && <ArrowUpDown className="w-3 h-3" />}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleSort('incoming')}
                      className="flex items-center justify-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition-colors mx-auto"
                    >
                      <span>INCOMING</span>
                      {sortField === 'incoming' && <ArrowUpDown className="w-3 h-3" />}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleSort('outgoing')}
                      className="flex items-center justify-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition-colors mx-auto"
                    >
                      <span>OUTGOING</span>
                      {sortField === 'outgoing' && <ArrowUpDown className="w-3 h-3" />}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-slate-300">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {paginatedNodes.map((node, idx) => {
                  const counts = nodeLinkCounts.get(node.id) || { incoming: 0, outgoing: 0 };
                  return (
                    <tr
                      key={node.id}
                      className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span style={{ color: CATEGORY_COLORS[node.category] }}>
                            {getCategoryIcon(node.category)}
                          </span>
                          <div>
                            <div className="font-semibold text-white text-sm">{node.label}</div>
                            <div className="text-xs font-mono text-slate-500">{node.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="text-xs font-bold px-2 py-1 rounded"
                          style={{
                            backgroundColor: `${CATEGORY_COLORS[node.category]}20`,
                            color: CATEGORY_COLORS[node.category]
                          }}
                        >
                          {node.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">{node.year || '-'}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-bold text-emerald-400">{counts.incoming}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-bold text-cyan-400">{counts.outgoing}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setSelectedNode(node)}
                          className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                          VIEW
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-slate-800 border border-slate-600 rounded text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-slate-400">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-slate-800 border border-slate-600 rounded text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedNode && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedNode(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{getCategoryIcon(selectedNode.category)}</span>
                <div>
                  <h3 className="text-2xl font-bold text-white">{selectedNode.label}</h3>
                  <p className="text-sm text-slate-400">{selectedNode.category}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <pre className="text-xs text-slate-300 bg-slate-800/50 p-4 rounded-lg overflow-auto">
              {JSON.stringify(selectedNode, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default NodeBrowser;
