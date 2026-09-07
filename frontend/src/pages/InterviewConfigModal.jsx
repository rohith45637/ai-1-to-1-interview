import React, { useState, useEffect } from 'react';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { rolesApi } from '../services/api';
import { 
  Sparkles, Clock, Camera, Mic, Volume2, Globe, 
  CheckCircle2, XCircle, ChevronRight, ChevronLeft, ShieldCheck, RefreshCw
} from 'lucide-react';

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
  const [currentStep, setCurrentStep] = useState(1); // 1: Config, 2: Device Check
  const [roles, setRoles] = useState(DEFAULT_ROLES);
  const resolveRoleTitle = (r) => (typeof r === 'string' ? r : (r?.title || r?.role_title || 'Full Stack Developer'));
  const [selectedRole, setSelectedRole] = useState(resolveRoleTitle(initialRole));
  const [interviewType, setInterviewType] = useState(initialType || 'Mixed');
  const [hrPercentage, setHrPercentage] = useState(20);
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [mode, setMode] = useState('real');

  // Real Device Check States
  const [deviceCheck, setDeviceCheck] = useState({
    camera: 'CHECKING', // 'CHECKING' | 'CONNECTED' | 'FAILED'
    microphone: 'CHECKING',
    speaker: 'CHECKING',
    internet: 'CHECKING',
    cameraError: '',
    micError: ''
  });

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
      setCurrentStep(1);
    }
  }, [isOpen, initialRole, initialType]);

  // Perform Real Device Check when reaching Step 2
  const runDeviceCheck = async () => {
    setDeviceCheck({
      camera: 'CHECKING',
      microphone: 'CHECKING',
      speaker: 'CHECKING',
      internet: navigator.onLine ? 'CONNECTED' : 'FAILED',
      cameraError: '',
      micError: ''
    });

    // 1. Check Camera
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const camStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        camStream.getTracks().forEach(t => t.stop());
        setDeviceCheck(prev => ({ ...prev, camera: 'CONNECTED' }));
      } else {
        setDeviceCheck(prev => ({ ...prev, camera: 'FAILED', cameraError: 'API unsupported' }));
      }
    } catch (e) {
      setDeviceCheck(prev => ({ ...prev, camera: 'FAILED', cameraError: e.name || 'Access denied' }));
    }

    // 2. Check Microphone
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        micStream.getTracks().forEach(t => t.stop());
        setDeviceCheck(prev => ({ ...prev, microphone: 'CONNECTED' }));
      } else {
        setDeviceCheck(prev => ({ ...prev, microphone: 'FAILED', micError: 'API unsupported' }));
      }
    } catch (e) {
      setDeviceCheck(prev => ({ ...prev, microphone: 'FAILED', micError: e.name || 'Access denied' }));
    }

    // 3. Check Audio / Speaker support
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx || 'speechSynthesis' in window) {
        setDeviceCheck(prev => ({ ...prev, speaker: 'CONNECTED' }));
      } else {
        setDeviceCheck(prev => ({ ...prev, speaker: 'FAILED' }));
      }
    } catch (e) {
      setDeviceCheck(prev => ({ ...prev, speaker: 'FAILED' }));
    }
  };

  const handleGoToDeviceCheck = () => {
    setCurrentStep(2);
    runDeviceCheck();
  };

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
      voice_enabled: true,
      camera_enabled: deviceCheck.camera === 'CONNECTED'
    });
  };

  const hrCount = interviewType === 'HR' 
    ? totalQuestions 
    : (interviewType === 'Technical' || interviewType === 'Weak-Skill Practice' 
      ? 0 
      : Math.max(0, Math.round((hrPercentage / 100) * totalQuestions)));
  const techCount = totalQuestions - hrCount;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Configure Your AI 1-to-1 Interview" 
      subtitle={`Step ${currentStep} of 2 • ${currentStep === 1 ? 'Interview Parameters' : 'Hardware & Device Verification'}`}
      maxWidth="max-w-2xl"
    >
      {currentStep === 1 ? (
        <div className="space-y-6 text-xs text-surface-300">
          
          {/* Target Job Role */}
          <div className="space-y-2">
            <label className="font-bold text-white flex items-center justify-between text-xs">
              <span>Target Job Role</span>
              {initialResumeId && <Badge variant="brand" size="xs">Resume Attached</Badge>}
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-surface-700 bg-surface-950 text-white font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none cursor-pointer"
            >
              {selectedRole && !roles.some(r => r.title?.toLowerCase() === selectedRole.toLowerCase()) && (
                <option value={selectedRole}>{selectedRole} (Resume Profile Target)</option>
              )}
              {roles.map(r => (
                <option key={r.id || r.title} value={r.title}>{r.title} ({r.category})</option>
              ))}
            </select>
          </div>

          {/* Interview Format */}
          <div className="space-y-2">
            <label className="font-bold text-white text-xs">Interview Format</label>
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
                  className={`p-2.5 rounded-xl border text-left font-semibold transition-all cursor-pointer ${
                    interviewType === type.id 
                      ? 'border-brand-500 bg-brand-500/15 text-brand-300 shadow-sm' 
                      : 'border-surface-800 hover:bg-surface-800/60 text-surface-300'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Session Duration Selector */}
          <div className="space-y-2 p-3.5 rounded-xl bg-surface-950 border border-surface-800">
            <div className="flex items-center justify-between font-bold text-white">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-brand-400" />
                Session Duration
              </span>
              <span className="text-brand-400 font-mono font-black">{durationMinutes} Minutes</span>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-1">
              {[10, 15, 20, 30].map(mins => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDurationMinutes(mins)}
                  className={`py-2 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                    durationMinutes === mins 
                      ? 'border-brand-500 bg-brand-600 text-white shadow-sm' 
                      : 'border-surface-800 bg-surface-900 text-surface-300 hover:bg-surface-800'
                  }`}
                >
                  {mins} Mins
                </button>
              ))}
            </div>
          </div>

          {/* HR Ratio */}
          {(interviewType === 'Mixed' || interviewType === 'Final Mock' || interviewType === 'Resume-Based') && (
            <div className="space-y-2 p-3.5 rounded-xl bg-surface-950 border border-surface-800">
              <div className="flex items-center justify-between font-bold text-white">
                <span>HR / Behavioral Proportion</span>
                <span className="text-brand-400 font-mono font-black">{hrPercentage}%</span>
              </div>
              
              <input
                type="range"
                min="0"
                max="50"
                step="10"
                value={hrPercentage}
                onChange={(e) => setHrPercentage(parseInt(e.target.value))}
                className="w-full h-2 bg-surface-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
              />

              <div className="flex items-center justify-between text-[10px] text-surface-500 pt-0.5">
                <span>0% (Tech Only)</span>
                <span>20% (Standard)</span>
                <span>50% (Equal Split)</span>
              </div>
            </div>
          )}

          {/* Difficulty Level */}
          <div className="space-y-2">
            <label className="font-bold text-white text-xs">Difficulty Level</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'Beginner', desc: 'Core basics & syntax' },
                { id: 'Intermediate', desc: 'Practical trade-offs' },
                { id: 'Advanced', desc: 'System internals' },
                { id: 'Expert', desc: 'Scale & failure modes' }
              ].map(diff => (
                <button
                  key={diff.id}
                  type="button"
                  onClick={() => setDifficulty(diff.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    difficulty === diff.id 
                      ? 'border-brand-500 bg-brand-500/15 text-brand-300 font-bold' 
                      : 'border-surface-800 hover:bg-surface-800/60 text-surface-300'
                  }`}
                >
                  <div className="font-bold text-xs">{diff.id}</div>
                  <div className="text-[10px] text-surface-400 font-normal mt-0.5">{diff.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-surface-800 flex justify-end gap-3">
            <Button variant="ghost" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              size="md" 
              onClick={handleGoToDeviceCheck} 
              icon={ChevronRight}
              iconPosition="right"
              className="font-bold"
            >
              Continue to Device Check
            </Button>
          </div>

        </div>
      ) : (
        /* STEP 2: REAL PRE-INTERVIEW DEVICE CHECK */
        <div className="space-y-6 text-xs text-surface-300">
          <div className="p-4 rounded-2xl bg-surface-950 border border-surface-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-surface-800">
              <span className="font-bold text-white text-sm">Hardware & Network Diagnostics</span>
              <button
                onClick={runDeviceCheck}
                className="inline-flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-check</span>
              </button>
            </div>

            {/* 4 Hardware Status Rows */}
            <div className="space-y-3">
              {/* Camera */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-900 border border-surface-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-surface-800 text-brand-400">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">Camera</span>
                    <span className="text-[11px] text-surface-400">Candidate video feed</span>
                  </div>
                </div>
                <div>
                  {deviceCheck.camera === 'CONNECTED' && (
                    <Badge variant="success" dot={true}>CONNECTED</Badge>
                  )}
                  {deviceCheck.camera === 'FAILED' && (
                    <Badge variant="danger" dot={true}>FAILED</Badge>
                  )}
                  {deviceCheck.camera === 'CHECKING' && (
                    <Badge variant="warning" dot={true}>Testing...</Badge>
                  )}
                </div>
              </div>

              {/* Microphone */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-900 border border-surface-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-surface-800 text-indigo-400">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">Microphone</span>
                    <span className="text-[11px] text-surface-400">Speech recognition audio</span>
                  </div>
                </div>
                <div>
                  {deviceCheck.microphone === 'CONNECTED' && (
                    <Badge variant="success" dot={true}>CONNECTED</Badge>
                  )}
                  {deviceCheck.microphone === 'FAILED' && (
                    <Badge variant="danger" dot={true}>FAILED</Badge>
                  )}
                  {deviceCheck.microphone === 'CHECKING' && (
                    <Badge variant="warning" dot={true}>Testing...</Badge>
                  )}
                </div>
              </div>

              {/* Speaker */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-900 border border-surface-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-surface-800 text-emerald-400">
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">Speaker & Voice Synthesis</span>
                    <span className="text-[11px] text-surface-400">AI interviewer audio</span>
                  </div>
                </div>
                <div>
                  {deviceCheck.speaker === 'CONNECTED' && (
                    <Badge variant="success" dot={true}>CONNECTED</Badge>
                  )}
                  {deviceCheck.speaker === 'FAILED' && (
                    <Badge variant="danger" dot={true}>FAILED</Badge>
                  )}
                  {deviceCheck.speaker === 'CHECKING' && (
                    <Badge variant="warning" dot={true}>Testing...</Badge>
                  )}
                </div>
              </div>

              {/* Internet */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-900 border border-surface-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-surface-800 text-amber-400">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">Internet Connectivity</span>
                    <span className="text-[11px] text-surface-400">Gemini backend connection</span>
                  </div>
                </div>
                <div>
                  {deviceCheck.internet === 'CONNECTED' && (
                    <Badge variant="success" dot={true}>CONNECTED</Badge>
                  )}
                  {deviceCheck.internet === 'FAILED' && (
                    <Badge variant="danger" dot={true}>FAILED</Badge>
                  )}
                  {deviceCheck.internet === 'CHECKING' && (
                    <Badge variant="warning" dot={true}>Testing...</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-surface-800 flex justify-between items-center">
            <Button 
              variant="outline" 
              size="md" 
              onClick={() => setCurrentStep(1)}
              icon={ChevronLeft}
            >
              Back
            </Button>
            
            <Button
              variant="primary"
              size="md"
              onClick={handleLaunch}
              icon={Sparkles}
              className="font-bold"
            >
              Enter Interview Room
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}