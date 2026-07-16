import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  type = 'button',
  onClick,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none rounded-xl select-none';

  const variants = {
    primary:
      'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/20 dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:text-slate-950',
    secondary:
      'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-sm',
    ghost:
      'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300',
    destructive:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/20 dark:bg-rose-500 dark:hover:bg-rose-600 dark:text-slate-950',
    outlineDestructive:
      'bg-transparent border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40',
  };

  const sizes = {
    sm: 'h-9 px-3 text-xs gap-1.5',
    md: 'h-10 px-4 text-sm gap-2',
    lg: 'h-12 px-5 text-base gap-2.5',
    icon: 'h-10 w-10 p-0 justify-center',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          {size !== 'icon' && <span>Memproses...</span>}
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
        </>
      )}
    </button>
  );
};

export default Button;
