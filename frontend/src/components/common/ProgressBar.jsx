import React from 'react';

export function ProgressBar({ value = 0, max = 100, label, showValue = true, color = 'brand', className = '' }) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const colors = {
    brand: 'bg-brand-600 dark:bg-brand-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    purple: 'bg-purple-500',
  };

  return (
    <div className={'w-full ' + className}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs font-medium mb-1.5 text-surface-600 dark:text-surface-400">
          <span>{label}</span>
          {showValue && <span className="font-bold text-surface-900 dark:text-white">{percentage}%</span>}
        </div>
      )}
      <div className="w-full bg-surface-200 dark:bg-surface-800 rounded-full h-2.5 overflow-hidden">
        <div
          className={'h-full rounded-full transition-all duration-500 ease-out ' + (colors[color] || colors.brand)}
          style={{ width: percentage + '%' }}
        />
      </div>
    </div>
  );
}
