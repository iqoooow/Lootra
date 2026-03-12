import type { Locale } from '@/i18n/request';

export function MarketplaceSEO({ locale }: { locale: Locale }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://shax.uz';
  const path = locale === 'uz' ? 'pubg-akkaunt-sotib-olish' : 'buy-pubg-account';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: locale === 'uz' ? 'PUBG Mobile Akkauntlar' : 'PUBG Mobile Accounts',
    description: locale === 'uz'
      ? 'PUBG Mobile akkaunt sotib olish — eng arzon narxlar, tasdiqlangan sotuvchilar'
      : 'Buy PUBG Mobile accounts — lowest prices, verified sellers',
    url: `${siteUrl}/${locale}/${path}`,
    inLanguage: locale === 'uz' ? 'uz-UZ' : 'en-US',
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: locale === 'uz' ? 'Bosh sahifa' : 'Home', item: `${siteUrl}/${locale}` },
      { '@type': 'ListItem', position: 2, name: locale === 'uz' ? 'Akkaunt bozori' : 'Marketplace', item: `${siteUrl}/${locale}/${path}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
    </>
  );
}
