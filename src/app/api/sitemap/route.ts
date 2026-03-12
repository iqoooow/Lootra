import { NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/server';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://shax.uz';
const locales = ['uz', 'en'] as const;

function xmlEscape(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlEntry(
  loc: string,
  alternates: { lang: string; href: string }[],
  options?: { lastmod?: string; changefreq?: string; priority?: string }
): string {
  const { lastmod, changefreq = 'weekly', priority = '0.7' } = options ?? {};
  return `
  <url>
    <loc>${xmlEscape(loc)}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
    ${alternates.map(({ lang, href }) => `<xhtml:link rel="alternate" hreflang="${lang}" href="${xmlEscape(href)}"/>`).join('\n    ')}
  </url>`;
}

export async function GET() {
  const supabase = createAdminSupabaseClient();

  // Static pages
  const staticPages = [
    { uz: '', en: '', priority: '1.0', changefreq: 'daily' },
    { uz: 'pubg-akkaunt-sotib-olish', en: 'buy-pubg-account', priority: '0.9', changefreq: 'hourly' },
    { uz: 'uc-sotib-olish', en: 'buy-uc', priority: '0.9', changefreq: 'daily' },
    { uz: 'yangiliklar', en: 'blog', priority: '0.8', changefreq: 'daily' },
    { uz: 'qollanmalar', en: 'guides', priority: '0.8', changefreq: 'weekly' },
    { uz: 'skinlar', en: 'skins', priority: '0.7', changefreq: 'weekly' },
    { uz: 'reyting', en: 'leaderboard', priority: '0.6', changefreq: 'daily' },
    { uz: 'sovrinlar', en: 'giveaways', priority: '0.7', changefreq: 'daily' },
    { uz: 'akkaunt-qiymati', en: 'account-value-checker', priority: '0.7', changefreq: 'monthly' },
    { uz: 'yordam', en: 'support', priority: '0.5', changefreq: 'monthly' },
  ];

  // Fetch dynamic content
  const [{ data: accounts }, { data: posts }, { data: guides }] = await Promise.all([
    supabase.from('accounts_for_sale').select('slug, updated_at').eq('status', 'active').limit(1000),
    supabase.from('blog_posts').select('slug, updated_at').eq('is_published', true).limit(500),
    supabase.from('guides').select('slug, updated_at').eq('is_published', true).limit(200),
  ]);

  const urls: string[] = [];

  // Static pages
  for (const page of staticPages) {
    const uzPath = page.uz ? `${siteUrl}/uz/${page.uz}` : `${siteUrl}/uz`;
    const enPath = page.en ? `${siteUrl}/en/${page.en}` : `${siteUrl}/en`;
    const defaultPath = page.uz ? `${siteUrl}/uz/${page.uz}` : `${siteUrl}/uz`;

    urls.push(urlEntry(uzPath, [
      { lang: 'uz-UZ', href: uzPath },
      { lang: 'en-US', href: enPath },
      { lang: 'x-default', href: defaultPath },
    ], { changefreq: page.changefreq, priority: page.priority }));
  }

  // Dynamic account pages
  for (const account of accounts ?? []) {
    const uzPath = `${siteUrl}/uz/akkaunt/${account.slug}`;
    const enPath = `${siteUrl}/en/account/${account.slug}`;
    urls.push(urlEntry(uzPath, [
      { lang: 'uz-UZ', href: uzPath },
      { lang: 'en-US', href: enPath },
      { lang: 'x-default', href: uzPath },
    ], { lastmod: account.updated_at?.split('T')[0], changefreq: 'daily', priority: '0.8' }));
  }

  // Blog posts
  for (const post of posts ?? []) {
    const uzPath = `${siteUrl}/uz/yangiliklar/${post.slug}`;
    const enPath = `${siteUrl}/en/blog/${post.slug}`;
    urls.push(urlEntry(uzPath, [
      { lang: 'uz-UZ', href: uzPath },
      { lang: 'en-US', href: enPath },
      { lang: 'x-default', href: uzPath },
    ], { lastmod: post.updated_at?.split('T')[0], changefreq: 'monthly', priority: '0.6' }));
  }

  // Guides
  for (const guide of guides ?? []) {
    const uzPath = `${siteUrl}/uz/qollanmalar/${guide.slug}`;
    const enPath = `${siteUrl}/en/guides/${guide.slug}`;
    urls.push(urlEntry(uzPath, [
      { lang: 'uz-UZ', href: uzPath },
      { lang: 'en-US', href: enPath },
      { lang: 'x-default', href: uzPath },
    ], { lastmod: guide.updated_at?.split('T')[0], changefreq: 'monthly', priority: '0.6' }));
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
>
${urls.join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
