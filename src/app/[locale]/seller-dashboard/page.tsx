import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/request';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { SellerStats } from '@/components/seller/SellerStats';
import { RecentOrders } from '@/components/seller/RecentOrders';
import { MyListings } from '@/components/seller/MyListings';
import { EarningsChart } from '@/components/seller/EarningsChart';
import Link from 'next/link';
import { Plus, BarChart2 } from 'lucide-react';

export default async function SellerDashboardPage({
  params: { locale },
}: {
  params: { locale: Locale };
}) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/auth/login`);

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || !['seller', 'admin'].includes(profile.role)) {
    // Prompt to become a seller
    redirect(`/${locale}/profile?become_seller=1`);
  }

  const t = await getTranslations({ locale, namespace: 'seller_dashboard' });

  // Fetch seller stats
  const [{ data: orders }, { data: listings }] = await Promise.all([
    supabase
      .from('orders')
      .select('id, total_amount, status, created_at, order_type')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('accounts_for_sale')
      .select('id, title_uz, title_en, price, status, view_count, images, pubg_rank, created_at')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  const completedOrders = orders?.filter((o) => o.status === 'completed') ?? [];
  const totalEarnings = completedOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
  const platformFee = totalEarnings * 0.08;
  const netEarnings = totalEarnings - platformFee;

  return (
    <div className="container-page py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="section-title">{t('title')}</h1>
          <p className="text-dark-300 text-sm mt-1">
            {locale === 'uz' ? 'Xush kelibsiz' : 'Welcome back'}, {profile.display_name ?? profile.username}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href={`/${locale}/seller-dashboard/analytics`} className="btn-secondary btn-sm">
            <BarChart2 size={14} />
            {t('analytics')}
          </Link>
          <Link href={`/${locale}/seller-dashboard/new-listing`} className="btn-primary btn-sm">
            <Plus size={14} />
            {t('new_listing')}
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <SellerStats
        locale={locale}
        totalListings={listings?.length ?? 0}
        activeListings={listings?.filter((l) => l.status === 'active').length ?? 0}
        totalOrders={orders?.length ?? 0}
        totalEarnings={totalEarnings}
        netEarnings={netEarnings}
        rating={profile.seller_rating ?? 0}
        reviewCount={profile.total_reviews}
      />

      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        {/* Earnings chart */}
        <div className="lg:col-span-2">
          <EarningsChart locale={locale} sellerId={user.id} />
        </div>

        {/* Recent orders */}
        <div className="lg:col-span-1">
          <RecentOrders orders={orders ?? []} locale={locale} />
        </div>
      </div>

      {/* My listings */}
      <div className="mt-8">
        <MyListings listings={listings ?? []} locale={locale} />
      </div>
    </div>
  );
}
