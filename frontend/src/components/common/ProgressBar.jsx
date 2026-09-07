import React from 'react';

export function ProgressBar({ 
  value = 0, 
  max = 100, 
  label, 
  showValue = true, 
  color = 'brand', 
  size = 'md', // 'sm', 'md', 'lg'
  className = '' 
}) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const colors = {
    brand: 'bg-gradient-to-r from-brand-500 to-indigo-500 shadow-glow-brand',
    success: 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-glow-emerald',
    warning: 'bg-gradient-to-r from-amber-500 to-orange-400',
    danger: 'bg-gradient-to-r from-rose-500 to-red-500',
    purple: 'bg-gradient-to-r from-purple-500 to-pink-500',
    accent: 'bg-gradient-to-r from-accent-500 to-indigo-500 shadow-glow-accent',
  };

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs font-semibold mb-1.5 text-surface-400">
          <span>{label}</span>
          {showValue && <span className="text-white font-bold">{percentage}%</span>}
        </div>
      )}
      <div className={`w-full bg-surface-800/80 rounded-full ${heights[size] || heights.md} overflow-hidden border border-surface-700/40 p-0.5`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${colors[color] || colors.brand}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
