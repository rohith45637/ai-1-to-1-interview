import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { skillsApi } from '../services/api';
import { 
  Target, AlertCircle, CheckCircle2, ArrowRight, Sparkles, Zap
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
        <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-surface-400">Isolating historical weak concepts...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6 pb-24 text-surface-200">
      
      {/* Header */}
      <div className="pb-4 border-b border-surface-800">
        <div className="flex items-center gap-2 mb-1.5">
          <Badge variant="warning" dot={true}>Targeted Mastery Drills</Badge>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Practice My Weak Areas</h1>
        <p className="text-sm text-surface-400 mt-0.5">
          The adaptive AI isolates concepts where your past answer depth or correctness scored under 72%, generating hyper-focused drill questions.
        </p>
      </div>

      {weakSkills.length === 0 ? (
        <Card className="text-center p-12 space-y-4 border-surface-800 bg-surface-900/80">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Critical Weak Areas Detected!</h3>
          <p className="text-xs text-surface-400 max-w-md mx-auto">
            You are scoring solidly across tested technical and behavioral skills. Take another mock interview round to uncover advanced nuances.
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
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    isSelected 
                      ? 'border-brand-500 bg-brand-500/10' 
                      : 'border-surface-800 bg-surface-900/80 opacity-60'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{sk.skill_name}</span>
                      <Badge variant="danger" size="xs">{Math.round(sk.current_score)}%</Badge>
                    </div>
                    <p className="text-[11px] text-surface-400">Category: {sk.category} • Trend: {sk.trend}</p>
                  </div>

                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                    isSelected ? 'bg-brand-600 border-brand-600 text-white' : 'border-surface-600'
                  }`}>
                    {isSelected && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                </div>
              );
            })}
          </div>

          <Card className="p-6 border-brand-500/30 bg-gradient-to-r from-brand-600/20 via-indigo-600/20 to-purple-600/20 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="font-bold text-base text-white">Ready to Drill {selectedSkills.length} Selected Topics</h4>
              <p className="text-xs text-surface-300">Adaptive session will test different questions covering the same core nuances.</p>
            </div>

            <Button
              variant="primary"
              size="md"
              disabled={selectedSkills.length === 0}
              onClick={() => onLaunchWeakPractice(selectedSkills)}
              className="font-bold shrink-0"
              icon={Zap}
            >
              Start Weak Drill Session
            </Button>
          </Card>

        </div>
      )}

    </div>
  );
}
