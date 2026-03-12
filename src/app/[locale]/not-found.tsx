import Link from 'next/link';
import { getLocale } from 'next-intl/server';

export default async function NotFound() {
  const locale = await getLocale();
  const isUz = locale === 'uz';

  return (
    <div className="min-h-[60dvh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-8xl font-display font-bold text-gradient-gold mb-4">404</div>
      <h1 className="text-2xl font-display font-bold text-white mb-3">
        {isUz ? 'Sahifa topilmadi' : 'Page Not Found'}
      </h1>
      <p className="text-dark-300 mb-8 max-w-sm">
        {isUz
          ? "Siz qidirayotgan sahifa mavjud emas yoki o'chirilgan."
          : 'The page you are looking for does not exist or has been removed.'}
      </p>
      <Link href={`/${locale}`} className="btn-primary">
        {isUz ? 'Bosh sahifaga qaytish' : 'Back to Home'}
      </Link>
    </div>
  );
}
