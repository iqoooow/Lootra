import { createServerSupabaseClient } from '@/lib/supabase/server';
import { UsersTable } from '@/components/admin/UsersTable';

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { role?: string; page?: string; q?: string };
}) {
  const supabase = createServerSupabaseClient();
  const page = parseInt(searchParams.page ?? '1');
  const limit = 25;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, role, seller_verified, seller_rating, wallet_balance, total_purchases, seller_total_sales, is_banned, is_active, created_at', { count: 'exact' });

  if (searchParams.role) query = query.eq('role', searchParams.role);
  if (searchParams.q) query = query.ilike('username', `%${searchParams.q}%`);

  query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

  const { data: users, count } = await query;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-display font-bold text-white">User Management</h1>
        <span className="badge-blue">{count ?? 0} users</span>
      </div>

      <div className="flex gap-3 items-center">
        <input
          type="search"
          placeholder="Search by username..."
          defaultValue={searchParams.q}
          className="input max-w-xs"
          // Client-side would handle change, simplified for server component
        />
        <div className="flex gap-2">
          {['user', 'seller', 'admin', 'moderator'].map((role) => (
            <a
              key={role}
              href={`/admin/users?role=${role}`}
              className={`badge cursor-pointer capitalize ${searchParams.role === role ? 'badge-blue' : 'bg-surface-overlay text-dark-300 border border-surface-border'}`}
            >
              {role}
            </a>
          ))}
        </div>
      </div>

      <UsersTable users={users ?? []} total={count ?? 0} page={page} limit={limit} />
    </div>
  );
}
