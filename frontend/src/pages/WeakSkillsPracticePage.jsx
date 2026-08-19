import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { skillsApi } from '../services/api';
import { 
  Target, AlertCircle, CheckCircle2, ArrowRight
} from 'lucide-react';

export function WeakSkillsPracticePage({ onLaunchWeakPractice }) {
  const [weakSkills, setWeakSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkills, setSelectedSkills] = useState([]);

  useEffect(() => {
    async function fetchWeakSkills() {
      try {
        setLoading(true);
        const data = await skillsApi.getWeakAreas();
        setWeakSkills(data);
        setSelectedSkills(data.map(s => s.skill_name));
      } catch (err) {
        console.error('Failed to load weak skills:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchWeakSkills();
  }, []);

  const toggleSkill = (name) => {
    setSelectedSkills(prev => 
      prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
    );
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-surface-500">Isolating historical weak concepts...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6 pb-24">
      
      <div>
        <Badge variant="warning" className="mb-2">Targeted Mastery</Badge>
        <h1 className="text-3xl font-black text-surface-900 dark:text-white">Practice My Weak Areas</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
          The adaptive AI isolates specific concepts where your past answer depth or correctness scored under 72%, generating hyper-focused drill questions.
        </p>
      </div>

      {weakSkills.length === 0 ? (
        <Card className="text-center p-10 space-y-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-lg font-bold text-surface-900 dark:text-white">No Critical Weak Areas Detected!</h3>
          <p className="text-xs text-surface-500 max-w-md mx-auto">
            You are scoring well across your tested technical and behavioral skills. Take another mock interview to discover advanced growth areas.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {weakSkills.map(sk => {
              const isSelected = selectedSkills.includes(sk.skill_name);
              return (
                <div
                  key={sk.skill_name}
                  onClick={() => toggleSkill(sk.skill_name)}
                  className={'p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ' + (isSelected ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40' : 'border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 opacity-60')}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-surface-900 dark:text-white">{sk.skill_name}</span>
                      <Badge variant="danger" size="sm">{Math.round(sk.current_score)}%</Badge>
                    </div>
                    <p className="text-[11px] text-surface-400">Category: {sk.category} • Trend: {sk.trend}</p>
                  </div>

                  <div className={'w-6 h-6 rounded-full flex items-center justify-center border ' + (isSelected ? 'bg-brand-600 border-brand-600 text-white' : 'border-surface-400')}>
                    {isSelected && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-brand-600/20">
            <div className="space-y-0.5 text-center sm:text-left">
              <h4 className="font-black text-lg">Ready to Drill {selectedSkills.length} Selected Topics</h4>
              <p className="text-xs text-white/80">Adaptive session will test different questions covering the same core nuances.</p>
            </div>

            <Button
              variant="primary"
              size="lg"
              disabled={selectedSkills.length === 0}
              onClick={() => onLaunchWeakPractice(selectedSkills)}
              className="bg-white hover:bg-white/90 text-brand-700 font-black text-xs shadow-md"
              icon={ArrowRight}
            >
              Start Focused Weak Drill
            </Button>
          </div>

        </div>
      )}

    </div>
  );
}
