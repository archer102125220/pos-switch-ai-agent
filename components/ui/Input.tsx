'use client';

import { type InputHTMLAttributes, forwardRef } from 'react';
import { classNames } from '@/utils/classNames';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={classNames(
            'w-full px-4 py-2.5 rounded-xl border-2 transition-all duration-200',
            'bg-white dark:bg-slate-800',
            'text-slate-900 dark:text-slate-100',
            'placeholder:text-slate-400 dark:placeholder:text-slate-500',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
            error
              ? 'border-red-500 focus:border-red-500'
              : 'border-slate-200 dark:border-slate-600 focus:border-indigo-500 dark:focus:border-indigo-400',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50 dark:disabled:bg-slate-900',
            className
          )}
          {...props}
        />
        {(error || helperText) && (
          <p
            className={classNames(
              'mt-1.5 text-sm',
              error ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
