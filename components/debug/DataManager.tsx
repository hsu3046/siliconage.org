import React, { useState, useMemo } from 'react';
import { useDebugContext } from './DebugContext';
import { generateCode, copyToClipboard, downloadAsFile } from '../../utils/debug/codeGenerator';
import { Copy, Download, RefreshCw, Code, AlertCircle } from 'lucide-react';

const DataManager: React.FC = () => {
  const { data, resetData, isDirty } = useDebugContext();
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleGenerateCode = () => {
    const code = generateCode(data);
    setGeneratedCode(code);
    setShowPreview(true);
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(generatedCode);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleDownload = () => {
    downloadAsFile(generatedCode, 'generated-constants.ts');
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all changes? This cannot be undone.')) {
      resetData();
      setShowPreview(false);
      setGeneratedCode('');
    }
  };

  const stats = useMemo(() => {
    return {
      totalNodes: data.nodes.length,
      totalLinks: data.links.length,
      companies: data.nodes.filter(n => n.category === 'COMPANY').length,
      people: data.nodes.filter(n => n.category === 'PERSON').length,
      technologies: data.nodes.filter(n => n.category === 'TECHNOLOGY').length,
    };
  }, [data]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-slate-900/50 border-b border-slate-700">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Data Manager & Code Generator</h2>
                <p className="text-sm text-slate-400">Export your data as TypeScript code</p>
              </div>
            </div>

            {isDirty && (
              <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-400">UNSAVED CHANGES</span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700">
              <div className="text-2xl font-bold text-white">{stats.totalNodes}</div>
              <div className="text-xs text-slate-400">Total Nodes</div>
            </div>
            <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700">
              <div className="text-2xl font-bold text-white">{stats.totalLinks}</div>
              <div className="text-xs text-slate-400">Total Links</div>
            </div>
            <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700">
              <div className="text-2xl font-bold text-red-400">{stats.companies}</div>
              <div className="text-xs text-slate-400">Companies</div>
            </div>
            <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700">
              <div className="text-2xl font-bold text-blue-400">{stats.people}</div>
              <div className="text-xs text-slate-400">People</div>
            </div>
            <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700">
              <div className="text-2xl font-bold text-emerald-400">{stats.technologies}</div>
              <div className="text-xs text-slate-400">Technologies</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Instructions */}
          <div className="p-6 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-xl">
            <h3 className="text-lg font-bold text-white mb-3">📘 How to Use</h3>
            <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-blue-300">
                <strong>Note:</strong> This tool exports your <strong>current</strong> dataset from <code className="px-1 bg-slate-900/50 rounded">constants.ts</code> as TypeScript code.
                To modify data, edit <code className="px-1 bg-slate-900/50 rounded">constants.ts</code> directly.
              </p>
            </div>
            <ol className="space-y-2 text-sm text-slate-300">
              <li className="flex gap-2">
                <span className="font-bold text-cyan-400">1.</span>
                <span>Click "Generate Code" to export your current dataset as TypeScript</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-cyan-400">2.</span>
                <span>Review the generated code in the preview below</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-cyan-400">3.</span>
                <span>Copy to clipboard or download as a backup file</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-cyan-400">4.</span>
                <span>Use this as a reference or backup of your data structure</span>
              </li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleGenerateCode}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Code className="w-5 h-5" />
              Generate Code
            </button>

            {isDirty && (
              <button
                onClick={handleReset}
                className="px-6 py-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Reset Changes
              </button>
            )}
          </div>

          {/* Code Preview */}
          {showPreview && generatedCode && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Generated Code</h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                      copySuccess
                        ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400'
                        : 'bg-slate-700 hover:bg-slate-600 text-white'
                    }`}
                  >
                    <Copy className="w-4 h-4" />
                    {copySuccess ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>

              <div className="relative">
                <pre className="p-6 bg-slate-950 border border-slate-700 rounded-xl overflow-x-auto text-xs text-slate-300 font-mono max-h-[600px] overflow-y-auto custom-scrollbar">
                  {generatedCode}
                </pre>
                <div className="absolute top-3 right-3 px-2 py-1 bg-slate-800/90 rounded text-[10px] text-slate-400 font-bold">
                  {generatedCode.split('\n').length} lines
                </div>
              </div>

              {/* Warning */}
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-slate-300">
                  <p className="font-bold text-amber-400 mb-1">Important:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• This code must be manually pasted into <code className="px-1 bg-slate-900/50 rounded">constants.ts</code></li>
                    <li>• Make sure to backup your original file first</li>
                    <li>• Run <code className="px-1 bg-slate-900/50 rounded">npm run dev</code> to verify no syntax errors</li>
                    <li>• The ranking algorithm will recalculate on app restart</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Feature Status */}
          <div className="p-6 bg-slate-800/40 border border-slate-700 rounded-xl">
            <h3 className="text-lg font-bold text-white mb-4">🚧 Phase 4 Status</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                <span className="text-slate-300">Code Generator (TypeScript output)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                <span className="text-slate-300">Copy to Clipboard</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                <span className="text-slate-300">Download as File</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                <span className="text-slate-300">Reset to Original Data</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">○</span>
                <span className="text-slate-500">Node CRUD Forms (Future enhancement)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">○</span>
                <span className="text-slate-500">Link Management UI (Future enhancement)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataManager;
