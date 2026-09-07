import React from 'react';

export function Button({
  children,
  variant = 'primary', // 'primary', 'secondary', 'outline', 'danger', 'ghost', 'accent', 'glass'
  size = 'md', // 'xs', 'sm', 'md', 'lg'
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  const baseStyles = 'relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-950 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] cursor-pointer';

  const variants = {
    primary: 'bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-lg shadow-brand-500/20 border border-brand-400/20 focus:ring-brand-500 hover:shadow-brand-500/30',
    accent: 'bg-gradient-to-r from-accent-600 to-purple-600 hover:from-accent-500 hover:to-purple-500 text-white shadow-lg shadow-accent-500/20 border border-accent-400/20 focus:ring-accent-500',
    secondary: 'bg-surface-800 hover:bg-surface-700 text-surface-100 border border-surface-700/80 hover:border-surface-600 shadow-sm focus:ring-surface-400',
    outline: 'border border-surface-700 bg-surface-900/40 hover:bg-surface-800/80 text-surface-200 hover:text-white hover:border-brand-500/40 focus:ring-brand-500',
    danger: 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-lg shadow-rose-600/20 border border-rose-400/20 focus:ring-rose-500',
    ghost: 'hover:bg-surface-800/60 text-surface-400 hover:text-surface-100 focus:ring-surface-400',
    glass: 'bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-white focus:ring-brand-500',
  };

  const sizes = {
    xs: 'px-2.5 py-1 text-xs gap-1.5 rounded-lg',
    sm: 'px-3.5 py-1.5 text-xs gap-2',
    md: 'px-4.5 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3.5 text-base gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : Icon && iconPosition === 'left' ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      
      <span>{children}</span>

      {!loading && Icon && iconPosition === 'right' && (
        <Icon className="w-4 h-4 shrink-0" />
      )}
    </button>
  );
}
