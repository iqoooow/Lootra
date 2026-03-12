import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AccountsTable } from '@/components/admin/AccountsTable';

export default async function AdminAccountsPage({
  searchParams,
}: {
  searchParams: { status?: string; page?: string };
}) {
  const supabase = createServerSupabaseClient();
  const page = parseInt(searchParams.page ?? '1');
  const limit = 25;
  const offset = (page - 1) * limit;
  const status = searchParams.status ?? 'pending_review';

  const { data: accounts, count } = await supabase
    .from('accounts_for_sale')
    .select(`
      id, title, slug, price, pubg_rank, pubg_level, status, is_featured, view_count,
      images, created_at, updated_at,
      profiles!seller_id (id, username, display_name, seller_verified, seller_rating)
    `, { count: 'exact' })
    .eq('status', status)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-display font-bold text-white">Account Management</h1>
        <span className="badge-gold">{count ?? 0} accounts</span>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {['pending_review', 'active', 'sold', 'suspended', 'draft'].map((s) => (
          <a
            key={s}
            href={`/admin/accounts?status=${s}`}
            className={`badge cursor-pointer capitalize ${status === s ? 'badge-gold' : 'bg-surface-overlay text-dark-300 border border-surface-border'}`}
          >
            {s.replace('_', ' ')}
          </a>
        ))}
      </div>

      <AccountsTable
        accounts={accounts ?? []}
        total={count ?? 0}
        page={page}
        limit={limit}
        currentStatus={status}
      />
    </div>
  );
}
