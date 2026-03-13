import { createServerSupabaseClient } from '@/lib/supabase/server';
import { MessageSquare, Eye, Trash2 } from 'lucide-react';

export default async function ModeratorCommentsPage() {
  const supabase = createServerSupabaseClient();

  // Comments live in ticket_messages — also covers any review comments flagged
  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      id, rating, comment, is_hidden, is_verified, created_at,
      profiles!reviewer_id (username, display_name)
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Moderate Comments</h1>
        <p className="text-dark-300 text-sm mt-1">Review and moderate seller reviews and comments</p>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-border flex items-center gap-2">
          <MessageSquare size={15} className="text-accent-blue" />
          <h2 className="font-semibold text-white">All Reviews ({reviews?.length ?? 0})</h2>
        </div>

        {reviews && reviews.length > 0 ? (
          <div className="divide-y divide-surface-border">
            {reviews.map((review: any) => {
              const reviewer = review.profiles as any;
              const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
              return (
                <div key={review.id} className={`px-5 py-4 ${review.is_hidden ? 'opacity-50' : ''}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white">
                          {reviewer?.display_name ?? reviewer?.username}
                        </span>
                        <span className="text-brand-400 text-sm">{stars}</span>
                        {review.is_hidden && (
                          <span className="badge-red text-xs">Hidden</span>
                        )}
                        {!review.is_verified && (
                          <span className="badge text-xs bg-dark-700 text-dark-300">Unverified</span>
                        )}
                      </div>
                      <p className="text-dark-200 text-sm leading-relaxed">
                        {review.comment ?? <em className="text-dark-400">No comment</em>}
                      </p>
                      <p className="text-dark-500 text-xs mt-1">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button className="p-1.5 text-dark-400 hover:text-white transition-colors" title="View">
                        <Eye size={14} />
                      </button>
                      <button className="p-1.5 text-dark-400 hover:text-accent-red transition-colors" title="Hide">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-dark-400 text-sm text-center py-12">No reviews found</p>
        )}
      </div>
    </div>
  );
}
