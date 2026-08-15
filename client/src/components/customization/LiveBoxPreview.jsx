import React from 'react';
import { Gift, Sparkles, Star, Heart, Calendar, Cake } from 'lucide-react';

export const LiveBoxPreview = ({ recipientName, birthdayDate, age, favoriteColor, theme, personalMessage, boxName = 'Standard Birthday Box' }) => {
  // Map favorite colors to CSS glow accents & hex values
  const colorMap = {
    Pink: { border: '#ec4899', bg: 'rgba(236, 72, 153, 0.2)', text: '#f472b6', shadow: '0 0 35px rgba(236, 72, 153, 0.5)' },
    Purple: { border: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.2)', text: '#a78bfa', shadow: '0 0 35px rgba(139, 92, 246, 0.5)' },
    Blue: { border: '#3b82f6', bg: 'rgba(59, 130, 246, 0.2)', text: '#60a5fa', shadow: '0 0 35px rgba(59, 130, 246, 0.5)' },
    Black: { border: '#64748b', bg: 'rgba(30, 41, 59, 0.8)', text: '#94a3b8', shadow: '0 0 25px rgba(148, 163, 184, 0.3)' },
    Red: { border: '#ef4444', bg: 'rgba(239, 68, 68, 0.2)', text: '#f87171', shadow: '0 0 35px rgba(239, 68, 68, 0.5)' },
    Green: { border: '#10b981', bg: 'rgba(16, 185, 129, 0.2)', text: '#34d399', shadow: '0 0 35px rgba(16, 185, 129, 0.5)' },
    Yellow: { border: '#f59e0b', bg: 'rgba(245, 158, 11, 0.2)', text: '#fbbf24', shadow: '0 0 35px rgba(245, 158, 11, 0.5)' },
    Custom: { border: '#d946ef', bg: 'rgba(217, 70, 239, 0.2)', text: '#e879f9', shadow: '0 0 35px rgba(217, 70, 239, 0.5)' }
  };

  const currentColor = colorMap[favoriteColor] || colorMap.Purple;

  return (
    <div className="flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-3 px-1">
        <span className="text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4" /> Live Box Preview
        </span>
        <span className="text-[11px] bg-purple-500/20 text-purple-300 font-semibold px-2.5 py-0.5 rounded-full border border-purple-500/30">
          Real-time Update
        </span>
      </div>

      {/* 3D Styled Birthday Box Canvas Card */}
      <div
        className="relative w-full aspect-[4/3] rounded-3xl p-6 flex flex-col justify-between overflow-hidden transition-all duration-500 border-2"
        style={{
          borderColor: currentColor.border,
          backgroundColor: '#16102b',
          boxShadow: currentColor.shadow
        }}
      >
        {/* Festive Ribbons */}
        <div className="ribbon-vertical opacity-80 pointer-events-none"></div>
        <div className="ribbon-horizontal opacity-80 pointer-events-none"></div>

        {/* Floating Confetti Elements */}
        <div className="absolute top-3 left-4 text-pink-400 opacity-60 animate-bounce">🎉</div>
        <div className="absolute top-4 right-6 text-amber-300 opacity-70 animate-pulse">✨</div>
        <div className="absolute bottom-6 left-6 text-purple-300 opacity-60 animate-float">🎈</div>
        <div className="absolute bottom-4 right-8 text-cyan-300 opacity-70">🎁</div>

        {/* Top Header: Box Title & Theme Badge */}
        <div className="relative z-20 flex justify-between items-start">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              DD MYSTERY BOX
            </span>
            <h3 className="text-lg font-black text-white font-display leading-tight">{boxName}</h3>
          </div>

          <div
            className="px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase shadow-lg border backdrop-blur-md"
            style={{ backgroundColor: currentColor.bg, color: currentColor.text, borderColor: currentColor.border }}
          >
            Theme: {theme || 'Anime'}
          </div>
        </div>

        {/* Centerpiece: Birthday Person Name & Age */}
        <div className="relative z-20 my-auto text-center py-2 bg-slate-950/75 backdrop-blur-md rounded-2xl border border-white/10 p-4">
          <div className="flex items-center justify-center gap-1.5 text-xs text-amber-400 font-bold tracking-widest uppercase mb-1">
            <Cake className="w-4 h-4" /> Happy Birthday <Cake className="w-4 h-4" />
          </div>
          <h2
            className="text-2xl sm:text-3xl font-black font-display tracking-wide drop-shadow-md"
            style={{ color: currentColor.text }}
          >
            {recipientName ? recipientName : 'Rahul'}
          </h2>

          {age && (
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md bg-pink-500/20 text-pink-300 text-xs font-bold">
              Turning {age} Years Old!
            </span>
          )}

          {birthdayDate && (
            <div className="mt-1 flex items-center justify-center gap-1 text-[11px] text-slate-300 font-medium">
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              <span>{birthdayDate}</span>
            </div>
          )}
        </div>

        {/* Bottom Card: Personal Message Snippet */}
        <div className="relative z-20 bg-slate-900/90 rounded-xl p-2.5 border border-purple-500/20 text-center">
          <p className="text-xs italic text-slate-300 line-clamp-2">
            "{personalMessage ? personalMessage : `Happy Birthday ${recipientName || 'Rahul'}! Have an amazing year ahead!`}"
          </p>
        </div>
      </div>

      {/* Box Contents Disclaimer */}
      <div className="mt-3 text-center px-4">
        <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
          <Gift className="w-3.5 h-3.5 text-amber-400" />
          Your box contains a carefully selected surprise based on your preferences.
        </p>
      </div>
    </div>
  );
};
