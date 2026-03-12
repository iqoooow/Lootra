import type { Locale } from '@/i18n/request';

// Structured data (JSON-LD) for homepage
export function HomeSEO({ locale }: { locale: Locale }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://shax.uz';

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Shax PUBG Marketplace',
    url: siteUrl,
    inLanguage: locale === 'uz' ? 'uz-UZ' : 'en-US',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/${locale}/${locale === 'uz' ? 'pubg-akkaunt-sotib-olish' : 'buy-pubg-account'}?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Shax PUBG Marketplace',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    sameAs: ['https://t.me/shaxpubg'],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['Uzbek', 'English'],
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: locale === 'uz' ? 'Bosh sahifa' : 'Home',
        item: `${siteUrl}/${locale}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}
