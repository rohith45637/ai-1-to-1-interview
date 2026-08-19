import React from 'react';
import { Bot, Sparkles, Volume2, Mic, BrainCircuit } from 'lucide-react';

export function AiInterviewerAvatar({
  interviewerName = 'Sarah Jenkins',
  interviewerTitle = 'Lead Technical Recruiter & Staff Architect',
  interviewerState = 'idle', // 'greeting', 'speaking', 'listening', 'thinking', 'idle'
  isSpeaking = false,
  isListening = false,
  targetSkill = ''
}) {
  const state = isSpeaking ? 'speaking' : isListening ? 'listening' : interviewerState;

  const stateBadge = {
    greeting: { text: 'Welcoming Candidate', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', icon: Sparkles },
    speaking: { text: 'Speaking Question', color: 'bg-brand-500/20 text-brand-300 border-brand-500/40 animate-pulse', icon: Volume2 },
    listening: { text: 'Attentively Listening...', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 animate-pulse', icon: Mic },
    thinking: { text: 'Evaluating Technical Depth...', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse', icon: BrainCircuit },
    idle: { text: 'Interview in Progress', color: 'bg-surface-800 text-surface-300 border-surface-700', icon: Bot },
  }[state] || { text: 'Interview Active', color: 'bg-surface-800 text-surface-300 border-surface-700', icon: Bot };

  const StateIcon = stateBadge.icon;

  return (
    <div className="relative w-full h-full min-h-[300px] sm:min-h-[350px] lg:min-h-[380px] rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-surface-950 border-2 border-surface-800 shadow-2xl flex flex-col justify-between p-5">
      
      {/* Top Header Profile */}
      <div className="relative z-10 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md border border-white/20">
            AI
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">{interviewerName}</h3>
              <span className="text-[10px] bg-brand-500/20 text-brand-300 border border-brand-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                AI Interviewer
              </span>
            </div>
            <p className="text-[11px] text-surface-400 font-medium">{interviewerTitle}</p>
          </div>
        </div>

        <div className={'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md transition-all ' + stateBadge.color}>
          <StateIcon className="w-3.5 h-3.5" />
          <span>{stateBadge.text}</span>
        </div>
      </div>

      {/* Center Stage Avatar */}
      <div className="relative z-10 my-auto flex flex-col items-center justify-center text-center py-4">
        <div className="relative">
          {state === 'speaking' && (
            <div className="absolute -inset-2 rounded-full border-2 border-brand-400/40 animate-pulse" />
          )}

          <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full p-1 bg-gradient-to-b from-brand-500 via-indigo-500 to-purple-600 shadow-2xl flex items-center justify-center overflow-hidden">
            <div className="w-full h-full rounded-full bg-slate-900 overflow-hidden relative flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900 to-indigo-950" />

              <svg viewBox="0 0 160 160" className="w-full h-full relative z-10">
                <path d="M40,80 Q40,30 80,25 Q120,30 120,80 Q120,110 115,130 L45,130 Q40,110 40,80 Z" fill="#1e293b" />
                <rect x="68" y="90" width="24" height="30" rx="6" fill="#f8d7c2" />
                <path d="M68,96 Q80,105 92,96" stroke="#e2bba4" strokeWidth="2" fill="none" />
                <path d="M35,160 L50,115 L68,118 L70,140 L90,140 L92,118 L110,115 L125,160 Z" fill="#0f172a" />
                <polygon points="68,118 80,135 92,118 80,108" fill="#ffffff" />
                <polygon points="75,115 80,128 85,115" fill="#3b82f6" />
                <path d="M50,115 L70,140 L60,160 Z" fill="#1e293b" />
                <path d="M110,115 L90,140 L100,160 Z" fill="#1e293b" />
                <path d="M52,65 Q50,102 80,105 Q110,102 108,65 Q110,40 80,38 Q50,40 52,65 Z" fill="#fed7aa" />
                <ellipse cx="49" cy="68" rx="4" ry="8" fill="#fdba74" />
                <ellipse cx="111" cy="68" rx="4" ry="8" fill="#fdba74" />
                <path d="M48,55 Q55,30 80,28 Q105,30 112,55 Q100,45 80,45 Q58,45 48,55 Z" fill="#0f172a" />
                <path d="M48,55 Q55,70 52,90 Q47,70 48,55 Z" fill="#0f172a" />
                <path d="M112,55 Q105,70 108,90 Q113,70 112,55 Z" fill="#0f172a" />
                <path d="M58,56 Q66,53 73,56" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <path d="M87,56 Q94,53 102,56" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <ellipse cx="66" cy="64" rx="4.5" ry="3" fill="#ffffff" />
                <ellipse cx="94" cy="64" rx="4.5" ry="3" fill="#ffffff" />
                <circle cx="66" cy="64" r="2.2" fill="#1e3a8a" />
                <circle cx="94" cy="64" r="2.2" fill="#1e3a8a" />
                <path d="M80,63 L78,75 L84,75" stroke="#ea580c" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />
                {state === 'speaking' ? (
                  <ellipse cx="80" cy="86" rx="6" ry="3.5" fill="#be123c" className="animate-pulse" />
                ) : state === 'listening' ? (
                  <path d="M74,85 Q80,89 86,85" stroke="#be123c" strokeWidth="2" strokeLinecap="round" fill="none" />
                ) : state === 'greeting' ? (
                  <path d="M73,84 Q80,91 87,84" stroke="#be123c" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                ) : (
                  <path d="M75,86 Q80,88 85,86" stroke="#be123c" strokeWidth="2" strokeLinecap="round" fill="none" />
                )}
              </svg>
            </div>
          </div>
        </div>

        <div className="mt-3 max-w-xs text-center space-y-1">
          {state === 'speaking' && (
            <p className="text-xs text-brand-300 font-semibold animate-pulse">
              Speaking question aloud...
            </p>
          )}
          {state === 'listening' && (
            <p className="text-xs text-indigo-300 font-semibold animate-pulse">
              Listening to your answer...
            </p>
          )}
          {state === 'thinking' && (
            <p className="text-xs text-amber-300 font-semibold animate-pulse">
              Analyzing technical depth & communication...
            </p>
          )}
          {targetSkill && (
            <span className="inline-block text-[10px] text-surface-400 bg-surface-900/80 px-2.5 py-0.5 rounded-full border border-surface-800">
              Focus Skill: <strong className="text-surface-200">{targetSkill}</strong>
            </span>
          )}
        </div>
      </div>

      <div className="relative z-10 pt-2 border-t border-surface-800/80 flex items-center justify-between text-[11px] text-surface-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>AI Audio: Active</span>
        </span>
        <span>Executive 1-to-1 Interview</span>
      </div>
    </div>
  );
}