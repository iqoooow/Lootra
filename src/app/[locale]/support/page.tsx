import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/request';

export default async function SupportPage({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'nav' });

  return (
    <div className="container-page py-20">
      <h1 className="section-title">{t('support')}</h1>
      <p className="text-dark-300 mt-4">
        {locale === 'uz'
          ? 'Yordam uchun Telegram: @shax_support'
          : 'For support contact us on Telegram: @shax_support'}
      </p>
    </div>
  );
}
