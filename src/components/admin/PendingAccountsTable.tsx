import { createServerSupabaseClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { formatPrice } from '@/utils/format';
import { RANK_LABELS } from '@/utils/pubg';
import { ExternalLink } from 'lucide-react';

export async function PendingAccountsTable() {
  const supabase = createServerSupabaseClient();
  const { data: accounts } = await supabase
    .from('accounts_for_sale')
    .select('id, title, price, pubg_rank, pubg_level, created_at, profiles!seller_id(username)')
    .eq('status', 'pending_review')
    .order('created_at', { ascending: true })
    .limit(5);

  if (!accounts?.length) {
    return <p className="text-dark-400 text-sm text-center py-4">No pending accounts</p>;
  }

  return (
    <div className="space-y-2">
      {accounts.map((account) => (
        <div key={account.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-overlay border border-surface-border/50">
          <div>
            <p className="text-sm font-medium text-white line-clamp-1">{account.title}</p>
            <p className="text-xs text-dark-400">
              {RANK_LABELS[account.pubg_rank]?.en} · Lv.{account.pubg_level} · by @{(account.profiles as any)?.username}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-brand-400 text-sm font-semibold">{formatPrice(account.price)}</span>
            <Link href={`/admin/accounts?status=pending_review`} className="text-dark-400 hover:text-white transition-colors">
              <ExternalLink size={13} />
            </Link>
          </div>
        </div>
      ))}
      <Link href="/admin/accounts?status=pending_review" className="block text-center text-xs text-brand-400 hover:text-brand-300 transition-colors pt-1">
        View all pending →
      </Link>
    </div>
  );
}
