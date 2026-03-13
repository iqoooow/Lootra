import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import type { Locale } from '@/i18n/request';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  Package, Zap, Heart, Gift, User, Star, ShoppingBag, Clock, CheckCircle
} from 'lucide-react';

export default async function UserDashboardPage({
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

  if (!profile) redirect(`/${locale}/auth/login`);

  // Sellers go to their own dashboard
  if (profile.role === 'seller') redirect(`/${locale}/seller-dashboard`);
  if (profile.role === 'admin')     redirect('/admin/dashboard');
  if (profile.role === 'moderator') redirect('/moderator/dashboard');

  // Fetch user's data in parallel
  const [
    { data: orders },
    { data: savedAccounts },
    { data: giveawayEntries },
  ] = await Promise.all([
    supabase
      .from('orders')
      .select('id, order_number, order_type, total_amount, status, created_at')
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('saved_accounts')
      .select(`
        account_id, created_at,
        accounts_for_sale (id, title_uz, title_en, price, pubg_rank, images, status)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(8),
    supabase
      .from('giveaway_entries')
      .select(`
        id, is_winner, created_at,
        giveaways (id, title_uz, title_en, status, ends_at, prize_type, prize_uc_amount)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const completedOrders = orders?.filter((o) => o.status === 'completed') ?? [];
  const pendingOrders   = orders?.filter((o) => ['pending', 'paid', 'processing'].includes(o.status)) ?? [];
  const accountOrders   = orders?.filter((o) => o.order_type === 'account') ?? [];
  const ucOrders        = orders?.filter((o) => o.order_type === 'uc') ?? [];
  const totalSpent      = completedOrders.reduce((s, o) => s + Number(o.total_amount), 0);

  const statusBadge = (status: string) => {
    switch (status) {
      case 'completed':  return 'badge-green';
      case 'pending':
      case 'paid':
      case 'processing': return 'badge-gold';
      case 'cancelled':  return 'badge-red';
      default:           return 'badge-blue';
    }
  };

  return (
    <div className="container-page py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="section-title">
            {locale === 'uz' ? 'Mening Kabinetim' : 'My Dashboard'}
          </h1>
          <p className="text-dark-300 text-sm mt-1">
            {locale === 'uz' ? 'Xush kelibsiz' : 'Welcome back'},{' '}
            <span className="text-brand-400">{profile.display_name ?? profile.username}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <Link href={`/${locale}/marketplace`} className="btn-primary btn-sm">
            <ShoppingBag size={14} />
            {locale === 'uz' ? 'Bozor' : 'Marketplace'}
          </Link>
          <Link href={`/${locale}/profile`} className="btn-secondary btn-sm">
            <User size={14} />
            {locale === 'uz' ? 'Profil' : 'Profile'}
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: locale === 'uz' ? 'Jami xaridlar' : 'Total Orders',
            value: orders?.length ?? 0,
            icon: Package,
            color: 'text-brand-400',
          },
          {
            label: locale === 'uz' ? 'Akkaunt xaridlar' : 'Accounts Bought',
            value: accountOrders.length,
            icon: ShoppingBag,
            color: 'text-accent-blue',
          },
          {
            label: locale === 'uz' ? 'UC xaridlar' : 'UC Purchases',
            value: ucOrders.length,
            icon: Zap,
            color: 'text-accent-purple',
          },
          {
            label: locale === 'uz' ? 'Saqlangan' : 'Saved',
            value: savedAccounts?.length ?? 0,
            icon: Heart,
            color: 'text-accent-red',
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-dark-400 text-xs font-medium uppercase tracking-wide">{label}</span>
              <div className="w-8 h-8 rounded-lg bg-dark-800 flex items-center justify-center">
                <Icon size={14} className={color} />
              </div>
            </div>
            <p className="text-2xl font-display font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">
              {locale === 'uz' ? 'So\'nggi buyurtmalar' : 'Recent Orders'}
            </h2>
            {pendingOrders.length > 0 && (
              <span className="badge-gold">{pendingOrders.length} pending</span>
            )}
          </div>

          {orders && orders.length > 0 ? (
            <div className="space-y-2">
              {orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-3 border-b border-surface-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-white">{order.order_number}</p>
                    <p className="text-xs text-dark-400">
                      {order.order_type === 'account'
                        ? (locale === 'uz' ? 'Akkaunt' : 'Account')
                        : 'UC'
                      } · {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">
                      {Number(order.total_amount).toLocaleString()} UZS
                    </p>
                    <span className={`badge text-xs mt-1 ${statusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package size={32} className="text-dark-600 mx-auto mb-3" />
              <p className="text-dark-400 text-sm">
                {locale === 'uz' ? 'Hali buyurtma yo\'q' : 'No orders yet'}
              </p>
              <Link href={`/${locale}/marketplace`} className="btn-primary btn-sm mt-4 inline-flex">
                {locale === 'uz' ? 'Xarid qilish' : 'Start Shopping'}
              </Link>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Giveaway entries */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white">
                {locale === 'uz' ? 'Sovrin o\'yinlari' : 'Giveaways'}
              </h2>
              <Link href={`/${locale}/giveaways`} className="text-xs text-brand-400 hover:text-brand-300">
                {locale === 'uz' ? 'Barchasi' : 'All'}
              </Link>
            </div>

            {giveawayEntries && giveawayEntries.length > 0 ? (
              <div className="space-y-3">
                {giveawayEntries.map((entry) => {
                  const giveaway = entry.giveaways as any;
                  return (
                    <div key={entry.id} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        entry.is_winner ? 'bg-brand-500/20' : 'bg-dark-800'
                      }`}>
                        <Gift size={14} className={entry.is_winner ? 'text-brand-400' : 'text-dark-400'} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-white truncate">
                          {locale === 'uz' ? giveaway?.title_uz : giveaway?.title_en}
                        </p>
                        <p className="text-xs text-dark-400">
                          {entry.is_winner
                            ? (locale === 'uz' ? '🏆 G\'olib!' : '🏆 Winner!')
                            : (giveaway?.status === 'active'
                                ? (locale === 'uz' ? 'Ishtirok etmoqda' : 'Entered')
                                : (locale === 'uz' ? 'Tugagan' : 'Ended')
                              )
                          }
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <Gift size={24} className="text-dark-600 mx-auto mb-2" />
                <p className="text-dark-400 text-xs">
                  {locale === 'uz' ? 'Sovrin o\'yinlariga qo\'shiling' : 'Join active giveaways'}
                </p>
                <Link href={`/${locale}/giveaways`} className="btn-primary btn-sm mt-3 inline-flex">
                  {locale === 'uz' ? 'Sovrinlar' : 'Giveaways'}
                </Link>
              </div>
            )}
          </div>

          {/* Saved accounts */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white">
                {locale === 'uz' ? 'Saqlangan' : 'Saved Accounts'}
              </h2>
            </div>

            {savedAccounts && savedAccounts.length > 0 ? (
              <div className="space-y-2">
                {savedAccounts.slice(0, 4).map((saved: any) => {
                  const account = saved.accounts_for_sale as any;
                  return (
                    <Link
                      key={saved.account_id}
                      href={`/${locale}/marketplace/${saved.account_id}`}
                      className="flex items-center gap-3 hover:bg-surface-overlay rounded-xl p-2 -mx-2 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-dark-800 overflow-hidden shrink-0">
                        {account?.images?.[0] ? (
                          <img src={account.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag size={14} className="text-dark-500" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-white truncate">
                          {account?.title_uz ?? account?.title_en}
                        </p>
                        <p className="text-xs text-brand-400">
                          {Number(account?.price).toLocaleString()} UZS
                        </p>
                      </div>
                      {account?.status === 'sold' && (
                        <span className="badge-red text-xs shrink-0">Sold</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <Heart size={24} className="text-dark-600 mx-auto mb-2" />
                <p className="text-dark-400 text-xs">
                  {locale === 'uz' ? 'Saqlangan akkauntlar yo\'q' : 'No saved accounts'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Wallet / Summary */}
      <div className="mt-6 card p-5 bg-gradient-to-r from-brand-500/5 to-transparent border-brand-500/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-dark-400 mb-1">
              {locale === 'uz' ? 'Hamyon balansi' : 'Wallet Balance'}
            </p>
            <p className="text-3xl font-display font-bold text-white">
              {Number(profile.wallet_balance).toLocaleString()}
              <span className="text-base text-dark-300 ml-1">UZS</span>
            </p>
          </div>
          <div className="flex gap-3">
            <Link href={`/${locale}/uc-store`} className="btn-primary btn-sm">
              <Zap size={14} />
              {locale === 'uz' ? 'UC Sotib olish' : 'Buy UC'}
            </Link>
            <Link href={`/${locale}/marketplace`} className="btn-secondary btn-sm">
              <ShoppingBag size={14} />
              {locale === 'uz' ? 'Bozor' : 'Marketplace'}
            </Link>
          </div>
        </div>
      </div>

      {/* Become seller CTA */}
      <div className="mt-6 card p-6 border-accent-blue/20 bg-accent-blue/5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-white">
              {locale === 'uz' ? 'Akkauntingizni sotsiz!' : 'Sell your account!'}
            </h3>
            <p className="text-dark-300 text-sm mt-1">
              {locale === 'uz'
                ? 'Seller hisobiga o\'ting va PUBG akkauntlaringizni sotsiz'
                : 'Upgrade to seller and start listing your PUBG accounts'
              }
            </p>
          </div>
          <Link href={`/${locale}/profile?become_seller=1`} className="btn-secondary btn-sm shrink-0">
            {locale === 'uz' ? 'Seller bo\'lish' : 'Become a Seller'}
          </Link>
        </div>
      </div>
    </div>
  );
}
