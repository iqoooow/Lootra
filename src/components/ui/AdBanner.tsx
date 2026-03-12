import { createServerSupabaseClient } from '@/lib/supabase/server';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/utils/cn';

interface AdBannerProps {
  placement: 'header' | 'sidebar' | 'content' | 'footer' | 'popup';
  className?: string;
}

export async function AdBanner({ placement, className }: AdBannerProps) {
  const supabase = createServerSupabaseClient();
  const now = new Date().toISOString();

  const { data: banner } = await supabase
    .from('ad_banners')
    .select('id, image_url, link_url, title')
    .eq('placement', placement)
    .eq('is_active', true)
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gte.${now}`)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!banner) return null;

  return (
    <div className={cn('relative overflow-hidden rounded-xl', className)}>
      <span className="absolute top-1 right-1 z-10 text-2xs text-dark-500 bg-dark-900/80 px-1.5 py-0.5 rounded">
        AD
      </span>
      {banner.link_url ? (
        <Link href={banner.link_url} target="_blank" rel="noopener noreferrer sponsored">
          <Image
            src={banner.image_url}
            alt={banner.title}
            width={970}
            height={90}
            className="w-full h-auto object-cover"
          />
        </Link>
      ) : (
        <Image
          src={banner.image_url}
          alt={banner.title}
          width={970}
          height={90}
          className="w-full h-auto object-cover"
        />
      )}
    </div>
  );
}
