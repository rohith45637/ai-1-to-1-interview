import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Sparkles, Flame, Sun, Moon, FileText, Compass, 
  BarChart3, Target, Settings as SettingsIcon, Menu, X
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
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-surface-200 dark:border-surface-800 glass transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          <div 
            onClick={() => handleNavClick('landing')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 animate-pulse-subtle" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-surface-900 dark:text-white flex items-center gap-1.5">
                1 to 1 Interview
                <span className="text-[10px] uppercase font-extrabold tracking-wider bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 px-1.5 py-0.5 rounded border border-brand-200 dark:border-brand-800">AI Pro</span>
              </span>
              <p className="text-xs text-surface-500 dark:text-surface-400 hidden sm:block">Personalized 1:1 Assessment Engine</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1 bg-surface-100/80 dark:bg-surface-900/80 p-1.5 rounded-xl border border-surface-200 dark:border-surface-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ' + (isActive ? 'bg-white dark:bg-surface-800 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-200/50 dark:hover:bg-surface-800/50')}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>{user?.streak_count || 1} Day Streak</span>
            </div>

            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-brand-600" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="md:hidden p-2 rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 text-surface-600 dark:text-surface-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 px-4 pt-2 pb-4 space-y-1 shadow-xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ' + (isActive ? 'bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 font-semibold' : 'text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800')}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}