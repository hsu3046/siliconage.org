import React, { useMemo, useState } from 'react';
import { useDebugContext } from './DebugContext';
import { validateGraphData, ValidationError } from '../../utils/debug/validation';
import { ChevronDown, ChevronRight, AlertTriangle, XCircle, Info } from 'lucide-react';

const IntegrityChecker: React.FC = () => {
  const { data } = useDebugContext();
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    errors: true,
    warnings: true,
    info: false
  });

  const validationResult = useMemo(() => {
    return validateGraphData(data);
  }, [data]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const renderErrorItem = (error: ValidationError, index: number) => {
    const icons = {
      error: <XCircle className="w-4 h-4 text-red-500" />,
      warning: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
      info: <Info className="w-4 h-4 text-blue-500" />
    };

    return (
      <div
        key={index}
        className="p-3 bg-slate-800/60 border border-slate-700 rounded-lg hover:bg-slate-700/70 transition-colors"
      >
        <div className="flex items-start gap-3">
          {icons[error.severity]}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                {error.category.replace('-', ' ')}
              </span>
              {error.nodeId && (
                <span className="text-xs font-mono bg-slate-900/50 px-2 py-0.5 rounded text-cyan-400">
                  {error.nodeId}
                </span>
              )}
              {error.linkIndex !== undefined && (
                <span className="text-xs font-mono bg-slate-900/50 px-2 py-0.5 rounded text-purple-400">
                  Link #{error.linkIndex}
                </span>
              )}
            </div>
            <p className="text-sm text-white mb-2">{error.message}</p>
            {error.suggestion && (
              <p className="text-xs text-emerald-400 flex items-center gap-1">
                <span>💡</span>
                <span>{error.suggestion}</span>
              </p>
            )}
            {error.details && (
              <pre className="text-[10px] text-slate-500 mt-2 p-2 bg-slate-900/30 rounded overflow-x-auto">
                {JSON.stringify(error.details, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSection = (
    title: string,
    items: ValidationError[],
    icon: React.ReactNode,
    categoryKey: string
  ) => {
    const isExpanded = expandedCategories[categoryKey];

    if (items.length === 0) return null;

    return (
      <div className="mb-6">
        <button
          onClick={() => toggleCategory(categoryKey)}
          className="w-full flex items-center justify-between p-3 bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700 rounded-lg transition-colors mb-2"
        >
          <div className="flex items-center gap-3">
            {icon}
            <span className="font-bold text-white">{title}</span>
            <span className="text-sm text-slate-400">({items.length})</span>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-slate-400" />
          )}
        </button>

        {isExpanded && (
          <div className="space-y-2 ml-2">
            {items.map((item, idx) => renderErrorItem(item, idx))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header with Summary */}
        <div className="mb-6 p-6 bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center">
              <span className="text-2xl">🚨</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Data Integrity Report</h2>
              <p className="text-sm text-slate-400">Automated validation of graph data</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-900/50 rounded-lg">
              <div className="text-2xl font-bold text-white">{validationResult.summary.totalNodes}</div>
              <div className="text-xs text-slate-400">Total Nodes</div>
            </div>
            <div className="p-3 bg-slate-900/50 rounded-lg">
              <div className="text-2xl font-bold text-white">{validationResult.summary.totalLinks}</div>
              <div className="text-xs text-slate-400">Total Links</div>
            </div>
            <div className="p-3 bg-slate-900/50 rounded-lg">
              <div className="text-2xl font-bold text-red-400">{validationResult.errors.length}</div>
              <div className="text-xs text-slate-400">Errors</div>
            </div>
            <div className="p-3 bg-slate-900/50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-400">{validationResult.warnings.length}</div>
              <div className="text-xs text-slate-400">Warnings</div>
            </div>
          </div>

          {validationResult.errors.length === 0 && validationResult.warnings.length === 0 && (
            <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <div className="font-bold text-emerald-400">All checks passed!</div>
                <div className="text-sm text-emerald-300/70">Your data is clean and ready to use.</div>
              </div>
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        {(validationResult.summary.orphanCount > 0 ||
          validationResult.summary.brokenLinkCount > 0 ||
          validationResult.summary.missingDataCount > 0 ||
          validationResult.summary.logicErrorCount > 0 ||
          validationResult.summary.duplicateCount > 0) && (
          <div className="mb-6 p-4 bg-slate-800/30 border border-slate-700 rounded-lg">
            <h3 className="text-sm font-bold text-slate-300 mb-3">Issue Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
              {validationResult.summary.orphanCount > 0 && (
                <div className="p-2 bg-slate-900/50 rounded">
                  <div className="font-bold text-yellow-400">{validationResult.summary.orphanCount}</div>
                  <div className="text-slate-500">Orphans</div>
                </div>
              )}
              {validationResult.summary.brokenLinkCount > 0 && (
                <div className="p-2 bg-slate-900/50 rounded">
                  <div className="font-bold text-red-400">{validationResult.summary.brokenLinkCount}</div>
                  <div className="text-slate-500">Broken Links</div>
                </div>
              )}
              {validationResult.summary.missingDataCount > 0 && (
                <div className="p-2 bg-slate-900/50 rounded">
                  <div className="font-bold text-orange-400">{validationResult.summary.missingDataCount}</div>
                  <div className="text-slate-500">Missing Data</div>
                </div>
              )}
              {validationResult.summary.logicErrorCount > 0 && (
                <div className="p-2 bg-slate-900/50 rounded">
                  <div className="font-bold text-red-400">{validationResult.summary.logicErrorCount}</div>
                  <div className="text-slate-500">Logic Errors</div>
                </div>
              )}
              {validationResult.summary.duplicateCount > 0 && (
                <div className="p-2 bg-slate-900/50 rounded">
                  <div className="font-bold text-purple-400">{validationResult.summary.duplicateCount}</div>
                  <div className="text-slate-500">Duplicates</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Sections */}
        {renderSection(
          'Errors',
          validationResult.errors,
          <XCircle className="w-5 h-5 text-red-500" />,
          'errors'
        )}

        {renderSection(
          'Warnings',
          validationResult.warnings,
          <AlertTriangle className="w-5 h-5 text-yellow-500" />,
          'warnings'
        )}

        {renderSection(
          'Info',
          validationResult.info,
          <Info className="w-5 h-5 text-blue-500" />,
          'info'
        )}
      </div>
    </div>
  );
};

export default IntegrityChecker;
