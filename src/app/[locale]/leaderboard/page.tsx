import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/request';

export default async function LeaderboardPage({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'nav' });

  return (
    <div className="container-page py-20">
      <h1 className="section-title">{t('leaderboard')}</h1>
      <p className="text-dark-300 mt-4">
        {locale === 'uz' ? 'Reyting jadvali tez orada.' : 'Leaderboard coming soon.'}
      </p>
    </div>
  );
}
