'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, Eye, Zap, Star, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import type { Locale } from '@/i18n/request';
import { cn } from '@/utils/cn';
import { formatPrice } from '@/utils/format';
import { RANK_LABELS, RANK_COLORS } from '@/utils/pubg';

interface AccountCardProps {
  account: {
    id: string;
    slug: string;
    price: number;
    pubg_rank: string;
    pubg_level: number;
    uc_balance: number;
    skin_count: number;
    legendary_count: number;
    images: string[];
    is_featured: boolean;
    view_count: number;
    title_uz?: string;
    title_en?: string;
    profiles?: {
      username: string;
      display_name?: string;
      avatar_url?: string;
      seller_rating?: number;
      seller_verified?: boolean;
    };
  };
  locale: Locale;
  className?: string;
}

export function AccountCard({ account, locale, className }: AccountCardProps) {
  const [saved, setSaved] = useState(false);
  const title = locale === 'en' ? (account.title_en ?? account.title_uz) : account.title_uz;
  const seller = account.profiles;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn('card-hover relative overflow-hidden group', className)}
    >
      {/* Featured badge */}
      {account.is_featured && (
        <div className="absolute top-2.5 left-2.5 z-10 badge-gold">
          <Star size={9} fill="currentColor" />
          {locale === 'uz' ? 'Tanlangan' : 'Featured'}
        </div>
      )}

      {/* Save button */}
      <button
        onClick={(e) => { e.preventDefault(); setSaved(!saved); }}
        className={cn(
          'absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-xl flex items-center justify-center',
          'bg-dark-900/70 backdrop-blur-sm border border-white/10 transition-colors',
          saved ? 'text-accent-red border-accent-red/30' : 'text-dark-300 hover:text-white'
        )}
        aria-label="Save account"
      >
        <Heart size={14} fill={saved ? 'currentColor' : 'none'} />
      </button>

      {/* Image */}
      <Link href={`/${locale}/${locale === 'uz' ? 'akkaunt' : 'account'}/${account.slug}`}>
        <div className="aspect-card bg-surface-overlay relative overflow-hidden">
          {account.images[0] ? (
            <Image
              src={account.images[0]}
              alt={title ?? 'PUBG Account'}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl">🎮</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 via-transparent to-transparent" />

          {/* Rank badge on image */}
          <div className={cn('absolute bottom-2.5 left-2.5 badge', RANK_COLORS[account.pubg_rank])}>
            {RANK_LABELS[account.pubg_rank]?.[locale] ?? account.pubg_rank}
          </div>

          {/* View count */}
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 text-dark-300 text-xs">
            <Eye size={10} />
            {account.view_count.toLocaleString()}
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <Link href={`/${locale}/${locale === 'uz' ? 'akkaunt' : 'account'}/${account.slug}`}>
          <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2 hover:text-brand-300 transition-colors mb-3">
            {title}
          </h3>
        </Link>

        {/* Stats row */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="flex items-center gap-1 text-xs text-dark-300">
            <span className="text-brand-400 font-mono">Lv.{account.pubg_level}</span>
          </span>
          {account.uc_balance > 0 && (
            <span className="flex items-center gap-1 text-xs text-dark-300">
              <Zap size={10} className="text-brand-400" />
              {account.uc_balance.toLocaleString()} UC
            </span>
          )}
          {account.legendary_count > 0 && (
            <span className="flex items-center gap-1 text-xs text-accent-purple">
              ✦ {account.legendary_count}
            </span>
          )}
          <span className="text-xs text-dark-300">
            {account.skin_count} {locale === 'uz' ? 'skin' : 'skins'}
          </span>
        </div>

        {/* Seller */}
        {seller && (
          <div className="flex items-center gap-1.5 mb-3">
            <div className="w-5 h-5 rounded-full bg-surface-overlay overflow-hidden border border-surface-border">
              {seller.avatar_url ? (
                <Image src={seller.avatar_url} alt={seller.username} width={20} height={20} className="object-cover" />
              ) : (
                <div className="w-full h-full bg-brand-500/20" />
              )}
            </div>
            <span className="text-xs text-dark-300 truncate">{seller.display_name ?? seller.username}</span>
            {seller.seller_verified && <ShieldCheck size={11} className="text-brand-400 shrink-0" />}
            {seller.seller_rating && (
              <span className="text-xs text-brand-400 ml-auto shrink-0 flex items-center gap-0.5">
                <Star size={9} fill="currentColor" />
                {seller.seller_rating.toFixed(1)}
              </span>
            )}
          </div>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="price-tag text-lg">{formatPrice(account.price)}</p>
            <p className="text-dark-400 text-xs">{locale === 'uz' ? "so'm" : 'UZS'}</p>
          </div>
          <Link
            href={`/${locale}/${locale === 'uz' ? 'akkaunt' : 'account'}/${account.slug}`}
            className="btn-primary btn-sm shrink-0"
          >
            {locale === 'uz' ? 'Sotib olish' : 'Buy Now'}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
