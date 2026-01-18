'use client';

import { classNames } from '@/utils/classNames';

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  imageUrl?: string | null;
  categoryName?: string;
  isActive?: boolean;
  onClick?: () => void;
}

export function ProductCard({
  name,
  price,
  imageUrl,
  categoryName,
  isActive = true,
  onClick,
}: ProductCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={!isActive}
      className={classNames(
        'group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300',
        'bg-white dark:bg-slate-800',
        'border-2 border-transparent',
        'shadow-md shadow-slate-200/50 dark:shadow-slate-900/50',
        isActive && 'hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/20 hover:scale-[1.02]',
        !isActive && 'opacity-50 cursor-not-allowed',
        'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
        'active:scale-[0.98]'
      )}
    >
      {/* Image */}
      <div className="relative aspect-square bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <svg
              className="w-16 h-16 text-slate-300 dark:text-slate-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
        {/* Category Badge */}
        {categoryName && (
          <span className="absolute top-2 left-2 px-2 py-1 text-xs font-medium bg-indigo-500/90 text-white rounded-lg backdrop-blur-sm">
            {categoryName}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col p-3 gap-1">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 line-clamp-2">
          {name}
        </h3>
        <p className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          ${price.toLocaleString()}
        </p>
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/5 transition-colors duration-300 pointer-events-none" />
    </button>
  );
}
