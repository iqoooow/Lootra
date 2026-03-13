import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminSupabaseClient } from '@/lib/supabase/server';
import { CheckCircle, XCircle, Eye, Clock } from 'lucide-react';

export default async function ModeratorListingsPage() {
  const supabase = createServerSupabaseClient();

  const { data: listings } = await supabase
    .from('accounts_for_sale')
    .select(`
      id, title_uz, title_en, price, pubg_rank, pubg_level, pubg_server,
      uc_balance, skin_count, legendary_count, images, status, created_at,
      profiles!seller_id (id, username, display_name, seller_verified, seller_rating)
    `)
    .in('status', ['pending_review', 'active', 'suspended'])
    .order('created_at', { ascending: true });

  const pending   = listings?.filter((l) => l.status === 'pending_review') ?? [];
  const active    = listings?.filter((l) => l.status === 'active') ?? [];
  const suspended = listings?.filter((l) => l.status === 'suspended') ?? [];

  const rankColor: Record<string, string> = {
    conqueror: 'text-brand-400', ace_dominator: 'text-red-400', ace_master: 'text-red-400',
    ace: 'text-red-400', crown: 'text-purple-400', diamond: 'text-cyan-400',
    platinum: 'text-teal-400', gold: 'text-brand-400', silver: 'text-gray-400', bronze: 'text-orange-400',
  };

  function ListingRow({ item }: { item: any }) {
    const seller = item.profiles as any;
    return (
      <tr className="border-b border-surface-border hover:bg-surface-overlay/50 transition-colors">
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-dark-800 overflow-hidden shrink-0">
              {item.images?.[0] ? (
                <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-dark-400 text-xs">No img</div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate max-w-[180px]">
                {item.title_uz ?? item.title_en}
              </p>
              <p className="text-xs text-dark-400">
                Lv.{item.pubg_level} · {item.pubg_server?.toUpperCase()}
              </p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3">
          <span className={`text-sm font-semibold capitalize ${rankColor[item.pubg_rank] ?? 'text-white'}`}>
            {item.pubg_rank?.replace('_', ' ')}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-white font-medium">
          {Number(item.price).toLocaleString()} UZS
        </td>
        <td className="px-4 py-3">
          <div>
            <p className="text-sm text-white">{seller?.display_name ?? seller?.username}</p>
            {seller?.seller_verified && (
              <span className="text-xs text-accent-green">✓ Verified</span>
            )}
          </div>
        </td>
        <td className="px-4 py-3">
          <span className={`badge text-xs ${
            item.status === 'pending_review' ? 'badge-gold' :
            item.status === 'active'         ? 'badge-green' :
            'badge-red'
          }`}>
            {item.status === 'pending_review' ? 'Pending' :
             item.status === 'active'          ? 'Active' : 'Suspended'}
          </span>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <a
              href={`/uz/marketplace/${item.id}`}
              target="_blank"
              className="p-1.5 text-dark-400 hover:text-white transition-colors"
              title="View listing"
            >
              <Eye size={14} />
            </a>
            {item.status === 'pending_review' && (
              <>
                <form action={`/api/mod/approve?id=${item.id}`} method="POST">
                  <button type="submit" className="p-1.5 text-accent-green hover:text-green-300 transition-colors" title="Approve">
                    <CheckCircle size={14} />
                  </button>
                </form>
                <form action={`/api/mod/reject?id=${item.id}`} method="POST">
                  <button type="submit" className="p-1.5 text-accent-red hover:text-red-300 transition-colors" title="Reject">
                    <XCircle size={14} />
                  </button>
                </form>
              </>
            )}
            {item.status === 'active' && (
              <form action={`/api/mod/suspend?id=${item.id}`} method="POST">
                <button type="submit" className="p-1.5 text-accent-red hover:text-red-300 transition-colors" title="Suspend">
                  <XCircle size={14} />
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
          <h1 className="text-2xl font-display font-bold text-white">Review Listings</h1>
          <p className="text-dark-300 text-sm mt-1">Approve or reject account listings</p>
        </div>
        <div className="flex gap-3">
          <span className="badge-gold">{pending.length} pending</span>
          <span className="badge-green">{active.length} active</span>
          <span className="badge-red">{suspended.length} suspended</span>
        </div>
      </div>

      {/* Pending first */}
      {pending.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-surface-border flex items-center gap-2">
            <Clock size={15} className="text-brand-400" />
            <h2 className="font-semibold text-white">Pending Review ({pending.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-dark-400 font-medium uppercase tracking-wide border-b border-surface-border">
                  <th className="px-4 py-3">Account</th>
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Seller</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((item) => <ListingRow key={item.id} item={item} />)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Active listings */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-border flex items-center gap-2">
          <CheckCircle size={15} className="text-accent-green" />
          <h2 className="font-semibold text-white">Active Listings ({active.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-dark-400 font-medium uppercase tracking-wide border-b border-surface-border">
                <th className="px-4 py-3">Account</th>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Seller</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {active.length > 0
                ? active.map((item) => <ListingRow key={item.id} item={item} />)
                : <tr><td colSpan={6} className="px-4 py-8 text-center text-dark-400 text-sm">No active listings</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
