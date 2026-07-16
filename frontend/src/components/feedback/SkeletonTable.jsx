import React from 'react';

export const SkeletonTable = ({ rows = 6, columns = 5, className = '' }) => {
  return (
    <div className={`w-full overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm animate-pulse ${className}`}>
      {/* Header Skeleton */}
      <div className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex gap-4">
        {Array.from({ length: columns }).map((_, idx) => (
          <div key={idx} className="h-4 bg-slate-200 dark:bg-slate-800 rounded flex-1" />
        ))}
      </div>
      {/* Rows Skeleton */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="px-6 py-4 flex gap-4 items-center">
            {Array.from({ length: columns }).map((_, cIdx) => (
              <div
                key={cIdx}
                className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded flex-1"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonTable;
