import { createServerSupabaseClient } from '@/lib/supabase/server';
import { formatPrice, formatRelativeTime } from '@/utils/format';
import { cn } from '@/utils/cn';

export async function RecentActivityTable() {
  const supabase = createServerSupabaseClient();
  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, total_amount, status, order_type, created_at, profiles!buyer_id(username)')
    .order('created_at', { ascending: false })
    .limit(8);

  const STATUS_STYLE: Record<string, string> = {
    completed: 'badge-green',
    pending: 'badge-gold',
    cancelled: 'badge-red',
    processing: 'badge-blue',
    paid: 'badge-blue',
  };

  return (
    <div className="space-y-2">
      {(orders ?? []).map((order) => (
        <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-overlay border border-surface-border/50">
          <div>
            <p className="text-xs font-mono text-dark-300">{order.order_number}</p>
            <p className="text-xs text-dark-400">
              @{(order.profiles as any)?.username} · {order.order_type}
            </p>
          </div>
          <div className="flex items-center gap-2 text-right">
            <div>
              <p className="text-sm font-semibold text-white">{formatPrice(order.total_amount)}</p>
              <p className="text-xs text-dark-500">{formatRelativeTime(order.created_at, 'en')}</p>
            </div>
            <span className={cn('badge', STATUS_STYLE[order.status] ?? 'badge-gold')}>{order.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
