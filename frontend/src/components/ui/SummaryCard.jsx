import React from 'react';
import * as LucideIcons from 'lucide-react';

export const SummaryCard = ({
  title,
  value = 0,
  iconName = 'Package',
  iconColorClass = 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60',
  helperText,
  onClick,
  className = '',
}) => {
  const Icon = LucideIcons[iconName] || LucideIcons.Package;

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lg dark:hover:shadow-black/30' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs md:text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            {title}
          </p>
          <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-50 mt-1.5 tabular-nums">
            {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
          </h3>
          {helperText && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              {helperText}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconColorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
