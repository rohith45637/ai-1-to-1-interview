import React from 'react';

export function Badge({ 
  children, 
  variant = 'default', 
  size = 'md', 
  dot = false,
  className = '' 
}) {
  const variants = {
    default: 'bg-surface-800/80 text-surface-300 border-surface-700/80',
    brand: 'bg-brand-500/10 text-brand-400 border-brand-500/30',
    accent: 'bg-accent-500/10 text-accent-300 border-accent-500/30',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    purple: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
  };

  const dotColors = {
    default: 'bg-surface-400',
    brand: 'bg-brand-400',
    accent: 'bg-accent-400',
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    danger: 'bg-rose-400',
    purple: 'bg-purple-400',
  };

  const sizes = {
    xs: 'text-[10px] px-2 py-0.5',
    sm: 'text-[11px] px-2.5 py-0.5',
    md: 'text-xs px-3 py-1',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full border backdrop-blur-md ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`}>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant] || dotColors.default} animate-pulse`} />
      )}
      {children}
    </span>
  );
}
