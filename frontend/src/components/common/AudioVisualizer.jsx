import React from 'react';

export function AudioVisualizer({ isListening = false, isSpeaking = false }) {
  if (!isListening && !isSpeaking) return null;

  return (
    <div className="flex items-center justify-center gap-1 h-6">
      <span className="w-1 bg-brand-500 rounded-full animate-wave h-3" style={{ animationDelay: '0.1s' }} />
      <span className="w-1 bg-brand-500 rounded-full animate-wave h-5" style={{ animationDelay: '0.2s' }} />
      <span className="w-1 bg-brand-500 rounded-full animate-wave h-6" style={{ animationDelay: '0.3s' }} />
      <span className="w-1 bg-brand-500 rounded-full animate-wave h-4" style={{ animationDelay: '0.4s' }} />
      <span className="w-1 bg-brand-500 rounded-full animate-wave h-2" style={{ animationDelay: '0.5s' }} />
    </div>
  );
}
