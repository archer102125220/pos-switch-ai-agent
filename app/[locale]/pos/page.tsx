'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProductCard, CategoryTabs, CartPanel, type CartItem } from '@/components/pos';

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string | null;
  categoryId: number;
  category?: { id: number; name: string };
}

interface Category {
  id: number;
  name: string;
}

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [nextCartItemId, setNextCartItemId] = useState(1);

  // Fetch products and categories
  useEffect(() => {
    async function fetchData() {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories'),
        ]);

        if (productsRes.ok) {
          const data = await productsRes.json();
          setProducts(data.products || []);
        }

        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Filter products by category
  const filteredProducts = selectedCategory
    ? products.filter((p) => p.categoryId === selectedCategory)
    : products;

  // Add product to cart
  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      const newItem: CartItem = {
        id: nextCartItemId,
        productId: product.id,
        name: product.name,
        price: Number(product.price),
        quantity: 1,
      };
      setNextCartItemId((id) => id + 1);
      return [...prev, newItem];
    });
  }, [nextCartItemId]);

  // Update cart item quantity
  const updateQuantity = useCallback((id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  // Remove item from cart
  const removeFromCart = useCallback((id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Checkout
  const handleCheckout = async () => {
    if (cart.length === 0) return;

    setIsCheckingOut(true);
    try {
      const orderItems = cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: orderItems }),
      });

      if (response.ok) {
        const { order } = await response.json();
        // Clear cart after successful order
        setCart([]);
        setNextCartItemId(1);
        alert(`訂單建立成功！訂單編號：${order.orderNumber}`);
      } else {
        const error = await response.json();
        alert(error.error || '建立訂單失敗');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('結帳時發生錯誤');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Main Content - Product Grid */}
      <main className="flex-1 flex flex-col overflow-hidden p-6">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            POS Switch
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">選擇商品加入購物車</p>
        </header>

        {/* Category Tabs */}
        <div className="mb-4">
          <CategoryTabs
            categories={categories}
            selectedId={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
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
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p>尚無商品</p>
              <p className="text-sm mt-1">請先透過管理後台新增商品</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={Number(product.price)}
                  imageUrl={product.imageUrl}
                  categoryName={product.category?.name}
                  onClick={() => addToCart(product)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Cart Sidebar */}
      <aside className="w-96 p-6 pl-0">
        <CartPanel
          items={cart}
          onUpdateQuantity={updateQuantity}
          onRemove={removeFromCart}
          onCheckout={handleCheckout}
          isCheckingOut={isCheckingOut}
        />
      </aside>
    </div>
  );
}
