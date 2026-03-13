import { createServerSupabaseClient } from '@/lib/supabase/server';
import { UserX, ShieldCheck, Star, Package } from 'lucide-react';

export default async function ModeratorSellersPage() {
  const supabase = createServerSupabaseClient();

  const { data: sellers } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, seller_verified, seller_rating, seller_total_sales, total_reviews, is_banned, ban_reason, created_at')
    .eq('role', 'seller')
    .order('created_at', { ascending: false })
    .limit(200);

  const active   = sellers?.filter((s) => !s.is_banned) ?? [];
  const banned   = sellers?.filter((s) => s.is_banned) ?? [];
  const verified = sellers?.filter((s) => s.seller_verified && !s.is_banned) ?? [];

  function SellerRow({ seller }: { seller: any }) {
    return (
      <tr className="border-b border-surface-border hover:bg-surface-overlay/50 transition-colors">
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-brand-400">
                {(seller.display_name ?? seller.username)?.[0]?.toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-white">{seller.display_name ?? seller.username}</p>
              <p className="text-xs text-dark-400">@{seller.username}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3">
          {seller.seller_verified ? (
            <span className="badge-green text-xs flex items-center gap-1 w-fit">
              <ShieldCheck size={10} /> Verified
            </span>
          ) : (
            <span className="badge text-xs bg-dark-700 text-dark-300 w-fit">Unverified</span>
          )}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1">
            <Star size={12} className="text-brand-400" />
            <span className="text-sm text-white">{seller.seller_rating?.toFixed(1) ?? '—'}</span>
            <span className="text-xs text-dark-400">({seller.total_reviews})</span>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-white">{seller.seller_total_sales}</td>
        <td className="px-4 py-3">
          {seller.is_banned ? (
            <span className="badge-red text-xs">Banned</span>
          ) : (
            <span className="badge-green text-xs">Active</span>
          )}
        </td>
        <td className="px-4 py-3">
          <div className="flex gap-2">
            {!seller.is_banned ? (
              <form action={`/api/mod/ban-seller?id=${seller.id}`} method="POST">
                <button type="submit" className="btn-danger btn-sm text-xs">
                  <UserX size={12} /> Suspend
                </button>
              </form>
            ) : (
              <form action={`/api/mod/unban-seller?id=${seller.id}`} method="POST">
                <button type="submit" className="btn-secondary btn-sm text-xs">
                  Unban
                </button>
              </form>
            )}
          </div>
        </td>
      </tr>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Warn / Suspend Sellers</h1>
          <p className="text-dark-300 text-sm mt-1">Manage seller accounts and take action</p>
        </div>
        <div className="flex gap-3">
          <span className="badge-green">{active.length} active</span>
          <span className="badge-gold">{verified.length} verified</span>
          <span className="badge-red">{banned.length} banned</span>
        </div>
      </div>

      {/* Banned sellers first */}
      {banned.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-surface-border">
            <h2 className="font-semibold text-accent-red">Banned Sellers ({banned.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-dark-400 font-medium uppercase tracking-wide border-b border-surface-border">
                  <th className="px-4 py-3">Seller</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Sales</th>
                  <th className="px-4 py-3">Account</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {banned.map((s) => <SellerRow key={s.id} seller={s} />)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All active sellers */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-border">
          <h2 className="font-semibold text-white">All Sellers ({sellers?.length ?? 0})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-dark-400 font-medium uppercase tracking-wide border-b border-surface-border">
                <th className="px-4 py-3">Seller</th>
                <th className="px-4 py-3">Verified</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Sales</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sellers && sellers.length > 0
                ? sellers.map((s) => <SellerRow key={s.id} seller={s} />)
                : <tr><td colSpan={6} className="px-4 py-8 text-center text-dark-400 text-sm">No sellers found</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
