import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Clock } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Locale } from '@/i18n/request';
import { formatRelativeTime } from '@/utils/format';

export async function BlogHighlights({ locale }: { locale: Locale }) {
  const supabase = createServerSupabaseClient();
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('id, slug, category, title_uz, title_en, cover_image, read_time_min, published_at')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(3);

  if (!posts?.length) return null;

  const blogPath = 'blog';

  return (
    <section className="py-16 container-page">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="section-title">
            {locale === 'uz' ? 'So\'nggi yangiliklar' : 'Latest News'}
          </h2>
          <div className="section-divider" />
        </div>
        <Link href={`/${locale}/${blogPath}`} className="btn-ghost btn-sm hidden sm:inline-flex">
          {locale === 'uz' ? 'Barchasini ko\'rish' : 'See All'}
          <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => {
          const title = locale === 'en' ? (post.title_en ?? post.title_uz) : post.title_uz;
          return (
            <Link
              key={post.id}
              href={`/${locale}/${blogPath}/${post.slug}`}
              className="card-hover overflow-hidden group"
            >
              <div className="aspect-video bg-surface-overlay relative overflow-hidden">
                {post.cover_image ? (
                  <Image
                    src={post.cover_image}
                    alt={title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-accent-purple/10 flex items-center justify-center">
                    <span className="text-4xl">📰</span>
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className="badge-gold capitalize">{post.category.replace('_', ' ')}</span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2 group-hover:text-brand-300 transition-colors mb-3">
                  {title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-dark-400">
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {post.read_time_min} {locale === 'uz' ? 'daqiqa' : 'min'}
                  </span>
                  {post.published_at && (
                    <span>{formatRelativeTime(post.published_at, locale)}</span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
