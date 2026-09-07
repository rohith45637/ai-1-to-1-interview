import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, subtitle, children, maxWidth = 'max-w-2xl' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="fixed inset-0 bg-surface-950/80 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
      />
      
      <div className={`relative bg-surface-900 border border-surface-700/80 rounded-3xl shadow-2xl shadow-black/80 w-full ${maxWidth} p-6 sm:p-7 overflow-hidden z-10 animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col`}>
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-surface-800/80 mb-5 flex-shrink-0">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-surface-400 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl text-surface-400 hover:text-white hover:bg-surface-800 transition-all border border-transparent hover:border-surface-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto pr-1 flex-1 space-y-4">{children}</div>
      </div>
    </div>
  );
}
