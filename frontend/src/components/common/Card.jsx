import React from 'react';

export function Card({ children, className = '', hover = false, onClick }) {
  return (
    <div
      onClick={onClick}
      className={'bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 shadow-sm ' + (hover ? 'hover:shadow-md hover:border-brand-500/50 transition-all cursor-pointer ' : '') + className}
    >
      {children}
    </div>
  );
}
