import Link from 'next/link';
import { Zap, ArrowRight } from 'lucide-react';
import type { Locale } from '@/i18n/request';
import { formatPrice } from '@/utils/format';

interface UCPromoProps {
  packages: any[];
  locale: Locale;
}

export function UCPromoSection({ packages, locale }: UCPromoProps) {
  if (!packages.length) return null;

  const ucPath = 'uc-store';

  return (
    <section className="bg-gradient-to-b from-dark-950 via-dark-900 to-dark-950 py-16">
      <div className="container-page">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Zap size={16} className="text-brand-400" />
              <span className="text-brand-400 text-sm font-semibold uppercase tracking-wider">
                {locale === 'uz' ? 'Tezkor yetkazib berish' : 'Instant Delivery'}
              </span>
            </div>
            <h2 className="section-title">
              {locale === 'uz' ? 'UC Do\'kon' : 'UC Store'}
            </h2>
            <div className="section-divider" />
          </div>
          <Link href={`/${locale}/${ucPath}`} className="btn-ghost btn-sm hidden sm:inline-flex">
            {locale === 'uz' ? 'Barchasini ko\'rish' : 'View All'}
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {packages.slice(0, 6).map((pkg) => (
            <Link
              key={pkg.id}
              href={`/${locale}/${ucPath}`}
              className="card-hover p-5 text-center group"
            >
              {pkg.is_popular && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                  <span className="badge-gold text-2xs px-2">
                    {locale === 'uz' ? 'MASHHUR' : 'POPULAR'}
                  </span>
                </div>
              )}

              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-brand-500/15 flex items-center justify-center group-hover:bg-brand-500/25 transition-colors">
                <Zap size={22} className="text-brand-400" />
              </div>

              <p className="font-display font-bold text-xl text-white">
                {pkg.uc_amount.toLocaleString()}
              </p>
              <p className="text-xs text-dark-300 mb-1">UC</p>

              {pkg.bonus_uc > 0 && (
                <p className="text-xs text-accent-green mb-2">+{pkg.bonus_uc} bonus</p>
              )}

              {pkg.discount_pct > 0 && (
                <div className="mb-2">
                  <span className="text-xs text-accent-red line-through text-dark-400">
                    {formatPrice(pkg.original_price)}
                  </span>
                  <span className="badge-red text-2xs ml-1">-{pkg.discount_pct}%</span>
                </div>
              )}

              <p className="font-bold text-brand-400 text-sm">
                {formatPrice(pkg.price_uzs)}
              </p>
              <p className="text-2xs text-dark-500">UZS</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
