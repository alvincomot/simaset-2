import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = 'success', title, message, duration = 4000 }) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, title, message }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = {
    toast: {
      success: (title, message) => addToast({ type: 'success', title, message }),
      error: (title, message) => addToast({ type: 'error', title, message, duration: 6000 }),
      info: (title, message) => addToast({ type: 'info', title, message }),
    },
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/90 dark:bg-emerald-950/90 text-emerald-900 dark:text-emerald-100',
    error: 'border-rose-200 dark:border-rose-900/60 bg-rose-50/90 dark:bg-rose-950/90 text-rose-900 dark:text-rose-100',
    info: 'border-cyan-200 dark:border-cyan-900/60 bg-cyan-50/90 dark:bg-cyan-950/90 text-cyan-900 dark:text-cyan-100',
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full px-4 sm:px-0 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start justify-between gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md animate-in slide-in-from-top-3 duration-200 ${
              borders[t.type] || borders.info
            }`}
          >
            <div className="flex items-start gap-3">
              {icons[t.type] || icons.info}
              <div>
                {t.title && <p className="text-sm font-bold">{t.title}</p>}
                {t.message && <p className="text-xs mt-0.5 opacity-90 leading-relaxed">{t.message}</p>}
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0"
            >
              <X className="w-4 h-4 opacity-70" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
};
