'use client';

import { type ReactNode } from 'react';
import { classNames } from '@/utils/classNames';

export interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  hoverable?: boolean;
}

const variantStyles: Record<string, string> = {
  default: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
  elevated: 'bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50',
  glass: 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50',
};

const paddingStyles: Record<string, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export function Card({
  children,
  className,
  variant = 'default',
  padding = 'md',
  onClick,
  hoverable = false,
}: CardProps) {
  const isClickable = !!onClick;

  return (
    <div
      onClick={onClick}
      className={classNames(
        'rounded-2xl transition-all duration-200',
        variantStyles[variant],
        paddingStyles[padding],
        isClickable && 'cursor-pointer',
        hoverable && 'hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/10',
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={classNames('pb-3 border-b border-slate-100 dark:border-slate-700 mb-4', className)}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h3 className={classNames('text-lg font-semibold text-slate-900 dark:text-slate-100', className)}>
      {children}
    </h3>
  );
}

export function CardContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}
