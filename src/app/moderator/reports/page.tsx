import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Flag, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const priorityColor: Record<string, string> = {
  urgent: 'badge-red',
  high:   'text-orange-400 bg-orange-400/10 border border-orange-400/30',
  medium: 'badge-gold',
  low:    'badge-blue',
};

export default async function ModeratorReportsPage() {
  const supabase = createServerSupabaseClient();

  const { data: tickets } = await supabase
    .from('support_tickets')
    .select(`
      id, subject, category, status, priority, created_at,
      profiles!user_id (username, display_name)
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  const open       = tickets?.filter((t) => t.status === 'open') ?? [];
  const inProgress = tickets?.filter((t) => t.status === 'in_progress') ?? [];
  const resolved   = tickets?.filter((t) => t.status === 'resolved') ?? [];

  function TicketRow({ ticket }: { ticket: any }) {
    const user = ticket.profiles as any;
    const date = new Date(ticket.created_at).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
    return (
      <tr className="border-b border-surface-border hover:bg-surface-overlay/50 transition-colors">
        <td className="px-4 py-3">
          <div>
            <p className="text-sm font-medium text-white">{ticket.subject}</p>
            <p className="text-xs text-dark-400 capitalize">{ticket.category?.replace('_', ' ')}</p>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-white">
          {user?.display_name ?? user?.username}
        </td>
        <td className="px-4 py-3">
          <span className={`badge text-xs ${priorityColor[ticket.priority] ?? 'badge-blue'}`}>
            {ticket.priority}
          </span>
        </td>
        <td className="px-4 py-3">
          <span className={`badge text-xs ${
            ticket.status === 'open'        ? 'badge-red' :
            ticket.status === 'in_progress' ? 'badge-gold' : 'badge-green'
          }`}>
            {ticket.status?.replace('_', ' ')}
          </span>
        </td>
        <td className="px-4 py-3 text-xs text-dark-400">{date}</td>
        <td className="px-4 py-3">
          <a href={`/moderator/reports/${ticket.id}`} className="btn-secondary btn-sm">
            View
          </a>
        </td>
      </tr>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Reports & Tickets</h1>
          <p className="text-dark-300 text-sm mt-1">Handle user complaints and reports</p>
        </div>
        <div className="flex gap-3">
          <span className="badge-red">{open.length} open</span>
          <span className="badge-gold">{inProgress.length} in progress</span>
          <span className="badge-green">{resolved.length} resolved</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Open', value: open.length, icon: AlertTriangle, color: 'text-accent-red' },
          { label: 'In Progress', value: inProgress.length, icon: Clock, color: 'text-brand-400' },
          { label: 'Resolved', value: resolved.length, icon: CheckCircle, color: 'text-accent-green' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-dark-800 flex items-center justify-center">
              <Icon size={18} className={color} />
            </div>
            <div>
              <p className="text-xl font-display font-bold text-white">{value}</p>
              <p className="text-dark-400 text-xs">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* All tickets table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-border flex items-center gap-2">
          <Flag size={15} className="text-accent-red" />
          <h2 className="font-semibold text-white">All Reports</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-dark-400 font-medium uppercase tracking-wide border-b border-surface-border">
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets && tickets.length > 0
                ? tickets.map((t) => <TicketRow key={t.id} ticket={t} />)
                : <tr><td colSpan={6} className="px-4 py-8 text-center text-dark-400 text-sm">No reports found</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
