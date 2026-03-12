'use client';

import { useState } from 'react';
import { Zap, Star } from 'lucide-react';
import type { Locale } from '@/i18n/request';
import { formatPrice } from '@/utils/format';
import { cn } from '@/utils/cn';

interface UCPackageGridProps {
  packages: any[];
  locale: Locale;
}

export function UCPackageGrid({ packages, locale }: UCPackageGridProps) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {packages.map((pkg) => (
        <button
          key={pkg.id}
          onClick={() => setSelected(pkg.id)}
          className={cn(
            'relative card p-5 text-left transition-all duration-200 cursor-pointer',
            selected === pkg.id
              ? 'border-brand-500/60 bg-brand-500/5 shadow-glow-gold'
              : 'hover:border-brand-500/30'
          )}
        >
          {pkg.is_popular && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="badge-gold text-2xs px-2 flex items-center gap-1">
                <Star size={8} fill="currentColor" />
                {locale === 'uz' ? 'MASHHUR' : 'POPULAR'}
              </span>
            </div>
          )}

          {/* Selected indicator */}
          {selected === pkg.id && (
            <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-brand-500 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-dark-950" />
            </div>
          )}

          <div className="flex items-center gap-2 mb-3">
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center',
              selected === pkg.id ? 'bg-brand-500/20' : 'bg-surface-overlay'
            )}>
              <Zap size={18} className="text-brand-400" />
            </div>
          </div>

          <p className="text-2xl font-display font-bold text-white">
            {pkg.uc_amount.toLocaleString()}
          </p>
          <p className="text-xs text-dark-400 mb-2">UC</p>

          {pkg.bonus_uc > 0 && (
            <p className="text-xs text-accent-green mb-2">
              +{pkg.bonus_uc} {locale === 'uz' ? 'bonus UC' : 'bonus UC'}
            </p>
          )}

          {pkg.discount_pct > 0 && (
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-dark-500 line-through">{formatPrice(pkg.original_price)}</span>
              <span className="badge-red text-2xs px-1.5">-{pkg.discount_pct}%</span>
            </div>
          )}

          <p className="font-bold text-brand-400">{formatPrice(pkg.price_uzs)}</p>
          <p className="text-2xs text-dark-500">UZS</p>
        </button>
      ))}
    </div>
  );
}
