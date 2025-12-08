import React, { useState } from 'react';
import { DebugProvider } from './DebugContext';
import IntegrityChecker from './IntegrityChecker';
import NodeBrowser from './NodeBrowser';
import RelationshipView from './inspector/RelationshipView';
import StatsDashboard from './StatsDashboard';
import DataManager from './DataManager';

type TabType = 'integrity' | 'browser' | 'inspector' | 'stats' | 'manager';

const DebugDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('integrity');

  // Production protection
  if (import.meta.env.PROD) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-500 mb-4">⛔ Access Denied</h1>
          <p className="text-slate-400">Debug mode is only available in development.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'integrity' as TabType, label: '🚨 Integrity Checker' },
    { id: 'browser' as TabType, label: '🔍 Node Browser' },
    { id: 'inspector' as TabType, label: '🕸️ Relationship Inspector' },
    { id: 'stats' as TabType, label: '📊 Statistics' },
    { id: 'manager' as TabType, label: '📝 Data Manager' },
  ];

  return (
    <DebugProvider>
      <div className="flex flex-col h-screen w-screen bg-slate-900 text-white overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-700 bg-slate-800 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                <span className="text-xl">🛠️</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">Debug Mode</h1>
                <p className="text-xs text-slate-400">Data Manager & Integrity Checker</p>
              </div>
            </div>
            <div className="ml-4 px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-full">
              <span className="text-xs font-bold text-red-400">DEV ONLY</span>
            </div>
          </div>

          <a
            href="/"
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-sm font-medium transition-colors"
          >
            ← Back to App
          </a>
        </header>

        {/* Tab Navigation */}
        <div className="border-b border-slate-700 bg-slate-800/50">
          <div className="flex items-center gap-2 px-6 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-cyan-500 text-white bg-slate-900/50'
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900/30'
                }`}
              >
                <span className="font-bold text-sm">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <main className="flex-1 overflow-hidden">
          {activeTab === 'integrity' && <IntegrityChecker />}
          {activeTab === 'browser' && <NodeBrowser />}
          {activeTab === 'inspector' && <RelationshipView />}
          {activeTab === 'stats' && <StatsDashboard />}
          {activeTab === 'manager' && <DataManager />}
        </main>

        {/* Footer */}
        <footer className="h-10 border-t border-slate-700 bg-slate-800/50 flex items-center justify-center shrink-0">
          <p className="text-xs text-slate-500">
            Silicon Age Debug Dashboard • Phase 4: Complete - All Features Available
          </p>
        </footer>
      </div>
    </DebugProvider>
  );
};

export default DebugDashboard;
