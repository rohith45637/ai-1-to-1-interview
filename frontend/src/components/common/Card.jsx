import React from 'react';

export function Card({ 
  children, 
  className = '', 
  hover = false, 
  glow = false,
  onClick,
  ...props 
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-surface-900/70 dark:bg-surface-900/80 backdrop-blur-xl border border-surface-800/80 dark:border-surface-800 rounded-2xl p-6 shadow-sm transition-all duration-200 ${
        hover ? 'hover:border-brand-500/40 hover:bg-surface-850/90 hover:shadow-xl hover:shadow-brand-500/5 cursor-pointer ' : ''
      } ${
        glow ? 'border-brand-500/30 shadow-glow-brand ' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
