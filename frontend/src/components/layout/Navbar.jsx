import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Sparkles, Flame, Sun, Moon, FileText, Compass, 
  BarChart3, Target, Settings as SettingsIcon, Menu, X, 
  Activity, ShieldCheck
} from 'lucide-react';

export function Navbar({ activeTab, setActiveTab }) {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'landing', label: 'Practice Hub', icon: Compass },
    { id: 'resume', label: 'Resume & ATS', icon: FileText },
    { id: 'weak-skills', label: 'Weak Skills', icon: Target },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'media-test', label: 'Media Diagnostics', icon: Activity, badge: 'Tool' },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    if (id === 'media-test') {
      window.history.pushState(null, '', '/media-test');
    } else if (id === 'landing') {
      window.history.pushState(null, '', '/');
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-surface-200 dark:border-surface-800/80 bg-white/80 dark:bg-surface-950/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand Title */}
          <div 
            onClick={() => handleNavClick('landing')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-accent-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform border border-white/20">
              <Sparkles className="w-4 h-4 animate-pulse-subtle" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-surface-900 dark:text-white flex items-center gap-2">
                1-to-1 Interview
                <span className="text-[10px] uppercase font-extrabold tracking-wider bg-brand-500/15 text-brand-600 dark:text-brand-400 border border-brand-500/30 px-1.5 py-0.5 rounded-full">
                  AI Pro
                </span>
              </span>
              <p className="text-[11px] text-surface-500 dark:text-surface-400 hidden sm:block">Intelligent AI Career Assessment Platform</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-surface-100 dark:bg-surface-900/90 p-1.5 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-inner">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25 border border-brand-400/30' 
                      : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-200/70 dark:hover:bg-surface-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {item.badge && !isActive && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-brand-500/15 text-brand-600 dark:text-brand-300 border border-brand-500/20 font-bold uppercase">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons: Streak, Theme Toggle, Mobile Menu */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
              <Flame className="w-4 h-4 text-amber-500 dark:text-amber-400 fill-amber-500 dark:fill-amber-400" />
              <span>{user?.streak_count ?? 0} Day Streak</span>
            </div>

            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-100 dark:bg-surface-900/80 text-surface-700 dark:text-surface-300 hover:text-surface-900 dark:hover:text-white hover:bg-surface-200 dark:hover:bg-surface-800 transition-colors cursor-pointer"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-brand-600" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="md:hidden p-2 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-100 dark:bg-surface-900 text-surface-700 dark:text-surface-300 hover:text-surface-900 dark:hover:text-white cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-surface-200 dark:border-surface-800 bg-white/95 dark:bg-surface-950/95 backdrop-blur-xl px-4 pt-3 pb-5 space-y-1.5 shadow-2xl animate-in slide-in-from-top-2 duration-150">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                  isActive 
                    ? 'bg-brand-600 text-white font-bold' 
                    : 'text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800/80 hover:text-surface-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-600 dark:text-brand-300 border border-brand-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}