import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AlertTriangle, ShieldOff, Eye } from 'lucide-react';

export default async function ModeratorScamPage() {
  const supabase = createServerSupabaseClient();

  // Listings flagged as complaints
  const { data: reported } = await supabase
    .from('support_tickets')
    .select(`
      id, subject, created_at,
      profiles!user_id (username)
    `)
    .eq('category', 'complaint')
    .in('status', ['open', 'in_progress'])
    .order('created_at', { ascending: false });

  // Suspended listings (likely scams)
  const { data: suspended } = await supabase
    .from('accounts_for_sale')
    .select(`
      id, title_uz, title_en, price, pubg_rank, created_at,
      profiles!seller_id (username, is_banned)
    `)
    .eq('status', 'suspended')
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Scam Detection</h1>
        <p className="text-dark-300 text-sm mt-1">Remove fraudulent listings and protect buyers</p>
      </div>

      {/* Warning banner */}
      <div className="card border-accent-red/30 p-4 bg-accent-red/5">
        <div className="flex items-center gap-3">
          <AlertTriangle size={18} className="text-accent-red shrink-0" />
          <div>
            <p className="text-sm font-medium text-white">
              {(reported?.length ?? 0)} complaint reports need attention
            </p>
            <p className="text-xs text-dark-400 mt-0.5">
              Review reported listings promptly to protect buyers
            </p>
          </div>
        </div>
      </div>

      {/* Complaint reports */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-border flex items-center gap-2">
          <AlertTriangle size={15} className="text-accent-red" />
          <h2 className="font-semibold text-white">Complaint Reports ({reported?.length ?? 0})</h2>
        </div>
        {reported && reported.length > 0 ? (
          <div className="divide-y divide-surface-border">
            {reported.map((t: any) => (
              <div key={t.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">{t.subject}</p>
                  <p className="text-xs text-dark-400">{(t.profiles as any)?.username}</p>
                </div>
                <a href={`/moderator/reports/${t.id}`} className="btn-secondary btn-sm">
                  <Eye size={12} /> Review
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-dark-400 text-sm text-center py-8">No complaint reports</p>
        )}
      </div>

      {/* Suspended listings */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-border flex items-center gap-2">
          <ShieldOff size={15} className="text-dark-400" />
          <h2 className="font-semibold text-white">Suspended Listings ({suspended?.length ?? 0})</h2>
        </div>
        {suspended && suspended.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-dark-400 font-medium uppercase tracking-wide border-b border-surface-border">
                  <th className="px-4 py-3">Listing</th>
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Seller</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {suspended.map((item: any) => {
                  const seller = item.profiles as any;
                  return (
                    <tr key={item.id} className="border-b border-surface-border">
                      <td className="px-4 py-3 text-sm text-white">{item.title_uz ?? item.title_en}</td>
                      <td className="px-4 py-3 text-sm text-dark-200 capitalize">{item.pubg_rank?.replace('_', ' ')}</td>
                      <td className="px-4 py-3 text-sm text-white">{Number(item.price).toLocaleString()} UZS</td>
                      <td className="px-4 py-3">
                        <span className={`text-sm ${seller?.is_banned ? 'text-accent-red' : 'text-white'}`}>
                          {seller?.username}
                          {seller?.is_banned && ' (banned)'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-dark-400">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-dark-400 text-sm text-center py-8">No suspended listings</p>
        )}
      </div>
    </div>
  );
}
