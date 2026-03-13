import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Flag, AlertTriangle, CheckCircle, Clock, MessageSquare } from 'lucide-react';

export default async function AdminReportsPage() {
  const supabase = createServerSupabaseClient();

  const { data: tickets } = await supabase
    .from('support_tickets')
    .select(`
      id, subject, category, status, priority, created_at, resolved_at,
      profiles!user_id (username, display_name)
    `)
    .order('created_at', { ascending: false })
    .limit(200);

  const stats = {
    open:        tickets?.filter((t) => t.status === 'open').length ?? 0,
    in_progress: tickets?.filter((t) => t.status === 'in_progress').length ?? 0,
    resolved:    tickets?.filter((t) => t.status === 'resolved').length ?? 0,
    closed:      tickets?.filter((t) => t.status === 'closed').length ?? 0,
    urgent:      tickets?.filter((t) => t.priority === 'urgent').length ?? 0,
  };

  const priorityBadge: Record<string, string> = {
    urgent: 'badge-red',
    high:   'text-orange-400 bg-orange-400/10 border border-orange-400/30 badge',
    medium: 'badge-gold',
    low:    'badge-blue',
  };

  const statusBadge: Record<string, string> = {
    open:        'badge-red',
    in_progress: 'badge-gold',
    resolved:    'badge-green',
    closed:      'text-dark-400 bg-dark-700 badge',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Reports & Support</h1>
        <p className="text-dark-300 text-sm mt-1">All user reports and support tickets</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Open',        value: stats.open,        icon: AlertTriangle, color: 'text-accent-red',    urgent: stats.open > 5 },
          { label: 'In Progress', value: stats.in_progress, icon: Clock,         color: 'text-brand-400',     urgent: false },
          { label: 'Resolved',    value: stats.resolved,    icon: CheckCircle,   color: 'text-accent-green',  urgent: false },
          { label: 'Closed',      value: stats.closed,      icon: MessageSquare, color: 'text-dark-400',      urgent: false },
          { label: 'Urgent',      value: stats.urgent,      icon: Flag,          color: 'text-accent-red',    urgent: stats.urgent > 0 },
        ].map(({ label, value, icon: Icon, color, urgent }) => (
          <div key={label} className={`card p-5 ${urgent ? 'border-accent-red/30' : ''}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-dark-400 text-xs font-medium uppercase tracking-wide">{label}</span>
              <Icon size={14} className={color} />
            </div>
            <p className={`text-2xl font-display font-bold ${urgent ? 'text-accent-red' : 'text-white'}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Tickets table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-border">
          <h2 className="font-semibold text-white">All Tickets ({tickets?.length ?? 0})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-dark-400 font-medium uppercase tracking-wide border-b border-surface-border">
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets && tickets.length > 0 ? tickets.map((ticket) => {
                const user = ticket.profiles as any;
                return (
                  <tr key={ticket.id} className="border-b border-surface-border hover:bg-surface-overlay/50">
                    <td className="px-4 py-3 text-sm font-medium text-white max-w-[200px]">
                      <p className="truncate">{ticket.subject}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-dark-200">
                      {user?.display_name ?? user?.username}
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge text-xs badge-blue capitalize">
                        {ticket.category?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs capitalize ${priorityBadge[ticket.priority] ?? 'badge-blue'}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs capitalize ${statusBadge[ticket.status] ?? 'badge-blue'}`}>
                        {ticket.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-dark-400">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <a href={`/admin/reports/${ticket.id}`} className="btn-secondary btn-sm text-xs">
                        View
                      </a>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-dark-400 text-sm">No reports found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
