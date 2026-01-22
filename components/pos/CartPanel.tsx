'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui';
import { classNames } from '@/utils/classNames';

export interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

interface CartPanelProps {
  items: CartItem[];
  onUpdateQuantity: (id: number, delta: number) => void;
  onRemove: (id: number) => void;
  onCheckout: () => void;
  isCheckingOut?: boolean;
}

export function CartPanel({
  items,
  onUpdateQuantity,
  onRemove,
  onCheckout,
  isCheckingOut = false,
}: CartPanelProps) {
  // Memoize expensive calculations to prevent recalculation on every render
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );
  
  const tax = 0; // Can be configured later
  
  const total = useMemo(
    () => subtotal + tax,
    [subtotal, tax]
  );
  
  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">購物車</h2>
          <span className="px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium text-white">
            {itemCount} 項
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500">
            <svg
              className="w-16 h-16 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p className="text-sm">購物車是空的</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl"
            >
              {/* Item Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-slate-800 dark:text-slate-100 truncate">
                  {item.name}
                </h3>
                <p className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold">
                  ${item.price.toLocaleString()}
                </p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUpdateQuantity(item.id, -1)}
                  className={classNames(
                    'w-8 h-8 flex items-center justify-center rounded-lg',
                    'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300',
                    'hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-indigo-500'
                  )}
                >
                  −
                </button>
                <span className="w-8 text-center font-semibold text-slate-800 dark:text-slate-100">
                  {item.quantity}
                </span>
                <button
                  onClick={() => onUpdateQuantity(item.id, 1)}
                  className={classNames(
                    'w-8 h-8 flex items-center justify-center rounded-lg',
                    'bg-indigo-500 text-white',
                    'hover:bg-indigo-600 transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-indigo-500'
                  )}
                >
                  +
                </button>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => onRemove(item.id)}
                className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-700 space-y-3">
        {/* Totals */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-slate-500 dark:text-slate-400">
            <span>小計</span>
            <span>${subtotal.toLocaleString()}</span>
          </div>
          {tax > 0 && (
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>稅金</span>
              <span>${tax.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold text-slate-900 dark:text-slate-100">
            <span>總計</span>
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              ${total.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Checkout Button */}
        <Button
          fullWidth
          size="lg"
          onClick={onCheckout}
          disabled={items.length === 0}
          isLoading={isCheckingOut}
        >
          結帳
        </Button>
      </div>
    </div>
  );
}
