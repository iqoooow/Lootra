import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/request';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { MarketplaceFilters } from '@/components/marketplace/MarketplaceFilters';
import { AccountGrid } from '@/components/marketplace/AccountGrid';
import { MarketplaceSEO } from '@/components/seo/MarketplaceSEO';
import { AdBanner } from '@/components/ui/AdBanner';

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'seo' });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://shax.uz';

  return {
    title: t('marketplace_title'),
    description: locale === 'uz'
      ? 'PUBG Mobile akkaunt sotib olish. Barcha ranglar: Conqueror, Ace, Diamond. Arzon narxlar, tasdiqlangan sotuvchilar.'
      : 'Buy PUBG Mobile accounts. All ranks: Conqueror, Ace, Diamond. Cheap prices, verified sellers.',
    alternates: {
      canonical: `${siteUrl}/${locale}/marketplace`,
      languages: {
        'uz-UZ': `${siteUrl}/uz/marketplace`,
        'en-US': `${siteUrl}/en/marketplace`,
      },
    },
  };
}

interface SearchParams {
  rank?: string;
  min_price?: string;
  max_price?: string;
  min_level?: string;
  server?: string;
  sort?: string;
  page?: string;
  q?: string;
}

async function getAccounts(searchParams: SearchParams) {
  const supabase = createServerSupabaseClient();
  const page = parseInt(searchParams.page ?? '1');
  const limit = 20;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('accounts_for_sale')
    .select(`
      id, slug, price, pubg_rank, pubg_level, uc_balance,
      skin_count, legendary_count, images, is_featured, view_count,
      title_uz, title_en,
      profiles!seller_id (username, display_name, avatar_url, seller_rating, seller_verified)
    `, { count: 'exact' })
    .eq('status', 'active');

  if (searchParams.rank) query = query.eq('pubg_rank', searchParams.rank);
  if (searchParams.min_price) query = query.gte('price', parseFloat(searchParams.min_price));
  if (searchParams.max_price) query = query.lte('price', parseFloat(searchParams.max_price));
  if (searchParams.min_level) query = query.gte('pubg_level', parseInt(searchParams.min_level));
  if (searchParams.server) query = query.eq('pubg_server', searchParams.server);

  const sortMap: Record<string, { column: string; ascending: boolean }> = {
    newest: { column: 'created_at', ascending: false },
    price_asc: { column: 'price', ascending: true },
    price_desc: { column: 'price', ascending: false },
    popular: { column: 'view_count', ascending: false },
  };
  const sort = sortMap[searchParams.sort ?? 'newest'] ?? sortMap.newest;
  query = query.order('is_featured', { ascending: false }).order(sort.column, { ascending: sort.ascending });
  query = query.range(offset, offset + limit - 1);

  const { data, count } = await query;
  return { accounts: data ?? [], total: count ?? 0, page, limit };
}

export default async function MarketplacePage({
  params: { locale },
  searchParams,
}: {
  params: { locale: Locale };
  searchParams: SearchParams;
}) {
  const [t, { accounts, total, page, limit }] = await Promise.all([
    getTranslations({ locale, namespace: 'marketplace' }),
    getAccounts(searchParams),
  ]);

  return (
    <>
      <MarketplaceSEO locale={locale} />

      <div className="container-page py-8">
        <div className="mb-8">
          <h1 className="section-title">{t('title')}</h1>
          <p className="section-subtitle">{t('subtitle')}</p>
          <div className="section-divider" />
          <p className="text-dark-300 text-sm">
            {total.toLocaleString()} {locale === 'uz' ? 'akkaunt topildi' : 'accounts found'}
          </p>
        </div>

        <AdBanner placement="content" className="mb-6" />

        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="w-full lg:w-72 shrink-0">
            <MarketplaceFilters locale={locale} currentFilters={searchParams} />
          </aside>
          <div className="flex-1 min-w-0">
            <Suspense fallback={
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-72" />)}
              </div>
            }>
              <AccountGrid accounts={accounts} locale={locale} total={total} page={page} limit={limit} />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
