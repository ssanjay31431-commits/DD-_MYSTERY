import React from 'react';
import { Package, ShieldCheck, Sparkles, Clock, Lock } from 'lucide-react';

export const MaintenancePage = () => {
  return (
    <div className="min-h-screen bg-[#0f0c1b] text-slate-100 flex flex-col justify-between items-center p-4 relative overflow-hidden font-sans">
      {/* Ambient background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-96 h-96 bg-pink-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <header className="w-full max-w-5xl py-6 flex justify-center items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 p-0.5 shadow-lg shadow-pink-500/20">
            <div className="w-full h-full bg-[#0f0c1b] rounded-[10px] flex items-center justify-center">
              <Package className="w-5 h-5 text-pink-400" />
            </div>
          </div>
          <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-white via-slate-200 to-pink-300 bg-clip-text text-transparent uppercase">
            DD Mystery
          </span>
        </div>
      </header>

      {/* Main Maintenance Content Card */}
      <main className="z-10 my-auto w-full max-w-xl text-center px-4">
        <div className="backdrop-blur-xl bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 sm:p-12 shadow-2xl shadow-purple-950/40 space-y-6 relative">
          
          {/* Animated Status Icon */}
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 animate-spin blur-sm opacity-70" style={{ animationDuration: '6s' }} />
            <div className="relative w-16 h-16 rounded-full bg-[#15102a] border border-pink-500/30 flex items-center justify-center shadow-inner">
              <Sparkles className="w-8 h-8 text-pink-400 animate-pulse" />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold uppercase tracking-widest">
              <Clock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '10s' }} />
              Scheduled Maintenance
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Website Under Update
            </h1>
          </div>

          {/* Detailed Explanation Message */}
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
            DD Mystery is currently being updated. Our payment system is being activated for a better and secure shopping experience.
          </p>

          <p className="text-pink-400/90 font-medium text-sm sm:text-base">
            Please check back shortly.
          </p>

          {/* Trust Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-800/60 text-left">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-800/50">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <div className="text-xs font-bold text-slate-200">Secure Payment System</div>
                <div className="text-[11px] text-slate-400">Gateway activation in progress</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-800/50">
              <Lock className="w-5 h-5 text-purple-400 shrink-0" />
              <div>
                <div className="text-xs font-bold text-slate-200">Protected Checkout</div>
                <div className="text-[11px] text-slate-400">Upgrading security protocols</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl py-6 text-center text-xs text-slate-500 z-10">
        <p>&copy; {new Date().getFullYear()} DD Mystery. All rights reserved.</p>
      </footer>
    </div>
  );
};
