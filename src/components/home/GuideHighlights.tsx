import Link from 'next/link';
import { ArrowRight, BookOpen, ThumbsUp } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Locale } from '@/i18n/request';
import { cn } from '@/utils/cn';

const DIFFICULTY_COLORS = {
  beginner:     'bg-accent-green/15 text-accent-green border border-accent-green/30',
  intermediate: 'bg-brand-500/15 text-brand-400 border border-brand-500/30',
  advanced:     'bg-accent-red/15 text-accent-red border border-accent-red/30',
};

export async function GuideHighlights({ locale }: { locale: Locale }) {
  const supabase = createServerSupabaseClient();
  const { data: guides } = await supabase
    .from('guides')
    .select('id, slug, category, difficulty, title_uz, title_en, cover_image, view_count, like_count')
    .eq('is_published', true)
    .order('view_count', { ascending: false })
    .limit(4);

  if (!guides?.length) return null;

  const guidesPath = 'guides';

  return (
    <section className="py-16 bg-dark-900/50">
      <div className="container-page">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="section-title">
              {locale === 'uz' ? 'Mashhur qo\'llanmalar' : 'Popular Guides'}
            </h2>
            <div className="section-divider" />
          </div>
          <Link href={`/${locale}/${guidesPath}`} className="btn-ghost btn-sm hidden sm:inline-flex">
            {locale === 'uz' ? 'Barchasini ko\'rish' : 'See All'}
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {guides.map((guide) => {
            const title = locale === 'en' ? (guide.title_en ?? guide.title_uz) : guide.title_uz;
            return (
              <Link
                key={guide.id}
                href={`/${locale}/${guidesPath}/${guide.slug}`}
                className="card-hover p-5 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
                    <BookOpen size={18} className="text-brand-400" />
                  </div>
                  <span className={cn('badge text-2xs', DIFFICULTY_COLORS[guide.difficulty as keyof typeof DIFFICULTY_COLORS])}>
                    {guide.difficulty}
                  </span>
                </div>

                <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2 group-hover:text-brand-300 transition-colors mb-3">
                  {title}
                </h3>

                <div className="flex items-center gap-3 text-xs text-dark-400">
                  <span>{guide.view_count.toLocaleString()} {locale === 'uz' ? 'ko\'rish' : 'views'}</span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp size={10} />
                    {guide.like_count.toLocaleString()}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
