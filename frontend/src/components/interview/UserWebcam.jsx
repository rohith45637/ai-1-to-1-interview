import React, { useState, useEffect, useRef } from 'react';
import { Camera, CameraOff, Mic, MicOff, User, AlertCircle, RefreshCw, Eye, Sparkles } from 'lucide-react';
import { usePresentationAnalysis } from '../../hooks/usePresentationAnalysis';

export function UserWebcam({
  isListening = false,
  candidateName = 'Candidate',
  onToggleMic,
  isMicMuted = false,
  micPermissionDenied = false,
  onUpdatePresentationMetrics
}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(true);
  const [permissionState, setPermissionState] = useState('requesting'); // 'requesting', 'granted', 'denied'
  const [errorMessage, setErrorMessage] = useState('');

  // The <video> element only mounts once permissionState === 'granted' &&
  // cameraActive are both true. That happens AFTER startCamera() already
  // tried to set videoRef.current.srcObject (when the ref was still null,
  // since the element wasn't in the DOM yet). This effect re-attaches the
  // stream to the video element once it actually exists in the DOM.
  useEffect(() => {
    if (permissionState === 'granted' && cameraActive && videoRef.current && streamRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
    }
  }, [permissionState, cameraActive]);

  // Presentation & Body Language Analysis Hook
  const { activeWarning, presentationMetrics } = usePresentationAnalysis(
    videoRef,
    cameraActive && permissionState === 'granted'
  );

  // Propagate updated presentation metrics to parent
  useEffect(() => {
    if (onUpdatePresentationMetrics && presentationMetrics) {
      onUpdatePresentationMetrics(presentationMetrics);
    }
  }, [presentationMetrics, onUpdatePresentationMetrics]);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setPermissionState('requesting');
      setErrorMessage('');

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setPermissionState('denied');
        setErrorMessage('Webcam not supported by your browser environment.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false // SpeechRecognition handles audio
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setPermissionState('granted');
      setCameraActive(true);
    } catch (err) {
      console.warn('Webcam permission error:', err);
      setPermissionState('denied');
      setErrorMessage(
        err.name === 'NotAllowedError'
          ? 'Camera access was denied in browser permissions.'
          : (err.message || 'Camera is unavailable or in use by another application.')
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const toggleCamera = () => {
    if (cameraActive) {
      if (streamRef.current) {
        streamRef.current.getVideoTracks().forEach(t => (t.enabled = false));
      }
      setCameraActive(false);
    } else {
      if (streamRef.current) {
        streamRef.current.getVideoTracks().forEach(t => (t.enabled = true));
        setCameraActive(true);
      } else {
        startCamera();
      }
    }
  };

  return (
    <div className="relative w-full h-full min-h-[240px] sm:min-h-[320px] rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-surface-900 via-surface-925 to-surface-950 border border-surface-800 shadow-2xl flex flex-col justify-between p-3.5 sm:p-5 group">

      {/* Top Bar: Candidate Tag & Status Controls */}
      <div className="relative z-20 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-surface-800 text-white flex items-center justify-center font-bold text-xs border border-surface-700">
            <User className="w-4 h-4 text-brand-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-white">{candidateName}</span>
              {permissionState === 'granted' && cameraActive ? (
                <span className="text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.2 rounded-full font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ● Camera Active
                </span>
              ) : (
                <span className="text-[10px] bg-rose-500/15 text-rose-300 border border-rose-500/30 px-2 py-0.2 rounded-full font-bold">
                  Camera Unavailable
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-surface-400">
              {permissionState === 'granted' && cameraActive && (
                <span className="text-emerald-400 flex items-center gap-1">
                  <Eye className="w-2.5 h-2.5" /> Presentation Tracking Active
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Media Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleCamera}
            title={cameraActive ? 'Turn off camera' : 'Turn on camera'}
            className={`p-2 rounded-xl border backdrop-blur-md transition-all cursor-pointer ${cameraActive
                ? 'bg-surface-800/80 border-surface-700 text-white hover:bg-surface-700'
                : 'bg-rose-950/80 border-rose-800 text-rose-300'
              }`}
          >
            {cameraActive ? <Camera className="w-3.5 h-3.5" /> : <CameraOff className="w-3.5 h-3.5" />}
          </button>

          {onToggleMic && (
            <button
              onClick={onToggleMic}
              title={isMicMuted ? 'Unmute microphone' : 'Mute microphone'}
              className={`p-2 rounded-xl border backdrop-blur-md transition-all cursor-pointer ${!isMicMuted && !micPermissionDenied
                  ? 'bg-surface-800/80 border-surface-700 text-white hover:bg-surface-700'
                  : 'bg-rose-950/80 border-rose-800 text-rose-300'
                }`}
            >
              {!isMicMuted && !micPermissionDenied ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Real-time Presentation Warning Toast */}
      {activeWarning && (
        <div className="relative z-30 mx-auto max-w-sm w-full animate-fade-in transition-all">
          <div className="p-2.5 px-3.5 rounded-2xl bg-amber-950/90 border border-amber-500/50 shadow-xl backdrop-blur-md flex items-center gap-2 text-amber-200 text-xs font-medium">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
            <span className="leading-tight">{activeWarning}</span>
          </div>
        </div>
      )}

      {/* Video Viewport Stage */}
      <div className="absolute inset-0 flex items-center justify-center z-10 overflow-hidden">
        {permissionState === 'granted' && cameraActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform -scale-x-100"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-surface-800/80 border border-surface-700 flex items-center justify-center text-surface-400">
              <User className="w-8 h-8" />
            </div>

            <div className="space-y-1 max-w-xs">
              <p className="text-xs font-bold text-white">
                {permissionState === 'denied' ? 'Camera unavailable' : 'Camera is Turned Off'}
              </p>
              <p className="text-[11px] text-surface-400 leading-tight">
                {errorMessage || 'Camera stream is off. Audio and interview transcription proceed normally.'}
              </p>
            </div>

            {permissionState === 'denied' && (
              <button
                onClick={startCamera}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-surface-800 hover:bg-surface-700 text-brand-300 border border-surface-700 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                Retry Camera Access
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bottom Status & Live Audio Meter */}
      <div className="relative z-20 pt-2 border-t border-surface-800 flex items-center justify-between text-[11px] text-surface-400">
        <div className="flex items-center gap-2">
          {micPermissionDenied ? (
            <span className="text-rose-400 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              Microphone unavailable
            </span>
          ) : isListening ? (
            <span className="flex items-center gap-1.5 text-rose-300 font-bold bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded-md">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              Candidate Speaking...
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              ● Microphone Active
            </span>
          )}
        </div>

        {/* Live Audio Waves when candidate is speaking */}
        {isListening && !isMicMuted && (
          <div className="flex items-center gap-0.5">
            <span className="w-1 h-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1 h-4 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '100ms' }} />
            <span className="w-1 h-3 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
            <span className="w-1 h-5 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1 h-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '50ms' }} />
          </div>
        )}
      </div>

    </div>
  );
}