'use client';

import { classNames } from '@/utils/classNames';

interface CategoryTabsProps {
  categories: Array<{ id: number; name: string }>;
  selectedId: number | null;
  onSelect: (id: number | null) => void;
}

export function CategoryTabs({ categories, selectedId, onSelect }: CategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {/* All Categories */}
      <button
        onClick={() => onSelect(null)}
        className={classNames(
          'px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
          selectedId === null
            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
        )}
      >
        全部
      </button>

      {/* Category Buttons */}
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelect(category.id)}
          className={classNames(
            'px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
            selectedId === category.id
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
          )}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
