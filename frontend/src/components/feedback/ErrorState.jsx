import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from '../ui/Button';

export const ErrorState = ({
  title = 'Gagal Memuat Data',
  message = 'Terjadi kesalahan saat berkomunikasi dengan server. Silakan coba lagi.',
  onRetry,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 md:p-12 border border-rose-200 dark:border-rose-900/60 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 shadow-sm">
        <AlertCircle className="w-7 h-7" />
      </div>
      <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
        {title}
      </h4>
      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-md leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <div className="mt-6">
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={onRetry}>
            Coba Lagi
          </Button>
        </div>
      )}
    </div>
  );
};

export default ErrorState;
