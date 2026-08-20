import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md">
      <div className={`relative w-full ${maxWidth} max-h-[90vh] flex flex-col p-4 sm:p-6 bg-[#140f24] border border-purple-500/30 rounded-2xl sm:rounded-3xl shadow-2xl my-auto transform transition-all duration-300 animate-in fade-in zoom-in-95`}>
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0 min-w-0">
          <h3 className="text-sm sm:text-lg font-bold text-white font-display truncate mr-2">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white shrink-0 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
        <div className="py-3 overflow-y-auto flex-1 pr-1 space-y-4">{children}</div>
      </div>
    </div>
  );
};
