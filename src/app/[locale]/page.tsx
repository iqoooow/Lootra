import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import type { Locale } from '@/i18n/request';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedAccounts } from '@/components/home/FeaturedAccounts';
import { UCPromoSection } from '@/components/home/UCPromoSection';
import { HowItWorksSection } from '@/components/home/HowItWorksSection';
import { StatsSection } from '@/components/home/StatsSection';
import { BlogHighlights } from '@/components/home/BlogHighlights';
import { GuideHighlights } from '@/components/home/GuideHighlights';
import { GiveawayBanner } from '@/components/home/GiveawayBanner';
import { TrustBadges } from '@/components/home/TrustBadges';
import { HomeSEO } from '@/components/seo/HomeSEO';
import { AccountCardSkeleton } from '@/components/ui/skeletons';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'seo' });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://shax.uz';

  return {
    title: t('home_title'),
    description: t('home_desc'),
    alternates: {
      canonical: `${siteUrl}/${locale}`,
      languages: { 'uz-UZ': `${siteUrl}/uz`, 'en-US': `${siteUrl}/en` },
    },
  };
}

async function getFeaturedAccounts(locale: Locale) {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from('accounts_for_sale')
    .select(`
      id, slug, price, pubg_rank, pubg_level, uc_balance,
      skin_count, legendary_count, images, is_featured, view_count,
      title_uz, title_en,
      profiles!seller_id (username, display_name, avatar_url, seller_rating, seller_verified)
    `)
    .eq('status', 'active')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(8);

  return data ?? [];
}

async function getActiveGiveaway() {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from('giveaways')
    .select('id, title_uz, title_en, prize_type, prize_uc_amount, ends_at, entry_count, cover_image')
    .eq('status', 'active')
    .order('ends_at', { ascending: true })
    .limit(1)
    .single();
  return data;
}

async function getMarketStats() {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase.from('mv_market_stats').select('*').single();
  return data;
}

async function getUCPackages() {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from('uc_packages')
    .select('*')
    .eq('is_active', true)
    .order('uc_amount', { ascending: true })
    .limit(6);
  return data ?? [];
}

export default async function HomePage({
  params: { locale },
}: {
  params: { locale: Locale };
}) {
  const [featuredAccounts, giveaway, stats, ucPackages] = await Promise.all([
    getFeaturedAccounts(locale),
    getActiveGiveaway(),
    getMarketStats(),
    getUCPackages(),
  ]);

  return (
    <>
      <HomeSEO locale={locale} />

      {/* Hero */}
      <HeroSection locale={locale} stats={stats} />

      {/* Trust badges */}
      <TrustBadges />

      {/* Stats counter */}
      <StatsSection stats={stats} />

      {/* Featured accounts */}
      <section className="py-16 container-page">
        <Suspense fallback={<div className="grid grid-cols-2 md:grid-cols-4 gap-4">{Array.from({length:8}).map((_,i)=><AccountCardSkeleton key={i}/>)}</div>}>
          <FeaturedAccounts accounts={featuredAccounts} locale={locale} />
        </Suspense>
      </section>

      {/* UC Promo */}
      <UCPromoSection packages={ucPackages} locale={locale} />

      {/* Active Giveaway Banner */}
      {giveaway && <GiveawayBanner giveaway={giveaway} locale={locale} />}

      {/* How it works */}
      <HowItWorksSection locale={locale} />

      {/* Blog highlights */}
      <Suspense fallback={null}>
        <BlogHighlights locale={locale} />
      </Suspense>

      {/* Guide highlights */}
      <Suspense fallback={null}>
        <GuideHighlights locale={locale} />
      </Suspense>
    </>
  );
}
