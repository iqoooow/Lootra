import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Image, Plus, Eye, MousePointer, Calendar, CheckCircle, XCircle } from 'lucide-react';

export default async function AdminAdsPage() {
  const supabase = createServerSupabaseClient();

  const { data: ads } = await supabase
    .from('ad_banners')
    .select('*')
    .order('created_at', { ascending: false });

  const active   = ads?.filter((a) => a.is_active) ?? [];
  const inactive = ads?.filter((a) => !a.is_active) ?? [];

  const totalViews  = ads?.reduce((s, a) => s + (a.view_count ?? 0), 0) ?? 0;
  const totalClicks = ads?.reduce((s, a) => s + (a.click_count ?? 0), 0) ?? 0;
  const avgCtr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : '0.00';

  const placementColor: Record<string, string> = {
    header:  'badge-blue',
    sidebar: 'badge-purple',
    content: 'badge-gold',
    footer:  'badge text-dark-300 bg-dark-700',
    popup:   'badge-red',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Advertising Banners</h1>
          <p className="text-dark-300 text-sm mt-1">Manage ad placements and track performance</p>
        </div>
        <a href="/admin/ads/new" className="btn-primary btn-sm">
          <Plus size={14} /> New Ad
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Ads',    value: active.length,           icon: CheckCircle,   color: 'text-accent-green' },
          { label: 'Total Views',   value: totalViews.toLocaleString(), icon: Eye,        color: 'text-accent-blue' },
          { label: 'Total Clicks',  value: totalClicks.toLocaleString(), icon: MousePointer, color: 'text-brand-400' },
          { label: 'Avg CTR',       value: `${avgCtr}%`,            icon: Calendar,      color: 'text-accent-purple' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-dark-400 text-xs font-medium uppercase tracking-wide">{label}</span>
              <div className="w-8 h-8 rounded-lg bg-dark-800 flex items-center justify-center">
                <Icon size={14} className={color} />
              </div>
            </div>
            <p className="text-2xl font-display font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Ads table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-border flex items-center gap-2">
          <Image size={15} className="text-brand-400" />
          <h2 className="font-semibold text-white">All Banners ({ads?.length ?? 0})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-dark-400 font-medium uppercase tracking-wide border-b border-surface-border">
                <th className="px-4 py-3">Ad</th>
                <th className="px-4 py-3">Placement</th>
                <th className="px-4 py-3">Views</th>
                <th className="px-4 py-3">Clicks</th>
                <th className="px-4 py-3">CTR</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ads && ads.length > 0 ? ads.map((ad) => {
                const ctr = ad.view_count > 0
                  ? ((ad.click_count / ad.view_count) * 100).toFixed(2) + '%'
                  : '0%';
                return (
                  <tr key={ad.id} className="border-b border-surface-border hover:bg-surface-overlay/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-8 rounded bg-dark-800 overflow-hidden shrink-0">
                          <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate max-w-[160px]">{ad.title}</p>
                          {ad.link_url && (
                            <a
                              href={ad.link_url}
                              target="_blank"
                              className="text-xs text-dark-400 hover:text-brand-400 truncate max-w-[160px] block"
                            >
                              {ad.link_url}
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs capitalize ${placementColor[ad.placement] ?? 'badge-blue'}`}>
                        {ad.placement}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-white">{ad.view_count.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-white">{ad.click_count.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-dark-200">{ctr}</td>
                    <td className="px-4 py-3">
                      {ad.is_active ? (
                        <span className="badge-green text-xs">Active</span>
                      ) : (
                        <span className="badge text-xs bg-dark-700 text-dark-300">Inactive</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <a href={`/admin/ads/${ad.id}/edit`} className="btn-secondary btn-sm text-xs">Edit</a>
                        <form action={`/api/admin/ads/toggle?id=${ad.id}`} method="POST">
                          <button type="submit" className="btn-ghost btn-sm text-xs">
                            {ad.is_active ? 'Disable' : 'Enable'}
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-dark-400 text-sm">
                    No ad banners yet. <a href="/admin/ads/new" className="text-brand-400 hover:underline">Create one</a>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
