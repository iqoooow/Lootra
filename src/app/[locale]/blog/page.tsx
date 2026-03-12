import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/request';

export default async function BlogPage({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'nav' });

  return (
    <div className="container-page py-20">
      <h1 className="section-title">{t('blog')}</h1>
      <p className="text-dark-300 mt-4">
        {locale === 'uz' ? 'Yangiliklar tez orada qo\'shiladi.' : 'Blog posts coming soon.'}
      </p>
    </div>
  );
}
