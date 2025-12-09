import React, { useMemo, useState } from 'react';
import { useDebugContext } from './DebugContext';
import {
  calculateOverallStats,
  calculateRoleDistribution,
  calculateTimelineDistribution,
  getTopConnectedNodes,
  getLeastConnectedNodes,
  findCoverageGaps,
  generateDataQualityReport,
} from '../../utils/debug/statistics';
import { CATEGORY_COLORS } from '../../constants';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle, Award } from 'lucide-react';

type TabType = 'overview' | 'quality' | 'balance' | 'links' | 'timeline';

const StatsDashboard: React.FC = () => {
  const { data } = useDebugContext();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const overallStats = useMemo(() => calculateOverallStats(data), [data]);
  const roleDistribution = useMemo(() => calculateRoleDistribution(data.nodes), [data]);
  const timelineDistribution = useMemo(() => calculateTimelineDistribution(data.nodes), [data]);
  const topConnected = useMemo(() => getTopConnectedNodes(data, 10), [data]);
  const leastConnected = useMemo(() => getLeastConnectedNodes(data, 10), [data]);
  const coverageGaps = useMemo(() => findCoverageGaps(data.nodes, 5), [data]);
  const qualityReport = useMemo(() => generateDataQualityReport(data), [data]);

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

  const GRADE_COLORS = {
    A: '#10b981', // emerald
    B: '#22c55e', // green
    C: '#eab308', // yellow
    D: '#f97316', // orange
    F: '#ef4444', // red
  };

  const COVERAGE_COLORS = {
    excellent: '#10b981',
    good: '#22c55e',
    fair: '#eab308',
    poor: '#f97316',
    missing: '#64748b',
  };

  const tabs = [
    { id: 'overview' as TabType, label: '📊 Overview', icon: '📊' },
    { id: 'quality' as TabType, label: '⭐ Quality Report', icon: '⭐' },
    { id: 'balance' as TabType, label: '⚖️ Category Balance', icon: '⚖️' },
    { id: 'links' as TabType, label: '🔗 Link Analysis', icon: '🔗' },
    { id: 'timeline' as TabType, label: '📅 Timeline Coverage', icon: '📅' },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Tab Navigation */}
      <div className="border-b border-slate-700 bg-slate-800/30 shrink-0">
        <div className="flex items-center gap-2 px-6 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-purple-500 text-white bg-slate-900/50'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900/30'
              }`}
            >
              <span className="font-bold text-sm">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Statistics Overview</h2>
                  <p className="text-sm text-slate-400">High-level data distribution summary</p>
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
            </>
          )}

          {/* QUALITY REPORT TAB */}
          {activeTab === 'quality' && (
            <>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                    <Award className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Data Quality Report</h2>
                    <p className="text-sm text-slate-400">Comprehensive dataset health analysis</p>
                  </div>
                </div>

                {/* Overall Grade Badge */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-slate-400">Overall Score</div>
                    <div className="text-3xl font-bold text-white">{qualityReport.overallScore}/100</div>
                  </div>
                  <div
                    className="w-24 h-24 rounded-full border-4 flex items-center justify-center"
                    style={{ borderColor: GRADE_COLORS[qualityReport.grade] }}
                  >
                    <span className="text-5xl font-bold" style={{ color: GRADE_COLORS[qualityReport.grade] }}>
                      {qualityReport.grade}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quality Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-slate-800/40 border border-slate-700 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-slate-400">Category Balance</div>
                    {qualityReport.categoryBalance.overall.isBalanced ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    )}
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {qualityReport.categoryBalance.overall.balanceScore}/100
                  </div>
                  <div className="text-xs text-slate-500">
                    {qualityReport.categoryBalance.overall.isBalanced ? 'Well balanced' : 'Needs improvement'}
                  </div>
                </div>

                <div className="p-4 bg-slate-800/40 border border-slate-700 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-slate-400">Link Density</div>
                    {qualityReport.linkDensity.recommendations.length === 0 ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    )}
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {qualityReport.linkDensity.averageLinks} avg
                  </div>
                  <div className="text-xs text-slate-500">
                    {qualityReport.linkDensity.recommendations.length} issue(s)
                  </div>
                </div>

                <div className="p-4 bg-slate-800/40 border border-slate-700 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-slate-400">Temporal Coverage</div>
                    {qualityReport.temporalCoverage.gaps.length === 0 ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    )}
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {qualityReport.temporalCoverage.coverageByDecade.filter(d => d.coverage === 'excellent').length}
                    /{qualityReport.temporalCoverage.coverageByDecade.length}
                  </div>
                  <div className="text-xs text-slate-500">
                    Excellent decades
                  </div>
                </div>
              </div>

              {/* All Recommendations */}
              {(qualityReport.categoryBalance.recommendations.length > 0 ||
                qualityReport.linkDensity.recommendations.length > 0 ||
                qualityReport.temporalCoverage.recommendations.length > 0) && (
                <div className="p-6 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    <h3 className="text-lg font-bold text-amber-400">Recommendations</h3>
                  </div>
                  <div className="space-y-4">
                    {qualityReport.categoryBalance.recommendations.length > 0 && (
                      <div>
                        <div className="text-sm font-bold text-slate-300 mb-2">Category Balance:</div>
                        <ul className="space-y-1">
                          {qualityReport.categoryBalance.recommendations.map((rec, idx) => (
                            <li key={idx} className="text-sm text-slate-400 flex items-start gap-2">
                              <span className="text-amber-400">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {qualityReport.linkDensity.recommendations.length > 0 && (
                      <div>
                        <div className="text-sm font-bold text-slate-300 mb-2">Link Density:</div>
                        <ul className="space-y-1">
                          {qualityReport.linkDensity.recommendations.map((rec, idx) => (
                            <li key={idx} className="text-sm text-slate-400 flex items-start gap-2">
                              <span className="text-amber-400">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {qualityReport.temporalCoverage.recommendations.length > 0 && (
                      <div>
                        <div className="text-sm font-bold text-slate-300 mb-2">Temporal Coverage:</div>
                        <ul className="space-y-1">
                          {qualityReport.temporalCoverage.recommendations.map((rec, idx) => (
                            <li key={idx} className="text-sm text-slate-400 flex items-start gap-2">
                              <span className="text-amber-400">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* CATEGORY BALANCE TAB */}
          {activeTab === 'balance' && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <span className="text-2xl">⚖️</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Category Balance Analysis</h2>
                  <p className="text-sm text-slate-400">Distribution fairness across eras and categories</p>
                </div>
              </div>

              {/* Era Balance Table */}
              <div className="p-6 bg-slate-800/40 border border-slate-700 rounded-xl">
                <h3 className="text-lg font-bold text-white mb-4">Balance by Era</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left p-3 text-slate-400 font-semibold">Era</th>
                        <th className="text-center p-3 text-slate-400 font-semibold">Total</th>
                        <th className="text-center p-3 text-slate-400 font-semibold">Companies</th>
                        <th className="text-center p-3 text-slate-400 font-semibold">People</th>
                        <th className="text-center p-3 text-slate-400 font-semibold">Tech</th>
                        <th className="text-center p-3 text-slate-400 font-semibold">Diversity</th>
                        <th className="text-center p-3 text-slate-400 font-semibold">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {qualityReport.categoryBalance.byEra.map((era, idx) => (
                        <tr key={idx} className="border-b border-slate-800 hover:bg-slate-900/30">
                          <td className="p-3 font-semibold text-white">{era.eraName}</td>
                          <td className="p-3 text-center text-slate-300">{era.totalNodes}</td>
                          <td className="p-3 text-center" style={{ color: CHART_COLORS.COMPANY }}>{era.companies}</td>
                          <td className="p-3 text-center" style={{ color: CHART_COLORS.PERSON }}>{era.people}</td>
                          <td className="p-3 text-center" style={{ color: CHART_COLORS.TECHNOLOGY }}>{era.technologies}</td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-1 bg-slate-900/50 rounded text-xs font-bold">
                              {era.diversityScore}/100
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className="px-2 py-1 rounded text-xs font-bold"
                              style={{
                                backgroundColor: era.balance === 'excellent' ? '#10b98120' :
                                  era.balance === 'good' ? '#22c55e20' :
                                  era.balance === 'fair' ? '#eab30820' : '#f9731620',
                                color: era.balance === 'excellent' ? '#10b981' :
                                  era.balance === 'good' ? '#22c55e' :
                                  era.balance === 'fair' ? '#eab308' : '#f97316',
                              }}
                            >
                              {era.balance}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* LINK ANALYSIS TAB */}
          {activeTab === 'links' && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <span className="text-2xl">🔗</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Link Density Analysis</h2>
                  <p className="text-sm text-slate-400">Connection patterns and distribution</p>
                </div>
              </div>

              {/* Connection Averages */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-slate-800/40 border border-slate-700 rounded-xl">
                  <div className="text-sm text-slate-400 mb-2">Overall Average</div>
                  <div className="text-3xl font-bold text-white">{qualityReport.linkDensity.averageLinks}</div>
                </div>
                <div className="p-4 bg-slate-800/40 border border-slate-700 rounded-xl">
                  <div className="text-sm text-slate-400 mb-2">Company Avg</div>
                  <div className="text-3xl font-bold" style={{ color: CHART_COLORS.COMPANY }}>
                    {qualityReport.linkDensity.companyAvg}
                  </div>
                </div>
                <div className="p-4 bg-slate-800/40 border border-slate-700 rounded-xl">
                  <div className="text-sm text-slate-400 mb-2">Person Avg</div>
                  <div className="text-3xl font-bold" style={{ color: CHART_COLORS.PERSON }}>
                    {qualityReport.linkDensity.personAvg}
                  </div>
                </div>
                <div className="p-4 bg-slate-800/40 border border-slate-700 rounded-xl">
                  <div className="text-sm text-slate-400 mb-2">Tech Avg</div>
                  <div className="text-3xl font-bold" style={{ color: CHART_COLORS.TECHNOLOGY }}>
                    {qualityReport.linkDensity.techAvg}
                  </div>
                </div>
              </div>

              {/* Link Type Balance */}
              <div className="p-6 bg-slate-800/40 border border-slate-700 rounded-xl mb-6">
                <h3 className="text-lg font-bold text-white mb-4">Link Type Balance</h3>
                <div className="space-y-3">
                  {qualityReport.linkDensity.linkTypeBalance.map(linkType => (
                    <div key={linkType.type} className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-32 text-sm text-slate-300">{linkType.type}</div>
                      <div className="flex-1">
                        <div className="h-6 bg-slate-900/50 rounded-full overflow-hidden">
                          <div
                            className="h-full flex items-center justify-center text-xs font-bold"
                            style={{
                              width: `${linkType.percentage}%`,
                              backgroundColor: linkType.isBalanced ? '#10b981' : '#f97316',
                            }}
                          >
                            {linkType.percentage}%
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0 w-16 text-right">
                        {linkType.isBalanced ? (
                          <CheckCircle className="w-5 h-5 text-emerald-400 inline" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-orange-400 inline" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hub & Isolated Nodes */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Hub Nodes */}
                {qualityReport.linkDensity.hubNodes.length > 0 && (
                  <div className="p-6 bg-slate-800/40 border border-slate-700 rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                      <h3 className="text-lg font-bold text-white">Hub Nodes</h3>
                      <span className="text-xs text-slate-500">(2x+ avg connections)</span>
                    </div>
                    <div className="space-y-2">
                      {qualityReport.linkDensity.hubNodes.map((node, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-2 bg-slate-900/30 rounded">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-white truncate">{node.label}</div>
                            <div className="text-xs text-slate-500">{node.category}</div>
                          </div>
                          <div className="flex-shrink-0 text-emerald-400 font-bold">{node.totalConnections}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Isolated Nodes */}
                {qualityReport.linkDensity.isolatedNodes.length > 0 && (
                  <div className="p-6 bg-slate-800/40 border border-slate-700 rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingDown className="w-5 h-5 text-red-400" />
                      <h3 className="text-lg font-bold text-white">Isolated Nodes</h3>
                      <span className="text-xs text-slate-500">(≤1 connections)</span>
                    </div>
                    <div className="space-y-2">
                      {qualityReport.linkDensity.isolatedNodes.map((node, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-2 bg-slate-900/30 rounded">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-white truncate">{node.label}</div>
                            <div className="text-xs text-slate-500">{node.category}</div>
                          </div>
                          <div className="flex-shrink-0 text-red-400 font-bold">{node.totalConnections}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* TIMELINE COVERAGE TAB */}
          {activeTab === 'timeline' && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <span className="text-2xl">📅</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Timeline Coverage Analysis</h2>
                  <p className="text-sm text-slate-400">Historical coverage and gaps</p>
                </div>
              </div>

              {/* Coverage by Decade */}
              <div className="p-6 bg-slate-800/40 border border-slate-700 rounded-xl mb-6">
                <h3 className="text-lg font-bold text-white mb-4">Coverage Quality by Decade</h3>
                <div className="space-y-3">
                  {qualityReport.temporalCoverage.coverageByDecade.map((decade, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-24 text-sm font-semibold text-white">{decade.decade}</div>
                      <div className="flex-1">
                        <div className="h-8 bg-slate-900/50 rounded-lg overflow-hidden relative">
                          <div
                            className="h-full flex items-center px-3 text-xs font-bold text-white"
                            style={{
                              width: `${Math.max((decade.nodeCount / 20) * 100, 5)}%`,
                              backgroundColor: COVERAGE_COLORS[decade.coverage],
                            }}
                          >
                            {decade.nodeCount} nodes
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0 w-24 text-right">
                        <span
                          className="px-2 py-1 rounded text-xs font-bold"
                          style={{
                            backgroundColor: `${COVERAGE_COLORS[decade.coverage]}20`,
                            color: COVERAGE_COLORS[decade.coverage],
                          }}
                        >
                          {decade.coverage}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Time Gaps */}
              {qualityReport.temporalCoverage.gaps.length > 0 && (
                <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <XCircle className="w-5 h-5 text-red-400" />
                    <h3 className="text-lg font-bold text-red-400">Significant Time Gaps</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {qualityReport.temporalCoverage.gaps.map((gap, idx) => (
                      <div key={idx} className="p-4 bg-slate-900/50 rounded-lg">
                        <div className="text-lg font-bold text-white mb-1">
                          {gap.startYear} - {gap.endYear}
                        </div>
                        <div className="text-sm text-slate-400">{gap.yearsSpan} year gap</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
