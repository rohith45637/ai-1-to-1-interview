import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { 
  Camera, CameraOff, Mic, MicOff, Volume2, ShieldCheck, 
  AlertTriangle, CheckCircle2, XCircle, RefreshCw, Radio, 
  Activity, Globe, Terminal, Info, Play, Square, ExternalLink
} from 'lucide-react';

export function MediaTestPage() {
  // -------------------------------------------------------------
  // 1. Camera Diagnostic State
  // -------------------------------------------------------------
  const [cameraStatus, setCameraStatus] = useState('IDLE'); // 'IDLE' | 'REQUESTING' | 'CONNECTED' | 'FAILED'
  const [cameraError, setCameraError] = useState(null); // { name, message, constraint }
  const [cameraTrackInfo, setCameraTrackInfo] = useState(null);
  const cameraVideoRef = useRef(null);
  const cameraStreamRef = useRef(null);

  // -------------------------------------------------------------
  // 2. Microphone Diagnostic State (Web Audio API / AudioContext)
  // -------------------------------------------------------------
  const [micStatus, setMicStatus] = useState('IDLE'); // 'IDLE' | 'REQUESTING' | 'CONNECTED' | 'FAILED'
  const [micError, setMicError] = useState(null); // { name, message }
  const [micLevel, setMicLevel] = useState(0); // 0 to 100
  const [micDecibels, setMicDecibels] = useState(-100);
  const [micTrackInfo, setMicTrackInfo] = useState(null);
  const micStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);

  // -------------------------------------------------------------
  // 3. Speech Recognition Diagnostic State
  // -------------------------------------------------------------
  const [speechStatus, setSpeechStatus] = useState('IDLE'); // 'IDLE' | 'LISTENING' | 'FAILED'
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [speechInterim, setSpeechInterim] = useState('');
  const [speechError, setSpeechError] = useState(null); // { name, message, rawEvent }
  const recognitionRef = useRef(null);

  // -------------------------------------------------------------
  // 4. Browser / Security Information State
  // -------------------------------------------------------------
  const [browserInfo, setBrowserInfo] = useState({
    userAgent: '',
    browserName: 'Detecting...',
    isHttps: false,
    isSecureContext: false,
    origin: '',
    protocol: '',
    cameraPermissionApi: 'unknown',
    micPermissionApi: 'unknown',
    hasMediaDevices: false,
    hasGetUserMedia: false,
    hasAudioContext: false,
    hasSpeechRecognition: false,
  });

  // -------------------------------------------------------------
  // System Inspection on Mount
  // -------------------------------------------------------------
  useEffect(() => {
    // 1. Gather browser info
    const ua = navigator.userAgent;
    let bName = 'Unknown Browser';
    if (ua.includes('Firefox')) bName = 'Mozilla Firefox';
    else if (ua.includes('Edg/')) bName = 'Microsoft Edge';
    else if (ua.includes('Chrome')) bName = 'Google Chrome';
    else if (ua.includes('Safari')) bName = 'Apple Safari';
    else if (ua.includes('OPR') || ua.includes('Opera')) bName = 'Opera';

    const isHttps = window.location.protocol === 'https:';
    const isSecureContext = window.isSecureContext || false;
    const hasMediaDevices = !!(navigator.mediaDevices);
    const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    const hasAudioContext = !!(window.AudioContext || window.webkitAudioContext);
    const hasSpeechRecognition = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

    setSpeechSupported(hasSpeechRecognition);

    setBrowserInfo(prev => ({
      ...prev,
      userAgent: ua,
      browserName: bName,
      isHttps,
      isSecureContext,
      origin: window.location.origin,
      protocol: window.location.protocol,
      hasMediaDevices,
      hasGetUserMedia,
      hasAudioContext,
      hasSpeechRecognition,
    }));

    // 2. Query Permissions API if supported
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'camera' })
        .then(perm => {
          setBrowserInfo(p => ({ ...p, cameraPermissionApi: perm.state }));
          perm.onchange = () => setBrowserInfo(p => ({ ...p, cameraPermissionApi: perm.state }));
        })
        .catch(() => setBrowserInfo(p => ({ ...p, cameraPermissionApi: 'Query Unsupported' })));

      navigator.permissions.query({ name: 'microphone' })
        .then(perm => {
          setBrowserInfo(p => ({ ...p, micPermissionApi: perm.state }));
          perm.onchange = () => setBrowserInfo(p => ({ ...p, micPermissionApi: perm.state }));
        })
        .catch(() => setBrowserInfo(p => ({ ...p, micPermissionApi: 'Query Unsupported' })));
    }

    // Automatically trigger initial tests
    startCameraTest();
    startMicrophoneTest();
    initSpeechRecognition();

    // Clean up all streams and audio contexts on unmount
    return () => {
      stopCameraTest();
      stopMicrophoneTest();
      stopSpeechRecognition();
    };
  }, []);

  // -------------------------------------------------------------
  // Camera Test Implementation
  // -------------------------------------------------------------
  const startCameraTest = async () => {
    stopCameraTest();
    setCameraStatus('REQUESTING');
    setCameraError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraStatus('FAILED');
      setCameraError({
        name: 'NotSupportedError',
        message: 'navigator.mediaDevices.getUserMedia is not supported on this browser or origin.'
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      });

      cameraStreamRef.current = stream;
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream;
      }

      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const settings = videoTrack.getSettings ? videoTrack.getSettings() : {};
        setCameraTrackInfo({
          label: videoTrack.label || 'Default Camera',
          readyState: videoTrack.readyState,
          enabled: videoTrack.enabled,
          muted: videoTrack.muted,
          width: settings.width || 1280,
          height: settings.height || 720,
          frameRate: settings.frameRate || 30
        });
      }

      setCameraStatus('CONNECTED');
    } catch (err) {
      console.error('Camera diagnostic error:', err);
      setCameraStatus('FAILED');
      setCameraError({
        name: err.name || 'UnknownError',
        message: err.message || 'Browser prevented camera access.',
        constraint: err.constraint || null,
        stack: err.stack || null
      });
    }
  };

  const stopCameraTest = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(t => t.stop());
      cameraStreamRef.current = null;
    }
    if (cameraVideoRef.current) {
      cameraVideoRef.current.srcObject = null;
    }
    setCameraTrackInfo(null);
  };

  // -------------------------------------------------------------
  // Microphone Test Implementation (Real Web Audio API Analyser)
  // -------------------------------------------------------------
  const startMicrophoneTest = async () => {
    stopMicrophoneTest();
    setMicStatus('REQUESTING');
    setMicError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMicStatus('FAILED');
      setMicError({
        name: 'NotSupportedError',
        message: 'navigator.mediaDevices.getUserMedia is not supported on this browser.'
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false
      });

      micStreamRef.current = stream;
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        setMicTrackInfo({
          label: audioTrack.label || 'Default Microphone',
          readyState: audioTrack.readyState,
          enabled: audioTrack.enabled,
          muted: audioTrack.muted
        });
      }

      // Initialize Web Audio API AudioContext
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) {
        throw new Error('Web Audio API AudioContext is not supported on this browser.');
      }

      const audioCtx = new AudioCtx();
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.5;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Real-time Audio Level Poller
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength; // 0 to 255
        const normalized = Math.min(100, Math.round((average / 128) * 100));
        setMicLevel(normalized);

        // Approximate decibel calculation
        const rms = Math.sqrt(average / 255);
        const db = rms > 0 ? Math.round(20 * Math.log10(rms)) : -100;
        setMicDecibels(db);

        animFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
      setMicStatus('CONNECTED');
    } catch (err) {
      console.error('Microphone diagnostic error:', err);
      setMicStatus('FAILED');
      setMicError({
        name: err.name || 'UnknownError',
        message: err.message || 'Browser prevented microphone access.'
      });
    }
  };

  const stopMicrophoneTest = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
    setMicLevel(0);
    setMicDecibels(-100);
    setMicTrackInfo(null);
  };

  // -------------------------------------------------------------
  // Speech Recognition Implementation
  // -------------------------------------------------------------
  const initSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setSpeechError({
        name: 'SpeechRecognitionUnsupported',
        message: 'SpeechRecognition / webkitSpeechRecognition is not supported by this browser engine. (Chromium/Edge/Safari recommended).'
      });
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setSpeechStatus('LISTENING');
        setSpeechError(null);
      };

      recognition.onresult = (event) => {
        let finalTrans = '';
        let interimTrans = '';
        for (let i = 0; i < event.results.length; i++) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTrans += item[0].transcript + ' ';
          } else {
            interimTrans += item[0].transcript;
          }
        }
        setSpeechTranscript(prev => (prev + finalTrans).trim());
        setSpeechInterim(interimTrans);
      };

      recognition.onerror = (event) => {
        console.warn('SpeechRecognition error event:', event);
        setSpeechError({
          name: event.error || 'SpeechError',
          message: event.message || `Browser SpeechRecognition triggered error: "${event.error}"`,
          rawEvent: String(event)
        });
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setSpeechStatus('FAILED');
        }
      };

      recognition.onend = () => {
        setSpeechStatus('IDLE');
      };

      recognitionRef.current = recognition;
      setSpeechSupported(true);
    } catch (err) {
      console.error('Speech recognition init error:', err);
      setSpeechError({
        name: err.name || 'SpeechRecognitionInitError',
        message: err.message || 'Failed to construct SpeechRecognition instance.'
      });
    }
  };

  const startSpeechRecognition = () => {
    if (!recognitionRef.current) {
      initSpeechRecognition();
    }
    if (recognitionRef.current) {
      try {
        setSpeechError(null);
        recognitionRef.current.start();
        setSpeechStatus('LISTENING');
      } catch (err) {
        if (err.name !== 'InvalidStateError') {
          setSpeechError({
            name: err.name || 'SpeechStartError',
            message: err.message || 'Could not start speech recognition.'
          });
        }
      }
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setSpeechStatus('IDLE');
  };

  const clearSpeechTranscript = () => {
    setSpeechTranscript('');
    setSpeechInterim('');
  };

  // -------------------------------------------------------------
  // Render
  // -------------------------------------------------------------
  return (
    <div className="max-w-6xl mx-auto space-y-8 py-6 pb-24 text-surface-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="brand" dot={true}>Real-Time Hardware & Permission Diagnostic</Badge>
            <span className="text-xs text-surface-400 font-mono">/media-test</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Activity className="w-8 h-8 text-brand-400" />
            Media & Speech Diagnostics Suite
          </h1>
          <p className="text-sm text-surface-400 mt-1">
            Zero-mock inspection for Camera (`getUserMedia`), Microphone (`AudioContext`), Speech Recognition, and Vercel/HTTPS security contexts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              startCameraTest();
              startMicrophoneTest();
              if (speechSupported) startSpeechRecognition();
            }}
            icon={RefreshCw}
          >
            Re-run All Tests
          </Button>
        </div>
      </div>

      {/* Grid: 4 Diagnostic Pillars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ------------------------------------------------------------- */}
        {/* PILLAR 1: CAMERA TEST */}
        {/* ------------------------------------------------------------- */}
        <Card className="flex flex-col justify-between space-y-4 border-2 border-surface-800 bg-surface-900/90">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-white">1. Camera Diagnostic</h2>
                  <span className="text-xs text-surface-400">navigator.mediaDevices.getUserMedia()</span>
                </div>
              </div>

              {cameraStatus === 'CONNECTED' && (
                <Badge variant="success" dot={true}>Camera: CONNECTED</Badge>
              )}
              {cameraStatus === 'FAILED' && (
                <Badge variant="danger" dot={true}>Camera: FAILED</Badge>
              )}
              {cameraStatus === 'REQUESTING' && (
                <Badge variant="warning" dot={true}>Requesting Permission...</Badge>
              )}
              {cameraStatus === 'IDLE' && (
                <Badge variant="default">Idle</Badge>
              )}
            </div>

            {/* Video Viewport */}
            <div className="relative aspect-video w-full rounded-2xl bg-surface-950 border border-surface-800 overflow-hidden flex items-center justify-center shadow-inner">
              <video
                ref={cameraVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transform -scale-x-100 ${cameraStatus === 'CONNECTED' ? 'block' : 'hidden'}`}
              />

              {cameraStatus !== 'CONNECTED' && (
                <div className="p-6 text-center space-y-2">
                  {cameraStatus === 'FAILED' ? (
                    <>
                      <XCircle className="w-10 h-10 text-rose-500 mx-auto" />
                      <p className="text-xs font-bold text-rose-400">Camera Feed Blocked or Unavailable</p>
                    </>
                  ) : (
                    <>
                      <CameraOff className="w-10 h-10 text-surface-600 mx-auto" />
                      <p className="text-xs text-surface-400">Camera stream is currently inactive</p>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Camera Details / Track Info */}
            {cameraTrackInfo && (
              <div className="p-3 rounded-xl bg-surface-950/70 border border-surface-800 text-xs font-mono space-y-1 text-surface-300">
                <div className="flex justify-between">
                  <span className="text-surface-500">Device Label:</span>
                  <span className="font-semibold text-white truncate max-w-[200px]">{cameraTrackInfo.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-500">Resolution & FPS:</span>
                  <span className="text-emerald-400">{cameraTrackInfo.width}x{cameraTrackInfo.height} @ ~{Math.round(cameraTrackInfo.frameRate)}fps</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-500">Track State:</span>
                  <span className="text-brand-400 capitalize">{cameraTrackInfo.readyState}</span>
                </div>
              </div>
            )}

            {/* Exact Error Display */}
            {cameraError && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/80 space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Exact Browser Camera Error:</span>
                </div>
                <div className="font-mono bg-surface-950/80 p-2 rounded-lg text-rose-300 space-y-1">
                  <div><strong>Error Name:</strong> {cameraError.name}</div>
                  <div><strong>Error Message:</strong> {cameraError.message}</div>
                  {cameraError.constraint && <div><strong>Constraint:</strong> {cameraError.constraint}</div>}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-3 border-t border-surface-800">
            <Button
              variant="primary"
              size="sm"
              onClick={startCameraTest}
              icon={Camera}
              className="flex-1"
            >
              Request Camera Access
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                stopCameraTest();
                setCameraStatus('IDLE');
              }}
              icon={CameraOff}
            >
              Stop
            </Button>
          </div>
        </Card>

        {/* ------------------------------------------------------------- */}
        {/* PILLAR 2: MICROPHONE TEST (Web Audio API Analyser) */}
        {/* ------------------------------------------------------------- */}
        <Card className="flex flex-col justify-between space-y-4 border-2 border-surface-800 bg-surface-900/90">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-white">2. Microphone & AudioContext</h2>
                  <span className="text-xs text-surface-400">Web Audio API AnalyserNode Data Stream</span>
                </div>
              </div>

              {micStatus === 'CONNECTED' && (
                <Badge variant="success" dot={true}>Microphone: CONNECTED</Badge>
              )}
              {micStatus === 'FAILED' && (
                <Badge variant="danger" dot={true}>Microphone: FAILED</Badge>
              )}
              {micStatus === 'REQUESTING' && (
                <Badge variant="warning" dot={true}>Requesting Mic...</Badge>
              )}
              {micStatus === 'IDLE' && (
                <Badge variant="default">Idle</Badge>
              )}
            </div>

            {/* Live Visualizer Box */}
            <div className="p-5 rounded-2xl bg-surface-950 border border-surface-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-surface-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-brand-400" />
                  Incoming Sound Amplitude
                </span>
                <span className="font-mono text-white font-bold">
                  {micLevel}% ({micDecibels} dB)
                </span>
              </div>

              {/* Dynamic dB Meter Bar */}
              <div className="h-4 w-full bg-surface-900 rounded-full overflow-hidden p-0.5 border border-surface-800">
                <div
                  className={`h-full rounded-full transition-all duration-75 ${
                    micLevel > 60 
                      ? 'bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500' 
                      : micLevel > 20 
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                        : 'bg-emerald-500'
                  }`}
                  style={{ width: `${micLevel}%` }}
                />
              </div>

              {/* Multi-Frequency Wave Simulation based on real AudioContext volume */}
              <div className="flex items-end justify-center gap-1.5 h-12 pt-2">
                {[0.4, 0.7, 1.0, 0.8, 1.2, 0.9, 0.5, 1.1, 0.6, 0.3].map((factor, idx) => {
                  const barHeight = Math.max(4, Math.min(48, Math.round((micLevel * factor))));
                  return (
                    <div
                      key={idx}
                      className="w-2 rounded-t-full bg-gradient-to-t from-indigo-600 to-brand-400 transition-all duration-75"
                      style={{ height: `${barHeight}px` }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Microphone Details */}
            {micTrackInfo && (
              <div className="p-3 rounded-xl bg-surface-950/70 border border-surface-800 text-xs font-mono space-y-1 text-surface-300">
                <div className="flex justify-between">
                  <span className="text-surface-500">Audio Hardware:</span>
                  <span className="font-semibold text-white truncate max-w-[200px]">{micTrackInfo.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-500">AudioContext State:</span>
                  <span className="text-emerald-400">{audioContextRef.current?.state || 'running'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-500">Track State:</span>
                  <span className="text-brand-400 capitalize">{micTrackInfo.readyState}</span>
                </div>
              </div>
            )}

            {/* Exact Error Display */}
            {micError && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/80 space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Exact Browser Microphone Error:</span>
                </div>
                <div className="font-mono bg-surface-950/80 p-2 rounded-lg text-rose-300 space-y-1">
                  <div><strong>Error Name:</strong> {micError.name}</div>
                  <div><strong>Error Message:</strong> {micError.message}</div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-3 border-t border-surface-800">
            <Button
              variant="primary"
              size="sm"
              onClick={startMicrophoneTest}
              icon={Mic}
              className="flex-1"
            >
              Request Microphone Access
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                stopMicrophoneTest();
                setMicStatus('IDLE');
              }}
              icon={MicOff}
            >
              Stop
            </Button>
          </div>
        </Card>

        {/* ------------------------------------------------------------- */}
        {/* PILLAR 3: SPEECH RECOGNITION TEST */}
        {/* ------------------------------------------------------------- */}
        <Card className="flex flex-col justify-between space-y-4 border-2 border-surface-800 bg-surface-900/90">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-white">3. Speech Recognition Engine</h2>
                  <span className="text-xs text-surface-400">SpeechRecognition / webkitSpeechRecognition API</span>
                </div>
              </div>

              {speechStatus === 'LISTENING' && (
                <Badge variant="purple" dot={true}>STT: LISTENING</Badge>
              )}
              {speechStatus === 'FAILED' && (
                <Badge variant="danger" dot={true}>STT: FAILED</Badge>
              )}
              {speechStatus === 'IDLE' && (
                <Badge variant="default">STT: IDLE</Badge>
              )}
            </div>

            {/* Live Transcript Display Box */}
            <div className="p-4 rounded-2xl bg-surface-950 border border-surface-800 min-h-[140px] flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-surface-400 pb-1 border-b border-surface-800/80">
                  <span className="font-semibold">Live Transcribed Speech Stream:</span>
                  {speechStatus === 'LISTENING' && (
                    <span className="text-purple-400 font-mono animate-pulse flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-purple-500" />
                      Listening now...
                    </span>
                  )}
                </div>

                <div className="text-sm font-medium leading-relaxed min-h-[60px]">
                  {speechTranscript ? (
                    <span className="text-white">{speechTranscript} </span>
                  ) : null}
                  {speechInterim ? (
                    <span className="text-purple-300 italic">{speechInterim}</span>
                  ) : null}
                  {!speechTranscript && !speechInterim && (
                    <span className="text-surface-500 text-xs italic">
                      Click "Start Speech Recognition" and speak into your microphone to verify STT recognition.
                    </span>
                  )}
                </div>
              </div>

              {speechTranscript && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={clearSpeechTranscript}
                    className="text-[11px] text-surface-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Clear Text
                  </button>
                </div>
              )}
            </div>

            {/* Exact Speech Recognition Error */}
            {speechError && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/80 space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Exact Browser SpeechRecognition Error:</span>
                </div>
                <div className="font-mono bg-surface-950/80 p-2 rounded-lg text-rose-300 space-y-1">
                  <div><strong>Error Code:</strong> {speechError.name}</div>
                  <div><strong>Error Details:</strong> {speechError.message}</div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-3 border-t border-surface-800">
            {speechStatus === 'LISTENING' ? (
              <Button
                variant="danger"
                size="sm"
                onClick={stopSpeechRecognition}
                icon={Square}
                className="flex-1"
              >
                Stop Recognition
              </Button>
            ) : (
              <Button
                variant="accent"
                size="sm"
                onClick={startSpeechRecognition}
                disabled={!speechSupported}
                icon={Play}
                className="flex-1"
              >
                Start Speech Recognition
              </Button>
            )}
          </div>
        </Card>

        {/* ------------------------------------------------------------- */}
        {/* PILLAR 4: BROWSER, SECURITY & HTTPS ENVIRONMENT */}
        {/* ------------------------------------------------------------- */}
        <Card className="flex flex-col justify-between space-y-4 border-2 border-surface-800 bg-surface-900/90">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-white">4. Browser & HTTPS Security</h2>
                  <span className="text-xs text-surface-400">Environment & Web Origin Security Matrix</span>
                </div>
              </div>

              {browserInfo.isHttps || browserInfo.origin.includes('localhost') ? (
                <Badge variant="success" dot={true}>Secure Origin</Badge>
              ) : (
                <Badge variant="danger" dot={true}>Insecure HTTP</Badge>
              )}
            </div>

            {/* Diagnostic Matrix Table */}
            <div className="rounded-2xl bg-surface-950 border border-surface-800 p-4 space-y-2.5 text-xs font-mono">
              <div className="flex items-center justify-between pb-2 border-b border-surface-800/80">
                <span className="text-surface-400">Detected Browser:</span>
                <span className="text-white font-bold">{browserInfo.browserName}</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-surface-800/80">
                <span className="text-surface-400">HTTPS Protocol:</span>
                <span className={browserInfo.isHttps ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {browserInfo.protocol} ({browserInfo.isHttps ? 'HTTPS Valid' : 'Insecure HTTP'})
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-surface-800/80">
                <span className="text-surface-400">Secure Context API:</span>
                <span className={browserInfo.isSecureContext ? 'text-emerald-400' : 'text-rose-400'}>
                  {browserInfo.isSecureContext ? 'window.isSecureContext === true' : 'window.isSecureContext === false'}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-surface-800/80">
                <span className="text-surface-400">Camera Permission Query:</span>
                <span className="text-brand-400 font-bold uppercase">{browserInfo.cameraPermissionApi}</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-surface-800/80">
                <span className="text-surface-400">Microphone Permission Query:</span>
                <span className="text-brand-400 font-bold uppercase">{browserInfo.micPermissionApi}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-surface-400">SpeechRecognition Support:</span>
                <span className={browserInfo.hasSpeechRecognition ? 'text-emerald-400' : 'text-amber-400'}>
                  {browserInfo.hasSpeechRecognition ? 'Native API Available' : 'Not Supported'}
                </span>
              </div>
            </div>

            {/* Diagnostic Interpretation Helper */}
            <div className="p-3 rounded-xl bg-brand-950/30 border border-brand-800/40 text-xs text-brand-300 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>Diagnosis Summary:</span>
              </div>
              <p className="text-[11px] leading-relaxed text-surface-300">
                If camera/mic fails on Vercel deployment, ensure that the browser address bar shows the lock icon (HTTPS) and camera/mic permissions are set to "Allow".
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-surface-800 flex justify-between items-center text-xs text-surface-400">
            <span className="truncate max-w-[280px]">Host: {browserInfo.origin}</span>
            <span className="text-emerald-400 font-bold">Vercel Ready</span>
          </div>
        </Card>

      </div>

    </div>
  );
}
