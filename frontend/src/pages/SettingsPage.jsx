import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authApi } from '../services/api';
import { 
  Settings as SettingsIcon, User, Sliders, Moon, Sun, 
  Trash2, CheckCircle2, AlertCircle, Sparkles, Volume2, 
  Shield, Bell, Lock, Activity
} from 'lucide-react';

export function SettingsPage() {
  const { user, updateProfile, refreshProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [name, setName] = useState(user?.name || 'Candidate');
  const [email, setEmail] = useState(user?.email || 'candidate@example.com');
  const [targetRole, setTargetRole] = useState(user?.target_role || 'Full Stack Developer');
  const [experienceLevel, setExperienceLevel] = useState(user?.experience_level || 'Intermediate');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Settings tabs
  const [activeSection, setActiveSection] = useState('account'); // 'account' | 'preferences' | 'voice' | 'privacy'

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateProfile({
        name,
        email,
        target_role: targetRole,
        experience_level: experienceLevel
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleResetData = async () => {
    if (window.confirm('Are you sure you want to reset all your past interview logs, skill scores, and streaks? This cannot be undone.')) {
      try {
        setResetting(true);
        await authApi.resetData();
        await refreshProfile();
        alert('All interview history and skill scores have been reset.');
      } catch (err) {
        console.error('Reset failed:', err);
      } finally {
        setResetting(false);
      }
    }
  };

  const sections = [
    { id: 'account', label: 'Account & Profile', icon: User },
    { id: 'preferences', label: 'Interview Preferences', icon: Sliders },
    { id: 'voice', label: 'Voice & Audio Settings', icon: Volume2 },
    { id: 'privacy', label: 'Privacy & Data', icon: Shield },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6 pb-24 text-surface-800 dark:text-surface-200">
      
      {/* Header */}
      <div className="pb-4 border-b border-surface-200 dark:border-surface-800">
        <div className="flex items-center gap-2 mb-1.5">
          <Badge variant="brand" dot={true}>System Preferences</Badge>
        </div>
        <h1 className="text-3xl font-black text-surface-900 dark:text-white tracking-tight">Platform Settings</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">
          Manage your candidate profile, interview defaults, speech parameters, and platform data.
        </p>
      </div>

      {/* Section Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-surface-200 dark:border-surface-800">
        {sections.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive 
                  ? 'bg-brand-600 text-white shadow-sm border border-brand-400/30' 
                  : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* SECTION 1: ACCOUNT & PROFILE */}
        {activeSection === 'account' && (
          <Card className="p-6 space-y-5 border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900/80 shadow-sm">
            <div className="flex items-center gap-2 font-bold text-sm text-surface-900 dark:text-white pb-2 border-b border-surface-200 dark:border-surface-800">
              <User className="w-4 h-4 text-brand-500 dark:text-brand-400" />
              <span>Candidate Profile Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-surface-700 dark:text-surface-300">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-surface-300 dark:border-surface-700 bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-surface-700 dark:text-surface-300">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-surface-300 dark:border-surface-700 bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-surface-700 dark:text-surface-300">Default Target Role</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-surface-300 dark:border-surface-700 bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-surface-700 dark:text-surface-300">Experience Tier</label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-surface-300 dark:border-surface-700 bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none cursor-pointer"
                >
                  <option value="Beginner">Beginner / Student</option>
                  <option value="Intermediate">Intermediate (1-3 Years)</option>
                  <option value="Advanced">Advanced (3-6 Years)</option>
                  <option value="Expert">Expert / Principal (6+ Years)</option>
                </select>
              </div>
            </div>
          </Card>
        )}

        {/* SECTION 2: INTERVIEW PREFERENCES & THEME */}
        {activeSection === 'preferences' && (
          <Card className="p-6 space-y-5 border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900/80 shadow-sm">
            <div className="flex items-center gap-2 font-bold text-sm text-surface-900 dark:text-white pb-2 border-b border-surface-200 dark:border-surface-800">
              <Sliders className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              <span>Theme & Platform Display</span>
            </div>

            <div className="flex items-center justify-between text-xs py-2">
              <div>
                <span className="font-bold text-surface-900 dark:text-white block">Theme Mode</span>
                <span className="text-surface-500 dark:text-surface-400">Toggle between Dark Mode and Light Mode</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                icon={theme === 'dark' ? Sun : Moon}
              >
                {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              </Button>
            </div>
          </Card>
        )}

        {/* SECTION 3: VOICE SETTINGS */}
        {activeSection === 'voice' && (
          <Card className="p-6 space-y-5 border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900/80 shadow-sm">
            <div className="flex items-center gap-2 font-bold text-sm text-surface-900 dark:text-white pb-2 border-b border-surface-200 dark:border-surface-800">
              <Volume2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>Speech & AI Audio Pacing</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800">
                <div>
                  <span className="font-bold text-surface-900 dark:text-white block">Voice Accent</span>
                  <span className="text-surface-500 dark:text-surface-400">Indian English / Neutral English dialect prioritization</span>
                </div>
                <Badge variant="brand" size="xs">en-IN Calibrated</Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800">
                <div>
                  <span className="font-bold text-surface-900 dark:text-white block">Speech Pacing</span>
                  <span className="text-surface-500 dark:text-surface-400">Calibrated at 0.90x for clear articulation</span>
                </div>
                <Badge variant="success" size="xs">Optimal</Badge>
              </div>
            </div>
          </Card>
        )}

        {/* SECTION 4: PRIVACY & DATA */}
        {activeSection === 'privacy' && (
          <Card className="p-6 space-y-5 border-rose-300 dark:border-rose-500/30 bg-rose-50/50 dark:bg-rose-950/10">
            <div className="flex items-center gap-2 font-bold text-sm text-rose-600 dark:text-rose-400 pb-2 border-b border-rose-200 dark:border-rose-900/40">
              <Trash2 className="w-4 h-4" />
              <span>Data Management & History Reset</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div>
                <span className="font-bold text-surface-900 dark:text-white block">Reset All Interview Transcripts & Scores</span>
                <span className="text-surface-500 dark:text-surface-400">Clears past assessment logs, question critiques, and streak counts.</span>
              </div>

              <Button
                variant="danger"
                size="sm"
                loading={resetting}
                onClick={handleResetData}
                icon={Trash2}
              >
                Reset All Data
              </Button>
            </div>
          </Card>
        )}

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {saveSuccess ? (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Settings updated successfully!
            </span>
          ) : <span />}

          <Button type="submit" variant="primary" size="md" loading={saving} icon={Sparkles} className="font-bold">
            Save Preferences
          </Button>
        </div>

      </form>

    </div>
  );
}
