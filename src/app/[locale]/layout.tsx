import type { Metadata, Viewport } from 'next';
import { Inter, Rajdhani } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/i18n/request';
import '@/styles/globals.css';
import { Toaster } from 'react-hot-toast';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';
import { SupabaseProvider } from '@/components/providers/SupabaseProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Analytics } from '@/components/Analytics';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-rajdhani',
  display: 'swap',
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'seo' });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://shax.uz';

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: t('home_title'),
      template: `%s | ${t('site_name')}`,
    },
    description: t('home_desc'),
    applicationName: t('site_name'),
    authors: [{ name: 'Shax' }],
    creator: 'Shax',
    publisher: 'Shax',
    keywords:
      locale === 'uz'
        ? ['pubg akkaunt sotib olish', 'arzon pubg uc', 'pubg skinlar', 'pubg sensitivity sozlamalari', 'pubg mobile uzbekistan']
        : ['buy pubg mobile account', 'cheap pubg uc', 'pubg skins list', 'pubg sensitivity guide', 'pubg marketplace'],
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
    openGraph: {
      type: 'website',
      locale: locale === 'uz' ? 'uz_UZ' : 'en_US',
      url: siteUrl,
      siteName: t('site_name'),
      title: t('home_title'),
      description: t('home_desc'),
      images: [{ url: `${siteUrl}/og-image.jpg`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('home_title'),
      description: t('home_desc'),
      images: [`${siteUrl}/og-image.jpg`],
    },
    alternates: {
      canonical: `${siteUrl}/${locale}`,
      languages: {
        'uz-UZ': `${siteUrl}/uz`,
        'en-US': `${siteUrl}/en`,
      },
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon-16x16.png',
      apple: '/apple-touch-icon.png',
    },
    manifest: '/site.webmanifest',
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      yandex: process.env.YANDEX_VERIFICATION,
    },
  };
}

export const viewport: Viewport = {
  themeColor: '#090918',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  colorScheme: 'dark',
};

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale as Locale)) notFound();

  const messages = await getMessages();

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* hreflang tags */}
        <link rel="alternate" hrefLang="uz" href={`${process.env.NEXT_PUBLIC_SITE_URL}/uz`} />
        <link rel="alternate" hrefLang="en" href={`${process.env.NEXT_PUBLIC_SITE_URL}/en`} />
        <link rel="alternate" hrefLang="x-default" href={`${process.env.NEXT_PUBLIC_SITE_URL}/uz`} />
      </head>
      <body className={`${inter.variable} ${rajdhani.variable} font-sans bg-dark-950 text-white antialiased`}>
        <ThemeProvider>
          <SupabaseProvider>
            <NextIntlClientProvider messages={messages} locale={locale}>
              {/* Skip to main content (a11y) */}
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-[200] btn-primary"
              >
                Skip to main content
              </a>

              <Navbar locale={locale as Locale} />

              <main id="main-content" className="min-h-[calc(100dvh-var(--nav-height))] pt-[var(--nav-height)]">
                {children}
              </main>

              <Footer locale={locale as Locale} />

              {/* Mobile bottom navigation */}
              <MobileNav locale={locale as Locale} />

              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    background: '#1e1e35',
                    color: '#ffffff',
                    border: '1px solid #2a2a45',
                    borderRadius: '12px',
                  },
                  success: { iconTheme: { primary: '#f5b800', secondary: '#090918' } },
                  error: { iconTheme: { primary: '#ef4444', secondary: '#ffffff' } },
                }}
              />

              <Analytics />
            </NextIntlClientProvider>
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
