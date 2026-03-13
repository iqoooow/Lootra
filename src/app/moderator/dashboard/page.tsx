import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  ShoppingBag, Flag, MessageSquare, AlertTriangle,
  Clock, CheckCircle, XCircle, TrendingUp
} from 'lucide-react';

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  urgent?: boolean;
}

function StatCard({ label, value, icon: Icon, color, urgent }: StatCard) {
  return (
    <div className={`card p-5 ${urgent ? 'border-accent-red/40' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-dark-400 text-xs font-medium uppercase tracking-wide">{label}</span>
        <div className={`w-8 h-8 rounded-lg bg-dark-800 flex items-center justify-center`}>
          <Icon size={15} className={color} />
        </div>
      </div>
      <p className={`text-2xl font-display font-bold ${urgent ? 'text-accent-red' : 'text-white'}`}>
        {value}
      </p>
    </div>
  );
}

export default async function ModeratorDashboardPage() {
  const supabase = createServerSupabaseClient();

  const [
    { count: pendingListings },
    { count: openReports },
    { count: totalApproved },
    { count: totalRejected },
  ] = await Promise.all([
    supabase.from('accounts_for_sale').select('id', { count: 'exact', head: true }).eq('status', 'pending_review'),
    supabase.from('support_tickets').select('id', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('accounts_for_sale').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('accounts_for_sale').select('id', { count: 'exact', head: true }).eq('status', 'suspended'),
  ]);

  const stats: StatCard[] = [
    {
      label: 'Pending Review',
      value: pendingListings ?? 0,
      icon: Clock,
      color: 'text-brand-400',
      urgent: (pendingListings ?? 0) > 5,
    },
    {
      label: 'Open Reports',
      value: openReports ?? 0,
      icon: Flag,
      color: 'text-accent-red',
      urgent: (openReports ?? 0) > 3,
    },
    {
      label: 'Approved Listings',
      value: (totalApproved ?? 0).toLocaleString(),
      icon: CheckCircle,
      color: 'text-accent-green',
    },
    {
      label: 'Suspended',
      value: totalRejected ?? 0,
      icon: XCircle,
      color: 'text-accent-red',
    },
  ];

  // Recent pending accounts
  const { data: recentPending } = await supabase
    .from('accounts_for_sale')
    .select(`
      id, title_uz, title_en, price, pubg_rank, created_at,
      profiles!seller_id (username, display_name)
    `)
    .eq('status', 'pending_review')
    .order('created_at', { ascending: true })
    .limit(10);

  // Recent reports
  const { data: recentReports } = await supabase
    .from('support_tickets')
    .select('id, subject, category, priority, created_at, profiles!user_id(username)')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Moderator Dashboard</h1>
        <p className="text-dark-300 text-sm mt-1">Review listings, handle reports, moderate content</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending Listings */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Pending Listings</h2>
            <span className="badge-gold">{pendingListings ?? 0}</span>
          </div>
          {recentPending && recentPending.length > 0 ? (
            <div className="space-y-2">
              {recentPending.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between py-2.5 border-b border-surface-border last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate">{item.title_uz ?? item.title_en}</p>
                    <p className="text-xs text-dark-400">
                      {(item.profiles as any)?.username} · {item.pubg_rank}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0 ml-2">
                    <a href={`/moderator/listings?id=${item.id}`} className="btn-secondary btn-sm">Review</a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-dark-400 text-sm text-center py-8">No pending listings</p>
          )}
        </div>

        {/* Open Reports */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Open Reports</h2>
            {(openReports ?? 0) > 0 && (
              <span className="badge-red">{openReports}</span>
            )}
          </div>
          {recentReports && recentReports.length > 0 ? (
            <div className="space-y-2">
              {recentReports.map((ticket: any) => (
                <div key={ticket.id} className="flex items-center justify-between py-2.5 border-b border-surface-border last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate">{ticket.subject}</p>
                    <p className="text-xs text-dark-400">
                      {(ticket.profiles as any)?.username} ·{' '}
                      <span className={`capitalize ${ticket.priority === 'urgent' ? 'text-accent-red' : 'text-dark-400'}`}>
                        {ticket.priority}
                      </span>
                    </p>
                  </div>
                  <a href={`/moderator/reports?id=${ticket.id}`} className="btn-secondary btn-sm shrink-0 ml-2">View</a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-dark-400 text-sm text-center py-8">No open reports</p>
          )}
        </div>
      </div>
    </div>
  );
}
