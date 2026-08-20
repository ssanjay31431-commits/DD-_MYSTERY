import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-xl' }) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md">
      <div
        className={`relative w-full ${maxWidth} max-h-[90vh] flex flex-col bg-[#18132a] border border-purple-500/30 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 my-auto transform transition-all duration-300 animate-in fade-in zoom-in-95`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0 min-w-0">
          <h3 className="text-sm sm:text-xl font-bold text-white font-display tracking-wide truncate mr-2">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
        <div className="py-3 overflow-y-auto pr-1 flex-1 space-y-4">{children}</div>
      </div>
    </div>
  );
};
