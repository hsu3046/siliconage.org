import React, { useMemo, useState } from 'react';
import { useDebugContext } from './DebugContext';
import { LinkData, LinkType, ArrowHead, LinkIcon, NodeData } from '../../types';
import { Search, Filter, ArrowRight, ArrowLeftRight, Minus, Heart, Zap, Sparkles, Target } from 'lucide-react';

const LinkBrowser: React.FC = () => {
  const { data } = useDebugContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<LinkType | 'ALL'>('ALL');
  const [filterHasStory, setFilterHasStory] = useState<boolean | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'index' | 'type' | 'story'>('index');

  // Create a map of node IDs to node data for quick lookup
  const nodeMap = useMemo(() => {
    const map = new Map<string, NodeData>();
    data.nodes.forEach(node => map.set(node.id, node));
    return map;
  }, [data.nodes]);

  // Get node label safely
  const getNodeLabel = (nodeRef: string | NodeData): string => {
    if (typeof nodeRef === 'string') {
      return nodeMap.get(nodeRef)?.label || nodeRef;
    }
    return nodeRef.label;
  };

  // Get node ID safely
  const getNodeId = (nodeRef: string | NodeData): string => {
    if (typeof nodeRef === 'string') {
      return nodeRef;
    }
    return nodeRef.id;
  };

  // Filter and sort links
  const filteredLinks = useMemo(() => {
    let links = data.links.map((link, index) => ({ ...link, _index: index }));

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      links = links.filter(link => {
        const sourceLabel = getNodeLabel(link.source).toLowerCase();
        const targetLabel = getNodeLabel(link.target).toLowerCase();
        const story = (link.story || '').toLowerCase();
        return sourceLabel.includes(term) || targetLabel.includes(term) || story.includes(term);
      });
    }

    // Filter by type
    if (filterType !== 'ALL') {
      links = links.filter(link => link.type === filterType);
    }

    // Filter by story existence
    if (filterHasStory !== 'ALL') {
      links = links.filter(link => {
        const hasStory = Boolean(link.story && link.story.trim().length > 0);
        return hasStory === filterHasStory;
      });
    }

    // Sort
    if (sortBy === 'type') {
      links.sort((a, b) => a.type.localeCompare(b.type));
    } else if (sortBy === 'story') {
      links.sort((a, b) => {
        const aHasStory = Boolean(a.story && a.story.trim().length > 0);
        const bHasStory = Boolean(b.story && b.story.trim().length > 0);
        if (aHasStory === bHasStory) return 0;
        return aHasStory ? -1 : 1;
      });
    }
    // Default sort by index (original order)

    return links;
  }, [data.links, searchTerm, filterType, filterHasStory, sortBy]);

  // Get icon for link type
  const getLinkTypeIcon = (type: LinkType, icon?: LinkIcon) => {
    if (icon === LinkIcon.HEART) return <Heart className="w-4 h-4" />;
    if (icon === LinkIcon.RIVALRY) return <Target className="w-4 h-4" />;
    if (icon === LinkIcon.POWERS) return <Zap className="w-4 h-4" />;
    if (icon === LinkIcon.SPARK) return <Sparkles className="w-4 h-4" />;

    // Default icons by type
    if (type === LinkType.CREATES) return <Sparkles className="w-4 h-4" />;
    if (type === LinkType.POWERS) return <Zap className="w-4 h-4" />;
    if (type === LinkType.CONTRIBUTES) return <ArrowRight className="w-4 h-4" />;
    if (type === LinkType.ENGAGES) return <ArrowLeftRight className="w-4 h-4" />;

    return <Minus className="w-4 h-4" />;
  };

  // Get arrow representation
  const getArrowDisplay = (arrow: ArrowHead) => {
    if (arrow === ArrowHead.SINGLE) return '→';
    if (arrow === ArrowHead.DOUBLE) return '↔';
    return '—';
  };

  // Get color for link type
  const getLinkTypeColor = (type: LinkType) => {
    switch (type) {
      case LinkType.CREATES: return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case LinkType.POWERS: return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case LinkType.CONTRIBUTES: return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case LinkType.ENGAGES: return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  const stats = useMemo(() => {
    const byType: Record<LinkType, number> = {
      [LinkType.CREATES]: 0,
      [LinkType.POWERS]: 0,
      [LinkType.CONTRIBUTES]: 0,
      [LinkType.ENGAGES]: 0,
    };

    data.links.forEach(link => {
      byType[link.type] = (byType[link.type] || 0) + 1;
    });

    const withStory = data.links.filter(link => link.story && link.story.trim().length > 0).length;

    return { byType, withStory, total: data.links.length };
  }, [data.links]);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 p-6 bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
              <span className="text-2xl">🔗</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Link Browser</h2>
              <p className="text-sm text-slate-400">Browse and analyze all relationships in the knowledge graph</p>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <div className="p-3 bg-slate-900/50 rounded-lg">
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-xs text-slate-400">Total Links</div>
            </div>
            <div className="p-3 bg-slate-900/50 rounded-lg">
              <div className="text-2xl font-bold text-cyan-400">{stats.withStory}</div>
              <div className="text-xs text-slate-400">With Story</div>
            </div>
            <div className="p-3 bg-emerald-900/30 rounded-lg border border-emerald-500/20">
              <div className="text-xl font-bold text-emerald-400">{stats.byType[LinkType.CREATES]}</div>
              <div className="text-xs text-emerald-300/70">CREATES</div>
            </div>
            <div className="p-3 bg-yellow-900/30 rounded-lg border border-yellow-500/20">
              <div className="text-xl font-bold text-yellow-400">{stats.byType[LinkType.POWERS]}</div>
              <div className="text-xs text-yellow-300/70">POWERS</div>
            </div>
            <div className="p-3 bg-blue-900/30 rounded-lg border border-blue-500/20">
              <div className="text-xl font-bold text-blue-400">{stats.byType[LinkType.CONTRIBUTES]}</div>
              <div className="text-xs text-blue-300/70">CONTRIBUTES</div>
            </div>
            <div className="p-3 bg-purple-900/30 rounded-lg border border-purple-500/20">
              <div className="text-xl font-bold text-purple-400">{stats.byType[LinkType.ENGAGES]}</div>
              <div className="text-xs text-purple-300/70">ENGAGES</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 p-4 bg-slate-800/40 border border-slate-700 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search links..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Filter by Type */}
            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as LinkType | 'ALL')}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">All Types</option>
                <option value={LinkType.CREATES}>CREATES</option>
                <option value={LinkType.POWERS}>POWERS</option>
                <option value={LinkType.CONTRIBUTES}>CONTRIBUTES</option>
                <option value={LinkType.ENGAGES}>ENGAGES</option>
              </select>
            </div>

            {/* Filter by Story */}
            <div>
              <select
                value={String(filterHasStory)}
                onChange={(e) => setFilterHasStory(e.target.value === 'ALL' ? 'ALL' : e.target.value === 'true')}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">All Links</option>
                <option value="true">With Story</option>
                <option value="false">Without Story</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'index' | 'type' | 'story')}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="index">Sort: Original Order</option>
                <option value="type">Sort: By Type</option>
                <option value="story">Sort: Stories First</option>
              </select>
            </div>
          </div>

          <div className="mt-3 text-xs text-slate-400">
            Showing {filteredLinks.length} of {data.links.length} links
          </div>
        </div>

        {/* Links List */}
        <div className="space-y-2">
          {filteredLinks.map((link) => {
            const sourceLabel = getNodeLabel(link.source);
            const targetLabel = getNodeLabel(link.target);
            const hasStory = Boolean(link.story && link.story.trim().length > 0);

            return (
              <div
                key={link._index}
                className="p-4 bg-slate-800/60 border border-slate-700 rounded-lg hover:bg-slate-700/70 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Link Index */}
                  <div className="text-xs font-mono text-slate-500 mt-1">
                    #{link._index}
                  </div>

                  {/* Link Icon */}
                  <div className={`mt-1 p-2 rounded-lg border ${getLinkTypeColor(link.type)}`}>
                    {getLinkTypeIcon(link.type, link.icon)}
                  </div>

                  {/* Link Details */}
                  <div className="flex-1 min-w-0">
                    {/* Connection */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="font-mono text-sm text-cyan-400">{sourceLabel}</span>
                      <span className="text-slate-500">{getArrowDisplay(link.arrow)}</span>
                      <span className="font-mono text-sm text-purple-400">{targetLabel}</span>
                      <span className={`ml-2 px-2 py-0.5 rounded text-xs font-bold ${getLinkTypeColor(link.type)}`}>
                        {link.type}
                      </span>
                      {hasStory && (
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                          📖 Story
                        </span>
                      )}
                    </div>

                    {/* Story */}
                    {hasStory && (
                      <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-600">
                        <p className="text-sm text-slate-300">{link.story}</p>
                        {(link.startYear || link.endYear) && (
                          <div className="mt-2 text-xs text-slate-500">
                            {link.startYear && <span>Started: {link.startYear}</span>}
                            {link.startYear && link.endYear && <span className="mx-2">•</span>}
                            {link.endYear && <span>Ended: {link.endYear}</span>}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                      <span>Strength: {link.strength}</span>
                      <span>Arrow: {link.arrow}</span>
                      {link.icon && link.icon !== LinkIcon.NONE && <span>Icon: {link.icon}</span>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredLinks.length === 0 && (
            <div className="p-12 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-slate-400">No links found matching your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LinkBrowser;
