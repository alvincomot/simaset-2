import React from 'react';

export const SkeletonCard = ({ count = 3, className = '' }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm animate-pulse ${className}`}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-3 w-2/3">
              <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
              <div className="h-7 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 shrink-0" />
          </div>
        </div>
      ))}
    </>
  );
};

export default SkeletonCard;
