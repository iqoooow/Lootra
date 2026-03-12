import type { Locale } from '@/i18n/request';
import { formatPrice, formatRelativeTime } from '@/utils/format';
import { cn } from '@/utils/cn';
import { Package } from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
  completed: 'badge-green',
  pending: 'badge-gold',
  cancelled: 'badge-red',
  processing: 'badge-blue',
  paid: 'badge-blue',
};

export function RecentOrders({ orders, locale }: { orders: any[]; locale: Locale }) {
  const label = locale === 'uz' ? "So'nggi buyurtmalar" : 'Recent Orders';

  return (
    <div className="card p-5 h-full">
      <h2 className="font-semibold text-white mb-4">{label}</h2>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-dark-400">
          <Package size={32} className="mb-2" />
          <p className="text-sm">{locale === 'uz' ? "Buyurtma yo'q" : 'No orders yet'}</p>
        </div>
      ) : (
        <div className="space-y-2 overflow-y-auto max-h-[280px]">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-overlay border border-surface-border/50">
              <div>
                <p className="text-xs font-mono text-dark-300">{order.order_number ?? order.id.slice(0, 8)}</p>
                <p className="text-xs text-dark-400 capitalize">{order.order_type}</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-white">{formatPrice(order.total_amount)}</p>
                <span className={cn('badge text-2xs', STATUS_STYLES[order.status] ?? 'badge-gold')}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
