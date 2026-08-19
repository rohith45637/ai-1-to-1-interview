import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authApi } from '../services/api';
import { 
  Settings as SettingsIcon, User, Sliders, Moon, Sun, 
  Trash2, CheckCircle2, AlertCircle, Sparkles, Volume2
} from 'lucide-react';

export function SettingsPage() {
  const { user, updateProfile, refreshProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [name, setName] = useState(user?.name || 'Alex Mercer');
  const [email, setEmail] = useState(user?.email || 'candidate@example.com');
  const [targetRole, setTargetRole] = useState(user?.target_role || 'Full Stack Developer');
  const [experienceLevel, setExperienceLevel] = useState(user?.experience_level || 'Intermediate');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetting, setResetting] = useState(false);

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

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6 pb-24">
      <div>
        <Badge variant="brand" className="mb-2">Preferences & Account</Badge>
        <h1 className="text-3xl font-black text-surface-900 dark:text-white">Settings & Profile</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
          Customize your default interview parameters, display theme, and candidate profile.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Profile Card */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 font-bold text-sm text-surface-900 dark:text-white pb-2 border-b border-surface-100 dark:border-surface-800">
            <User className="w-4 h-4 text-brand-500" />
            <span>Candidate Profile Information</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-surface-700 dark:text-surface-300">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-surface-700 dark:text-surface-300">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-surface-700 dark:text-surface-300">Default Target Role</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-surface-700 dark:text-surface-300">Experience Tier</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="Beginner">Beginner / Student</option>
                <option value="Intermediate">Intermediate (1-3 Years)</option>
                <option value="Advanced">Advanced (3-6 Years)</option>
                <option value="Expert">Expert / Principal (6+ Years)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Preferences Card */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 font-bold text-sm text-surface-900 dark:text-white pb-2 border-b border-surface-100 dark:border-surface-800">
            <Sliders className="w-4 h-4 text-indigo-500" />
            <span>Theme & Display Settings</span>
          </div>

          <div className="flex items-center justify-between text-xs py-2">
            <div>
              <span className="font-bold text-surface-900 dark:text-white block">Visual Theme</span>
              <span className="text-surface-500">Toggle between Dark Mode and Light Mode</span>
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

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {saveSuccess ? (
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Settings updated successfully!
            </span>
          ) : <span />}

          <Button type="submit" variant="primary" size="md" loading={saving} icon={Sparkles} className="font-bold">
            Save Preferences
          </Button>
        </div>
      </form>

      {/* Danger Zone: Data Management */}
      <Card className="p-6 space-y-4 border-rose-500/30 bg-rose-50/10 dark:bg-rose-950/10">
        <div className="flex items-center gap-2 font-bold text-sm text-rose-600 pb-2 border-b border-rose-200 dark:border-rose-900/40">
          <Trash2 className="w-4 h-4" />
          <span>Data Management & Reset</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div>
            <span className="font-bold text-surface-900 dark:text-white block">Reset All Interview & Skill Scores</span>
            <span className="text-surface-500">Deletes all previous interview transcripts and resets the adaptive skill matrix.</span>
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

    </div>
  );
}
