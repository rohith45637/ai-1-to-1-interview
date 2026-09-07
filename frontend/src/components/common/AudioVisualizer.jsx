import React from 'react';

export function AudioVisualizer({ isListening = false, isSpeaking = false, variant = 'brand' }) {
  if (!isListening && !isSpeaking) return null;

  const colorClasses = {
    brand: 'bg-brand-400 shadow-glow-brand',
    rose: 'bg-rose-400 shadow-glow-rose',
    emerald: 'bg-emerald-400 shadow-glow-emerald',
    indigo: 'bg-indigo-400 shadow-glow-accent',
  };

  const selectedColor = isListening ? colorClasses.rose : (colorClasses[variant] || colorClasses.brand);

  return (
    <div className="flex items-center justify-center gap-1 h-6 px-2 py-1 rounded-full bg-surface-900/60 border border-surface-800">
      <span className={`w-1 rounded-full animate-wave ${selectedColor} h-3`} style={{ animationDelay: '0.1s' }} />
      <span className={`w-1 rounded-full animate-wave ${selectedColor} h-5`} style={{ animationDelay: '0.2s' }} />
      <span className={`w-1 rounded-full animate-wave ${selectedColor} h-6`} style={{ animationDelay: '0.3s' }} />
      <span className={`w-1 rounded-full animate-wave ${selectedColor} h-4`} style={{ animationDelay: '0.4s' }} />
      <span className={`w-1 rounded-full animate-wave ${selectedColor} h-2`} style={{ animationDelay: '0.5s' }} />
    </div>
  );
}
