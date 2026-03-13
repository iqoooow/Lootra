import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ShieldCheck, Star, Package, TrendingUp, UserX, CheckCircle } from 'lucide-react';

export default async function AdminSellersPage() {
  const supabase = createServerSupabaseClient();

  const { data: sellers } = await supabase
    .from('profiles')
    .select('id, username, display_name, seller_verified, seller_rating, seller_total_sales, total_reviews, wallet_balance, is_banned, is_active, created_at')
    .eq('role', 'seller')
    .order('seller_total_sales', { ascending: false })
    .limit(200);

  const stats = {
    total:    sellers?.length ?? 0,
    verified: sellers?.filter((s) => s.seller_verified).length ?? 0,
    banned:   sellers?.filter((s) => s.is_banned).length ?? 0,
    totalSales: sellers?.reduce((sum, s) => sum + (s.seller_total_sales ?? 0), 0) ?? 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Manage Sellers</h1>
        <p className="text-dark-300 text-sm mt-1">Verify sellers, track performance, take action</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Sellers',    value: stats.total,                   icon: Package,      color: 'text-brand-400' },
          { label: 'Verified',         value: stats.verified,                 icon: ShieldCheck,  color: 'text-accent-green' },
          { label: 'Banned',           value: stats.banned,                   icon: UserX,        color: 'text-accent-red' },
          { label: 'Total Sales',      value: stats.totalSales.toLocaleString(), icon: TrendingUp, color: 'text-accent-blue' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-dark-400 text-xs font-medium uppercase tracking-wide">{label}</span>
              <Icon size={14} className={color} />
            </div>
            <p className="text-2xl font-display font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-border">
          <h2 className="font-semibold text-white">All Sellers ({stats.total})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-dark-400 font-medium uppercase tracking-wide border-b border-surface-border">
                <th className="px-4 py-3">Seller</th>
                <th className="px-4 py-3">Verified</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Sales</th>
                <th className="px-4 py-3">Balance</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sellers && sellers.length > 0 ? sellers.map((seller) => (
                <tr key={seller.id} className="border-b border-surface-border hover:bg-surface-overlay/50 transition-colors">
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
                        <CheckCircle size={10} /> Yes
                      </span>
                    ) : (
                      <span className="badge text-xs bg-dark-700 text-dark-400 w-fit">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-brand-400" />
                      <span className="text-sm text-white">{seller.seller_rating?.toFixed(1) ?? '—'}</span>
                      <span className="text-xs text-dark-400">({seller.total_reviews ?? 0})</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-white font-medium">
                    {seller.seller_total_sales ?? 0}
                  </td>
                  <td className="px-4 py-3 text-sm text-white">
                    {Number(seller.wallet_balance ?? 0).toLocaleString()} UZS
                  </td>
                  <td className="px-4 py-3">
                    {seller.is_banned ? (
                      <span className="badge-red text-xs">Banned</span>
                    ) : seller.is_active ? (
                      <span className="badge-green text-xs">Active</span>
                    ) : (
                      <span className="badge text-xs bg-dark-700 text-dark-400">Inactive</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {!seller.seller_verified && !seller.is_banned && (
                        <form action={`/api/admin/sellers/verify?id=${seller.id}`} method="POST">
                          <button type="submit" className="btn-secondary btn-sm text-xs">
                            Verify
                          </button>
                        </form>
                      )}
                      {!seller.is_banned ? (
                        <form action={`/api/admin/sellers/ban?id=${seller.id}`} method="POST">
                          <button type="submit" className="btn-danger btn-sm text-xs">
                            <UserX size={12} /> Ban
                          </button>
                        </form>
                      ) : (
                        <form action={`/api/admin/sellers/unban?id=${seller.id}`} method="POST">
                          <button type="submit" className="btn-ghost btn-sm text-xs">Unban</button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-dark-400 text-sm">No sellers found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
