import React from 'react';

export const CardSkeleton = () => (
  <div className="glass-2 p-5 rounded-[28px] animate-pulse flex flex-col gap-4">
    <div className="w-full h-48 bg-white/[0.06] rounded-[18px]"></div>
    <div className="h-6 bg-white/[0.07] rounded-full w-3/4"></div>
    <div className="h-4 bg-white/[0.05] rounded-full w-1/2"></div>
    <div className="flex justify-between items-center mt-2">
      <div className="h-7 bg-white/[0.08] rounded-full w-1/3"></div>
      <div className="h-10 bg-white/[0.08] rounded-full w-1/3"></div>
    </div>
  </div>
);

export const TableSkeleton = () => (
  <div className="w-full animate-pulse flex flex-col gap-3 p-4">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="h-12 bg-slate-800/40 rounded-xl w-full"></div>
    ))}
  </div>
);
