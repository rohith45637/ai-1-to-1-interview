import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ProgressBar } from '../components/common/ProgressBar';
import { AiInterviewerAvatar } from '../components/interview/AiInterviewerAvatar';
import { UserWebcam } from '../components/interview/UserWebcam';
import { useSpeech } from '../hooks/useSpeech';
import { useAuth } from '../context/AuthContext';
import { interviewsApi } from '../services/api';
import { 
  Clock, Sparkles, Send, SkipForward, Hourglass, 
  ArrowRight, RotateCcw, Volume2, VolumeX, Keyboard, 
  Mic, MicOff, CheckCircle2, AlertCircle, PhoneOff, MessageSquare, Bot, User
} from 'lucide-react';

export function InterviewRoomPage({ 
  initialConfig, 
  onInterviewComplete, 
  onExitInterview 
}) {
  const { user } = useAuth();
  
  // State Machine: 'loading' | 'greeting' | 'question_speaking' | 'ready_to_listen' | 'listening' | 'thinking' | 'submitting' | 'instant_modal' | 'concluding'
  const [interviewState, setInterviewState] = useState('loading');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [instantEvaluation, setInstantEvaluation] = useState(null);
  const [isFollowUpTriggered, setIsFollowUpTriggered] = useState(false);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [statusNotice, setStatusNotice] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);

  // Overall Interview Duration Countdown in Seconds
  const totalDurationSeconds = (initialConfig.duration_minutes || 15) * 60;
  const [secondsRemaining, setSecondsRemaining] = useState(totalDurationSeconds);

  // Temporary Thinking Breather Timer (e.g. 30 seconds)
  const [thinkingSeconds, setThinkingSeconds] = useState(0);
  const [isThinkingTimerActive, setIsThinkingTimerActive] = useState(false);

  // Reference to prevent duplicate speech of the same question ID
  const spokenQuestionIdRef = useRef(null);
  const presentationMetricsRef = useRef(null);

  const handleUpdatePresentationMetrics = useCallback((metrics) => {
    presentationMetricsRef.current = metrics;
  }, []);

  const {
    isListening,
    transcript,
    setTranscript,
    startListening,
    stopListening,
    isSpeaking,
    speak,
    stopSpeaking,
    isMuted,
    toggleMute,
    sttSupported,
    micPermissionDenied
  } = useSpeech();

  // 1. Initialize Interview Session on Mount
  useEffect(() => {
    let isMounted = true;
    async function initSession() {
      try {
        setInterviewState('loading');
        const firstQ = await interviewsApi.createInterview({
          job_role: initialConfig.job_role,
          interview_type: initialConfig.interview_type,
          difficulty: initialConfig.difficulty,
          hr_percentage: initialConfig.hr_percentage,
          total_questions: initialConfig.total_questions,
          duration_minutes: initialConfig.duration_minutes || 15,
          mode: initialConfig.mode,
          resume_id: initialConfig.resume_id,
          target_weak_skills: initialConfig.target_weak_skills
        });

        if (!isMounted) return;
        setCurrentQuestion(firstQ);
        setInterviewState('greeting');

        // Initial AI greeting
        const greetingText = `Good morning! Welcome to your 1-to-1 interview for the ${initialConfig.job_role} position. I will be your interviewer today. Let us get started with your first question.`;
        speak(greetingText, () => {
          if (isMounted) {
            setInterviewState('ready_to_listen');
          }
        });
      } catch (err) {
        console.error('Failed to start interview:', err);
        if (isMounted) setInterviewState('error');
      }
    }
    initSession();

    return () => {
      isMounted = false;
      stopSpeaking();
      stopListening();
    };
  }, [initialConfig]);

  // 2. Play AI Voice automatically whenever currentQuestion changes
  useEffect(() => {
    if (!currentQuestion || interviewState === 'greeting' || interviewState === 'loading') return;

    if (spokenQuestionIdRef.current === currentQuestion.id) return;
    spokenQuestionIdRef.current = currentQuestion.id;

    // Start speaking question
    setInterviewState('question_speaking');
    setStatusNotice('AI is speaking...');
    
    stopListening();
    setUserAnswer('');
    setTranscript('');

    speak(currentQuestion.question_text, () => {
      setInterviewState('ready_to_listen');
      setStatusNotice('Listening...');
      if (sttSupported && !micPermissionDenied) {
        startListening(handleAutoSilenceSubmit);
        setInterviewState('listening');
      }
    });
  }, [currentQuestion, sttSupported, micPermissionDenied]);

  // 3. Overall Session Timer
  useEffect(() => {
    let interval;
    if (interviewState !== 'loading' && interviewState !== 'concluding') {
      interval = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            handleTimeExpired();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [interviewState]);

  // 4. Temporary Thinking Timer
  useEffect(() => {
    let timer;
    if (isThinkingTimerActive && thinkingSeconds > 0) {
      timer = setInterval(() => {
        setThinkingSeconds(prev => {
          if (prev <= 1) {
            setIsThinkingTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isThinkingTimerActive, thinkingSeconds]);

  // Synchronize live speech transcript
  useEffect(() => {
    if (transcript) {
      setUserAnswer(transcript);
    }
  }, [transcript]);

  // Auto-silence submit handler
  const handleAutoSilenceSubmit = useCallback(async (finalSpeech) => {
    const textToSubmit = (finalSpeech || userAnswer || transcript).trim();
    if (textToSubmit.length > 5 && interviewState === 'listening') {
      submitCandidateAnswer(textToSubmit);
    }
  }, [userAnswer, transcript, interviewState]);

  // Submit Answer
  const submitCandidateAnswer = async (textOverride = null) => {
    const finalAnswer = (textOverride || userAnswer || transcript).trim();
    if (!finalAnswer || !currentQuestion) return;

    try {
      stopListening();
      setInterviewState('thinking');
      setStatusNotice('AI Interviewer is evaluating your answer...');

      // Record in conversation history
      setConversationHistory(prev => [
        ...prev,
        { role: 'ai', text: currentQuestion.question_text },
        { role: 'user', text: finalAnswer }
      ]);

      const response = await interviewsApi.submitAnswer({
        interview_id: currentQuestion.interview_id,
        question_id: currentQuestion.id,
        user_answer: finalAnswer,
        presentation_metrics: presentationMetricsRef.current
      });

      // Handle Practice Mode Instant Evaluation
      if (initialConfig.mode === 'practice' && response.instant_evaluation) {
        setInstantEvaluation(response.instant_evaluation);
        setInterviewState('instant_modal');
        return;
      }

      // Check if interview concluded
      if (response.is_complete) {
        setInterviewState('concluding');
        const farewell = 'Thank you for completing this comprehensive interview session. I am compiling your detailed performance scorecard now.';
        speak(farewell, () => {
          onInterviewComplete(currentQuestion.interview_id);
        });
        return;
      }

      // Proceed to Next Question
      if (response.next_question) {
        setCurrentQuestion(response.next_question);
        setIsFollowUpTriggered(response.is_follow_up || false);
      }
    } catch (err) {
      console.error('Answer submission failed:', err);
      setInterviewState('ready_to_listen');
    }
  };

  const handleTimeExpired = async () => {
    try {
      setInterviewState('concluding');
      speak('Session time has concluded. Compiling your final interview report now.', () => {
        onInterviewComplete(currentQuestion?.interview_id);
      });
    } catch (e) {
      onExitInterview();
    }
  };

  const handleManualSkip = async () => {
    if (!currentQuestion) return;
    try {
      stopListening();
      setInterviewState('thinking');
      const response = await interviewsApi.skipQuestion({
        interview_id: currentQuestion.interview_id,
        question_id: currentQuestion.id
      });

      if (response.is_complete) {
        onInterviewComplete(currentQuestion.interview_id);
      } else if (response.next_question) {
        setCurrentQuestion(response.next_question);
      }
    } catch (err) {
      console.error('Skip failed:', err);
    }
  };

  const handleStartThinkingBreather = () => {
    stopListening();
    setThinkingSeconds(30);
    setIsThinkingTimerActive(true);
    setInterviewState('ready_to_listen');
    setStatusNotice('Thinking timer active (30s). Organize your points, then speak.');
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  const currentQNum = currentQuestion?.question_number || 1;
  const totalQCount = currentQuestion?.total_questions || initialConfig.total_questions || 5;
  const progressPercent = Math.round((currentQNum / totalQCount) * 100);

  return (
    <div className="max-w-7xl mx-auto space-y-5 py-2 pb-16 text-surface-200">
      
      {/* ------------------------------------------------------------- */}
      {/* TOP STATUS BAR: AI INTERVIEWER | TIME / STATUS | EXIT */}
      {/* ------------------------------------------------------------- */}
      <div className="p-4 rounded-2xl bg-surface-900/90 border border-surface-800 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">{initialConfig.job_role}</span>
              <Badge variant="brand" size="xs">{initialConfig.difficulty}</Badge>
              {isFollowUpTriggered && <Badge variant="warning" size="xs">Adaptive Follow-up</Badge>}
            </div>
            <span className="text-[11px] text-surface-400">Question {currentQNum} of {totalQCount}</span>
          </div>
        </div>

        {/* Progress & Timer */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end gap-1">
            <span className="text-[10px] text-surface-400 font-semibold">Progress ({progressPercent}%)</span>
            <div className="w-28 h-2 bg-surface-800 rounded-full overflow-hidden p-0.5 border border-surface-700/50">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-indigo-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-950 border border-surface-800 font-mono text-xs font-bold text-white">
            <Clock className="w-3.5 h-3.5 text-brand-400" />
            <span>{formatTime(secondsRemaining)}</span>
          </div>

          <button
            onClick={() => setShowExitConfirm(true)}
            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors cursor-pointer"
            title="End Interview Early"
          >
            <PhoneOff className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MAIN STAGE: AI VIDEO AVATAR & CANDIDATE CAMERA PREVIEW */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: AI Interviewer Avatar */}
        <AiInterviewerAvatar
          interviewerName="Sarah Jenkins"
          interviewerTitle="Senior Technical Recruiter & Architect"
          interviewerState={interviewState === 'question_speaking' ? 'speaking' : interviewState === 'listening' ? 'listening' : interviewState === 'thinking' ? 'thinking' : 'idle'}
          isSpeaking={isSpeaking}
          isListening={isListening}
          targetSkill={currentQuestion?.primary_skill || ''}
        />

        {/* Right: Candidate Camera Preview */}
        <UserWebcam
          isListening={isListening}
          candidateName={user?.name || 'Candidate'}
          onToggleMic={toggleMute}
          isMicMuted={isMuted}
          micPermissionDenied={micPermissionDenied}
          onUpdatePresentationMetrics={handleUpdatePresentationMetrics}
        />
      </div>

      {/* ------------------------------------------------------------- */}
      {/* QUESTION & CONVERSATION SECTION */}
      {/* ------------------------------------------------------------- */}
      <Card className="p-6 space-y-5 border-surface-800 bg-surface-900/90 shadow-xl">
        
        {/* Current Active Question Display */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400 flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5" />
              Current Question ({currentQNum}/{totalQCount})
            </span>
            {isSpeaking && (
              <span className="text-xs text-brand-300 font-semibold flex items-center gap-1.5 animate-pulse">
                <Volume2 className="w-3.5 h-3.5" />
                AI is speaking...
              </span>
            )}
            {isListening && (
              <span className="text-xs text-rose-400 font-semibold flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Listening... Speak into mic
              </span>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-surface-950/80 border border-surface-800">
            <h2 className="text-base sm:text-lg font-bold text-white leading-relaxed">
              {currentQuestion?.question_text || 'Preparing interview question...'}
            </h2>
          </div>
        </div>

        {/* Conversation Stream (AI left-aligned, Candidate right-aligned) */}
        {conversationHistory.length > 0 && (
          <div className="space-y-3 pt-2 max-h-48 overflow-y-auto pr-2 border-t border-surface-800/80">
            {conversationHistory.map((item, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {item.role === 'ai' && (
                  <div className="w-6 h-6 rounded-lg bg-brand-500/20 text-brand-300 border border-brand-500/30 flex items-center justify-center shrink-0 mt-0.5 text-xs">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                
                <div
                  className={`p-3 rounded-2xl max-w-lg text-xs leading-relaxed ${
                    item.role === 'user'
                      ? 'bg-brand-600 text-white rounded-tr-none'
                      : 'bg-surface-950 text-surface-200 border border-surface-800 rounded-tl-none'
                  }`}
                >
                  <p>{item.text}</p>
                </div>

                {item.role === 'user' && (
                  <div className="w-6 h-6 rounded-lg bg-surface-800 text-surface-300 flex items-center justify-center shrink-0 mt-0.5 text-xs">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Live Speech Recognition Transcript / Manual Text Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-surface-400">
            <span className="font-semibold flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
              Your Live Spoken Response:
            </span>
            <button
              onClick={() => setShowTextEditor(!showTextEditor)}
              className="text-brand-400 hover:text-brand-300 flex items-center gap-1 text-[11px] cursor-pointer"
            >
              <Keyboard className="w-3 h-3" />
              {showTextEditor ? 'Switch to Voice View' : 'Type Response Instead'}
            </button>
          </div>

          {showTextEditor ? (
            <textarea
              rows={3}
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (userAnswer.trim() && interviewState !== 'thinking') {
                    submitCandidateAnswer();
                  }
                }
              }}
              placeholder="Type your detailed answer here (Press Enter to submit, Shift+Enter for new line)..."
              className="w-full p-3 rounded-xl bg-surface-50 dark:bg-surface-950 border border-surface-300 dark:border-surface-700 text-xs text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          ) : (
            <div className="p-3.5 rounded-xl bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 text-xs min-h-[60px] flex items-center">
              {userAnswer ? (
                <span className="text-surface-900 dark:text-white font-medium">{userAnswer}</span>
              ) : (
                <span className="text-surface-500 italic">
                  {isListening ? 'Listening... Speak your answer aloud or click Type Response.' : 'Waiting for AI question to complete before listening...'}
                </span>
              )}
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* INTERVIEW CONTROL BUTTONS BAR */}
        {/* ------------------------------------------------------------- */}
        <div className="pt-3 border-t border-surface-200 dark:border-surface-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleMute}
              icon={isMuted ? MicOff : Mic}
            >
              {isMuted ? 'Unmute Mic' : 'Mute Mic'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleStartThinkingBreather}
              disabled={isThinkingTimerActive}
              icon={Hourglass}
            >
              {isThinkingTimerActive ? `Thinking (${thinkingSeconds}s)` : '30s Breather'}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleManualSkip}
              icon={SkipForward}
            >
              Skip Question
            </Button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="primary"
              size="md"
              onClick={() => submitCandidateAnswer()}
              disabled={!userAnswer.trim() || interviewState === 'thinking'}
              loading={interviewState === 'thinking'}
              icon={Send}
              className="w-full sm:w-auto font-bold"
            >
              Submit Answer
            </Button>
          </div>
        </div>

      </Card>

      {/* ------------------------------------------------------------- */}
      {/* INSTANT PRACTICE MODE MODAL EVALUATION */}
      {/* ------------------------------------------------------------- */}
      {instantEvaluation && (
        <Modal
          isOpen={interviewState === 'instant_modal'}
          onClose={() => setInterviewState('ready_to_listen')}
          title="Instant Answer Critique"
          subtitle="Real-time calibration for practice mode"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-surface-950 border border-surface-800 flex items-center justify-between">
              <span className="font-bold text-white">Answer Score</span>
              <span className="text-xl font-black text-brand-400 font-mono">
                {instantEvaluation.score || 80} / 100
              </span>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-emerald-400 block">Strong Points:</span>
              <p className="text-surface-300">{instantEvaluation.strengths || 'Clear structure and confident articulation.'}</p>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-amber-400 block">Areas for Improvement:</span>
              <p className="text-surface-300">{instantEvaluation.improvements || 'Incorporate specific metrics and edge case trade-offs.'}</p>
            </div>

            <div className="pt-3 border-t border-surface-800 flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={async () => {
                  setInstantEvaluation(null);
                  setInterviewState('loading');
                  const nextQ = await interviewsApi.getNextQuestion({ interview_id: currentQuestion.interview_id });
                  if (nextQ.is_complete) {
                    onInterviewComplete(currentQuestion.interview_id);
                  } else {
                    setCurrentQuestion(nextQ);
                  }
                }}
                icon={ArrowRight}
              >
                Proceed to Next Question
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ------------------------------------------------------------- */}
      {/* EXIT CONFIRMATION MODAL */}
      {/* ------------------------------------------------------------- */}
      <Modal
        isOpen={showExitConfirm}
        onClose={() => setShowExitConfirm(false)}
        title="End Interview Early?"
        subtitle="You can generate a partial scorecard or exit to the practice hub."
      >
        <div className="space-y-4 text-xs text-surface-300">
          <p>
            Are you sure you want to exit the interview room? If you end now, an assessment will be compiled for your completed answers.
          </p>

          <div className="pt-3 border-t border-surface-800 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowExitConfirm(false)}>
              Resume Interview
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                setShowExitConfirm(false);
                onInterviewComplete(currentQuestion?.interview_id);
              }}
            >
              End & Generate Scorecard
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}