import React, { useState, useEffect, useRef } from 'react';
import { Camera, CameraOff, Mic, MicOff, User, AlertCircle, RefreshCw } from 'lucide-react';

export function UserWebcam({ 
  isListening = false, 
  candidateName = 'Candidate', 
  onToggleMic, 
  isMicMuted = false 
}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(true);
  const [permissionState, setPermissionState] = useState('requesting'); // 'requesting', 'granted', 'denied'
  const [errorMessage, setErrorMessage] = useState('');

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
        audio: false // SpeechRecognition handles audio separately
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
          ? 'Camera access was not granted. The interview will proceed in audio mode.'
          : 'Could not access webcam. Audio mode is active.'
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
    <div className="relative w-full h-full min-h-[300px] sm:min-h-[350px] lg:min-h-[380px] rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-surface-900 to-surface-950 border-2 border-surface-800 shadow-2xl flex flex-col justify-between p-5 group">
      
      {/* Top Bar: Candidate Tag & Controls */}
      <div className="relative z-20 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-surface-800 text-white flex items-center justify-center font-bold text-xs border border-surface-700">
            <User className="w-4 h-4 text-brand-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-white">{candidateName}</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.2 rounded-full font-bold">
                Live
              </span>
            </div>
            <span className="text-[10px] text-surface-400">Candidate Video Feed</span>
          </div>
        </div>

        {/* Media Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleCamera}
            title={cameraActive ? 'Turn off camera' : 'Turn on camera'}
            className={'p-2 rounded-xl border backdrop-blur-md transition-all ' + (cameraActive ? 'bg-surface-800/80 border-surface-700 text-white hover:bg-surface-700' : 'bg-rose-950/80 border-rose-800 text-rose-300')}
          >
            {cameraActive ? <Camera className="w-3.5 h-3.5" /> : <CameraOff className="w-3.5 h-3.5" />}
          </button>

          {onToggleMic && (
            <button
              onClick={onToggleMic}
              title={isMicMuted ? 'Unmute microphone' : 'Mute microphone'}
              className={'p-2 rounded-xl border backdrop-blur-md transition-all ' + (!isMicMuted ? 'bg-surface-800/80 border-surface-700 text-white hover:bg-surface-700' : 'bg-rose-950/80 border-rose-800 text-rose-300')}
            >
              {!isMicMuted ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Video Center Stage */}
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
            <div className="w-20 h-20 rounded-3xl bg-surface-800/80 border border-surface-700 flex items-center justify-center text-surface-400">
              <User className="w-10 h-10" />
            </div>
            
            <div className="space-y-1 max-w-xs">
              <p className="text-xs font-bold text-surface-200">
                {permissionState === 'denied' ? 'Audio-Only Mode' : 'Camera is Turned Off'}
              </p>
              <p className="text-[11px] text-surface-400 leading-tight">
                {errorMessage || 'Your microphone is still active for speaking answers.'}
              </p>
            </div>

            {permissionState === 'denied' && (
              <button
                onClick={startCamera}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold bg-surface-800 hover:bg-surface-700 text-brand-300 border border-surface-700 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Retry Camera Access
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bottom Status & Live Audio Meter */}
      <div className="relative z-20 pt-2 border-t border-surface-800/60 flex items-center justify-between text-[11px] text-surface-400">
        <div className="flex items-center gap-2">
          {isListening ? (
            <span className="flex items-center gap-1.5 text-rose-400 font-bold bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-900/60">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              Candidate Speaking...
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-surface-400">
              <span className="w-2 h-2 rounded-full bg-surface-600" />
              Mic Ready
            </span>
          )}
        </div>

        {/* Live Audio Waves when candidate is speaking */}
        {isListening && (
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