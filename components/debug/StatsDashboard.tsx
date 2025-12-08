import React, { useMemo } from 'react';
import { useDebugContext } from './DebugContext';
import {
  calculateOverallStats,
  calculateRoleDistribution,
  calculateTimelineDistribution,
  getTopConnectedNodes,
  getLeastConnectedNodes,
  findCoverageGaps
} from '../../utils/debug/statistics';
import { CATEGORY_COLORS } from '../../constants';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StatsDashboard: React.FC = () => {
  const { data } = useDebugContext();

  const overallStats = useMemo(() => calculateOverallStats(data), [data]);
  const roleDistribution = useMemo(() => calculateRoleDistribution(data.nodes), [data]);
  const timelineDistribution = useMemo(() => calculateTimelineDistribution(data.nodes), [data]);
  const topConnected = useMemo(() => getTopConnectedNodes(data, 10), [data]);
  const leastConnected = useMemo(() => getLeastConnectedNodes(data, 10), [data]);
  const coverageGaps = useMemo(() => findCoverageGaps(data.nodes, 5), [data]);

  // Colors for charts
  const CHART_COLORS = {
    COMPANY: CATEGORY_COLORS.COMPANY,
    PERSON: CATEGORY_COLORS.PERSON,
    TECHNOLOGY: CATEGORY_COLORS.TECHNOLOGY,
    creates: '#0891b2',
    powers: '#c2410c',
    contributes: '#a855f7',
    engages: '#64748b'
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
            <span className="text-2xl">📊</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Statistics Dashboard</h2>
            <p className="text-sm text-slate-400">Data distribution and analysis</p>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-6 bg-gradient-to-br from-cyan-500/10 to-cyan-900/10 border border-cyan-500/30 rounded-xl">
            <div className="text-4xl font-bold text-cyan-400 mb-2">{overallStats.totalNodes}</div>
            <div className="text-sm text-slate-300 font-medium">Total Nodes</div>
          </div>
          <div className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-900/10 border border-purple-500/30 rounded-xl">
            <div className="text-4xl font-bold text-purple-400 mb-2">{overallStats.totalLinks}</div>
            <div className="text-sm text-slate-300 font-medium">Total Links</div>
          </div>
          <div className="p-6 bg-gradient-to-br from-emerald-500/10 to-emerald-900/10 border border-emerald-500/30 rounded-xl">
            <div className="text-4xl font-bold text-emerald-400 mb-2">{overallStats.avgConnectionsPerNode}</div>
            <div className="text-sm text-slate-300 font-medium">Avg Connections</div>
          </div>
          <div className="p-6 bg-gradient-to-br from-orange-500/10 to-orange-900/10 border border-orange-500/30 rounded-xl">
            <div className="text-4xl font-bold text-orange-400 mb-2">
              {overallStats.dateRange.earliest}-{overallStats.dateRange.latest}
            </div>
            <div className="text-sm text-slate-300 font-medium">Year Range ({overallStats.dateRange.span} years)</div>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="p-6 bg-slate-800/40 border border-slate-700 rounded-xl">
            <h3 className="text-lg font-bold text-white mb-4">Category Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={overallStats.categoryStats}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ category, percentage }) => `${category}: ${percentage}%`}
                  labelLine={false}
                >
                  {overallStats.categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[entry.category]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {overallStats.categoryStats.map(stat => (
                <div key={stat.category} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: CHART_COLORS[stat.category] }}></div>
                    <span className="text-slate-300">{stat.category}</span>
                  </div>
                  <span className="font-bold text-white">{stat.count} ({stat.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>

          {/* Link Type Distribution */}
          <div className="p-6 bg-slate-800/40 border border-slate-700 rounded-xl">
            <h3 className="text-lg font-bold text-white mb-4">Link Type Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={overallStats.linkTypeStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="type" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {overallStats.linkTypeStats.map(stat => (
                <div key={stat.type} className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">{stat.type}</span>
                  <span className="font-bold text-white">{stat.count} ({stat.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline Histogram */}
        <div className="p-6 bg-slate-800/40 border border-slate-700 rounded-xl">
          <h3 className="text-lg font-bold text-white mb-4">Timeline Distribution by Decade</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={timelineDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="decade" stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Bar dataKey="companies" stackId="a" fill={CHART_COLORS.COMPANY} name="Companies" />
              <Bar dataKey="people" stackId="a" fill={CHART_COLORS.PERSON} name="People" />
              <Bar dataKey="technologies" stackId="a" fill={CHART_COLORS.TECHNOLOGY} name="Technologies" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Coverage Gaps */}
        {coverageGaps.length > 0 && (
          <div className="p-6 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">⚠️</span>
              <h3 className="text-lg font-bold text-amber-400">Coverage Gaps</h3>
            </div>
            <p className="text-sm text-slate-300 mb-3">Time periods with fewer than 5 nodes:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {coverageGaps.map(gap => (
                <div key={gap.decade} className="p-3 bg-slate-900/50 rounded-lg">
                  <div className="font-bold text-white">{gap.decade}</div>
                  <div className="text-xs text-slate-400">{gap.count} nodes</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Connected Nodes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Most Connected */}
          <div className="p-6 bg-slate-800/40 border border-slate-700 rounded-xl">
            <h3 className="text-lg font-bold text-white mb-4">🏆 Most Connected Nodes</h3>
            <div className="space-y-2">
              {topConnected.map((node, idx) => (
                <div key={node.nodeId} className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900/70 transition-colors">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-emerald-400">#{idx + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-sm">{node.label}</div>
                    <div className="text-xs text-slate-400">
                      {node.category} • {node.incoming}↓ {node.outgoing}↑
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="text-lg font-bold text-emerald-400">{node.totalConnections}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Least Connected */}
          <div className="p-6 bg-slate-800/40 border border-slate-700 rounded-xl">
            <h3 className="text-lg font-bold text-white mb-4">📉 Least Connected Nodes</h3>
            <div className="space-y-2">
              {leastConnected.map((node, idx) => (
                <div key={node.nodeId} className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900/70 transition-colors">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-red-400">#{idx + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-sm">{node.label}</div>
                    <div className="text-xs text-slate-400">
                      {node.category} • {node.incoming}↓ {node.outgoing}↑
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="text-lg font-bold text-red-400">{node.totalConnections}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Role Distribution (Top 10) */}
        <div className="p-6 bg-slate-800/40 border border-slate-700 rounded-xl">
          <h3 className="text-lg font-bold text-white mb-4">Role Distribution (Top 10)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {roleDistribution.slice(0, 10).map(role => (
              <div key={role.role} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded" style={{ backgroundColor: CHART_COLORS[role.category] }}></div>
                  <span className="text-sm text-slate-300">{role.role}</span>
                </div>
                <span className="text-sm font-bold text-white">{role.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
