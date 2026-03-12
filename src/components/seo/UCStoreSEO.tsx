import type { Locale } from '@/i18n/request';

export function UCStoreSEO({ locale }: { locale: Locale }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://shax.uz';
  const path = locale === 'uz' ? 'uc-sotib-olish' : 'buy-uc';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: locale === 'uz' ? 'Shax UC Do\'kon' : 'Shax UC Store',
    description: locale === 'uz'
      ? 'Arzon PUBG UC sotib olish. 5 daqiqada yetkazib berish.'
      : 'Buy cheap PUBG UC. Delivered in 5 minutes.',
    url: `${siteUrl}/${locale}/${path}`,
    currenciesAccepted: 'UZS, USD',
    paymentAccepted: 'Cash, Payme, Click',
    priceRange: '$$',
    inLanguage: locale === 'uz' ? 'uz-UZ' : 'en-US',
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
}
