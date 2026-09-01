import React, { useState, useEffect } from 'react';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { rolesApi } from '../services/api';
import { Sparkles, Clock } from 'lucide-react';

const DEFAULT_ROLES = [
  { id: 'full-stack-developer', title: 'Full Stack Developer', category: 'Software Engineering' },
  { id: 'frontend-developer', title: 'Frontend Developer', category: 'Software Engineering' },
  { id: 'backend-developer', title: 'Backend Developer', category: 'Software Engineering' },
  { id: 'software-developer', title: 'Software Developer', category: 'Software Engineering' },
  { id: 'python-developer', title: 'Python Developer', category: 'Software Engineering' },
  { id: 'java-developer', title: 'Java Developer', category: 'Software Engineering' },
  { id: 'ai-engineer', title: 'AI Engineer', category: 'Data & AI' },
  { id: 'machine-learning-engineer', title: 'Machine Learning Engineer', category: 'Data & AI' },
  { id: 'data-scientist', title: 'Data Scientist', category: 'Data & AI' },
  { id: 'data-analyst', title: 'Data Analyst', category: 'Data & AI' },
  { id: 'cybersecurity-analyst', title: 'Cybersecurity Analyst', category: 'Security & Cloud' },
  { id: 'soc-analyst', title: 'SOC Analyst', category: 'Security & Cloud' },
  { id: 'cloud-engineer', title: 'Cloud Engineer', category: 'Security & Cloud' },
  { id: 'devops-engineer', title: 'DevOps Engineer', category: 'Infrastructure' },
  { id: 'qa-engineer', title: 'QA Engineer', category: 'Software Engineering' },
  { id: 'mobile-app-developer', title: 'Mobile App Developer', category: 'Software Engineering' },
  { id: 'network-engineer', title: 'Network Engineer', category: 'Infrastructure' },
  { id: 'database-administrator', title: 'Database Administrator', category: 'Infrastructure' },
  { id: 'ui-ux-designer', title: 'UI/UX Designer', category: 'Design & Product' },
  { id: 'business-analyst', title: 'Business Analyst', category: 'Design & Product' }
];

export function InterviewConfigModal({
  isOpen,
  onClose,
  initialRole = null,
  initialResumeId = null,
  initialType = 'Mixed',
  initialWeakSkills = null,
  onLaunchInterview
}) {
  const [roles, setRoles] = useState(DEFAULT_ROLES);
  const resolveRoleTitle = (r) => (typeof r === 'string' ? r : (r?.title || r?.role_title || 'Full Stack Developer'));
  const [selectedRole, setSelectedRole] = useState(resolveRoleTitle(initialRole));
  const [interviewType, setInterviewType] = useState(initialType || 'Mixed');
  const [hrPercentage, setHrPercentage] = useState(20);
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [mode, setMode] = useState('real');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);

  useEffect(() => {
    async function fetchRoles() {
      try {
        const data = await rolesApi.getRoles();
        if (Array.isArray(data) && data.length > 0) {
          setRoles(data);
        }
      } catch (err) {
        console.warn('Using default roles fallback:', err);
      }
    }
    fetchRoles();
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (initialRole) {
        setSelectedRole(resolveRoleTitle(initialRole));
      }
      if (initialType) {
        setInterviewType(initialType);
      }
    }
  }, [isOpen, initialRole, initialType]);

  const hrCount = interviewType === 'HR' 
    ? totalQuestions 
    : (interviewType === 'Technical' || interviewType === 'Weak-Skill Practice' 
      ? 0 
      : Math.max(0, Math.round((hrPercentage / 100) * totalQuestions)));
  const techCount = totalQuestions - hrCount;

  const handleLaunch = () => {
    onLaunchInterview({
      job_role: selectedRole,
      interview_type: interviewType,
      difficulty,
      hr_percentage: hrPercentage,
      total_questions: totalQuestions,
      duration_minutes: durationMinutes,
      mode,
      resume_id: initialResumeId,
      target_weak_skills: initialWeakSkills,
      voice_enabled: voiceEnabled,
      camera_enabled: cameraEnabled
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configure Your AI 1-to-1 Interview" maxWidth="max-w-2xl">
      <div className="space-y-6 text-xs text-surface-700 dark:text-surface-300">
        
        {/* Target Job Role */}
        <div className="space-y-2">
          <label className="font-bold text-surface-900 dark:text-white flex items-center justify-between">
            <span>Target Job Role</span>
            {initialResumeId && <Badge variant="brand" size="sm">Resume Attached</Badge>}
          </label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
          >
            {/* If selectedRole is custom or not in roles list, ensure it appears as an option */}
            {selectedRole && !roles.some(r => r.title?.toLowerCase() === selectedRole.toLowerCase()) && (
              <option value={selectedRole}>{selectedRole} (Selected / Resume Profile)</option>
            )}
            {roles.map(r => (
              <option key={r.id || r.title} value={r.title}>{r.title} ({r.category})</option>
            ))}
          </select>
        </div>

        {/* Interview Format */}
        <div className="space-y-2">
          <label className="font-bold text-surface-900 dark:text-white">Interview Format</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { id: 'Mixed', label: 'Mixed (Tech + HR)' },
              { id: 'Technical', label: 'Technical Only' },
              { id: 'HR', label: 'HR Behavioral Only' },
              { id: 'Resume-Based', label: 'Resume Deep-Dive' },
              { id: 'Weak-Skill Practice', label: 'Weak-Skill Focus' },
              { id: 'Final Mock', label: 'Comprehensive Final' },
            ].map(type => (
              <button
                key={type.id}
                type="button"
                onClick={() => setInterviewType(type.id)}
                className={'p-2.5 rounded-xl border text-left font-medium transition-all ' + (interviewType === type.id ? 'border-brand-600 bg-brand-50/70 dark:bg-brand-950/70 text-brand-700 dark:text-brand-300 font-bold' : 'border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800 text-surface-700 dark:text-surface-300')}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Session Duration Selector */}
        <div className="space-y-2 p-3.5 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700">
          <div className="flex items-center justify-between font-bold text-surface-900 dark:text-white">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-brand-500" />
              Interview Session Duration
            </span>
            <span className="text-brand-600 dark:text-brand-400 font-black">{durationMinutes} Minutes</span>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-1">
            {[10, 15, 20, 30].map(mins => (
              <button
                key={mins}
                type="button"
                onClick={() => setDurationMinutes(mins)}
                className={'py-2 rounded-xl border text-center font-bold text-xs transition-all ' + (durationMinutes === mins ? 'border-brand-600 bg-brand-600 text-white shadow-sm' : 'border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-surface-700 dark:text-surface-300 hover:bg-surface-100')}
              >
                {mins} Mins
              </button>
            ))}
          </div>
          <p className="text-[11px] text-surface-500 italic">No per-question timeout. The AI manages pace across your complete {durationMinutes}-minute session.</p>
        </div>

        {/* HR Percentage Slider */}
        {(interviewType === 'Mixed' || interviewType === 'Final Mock' || interviewType === 'Resume-Based') && (
          <div className="space-y-2 p-3.5 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700">
            <div className="flex items-center justify-between font-bold text-surface-900 dark:text-white">
              <span>HR / Behavioral Proportion</span>
              <span className="text-brand-600 dark:text-brand-400 font-black">{hrPercentage}%</span>
            </div>
            
            <input
              type="range"
              min="0"
              max="50"
              step="10"
              value={hrPercentage}
              onChange={(e) => setHrPercentage(parseInt(e.target.value))}
              className="w-full h-2 bg-surface-200 dark:bg-surface-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
            />

            <div className="flex items-center justify-between text-[11px] text-surface-500 pt-1">
              <span>0% (Tech Only)</span>
              <span>20% (Standard)</span>
              <span>50% (Equal Split)</span>
            </div>

            <div className="text-[11px] text-surface-500 font-medium pt-1">
              Distribution: <strong className="text-surface-900 dark:text-white">{techCount} Technical</strong> questions + <strong className="text-surface-900 dark:text-white">{hrCount} HR</strong> questions.
            </div>
          </div>
        )}

        {/* Difficulty Level */}
        <div className="space-y-2">
          <label className="font-bold text-surface-900 dark:text-white">Difficulty Level</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'Beginner', desc: 'Core basics & syntax' },
              { id: 'Intermediate', desc: 'Practical trade-offs & bugs' },
              { id: 'Advanced', desc: 'Internals & distributed design' },
              { id: 'Expert', desc: 'High scale & failure modes' }
            ].map(diff => (
              <button
                key={diff.id}
                type="button"
                onClick={() => setDifficulty(diff.id)}
                className={'p-2.5 rounded-xl border text-left transition-all ' + (difficulty === diff.id ? 'border-brand-600 bg-brand-50/70 dark:bg-brand-950/70 text-brand-700 dark:text-brand-300 font-bold' : 'border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800')}
              >
                <div className="font-bold text-xs">{diff.id}</div>
                <div className="text-[10px] text-surface-400 font-normal mt-0.5">{diff.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Interview Experience Mode */}
        <div className="space-y-2">
          <label className="font-bold text-surface-900 dark:text-white">Interview Experience</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMode('real')}
              className={'p-2.5 rounded-xl border text-center transition-all ' + (mode === 'real' ? 'border-brand-600 bg-brand-50/70 dark:bg-brand-950/70 text-brand-700 dark:text-brand-300 font-bold' : 'border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300')}
            >
              <div className="font-bold text-xs">Real Interview Mode</div>
              <div className="text-[10px] text-surface-400 mt-0.5">Comprehensive report at end</div>
            </button>

            <button
              type="button"
              onClick={() => setMode('practice')}
              className={'p-2.5 rounded-xl border text-center transition-all ' + (mode === 'practice' ? 'border-brand-600 bg-brand-50/70 dark:bg-brand-950/70 text-brand-700 dark:text-brand-300 font-bold' : 'border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300')}
            >
              <div className="font-bold text-xs">Instant Practice Mode</div>
              <div className="text-[10px] text-surface-400 mt-0.5">Real-time feedback per answer</div>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-surface-200 dark:border-surface-800 flex justify-end gap-3">
          <Button variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="md" onClick={handleLaunch} icon={Sparkles} className="font-bold">
            Start 1-to-1 Interview
          </Button>
        </div>

      </div>
    </Modal>
  );
}