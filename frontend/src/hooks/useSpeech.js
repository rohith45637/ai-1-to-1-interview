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
  const shouldListenRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const isMutedRef = useRef(false);
  const synthRef = useRef(null);
  const voicesRef = useRef([]);
  const silenceTimerRef = useRef(null);
  const onSilenceCallbackRef = useRef(null);
  const restartTimeoutRef = useRef(null);

  // Keep refs in sync
  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Load and cache TTS voices
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

    const SpeechRecognition = typeof window !== 'undefined' 
      ? (window.SpeechRecognition || window.webkitSpeechRecognition) 
      : null;
    if (!SpeechRecognition) {
      setSttSupported(false);
    }
  }, []);

  // Cleanup helper for speech recognition instance
  const cleanupRecognition = useCallback(() => {
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }
  }, []);

  // Helper to create and start a fresh SpeechRecognition instance
  const createAndStartRecognition = useCallback(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSttSupported(false);
      return;
    }

    if (isSpeakingRef.current || isMutedRef.current || !shouldListenRef.current) {
      return;
    }

    cleanupRecognition();

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setMicPermissionDenied(false);
      };

      recognition.onresult = (event) => {
        if (isSpeakingRef.current) return;

        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        
        const trimmed = currentTranscript.trim();
        if (trimmed) {
          setTranscript(trimmed);

          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }

          if (trimmed.split(' ').length >= 3 && onSilenceCallbackRef.current) {
            silenceTimerRef.current = setTimeout(() => {
              if (onSilenceCallbackRef.current && !isSpeakingRef.current) {
                onSilenceCallbackRef.current(trimmed);
              }
            }, 3500);
          }
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition event/error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setMicPermissionDenied(true);
          shouldListenRef.current = false;
          setIsListening(false);
        } else if (event.error === 'language-not-supported') {
          recognition.lang = 'en-US';
        } else if (event.error === 'no-speech' || event.error === 'network') {
          // Non-fatal, handled gracefully
        } else {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        // If candidate should still be listening and AI is not talking, cleanly restart instance
        if (shouldListenRef.current && !isSpeakingRef.current && !isMutedRef.current) {
          restartTimeoutRef.current = setTimeout(() => {
            if (shouldListenRef.current && !isSpeakingRef.current) {
              createAndStartRecognition();
            }
          }, 200);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Speech recognition instantiation/start note:', err);
      if (shouldListenRef.current && !isSpeakingRef.current) {
        restartTimeoutRef.current = setTimeout(() => {
          if (shouldListenRef.current && !isSpeakingRef.current) {
            createAndStartRecognition();
          }
        }, 300);
      }
    }
  }, [cleanupRecognition]);

  // Start listening with optional auto-silence callback
  const startListening = useCallback((onSilenceAutoSubmit = null) => {
    if (onSilenceAutoSubmit) {
      onSilenceCallbackRef.current = onSilenceAutoSubmit;
    }
    shouldListenRef.current = true;

    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    createAndStartRecognition();
  }, [createAndStartRecognition]);

  // Stop listening cleanly
  const stopListening = useCallback(() => {
    shouldListenRef.current = false;
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    cleanupRecognition();
    setIsListening(false);
  }, [cleanupRecognition]);

  // Speak function with Indian English voice prioritization & onEnd callback
  const speak = useCallback((text, onEndCallback = null) => {
    if (!synthRef.current || isMutedRef.current || !text) {
      if (onEndCallback) onEndCallback();
      return;
    }

    try {
      // 1. Immediately cancel any currently playing speech
      synthRef.current.cancel();
      setIsSpeaking(false);
      isSpeakingRef.current = false;

      // 2. Temporarily pause microphone listening while AI speaks
      shouldListenRef.current = false;
      cleanupRecognition();
      setIsListening(false);

      // 3. Create fresh utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.90;
      utterance.pitch = 1.0;
      utterance.lang = 'en-IN';

      // 4. Select best Indian English Voice
      const voices = voicesRef.current.length > 0 ? voicesRef.current : synthRef.current.getVoices();
      
      const indianVoice = voices.find(v => 
        (v.lang === 'en-IN' || v.lang === 'en_IN' || v.lang?.startsWith('en-IN') || v.lang === 'hi-IN') ||
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

      synthRef.current.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis invocation failed:', err);
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      if (onEndCallback) onEndCallback();
    }
  }, [cleanupRecognition]);

  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      isSpeakingRef.current = false;
    }
  }, []);

  // Cleanup all audio/speech on unmount
  useEffect(() => {
    return () => {
      shouldListenRef.current = false;
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      cleanupRecognition();
      if (synthRef.current) {
        try { synthRef.current.cancel(); } catch (e) {}
      }
    };
  }, [cleanupRecognition]);

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
    toggleMute: () => {
      setIsMuted(prev => {
        const next = !prev;
        if (next) {
          stopListening();
        }
        return next;
      });
    },
    sttSupported,
    ttsSupported,
    micPermissionDenied,
  };
}