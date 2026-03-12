'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Check, X, Star, Eye } from 'lucide-react';
import { useSupabase } from '@/hooks/useSupabase';
import { toast } from 'react-hot-toast';
import { formatPrice } from '@/utils/format';
import { RANK_LABELS } from '@/utils/pubg';
import { cn } from '@/utils/cn';

export function AccountsTable({ accounts, total, page, limit, currentStatus }: {
  accounts: any[];
  total: number;
  page: number;
  limit: number;
  currentStatus: string;
}) {
  const { supabase } = useSupabase();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const updateStatus = async (id: string, status: string, featured?: boolean) => {
    setLoadingId(id);
    const update: Record<string, any> = { status };
    if (featured !== undefined) update.is_featured = featured;

    const { error } = await supabase.from('accounts_for_sale').update(update).eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success(`Account ${status}`);
      window.location.reload();
    }
    setLoadingId(null);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-surface-border text-left">
            {['Account', 'Seller', 'Rank/Level', 'Price', 'Status', 'Actions'].map((h) => (
              <th key={h} className="px-3 py-3 text-xs font-semibold text-dark-300 uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-border/50">
          {accounts.map((account) => (
            <tr key={account.id} className="hover:bg-surface-overlay/30 transition-colors">
              {/* Account */}
              <td className="px-3 py-3">
                <div className="flex items-center gap-3">
                  {account.images?.[0] && (
                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-surface-overlay">
                      <Image src={account.images[0]} alt="" width={40} height={40} className="object-cover w-full h-full" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-white line-clamp-1 max-w-[200px]">{account.title}</p>
                    <p className="text-xs text-dark-400">{account.view_count} views</p>
                  </div>
                </div>
              </td>

              {/* Seller */}
              <td className="px-3 py-3">
                <p className="text-white">{account.profiles?.username}</p>
                {account.profiles?.seller_verified && (
                  <span className="text-xs text-brand-400">✓ Verified</span>
                )}
              </td>

              {/* Rank/Level */}
              <td className="px-3 py-3">
                <p className="text-white capitalize">{RANK_LABELS[account.pubg_rank]?.en ?? account.pubg_rank}</p>
                <p className="text-xs text-dark-400">Lv. {account.pubg_level}</p>
              </td>

              {/* Price */}
              <td className="px-3 py-3">
                <p className="font-semibold text-brand-400">{formatPrice(account.price)}</p>
              </td>

              {/* Status */}
              <td className="px-3 py-3">
                <span className={cn(
                  'badge capitalize',
                  account.status === 'active' ? 'badge-green' :
                  account.status === 'pending_review' ? 'badge-gold' :
                  account.status === 'sold' ? 'badge-blue' : 'badge-red'
                )}>
                  {account.status.replace('_', ' ')}
                </span>
              </td>

              {/* Actions */}
              <td className="px-3 py-3">
                <div className="flex items-center gap-1.5">
                  {account.status === 'pending_review' && (
                    <>
                      <button
                        onClick={() => updateStatus(account.id, 'active')}
                        disabled={loadingId === account.id}
                        className="w-7 h-7 rounded-lg bg-accent-green/15 text-accent-green hover:bg-accent-green/25 flex items-center justify-center transition-colors"
                        title="Approve"
                      >
                        <Check size={13} />
                      </button>
                      <button
                        onClick={() => updateStatus(account.id, 'suspended')}
                        disabled={loadingId === account.id}
                        className="w-7 h-7 rounded-lg bg-accent-red/15 text-accent-red hover:bg-accent-red/25 flex items-center justify-center transition-colors"
                        title="Reject"
                      >
                        <X size={13} />
                      </button>
                    </>
                  )}
                  {account.status === 'active' && (
                    <button
                      onClick={() => updateStatus(account.id, 'active', !account.is_featured)}
                      className={cn(
                        'w-7 h-7 rounded-lg flex items-center justify-center transition-colors',
                        account.is_featured
                          ? 'bg-brand-500/20 text-brand-400'
                          : 'bg-surface-overlay text-dark-400 hover:text-brand-400'
                      )}
                      title="Toggle featured"
                    >
                      <Star size={13} fill={account.is_featured ? 'currentColor' : 'none'} />
                    </button>
                  )}
                  <a
                    href={`/uz/akkaunt/${account.slug}`}
                    target="_blank"
                    className="w-7 h-7 rounded-lg bg-surface-overlay text-dark-400 hover:text-white flex items-center justify-center transition-colors"
                  >
                    <Eye size={13} />
                  </a>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {accounts.length === 0 && (
        <div className="text-center py-12 text-dark-400">No accounts found</div>
      )}
    </div>
  );
}
