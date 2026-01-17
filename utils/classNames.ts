import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx
 * Combines clsx for conditional classes and tailwind-merge for deduplication
 *
 * @param inputs - Class values to merge (strings, objects, arrays)
 * @returns Merged and deduplicated class string
 *
 * @example
 * classNames('px-4 py-2', isActive && 'bg-primary', { 'text-white': isLight })
 */
export function classNames(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
