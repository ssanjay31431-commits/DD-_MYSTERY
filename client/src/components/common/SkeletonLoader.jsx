import React from 'react';

export const CardSkeleton = () => (
  <div className="glass-panel p-5 rounded-2xl animate-pulse flex flex-col gap-4">
    <div className="w-full h-48 bg-slate-800/60 rounded-xl"></div>
    <div className="h-6 bg-slate-800/60 rounded w-3/4"></div>
    <div className="h-4 bg-slate-800/40 rounded w-1/2"></div>
    <div className="flex justify-between items-center mt-2">
      <div className="h-7 bg-slate-800/80 rounded w-1/3"></div>
      <div className="h-10 bg-slate-800/80 rounded-xl w-1/3"></div>
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
