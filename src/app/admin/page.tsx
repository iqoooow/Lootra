import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AdminStatCard } from '@/components/admin/AdminStatCard';
import { RecentActivityTable } from '@/components/admin/RecentActivityTable';
import { PendingAccountsTable } from '@/components/admin/PendingAccountsTable';
import {
  Users, ShoppingBag, TrendingUp, DollarSign,
  AlertTriangle, Clock, CheckCircle, Package
} from 'lucide-react';

export default async function AdminDashboardPage() {
  const supabase = createServerSupabaseClient();

  const [
    { count: totalUsers },
    { count: totalAccounts },
    { count: pendingAccounts },
    { count: totalOrders },
    { count: openTickets },
    { data: revenueData },
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('accounts_for_sale').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('accounts_for_sale').select('id', { count: 'exact', head: true }).eq('status', 'pending_review'),
    supabase.from('orders').select('id', { count: 'exact', head: true }),
    supabase.from('support_tickets').select('id', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('orders').select('total_amount').eq('status', 'completed'),
  ]);

  const totalRevenue = (revenueData ?? []).reduce((sum, o) => sum + Number(o.total_amount), 0);
  const platformRevenue = totalRevenue * 0.08;

  const stats = [
    { label: 'Total Users', value: (totalUsers ?? 0).toLocaleString(), icon: Users, color: 'text-accent-blue', trend: '+12%' },
    { label: 'Active Listings', value: (totalAccounts ?? 0).toLocaleString(), icon: ShoppingBag, color: 'text-brand-400', trend: '+5%' },
    { label: 'Total Orders', value: (totalOrders ?? 0).toLocaleString(), icon: Package, color: 'text-accent-green', trend: '+18%' },
    { label: 'Platform Revenue', value: platformRevenue.toLocaleString('uz-UZ') + ' UZS', icon: DollarSign, color: 'text-accent-purple', trend: '+22%' },
    { label: 'Pending Review', value: (pendingAccounts ?? 0).toLocaleString(), icon: Clock, color: 'text-brand-400', urgent: (pendingAccounts ?? 0) > 10 },
    { label: 'Open Tickets', value: (openTickets ?? 0).toLocaleString(), icon: AlertTriangle, color: 'text-accent-red', urgent: (openTickets ?? 0) > 5 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Dashboard Overview</h1>
        <p className="text-dark-300 text-sm mt-1">Welcome to the Shax Admin Panel</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <AdminStatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending accounts */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Pending Reviews</h2>
            <span className="badge-gold">{pendingAccounts ?? 0}</span>
          </div>
          <PendingAccountsTable />
        </div>

        {/* Recent activity */}
        <div className="card p-5">
          <h2 className="font-semibold text-white mb-4">Recent Orders</h2>
          <RecentActivityTable />
        </div>
      </div>
    </div>
  );
}
