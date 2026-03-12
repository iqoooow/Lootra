import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/request';

export default async function SellerAnalyticsPage({ params: { locale } }: { params: { locale: Locale } }) {
  return (
    <div className="container-page py-12">
      <h1 className="section-title mb-2">
        {locale === 'uz' ? 'Tahlil' : 'Analytics'}
      </h1>
      <p className="text-dark-400">
        {locale === 'uz' ? 'Tez orada qo\'shiladi.' : 'Coming soon.'}
      </p>
    </div>
  );
}
