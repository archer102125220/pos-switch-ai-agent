import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('common');
  const nav = await getTranslations('navigation');

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold text-center mb-8">
          {t('appName')}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* POS */}
          <Link
            href="/pos"
            className="block p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-2xl font-semibold mb-2">🛒 {nav('pos')}</h2>
            <p className="text-gray-600">Start taking orders</p>
          </Link>

          {/* Products */}
          <Link
            href="/admin/products"
            className="block p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-2xl font-semibold mb-2">📦 {nav('products')}</h2>
            <p className="text-gray-600">Manage products</p>
          </Link>

          {/* Categories */}
          <Link
            href="/admin/categories"
            className="block p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-2xl font-semibold mb-2">🏷️ {nav('categories')}</h2>
            <p className="text-gray-600">Manage categories</p>
          </Link>

          {/* Orders */}
          <Link
            href="/admin/orders"
            className="block p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-2xl font-semibold mb-2">📋 {nav('orders')}</h2>
            <p className="text-gray-600">View order history</p>
          </Link>

          {/* Reports */}
          <Link
            href="/admin/reports"
            className="block p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-2xl font-semibold mb-2">📊 {nav('reports')}</h2>
            <p className="text-gray-600">View sales reports</p>
          </Link>

          {/* Settings */}
          <Link
            href="/admin/settings"
            className="block p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-2xl font-semibold mb-2">⚙️ {nav('settings')}</h2>
            <p className="text-gray-600">System settings</p>
          </Link>
        </div>

        {/* Language Switcher */}
        <div className="mt-8 text-center">
          <span className="text-gray-600 mr-4">Language:</span>
          <Link href="/" locale="zh-tw" className="mr-2 hover:underline">
            繁體中文
          </Link>
          |
          <Link href="/" locale="en" className="ml-2 hover:underline">
            English
          </Link>
        </div>
      </div>
    </main>
  );
}
