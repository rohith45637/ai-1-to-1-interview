import { useState, useEffect, useRef, useCallback } from 'react';

export function useSpeech() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [sttSupported, setSttSupported] = useState(true);
  const [ttsSupported, setTtsSupported] = useState(true);
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);

  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const voicesRef = useRef([]);
  const silenceTimerRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const onSilenceCallbackRef = useRef(null);

  // Keep isSpeakingRef in sync
  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  // Load and cache voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;

      const updateVoices = () => {
        const available = window.speechSynthesis.getVoices();
        if (available && available.length > 0) {
          voicesRef.current = available;
        }
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    } else {
      setTtsSupported(false);
    }
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN'; // Indian English

      recognition.onstart = () => {
        setIsListening(true);
        setMicPermissionDenied(false);
      };

      recognition.onresult = (event) => {
        // If AI is currently speaking, disregard to prevent AI self-transcription
        if (isSpeakingRef.current) return;

        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        
        const trimmed = currentTranscript.trim();
        if (trimmed) {
          setTranscript(trimmed);

          // Reset silence timer on every new speech event
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }

          // Auto-submit silence detector: 3.5s of silence after candidate speaks >= 3 words
          if (trimmed.split(' ').length >= 3 && onSilenceCallbackRef.current) {
            silenceTimerRef.current = setTimeout(() => {
              if (onSilenceCallbackRef.current) {
                onSilenceCallbackRef.current(trimmed);
              }
            }, 3500);
          }
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition status/error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setMicPermissionDenied(true);
          setIsListening(false);
        } else if (event.error === 'language-not-supported') {
          recognition.lang = 'en-US';
        } else if (event.error === 'no-speech') {
          // Graceful ignore; user is just thinking
        } else {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setSttSupported(false);
    }

    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      if (synthRef.current) {
        try { synthRef.current.cancel(); } catch (e) {}
      }
    };
  }, []);

  // Start listening with optional auto-silence callback
  const startListening = useCallback((onSilenceAutoSubmit = null) => {
    if (onSilenceAutoSubmit) {
      onSilenceCallbackRef.current = onSilenceAutoSubmit;
    }

    if (!recognitionRef.current || isSpeakingRef.current) return;

    try {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      recognitionRef.current.start();
      setIsListening(true);
      setMicPermissionDenied(false);
    } catch (err) {
      // If already started, ignore error
      if (err.name !== 'InvalidStateError') {
        console.warn('Speech recognition start note:', err);
      }
    }
  }, []);

  // Stop listening cleanly
  const stopListening = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {}
    }
    setIsListening(false);
  }, []);

  // Speak function with Indian English voice prioritization & onEnd callback
  const speak = useCallback((text, onEndCallback = null) => {
    if (!synthRef.current || isMuted || !text) {
      if (onEndCallback) onEndCallback();
      return;
    }

    try {
      // 1. Immediately cancel any currently playing speech to prevent duplicate overlap
      synthRef.current.cancel();
      setIsSpeaking(false);

      // 2. Stop microphone listening while AI speaks (prevents recording AI's own voice)
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsListening(false);

      // 3. Create fresh utterance
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Calibrate rate to 0.90 for clear, moderate Indian English pacing
      utterance.rate = 0.90;
      utterance.pitch = 1.0;
      utterance.lang = 'en-IN';

      // 4. Select best Indian English Voice
      const voices = voicesRef.current.length > 0 ? voicesRef.current : synthRef.current.getVoices();
      
      const indianVoice = voices.find(v => 
        (v.lang === 'en-IN' || v.lang === 'en_IN' || v.lang.startsWith('en-IN') || v.lang === 'hi-IN') ||
        (v.name.toLowerCase().includes('india') || 
         v.name.toLowerCase().includes('indian') || 
         v.name.toLowerCase().includes('heera') || 
         v.name.toLowerCase().includes('ravi') || 
         v.name.toLowerCase().includes('veena') || 
         v.name.toLowerCase().includes('neerja') || 
         v.name.toLowerCase().includes('rishi') ||
         v.name.toLowerCase().includes('aditi') ||
         v.name.toLowerCase().includes('kavya') ||
         v.name.toLowerCase().includes('prabhat'))
      );

      const selectedVoice = indianVoice || 
        voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Microsoft'))) ||
        voices.find(v => v.lang.startsWith('en')) || 
        voices[0];

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        isSpeakingRef.current = true;
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        if (onEndCallback) {
          // Short natural pause (300ms) before triggering next step
          setTimeout(() => {
            onEndCallback();
          }, 300);
        }
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis error/cancelled:', e);
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        if (onEndCallback) {
          onEndCallback();
        }
      };

      // Speak utterance
      synthRef.current.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis invocation failed:', err);
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      if (onEndCallback) onEndCallback();
    }
  }, [isMuted]);

  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      isSpeakingRef.current = false;
    }
  }, []);

  return {
    isListening,
    transcript,
    setTranscript,
    startListening,
    stopListening,
    isSpeaking,
    speak,
    stopSpeaking,
    isMuted,
    toggleMute: () => setIsMuted(prev => !prev),
    sttSupported,
    ttsSupported,
    micPermissionDenied,
  };
}