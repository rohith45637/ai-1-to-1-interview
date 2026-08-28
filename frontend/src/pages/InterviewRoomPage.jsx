import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { AiInterviewerAvatar } from '../components/interview/AiInterviewerAvatar';
import { UserWebcam } from '../components/interview/UserWebcam';
import { useSpeech } from '../hooks/useSpeech';
import { useAuth } from '../context/AuthContext';
import { interviewsApi } from '../services/api';
import { 
  Clock, Sparkles, Send, SkipForward, Hourglass, 
  CornerDownRight, ArrowRight, 
  RotateCcw, Volume2, VolumeX, Keyboard, Mic, MicOff
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

        // Warm Indian English Greeting
        const greetingText = `Good morning! Welcome to your 1-to-1 interview for the ${initialConfig.job_role} position. I will be your interviewer today. Shall we begin?`;
        speak(greetingText, () => {
          if (isMounted) {
            // Once greeting finishes speaking, listen for candidate confirmation
            startListening(handleAutoSilenceSubmit);
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

    // Check if this question was already spoken
    if (spokenQuestionIdRef.current === currentQuestion.id) return;
    spokenQuestionIdRef.current = currentQuestion.id;

    // Start speaking question
    setInterviewState('question_speaking');
    setStatusNotice('AI Interviewer is speaking question aloud...');
    
    // Stop any previous microphone input while AI speaks
    stopListening();
    setUserAnswer('');
    setTranscript('');

    speak(currentQuestion.question_text, () => {
      // Once AI speech finishes, activate Voice Recognition automatically
      setInterviewState('ready_to_listen');
      setStatusNotice('Listening for your response. Speak naturally into your microphone...');
      if (sttSupported && !micPermissionDenied) {
        startListening(handleAutoSilenceSubmit);
        setInterviewState('listening');
      }
    });
  }, [currentQuestion, sttSupported, micPermissionDenied]);

  // 3. Overall Interview Duration Countdown
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

  // 5. Sync STT transcript into userAnswer & Detect Greeting/Thinking/Skip cues
  useEffect(() => {
    if (transcript) {
      setUserAnswer(transcript);
      const lower = transcript.toLowerCase();

      // Conversational Greeting Response
      if (interviewState === 'greeting') {
        if (lower.includes('yes') || lower.includes('ready') || lower.includes('begin') || lower.includes('start') || lower.includes('sure') || lower.includes('hello')) {
          handleStartFirstQuestion();
        }
      }

      // Conversational Thinking Request
      if ((interviewState === 'listening' || interviewState === 'ready_to_listen') && !isThinkingTimerActive) {
        if (lower.includes('give me some time') || lower.includes('let me think') || lower.includes('one minute') || lower.includes('need some time')) {
          handleTriggerThinking();
        }
      }

      // Conversational Skip Request
      if (interviewState === 'listening' || interviewState === 'ready_to_listen') {
        if (lower.includes("i don't know") || lower.includes("i do not know") || lower.includes("skip this") || lower.includes("skip question")) {
          handleSkipQuestion();
        }
      }
    }
  }, [transcript, interviewState, isThinkingTimerActive]);

  const formatCountdown = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return String(mins).padStart(2, '0') + ':' + String(rem).padStart(2, '0');
  };

  // Start First Question from Greeting
  const handleStartFirstQuestion = () => {
    stopSpeaking();
    stopListening();
    setInterviewState('question_speaking');
    setTranscript('');
    setUserAnswer('');

    if (currentQuestion?.question_text) {
      spokenQuestionIdRef.current = currentQuestion.id;
      speak(currentQuestion.question_text, () => {
        setInterviewState('ready_to_listen');
        setStatusNotice('Microphone active. Speak your answer...');
        if (sttSupported && !micPermissionDenied) {
          startListening(handleAutoSilenceSubmit);
          setInterviewState('listening');
        }
      });
    }
  };

  // Auto-silence submission callback triggered by useSpeech silence detector
  const handleAutoSilenceSubmit = useCallback((finalSpokenText) => {
    if (!finalSpokenText || finalSpokenText.trim().length < 5) return;
    submitAnswerPayload(finalSpokenText);
  }, [currentQuestion]);

  // Submit Answer Payload to Backend
  const submitAnswerPayload = async (answerText) => {
    if (!currentQuestion) return;
    
    try {
      stopListening();
      stopSpeaking();
      setInterviewState('submitting');
      setStatusNotice('Analyzing your answer and preparing next question...');

      const payload = {
        interview_id: currentQuestion.interview_id,
        question_id: currentQuestion.id,
        user_answer: answerText || userAnswer || '(No response recorded)',
        presentation_metrics: presentationMetricsRef.current || undefined
      };

      const result = await interviewsApi.submitAnswer(payload);

      if (result.status === 'completed') {
        if (initialConfig.mode === 'practice' && result.evaluation) {
          setInstantEvaluation(result.evaluation);
          setInterviewState('instant_modal');
        } else {
          onInterviewComplete(result.interview_id);
        }
      } else if (result.status === 'next_question') {
        if (initialConfig.mode === 'practice' && result.evaluation) {
          setInstantEvaluation(result.evaluation);
          setInterviewState('instant_modal');
          setCurrentQuestion(result.next_question);
          setIsFollowUpTriggered(result.next_question.is_follow_up);
        } else {
          // Move smoothly to next question with automatic Indian English voice playback
          setCurrentQuestion(result.next_question);
          setIsFollowUpTriggered(result.next_question.is_follow_up);
          setUserAnswer('');
          setTranscript('');
          // The useEffect watching currentQuestion will automatically speak and then start listening!
        }
      }
    } catch (err) {
      console.error('Answer submission error:', err);
      setInterviewState('ready_to_listen');
      setStatusNotice('Network note: Please check your answer and click submit again.');
    }
  };

  // Manual Start Voice Recognition Button handler
  const handleToggleVoiceRecognition = () => {
    if (isListening) {
      stopListening();
      setInterviewState('ready_to_listen');
      setStatusNotice('Microphone paused. Click "Start Voice Recognition" or "Continue / Submit Answer".');
    } else {
      if (isSpeaking) stopSpeaking();
      startListening(handleAutoSilenceSubmit);
      setInterviewState('listening');
      setStatusNotice('Listening live. Speak your answer clearly...');
    }
  };

  // Replay Current Question Button handler
  const handleReplayQuestion = () => {
    if (!currentQuestion?.question_text) return;
    stopListening();
    setInterviewState('question_speaking');
    setStatusNotice('Replaying question...');
    
    speak(currentQuestion.question_text, () => {
      setInterviewState('ready_to_listen');
      setStatusNotice('Microphone ready. You can answer now...');
      if (sttSupported && !micPermissionDenied) {
        startListening(handleAutoSilenceSubmit);
        setInterviewState('listening');
      }
    });
  };

  // Thinking Time handler
  const handleTriggerThinking = () => {
    stopListening();
    setIsThinkingTimerActive(true);
    setThinkingSeconds(30);
    setInterviewState('thinking');
    setStatusNotice('Thinking breather active. Take your time...');
    speak("Sure. Take your time to organize your thoughts.");
  };

  const handleAddMoreThinkingTime = () => {
    setThinkingSeconds(prev => prev + 30);
    speak("Added thirty more seconds.");
  };

  const handleResumeFromThinking = () => {
    setIsThinkingTimerActive(false);
    setThinkingSeconds(0);
    setInterviewState('ready_to_listen');
    if (sttSupported && !micPermissionDenied) {
      startListening(handleAutoSilenceSubmit);
      setInterviewState('listening');
    }
  };

  // Skip Question handler
  const handleSkipQuestion = async () => {
    stopListening();
    stopSpeaking();
    setStatusNotice('Skipping current question...');
    speak("That's alright. Let's move to the next question.");
    await submitAnswerPayload("I don't know the answer to this question. Please skip.");
  };

  // Time Expired handler
  const handleTimeExpired = async () => {
    stopListening();
    stopSpeaking();
    setInterviewState('concluding');
    speak("We have reached the end of our allotted interview duration. Thank you for your time. Preparing your final assessment report now.");

    setTimeout(() => {
      if (currentQuestion?.interview_id) {
        onInterviewComplete(currentQuestion.interview_id);
      }
    }, 4000);
  };

  const handleCloseInstantModal = () => {
    setInstantEvaluation(null);
    setUserAnswer('');
    setTranscript('');
    
    if (currentQuestion) {
      // Trigger voice for next question
      setInterviewState('question_speaking');
      speak(currentQuestion.question_text, () => {
        setInterviewState('ready_to_listen');
        if (sttSupported && !micPermissionDenied) {
          startListening(handleAutoSilenceSubmit);
          setInterviewState('listening');
        }
      });
    } else {
      onInterviewComplete(initialConfig.interview_id);
    }
  };

  if (interviewState === 'loading') {
    return (
      <div className="max-w-xl mx-auto py-24 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto border border-brand-200 dark:border-brand-800">
          <Sparkles className="w-8 h-8 animate-pulse" />
        </div>
        <h3 className="text-xl font-bold text-surface-900 dark:text-white">Connecting AI Interviewer...</h3>
        <p className="text-xs text-surface-500">Initializing Indian English voice engine, webcam stage, and basic questions.</p>
      </div>
    );
  }

  const qNum = currentQuestion?.question_number || 1;
  const totalQ = currentQuestion?.total_questions || initialConfig.total_questions;

  // Determine avatar visual state
  const avatarVisualState = isSpeaking 
    ? 'speaking' 
    : isListening 
      ? 'listening' 
      : interviewState === 'submitting' 
        ? 'thinking' 
        : interviewState === 'greeting' 
          ? 'greeting' 
          : 'idle';

  return (
    <div className="max-w-6xl mx-auto space-y-4 py-2 pb-24">
      
      {/* TOP STATUS BAR */}
      <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-xs">
            1:1
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-surface-900 dark:text-white">{initialConfig.job_role}</span>
              <Badge variant="brand" size="sm">{initialConfig.difficulty}</Badge>
            </div>
            <span className="text-[11px] text-surface-500 font-medium">
              Question {qNum} of {totalQ} • {initialConfig.mode === 'real' ? 'Real Mode' : 'Practice Mode'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={'flex items-center gap-1.5 font-mono text-xs font-black px-3.5 py-1.5 rounded-xl border transition-all ' + (secondsRemaining <= 120 ? 'bg-rose-500/10 border-rose-500/40 text-rose-500 animate-pulse' : 'bg-surface-100 dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-200')}>
            <Clock className="w-3.5 h-3.5 text-brand-500" />
            <span>Time Left: {formatCountdown(secondsRemaining)}</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowExitConfirm(true)}
            className="text-xs text-surface-500 hover:text-rose-600"
          >
            End Early
          </Button>
        </div>
      </div>

      {/* DUAL STAGE: AI AVATAR + USER WEBCAM */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AiInterviewerAvatar
          interviewerName="Pooja Sharma"
          interviewerTitle="Senior Technical Recruiter & Staff Architect"
          interviewerState={avatarVisualState}
          isSpeaking={isSpeaking}
          isListening={isListening}
          targetSkill={currentQuestion?.target_skill}
        />

        <UserWebcam
          isListening={isListening}
          candidateName={user?.name || 'Candidate'}
          onToggleMic={handleToggleVoiceRecognition}
          isMicMuted={!isListening}
          onUpdatePresentationMetrics={handleUpdatePresentationMetrics}
        />
      </div>

      {/* QUESTION DISPLAY & AUDIO REPLAY CONTROLS */}
      <Card className="p-5 sm:p-6 border-2 border-brand-500/30 bg-gradient-to-br from-white to-brand-50/20 dark:from-surface-900 dark:to-brand-950/20 shadow-md space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              {interviewState === 'greeting' ? 'Welcome Dialogue' : (`Question ${qNum}`)}
            </span>
            {currentQuestion?.category && (
              <Badge variant="brand" size="sm">{currentQuestion.category}</Badge>
            )}
            {isFollowUpTriggered && (
              <Badge variant="warning" size="sm" className="animate-pulse">
                <CornerDownRight className="w-3 h-3 mr-1" />
                Adaptive Follow-Up
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReplayQuestion}
              title="Replay Question Audio"
              className="p-1.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-100 flex items-center gap-1 text-xs font-semibold px-2.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-brand-600" />
              <span>Replay Audio</span>
            </button>
            <button
              onClick={toggleMute}
              title={isMuted ? 'Unmute AI' : 'Mute AI'}
              className="p-1.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-100"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5 text-brand-600" />}
            </button>
          </div>
        </div>

        <h2 className="text-lg sm:text-xl font-bold text-surface-900 dark:text-white leading-relaxed">
          {interviewState === 'greeting' 
            ? "“Good morning! Welcome to your 1-to-1 interview. I am your AI interviewer today. Shall we begin?”"
            : (`“${currentQuestion?.question_text || "Please share your experience..."}”`)
          }
        </h2>

        {interviewState === 'greeting' && (
          <div className="pt-2 flex justify-start">
            <Button
              variant="primary"
              size="md"
              onClick={handleStartFirstQuestion}
              icon={ArrowRight}
              className="font-bold shadow-md shadow-brand-500/20"
            >
              Yes, I'm Ready — Begin Interview
            </Button>
          </div>
        )}
      </Card>

      {/* THINKING TIMER ACTIVE BANNER */}
      {isThinkingTimerActive && (
        <Card className="p-4 bg-amber-500/10 border-2 border-amber-500/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold text-xs">
              <Hourglass className="w-4 h-4 animate-spin" />
              <span>Thinking Breather: {thinkingSeconds}s remaining</span>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleAddMoreThinkingTime} className="text-xs">
                +30s More
              </Button>
              <Button size="sm" variant="primary" onClick={handleResumeFromThinking} className="text-xs font-bold">
                I'm Ready to Answer
              </Button>
            </div>
          </div>
          <p className="text-[11px] text-surface-500">Take your time to structure your thoughts. This does not penalize your communication score.</p>
        </Card>
      )}

      {/* CANDIDATE SPEECH SECTION WITH PROMINENT "START VOICE RECOGNITION" BUTTON */}
      {interviewState !== 'greeting' && (
        <Card className="p-5 space-y-4 shadow-md">
          
          <div className="flex items-center justify-between border-b border-surface-100 dark:border-surface-800 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-surface-900 dark:text-white">
                Candidate Speech / Transcript
              </span>
              
              {/* Status Indicator */}
              {isListening ? (
                <span className="text-[11px] text-rose-500 font-bold flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-900/60">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  Listening live...
                </span>
              ) : isSpeaking ? (
                <span className="text-[11px] text-brand-600 font-semibold flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                  AI Interviewer Speaking...
                </span>
              ) : (
                <span className="text-[11px] text-surface-400 font-medium">
                  Mic Ready
                </span>
              )}
            </div>

            <button
              onClick={() => setShowTextEditor(!showTextEditor)}
              className="text-[11px] text-brand-600 dark:text-brand-400 font-semibold hover:underline flex items-center gap-1"
            >
              <Keyboard className="w-3.5 h-3.5" />
              {showTextEditor ? 'Hide Text Box' : 'Type Response Manually'}
            </button>
          </div>

          {/* Transcript Area */}
          {showTextEditor ? (
            <textarea
              rows={4}
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type your response here or speak into the microphone..."
              className="w-full p-3 rounded-xl border border-surface-300 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-xs text-surface-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          ) : (
            <div className="p-3.5 rounded-xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700 min-h-[55px] text-xs text-surface-800 dark:text-surface-200 leading-relaxed">
              {userAnswer || (
                <span className="text-surface-400 italic">
                  {isListening 
                    ? "Listening... Speak your answer now. Answers submit automatically when you finish speaking." 
                    : "Click \"Start Voice Recognition\" below or speak into your microphone..."
                  }
                </span>
              )}
            </div>
          )}

          {statusNotice && (
            <p className="text-[11px] text-surface-400 italic">{statusNotice}</p>
          )}

          {/* DEDICATED ACTION BUTTONS ROW (INCLUDING START VOICE RECOGNITION) */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            
            {/* Left Controls: Start Voice Recognition + Skip + Give Me More Time */}
            <div className="flex items-center gap-2 flex-wrap">
              
              {/* PRIMARY: START VOICE RECOGNITION BUTTON */}
              <button
                type="button"
                onClick={handleToggleVoiceRecognition}
                disabled={micPermissionDenied || !sttSupported || interviewState === 'submitting'}
                className={'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ' + (
                  micPermissionDenied 
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 cursor-not-allowed'
                    : isListening 
                      ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                )}
              >
                {micPermissionDenied ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    <span>Microphone Permission Required</span>
                  </>
                ) : isListening ? (
                  <>
                    <Mic className="w-4 h-4" />
                    <span>Listening... (Click to Pause)</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    <span>Start Voice Recognition</span>
                  </>
                )}
              </button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleSkipQuestion}
                icon={SkipForward}
                disabled={interviewState === 'submitting'}
                className="text-xs text-surface-600 dark:text-surface-300"
              >
                Skip Question
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleTriggerThinking}
                icon={Hourglass}
                disabled={isThinkingTimerActive || interviewState === 'submitting'}
                className="text-xs text-surface-600 dark:text-surface-300"
              >
                Give Me More Time
              </Button>

            </div>

            {/* Right Control: Continue / Submit Answer */}
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="md"
                loading={interviewState === 'submitting'}
                disabled={!userAnswer.trim() || interviewState === 'submitting'}
                onClick={() => submitAnswerPayload(userAnswer)}
                icon={Send}
                className="font-bold shadow-md shadow-brand-500/20 text-xs"
              >
                Continue / Submit Answer
              </Button>
            </div>

          </div>

        </Card>
      )}

      {/* PRACTICE MODE INSTANT EVALUATION MODAL */}
      {instantEvaluation && (
        <Modal
          isOpen={true}
          onClose={handleCloseInstantModal}
          title="Instant Feedback (Practice Mode)"
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs text-surface-700 dark:text-surface-300 max-h-[70vh] overflow-y-auto pr-1">
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold opacity-80">Answer Score</span>
                <div className="text-2xl font-black">{instantEvaluation.overall_score} / 100</div>
              </div>
              <div className="text-right text-xs">
                <div>Correctness: <strong>{instantEvaluation.correctness_score}</strong></div>
                <div>Tech Depth: <strong>{instantEvaluation.technical_depth_score}</strong></div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/60 space-y-1">
                <span className="font-bold text-emerald-700 dark:text-emerald-300">Strong Points</span>
                <ul className="space-y-0.5">
                  {instantEvaluation.strong_points?.map((sp, i) => (
                    <li key={i}>• {sp}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 space-y-1">
                <span className="font-bold text-rose-700 dark:text-rose-300">Missing Concepts</span>
                <ul className="space-y-0.5">
                  {instantEvaluation.missing_points?.map((mp, i) => (
                    <li key={i}>• {mp}</li>
                  ))}
                </ul>
              </div>
            </div>

            {instantEvaluation.ideal_answer && (
              <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700 space-y-1">
                <span className="font-bold text-surface-900 dark:text-white block">Ideal Answer Guidance</span>
                <p className="text-surface-600 dark:text-surface-300 leading-relaxed whitespace-pre-line">{instantEvaluation.ideal_answer}</p>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <Button variant="primary" size="sm" onClick={handleCloseInstantModal} icon={ArrowRight}>
                Continue Next Question
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* EXIT CONFIRMATION MODAL */}
      <Modal
        isOpen={showExitConfirm}
        onClose={() => setShowExitConfirm(false)}
        title="Leave Interview Session?"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs text-surface-600 dark:text-surface-300">
          <p>Are you sure you want to exit? Your answers up to this point will be saved, and your assessment report will be generated.</p>
          <div className="flex justify-end gap-2 pt-3 border-t border-surface-200 dark:border-surface-800">
            <Button variant="outline" size="sm" onClick={() => setShowExitConfirm(false)}>
              Keep Practicing
            </Button>
            <Button variant="danger" size="sm" onClick={onExitInterview}>
              Exit Interview
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}