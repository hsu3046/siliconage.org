import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => {
  return (
    <svg 
      className={className} 
      viewBox="-4 -4 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="waferGradient" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#334155" /> {/* Slate 700 */}
          <stop offset="100%" stopColor="#0f172a" /> {/* Slate 900 */}
        </linearGradient>
        <linearGradient id="aiGradient" x1="8" y1="8" x2="24" y2="24">
          <stop offset="0%" stopColor="#3b82f6" /> {/* Blue 500 */}
          <stop offset="100%" stopColor="#8b5cf6" /> {/* Violet 500 */}
        </linearGradient>
      </defs>

      {/* 1. Silicon Wafer Base (Perfect Circle) */}
      <circle cx="16" cy="16" r="15" fill="url(#waferGradient)" />
      
      {/* 2. Grid Lines (Chip Pattern) */}
      <clipPath id="waferClip">
         <circle cx="16" cy="16" r="15" />
      </clipPath>

      <g stroke="#475569" strokeWidth="0.5" clipPath="url(#waferClip)" opacity="0.5">
        <line x1="10" y1="0" x2="10" y2="32" />
        <line x1="16" y1="0" x2="16" y2="32" />
        <line x1="22" y1="0" x2="22" y2="32" />
        <line x1="0" y1="10" x2="32" y2="10" />
        <line x1="0" y1="16" x2="32" y2="16" />
        <line x1="0" y1="22" x2="32" y2="22" />
      </g>

      {/* 3. Wafer Rim Highlight */}
      <circle cx="16" cy="16" r="15" stroke="#64748b" strokeWidth="0.5" />

      {/* 4. AI Neural Network Overlay (Center) */}
      <g transform="translate(16 16)">
        {/* Connections */}
        <g stroke="#60a5fa" strokeWidth="1" opacity="0.8">
          <line x1="-6" y1="4" x2="0" y2="-5" />
          <line x1="6" y1="4" x2="0" y2="-5" />
          <line x1="-6" y1="4" x2="0" y2="6" />
          <line x1="6" y1="4" x2="0" y2="6" />
          <line x1="-6" y1="4" x2="6" y2="4" />
        </g>
        
        {/* Nodes */}
        <circle cx="0" cy="-5" r="2.5" fill="url(#aiGradient)" stroke="white" strokeWidth="0.5" />
        <circle cx="-6" cy="4" r="2" fill="#3b82f6" stroke="white" strokeWidth="0.5" />
        <circle cx="6" cy="4" r="2" fill="#8b5cf6" stroke="white" strokeWidth="0.5" />
        <circle cx="0" cy="6" r="1.5" fill="#f59e0b" stroke="white" strokeWidth="0.5" />
      </g>
    </svg>
  );
};