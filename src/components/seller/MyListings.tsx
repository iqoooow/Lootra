'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Edit, Eye, Trash2, Star } from 'lucide-react';
import { useSupabase } from '@/hooks/useSupabase';
import { toast } from 'react-hot-toast';
import { formatPrice } from '@/utils/format';
import { RANK_LABELS, RANK_COLORS } from '@/utils/pubg';
import type { Locale } from '@/i18n/request';
import { cn } from '@/utils/cn';

export function MyListings({ listings, locale }: { listings: any[]; locale: Locale }) {
  const { supabase } = useSupabase();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const label = locale === 'uz' ? "Mening e'lonlarim" : 'My Listings';

  const deleteListing = async (id: string) => {
    if (!confirm(locale === 'uz' ? "O'chirilsinmi?" : 'Delete this listing?')) return;
    setDeletingId(id);
    const { error } = await supabase.from('accounts_for_sale').delete().eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success(locale === 'uz' ? "O'chirildi" : 'Deleted'); window.location.reload(); }
    setDeletingId(null);
  };

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-surface-border">
        <h2 className="font-semibold text-white">{label}</h2>
        <span className="badge-gold">{listings.length}</span>
      </div>

      {listings.length === 0 ? (
        <div className="p-8 text-center text-dark-400">
          <p>{locale === 'uz' ? "Hali e'lon qo'shilmagan" : 'No listings yet'}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border text-left bg-surface-overlay/30">
                {['Account', 'Rank', 'Price', 'Status', 'Views', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs font-semibold text-dark-300 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/50">
              {listings.map((listing) => {
                const title = locale === 'en' ? (listing.title_en ?? listing.title_uz) : listing.title_uz;
                return (
                  <tr key={listing.id} className="hover:bg-surface-overlay/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {listing.images?.[0] && (
                          <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0">
                            <Image src={listing.images[0]} alt="" width={36} height={36} className="object-cover" />
                          </div>
                        )}
                        <p className="font-medium text-white line-clamp-1 max-w-[180px]">{title ?? listing.title}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('badge', RANK_COLORS[listing.pubg_rank])}>
                        {RANK_LABELS[listing.pubg_rank]?.[locale] ?? listing.pubg_rank}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-brand-400">{formatPrice(listing.price)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('badge capitalize',
                        listing.status === 'active' ? 'badge-green' :
                        listing.status === 'pending_review' ? 'badge-gold' :
                        listing.status === 'sold' ? 'badge-blue' : 'badge-red'
                      )}>
                        {listing.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-dark-300">{listing.view_count.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/${locale}/akkaunt/${listing.slug}`}
                          target="_blank"
                          className="w-7 h-7 rounded-lg bg-surface-overlay text-dark-400 hover:text-white flex items-center justify-center"
                        >
                          <Eye size={12} />
                        </Link>
                        <Link
                          href={`/${locale}/seller-dashboard/edit/${listing.id}`}
                          className="w-7 h-7 rounded-lg bg-surface-overlay text-dark-400 hover:text-brand-400 flex items-center justify-center"
                        >
                          <Edit size={12} />
                        </Link>
                        {listing.status !== 'sold' && (
                          <button
                            onClick={() => deleteListing(listing.id)}
                            disabled={deletingId === listing.id}
                            className="w-7 h-7 rounded-lg bg-accent-red/10 text-accent-red/60 hover:text-accent-red hover:bg-accent-red/20 flex items-center justify-center transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
