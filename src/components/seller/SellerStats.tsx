import { ShoppingBag, DollarSign, Star, Package, TrendingUp, Eye } from 'lucide-react';
import type { Locale } from '@/i18n/request';
import { formatPrice } from '@/utils/format';

interface SellerStatsProps {
  locale: Locale;
  totalListings: number;
  activeListings: number;
  totalOrders: number;
  totalEarnings: number;
  netEarnings: number;
  rating: number;
  reviewCount: number;
}

export function SellerStats({
  locale, totalListings, activeListings, totalOrders,
  totalEarnings, netEarnings, rating, reviewCount,
}: SellerStatsProps) {
  const l = locale === 'uz' ? {
    listings: "E'lonlar", active: 'Faol', orders: 'Buyurtmalar',
    earnings: 'Daromad', net: 'Sof daromad', rating: 'Reyting', reviews: 'Sharhlar'
  } : {
    listings: 'Listings', active: 'Active', orders: 'Orders',
    earnings: 'Revenue', net: 'Net Earnings', rating: 'Rating', reviews: 'Reviews'
  };

  const stats = [
    { icon: ShoppingBag, label: l.listings, value: totalListings.toString(), sub: `${activeListings} ${l.active}`, color: 'text-brand-400' },
    { icon: Package, label: l.orders, value: totalOrders.toString(), color: 'text-accent-blue' },
    { icon: DollarSign, label: l.earnings, value: formatPrice(totalEarnings), sub: `${l.net}: ${formatPrice(netEarnings)}`, color: 'text-accent-green' },
    { icon: Star, label: l.rating, value: rating.toFixed(1), sub: `${reviewCount} ${l.reviews}`, color: 'text-brand-400' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(({ icon: Icon, label, value, sub, color }) => (
        <div key={label} className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
              <Icon size={18} className={color} />
            </div>
          </div>
          <p className="text-2xl font-display font-bold text-white">{value}</p>
          <p className="text-sm text-dark-300 mt-0.5">{label}</p>
          {sub && <p className="text-xs text-dark-500 mt-0.5">{sub}</p>}
        </div>
      ))}
    </div>
  );
}
