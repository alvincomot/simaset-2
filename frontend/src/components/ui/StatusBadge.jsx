import React from 'react';
import { borrowingStatusMap, assetAvailabilityMap } from '../../lib/constants';

export const StatusBadge = ({ status, type = 'availability', className = '' }) => {
  const map = type === 'borrowing' ? borrowingStatusMap : assetAvailabilityMap;
  const config = map[status] || {
    label: status || 'Unknown',
    badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
    dotClass: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium select-none w-fit ${config.badgeClass} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dotClass}`} />
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;
