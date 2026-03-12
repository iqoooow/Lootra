'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Ban, CheckCircle, ShieldCheck, User } from 'lucide-react';
import { useSupabase } from '@/hooks/useSupabase';
import { toast } from 'react-hot-toast';
import { formatPrice } from '@/utils/format';
import { cn } from '@/utils/cn';

export function UsersTable({ users, total, page, limit }: {
  users: any[];
  total: number;
  page: number;
  limit: number;
}) {
  const { supabase } = useSupabase();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const toggleBan = async (id: string, currentBan: boolean) => {
    setLoadingId(id);
    const { error } = await supabase
      .from('profiles')
      .update({ is_banned: !currentBan })
      .eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success(currentBan ? 'User unbanned' : 'User banned'); window.location.reload(); }
    setLoadingId(null);
  };

  const promoteToSeller = async (id: string) => {
    setLoadingId(id);
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'seller', seller_verified: true })
      .eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('Promoted to verified seller'); window.location.reload(); }
    setLoadingId(null);
  };

  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-surface-border text-left bg-surface-overlay/50">
            {['User', 'Role', 'Stats', 'Wallet', 'Status', 'Actions'].map((h) => (
              <th key={h} className="px-4 py-3 text-xs font-semibold text-dark-300 uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-border/50">
          {users.map((user) => (
            <tr key={user.id} className={cn('hover:bg-surface-overlay/30 transition-colors', user.is_banned && 'opacity-60')}>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface-overlay overflow-hidden shrink-0">
                    {user.avatar_url ? (
                      <Image src={user.avatar_url} alt={user.username} width={32} height={32} className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User size={14} className="text-dark-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-white">{user.display_name ?? user.username}</p>
                    <p className="text-xs text-dark-400">@{user.username}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className={cn('badge capitalize',
                  user.role === 'admin' ? 'badge-red' :
                  user.role === 'seller' ? 'badge-gold' :
                  'bg-surface-overlay text-dark-300 border border-surface-border'
                )}>
                  {user.role}
                </span>
                {user.seller_verified && <ShieldCheck size={12} className="text-brand-400 inline ml-1" />}
              </td>
              <td className="px-4 py-3 text-xs text-dark-300">
                <p>{user.total_purchases} purchases</p>
                {user.seller_total_sales > 0 && <p>{user.seller_total_sales} sales</p>}
              </td>
              <td className="px-4 py-3">
                <p className="text-white font-medium text-sm">{formatPrice(user.wallet_balance)}</p>
              </td>
              <td className="px-4 py-3">
                <span className={cn('badge', user.is_banned ? 'badge-red' : 'badge-green')}>
                  {user.is_banned ? 'Banned' : 'Active'}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  {user.role === 'user' && (
                    <button
                      onClick={() => promoteToSeller(user.id)}
                      disabled={loadingId === user.id}
                      className="px-2 py-1 rounded-lg text-xs bg-brand-500/15 text-brand-400 hover:bg-brand-500/25 transition-colors"
                    >
                      → Seller
                    </button>
                  )}
                  <button
                    onClick={() => toggleBan(user.id, user.is_banned)}
                    disabled={loadingId === user.id || user.role === 'admin'}
                    className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center transition-colors',
                      user.is_banned
                        ? 'bg-accent-green/15 text-accent-green hover:bg-accent-green/25'
                        : 'bg-accent-red/15 text-accent-red hover:bg-accent-red/25'
                    )}
                  >
                    {user.is_banned ? <CheckCircle size={13} /> : <Ban size={13} />}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
