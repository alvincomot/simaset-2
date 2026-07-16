import React from 'react';
import * as LucideIcons from 'lucide-react';
import Button from '../ui/Button';

export const EmptyState = ({
  iconName = 'Inbox',
  title = 'Tidak ada data',
  message = 'Belum ada item yang ditemukan dalam daftar ini.',
  actionLabel,
  onAction,
  className = '',
}) => {
  const Icon = LucideIcons[iconName] || LucideIcons.Inbox;

  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 md:p-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 shadow-sm">
        <Icon className="w-7 h-7" />
      </div>
      <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
        {title}
      </h4>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm leading-relaxed">
        {message}
      </p>
      {actionLabel && onAction && (
        <div className="mt-6">
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
