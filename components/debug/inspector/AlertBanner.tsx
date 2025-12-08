import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface AlertBannerProps {
  type: 'cycle' | 'duplicate' | 'warning';
  message: string;
  details?: string[];
  onDismiss?: () => void;
}

const AlertBanner: React.FC<AlertBannerProps> = ({ type, message, details, onDismiss }) => {
  const config = {
    cycle: {
      icon: <RefreshCw className="w-5 h-5 text-red-400" />,
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      textColor: 'text-red-400',
      emoji: '🔄'
    },
    duplicate: {
      icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      textColor: 'text-amber-400',
      emoji: '⚠️'
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
      textColor: 'text-yellow-400',
      emoji: '⚡'
    }
  };

  const style = config[type];

  return (
    <div className={`p-4 ${style.bgColor} border ${style.borderColor} rounded-lg mb-4`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{style.emoji}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {style.icon}
            <span className={`font-bold text-sm uppercase tracking-wide ${style.textColor}`}>
              {type === 'cycle' ? 'Cycle Detected' : type === 'duplicate' ? 'Duplicate Link' : 'Warning'}
            </span>
          </div>
          <p className="text-sm text-white mb-2">{message}</p>
          {details && details.length > 0 && (
            <div className="mt-2 space-y-1">
              {details.map((detail, idx) => (
                <div key={idx} className="text-xs font-mono text-slate-300 flex items-center gap-2">
                  <span className="text-slate-500">→</span>
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default AlertBanner;
