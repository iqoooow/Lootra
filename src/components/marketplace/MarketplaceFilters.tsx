'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import type { Locale } from '@/i18n/request';
import { RANKS, SERVERS } from '@/utils/pubg';
import { cn } from '@/utils/cn';

interface MarketplaceFiltersProps {
  locale: Locale;
  currentFilters: {
    rank?: string;
    min_price?: string;
    max_price?: string;
    min_level?: string;
    server?: string;
    sort?: string;
  };
}

export function MarketplaceFilters({ locale, currentFilters }: MarketplaceFiltersProps) {
  const t = useTranslations('marketplace');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    rank: currentFilters.rank ?? '',
    min_price: currentFilters.min_price ?? '',
    max_price: currentFilters.max_price ?? '',
    min_level: currentFilters.min_level ?? '',
    server: currentFilters.server ?? '',
    sort: currentFilters.sort ?? 'newest',
  });

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    router.push(`${pathname}?${params.toString()}`);
  }, [filters, pathname, router]);

  const resetFilters = useCallback(() => {
    setFilters({ rank: '', min_price: '', max_price: '', min_level: '', server: '', sort: 'newest' });
    router.push(pathname);
  }, [pathname, router]);

  const hasActiveFilters = Object.entries(filters).some(
    ([key, value]) => value && !(key === 'sort' && value === 'newest')
  );

  return (
    <div className="card p-5 sticky top-24">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-brand-400" />
          <span className="font-semibold text-white">{t('filters.sort')}</span>
        </div>
        {hasActiveFilters && (
          <button onClick={resetFilters} className="flex items-center gap-1 text-xs text-dark-300 hover:text-white transition-colors">
            <X size={12} />
            {t('filters.reset')}
          </button>
        )}
      </div>

      <div className="flex flex-col gap-5">
        {/* Sort */}
        <FilterGroup label={t('filters.sort')}>
          <select
            value={filters.sort}
            onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
            className="input"
          >
            {Object.entries({
              newest: t('sort_options.newest'),
              price_asc: t('sort_options.price_asc'),
              price_desc: t('sort_options.price_desc'),
              rank_desc: t('sort_options.rank_desc'),
              popular: t('sort_options.popular'),
            }).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </FilterGroup>

        {/* Rank */}
        <FilterGroup label={t('filters.rank')}>
          <div className="flex flex-wrap gap-2">
            {RANKS.map((rank) => (
              <button
                key={rank.value}
                onClick={() => setFilters((f) => ({ ...f, rank: f.rank === rank.value ? '' : rank.value }))}
                className={cn(
                  'badge cursor-pointer transition-all',
                  filters.rank === rank.value
                    ? 'bg-brand-500/20 text-brand-300 border border-brand-500/50'
                    : 'bg-surface-overlay text-dark-300 border border-surface-border hover:border-brand-500/30'
                )}
              >
                {rank.label[locale]}
              </button>
            ))}
          </div>
        </FilterGroup>

        {/* Price range */}
        <FilterGroup label={locale === 'uz' ? "Narx (so'm)" : 'Price (UZS)'}>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder={t('filters.min_price')}
              value={filters.min_price}
              onChange={(e) => setFilters((f) => ({ ...f, min_price: e.target.value }))}
              className="input"
            />
            <input
              type="number"
              placeholder={t('filters.max_price')}
              value={filters.max_price}
              onChange={(e) => setFilters((f) => ({ ...f, max_price: e.target.value }))}
              className="input"
            />
          </div>
        </FilterGroup>

        {/* Min level */}
        <FilterGroup label={locale === 'uz' ? 'Min daraja' : 'Min Level'}>
          <input
            type="number"
            placeholder={locale === 'uz' ? 'Masalan: 30' : 'e.g. 30'}
            min={1} max={100}
            value={filters.min_level}
            onChange={(e) => setFilters((f) => ({ ...f, min_level: e.target.value }))}
            className="input"
          />
        </FilterGroup>

        {/* Server */}
        <FilterGroup label={t('filters.server')}>
          <div className="flex flex-wrap gap-2">
            {SERVERS.map((server) => (
              <button
                key={server.value}
                onClick={() => setFilters((f) => ({ ...f, server: f.server === server.value ? '' : server.value }))}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border',
                  filters.server === server.value
                    ? 'bg-brand-500/20 text-brand-300 border-brand-500/50'
                    : 'bg-surface-overlay text-dark-300 border-surface-border hover:border-brand-500/30'
                )}
              >
                {server.label}
              </button>
            ))}
          </div>
        </FilterGroup>

        <button onClick={applyFilters} className="btn-primary w-full">
          {t('filters.apply')}
        </button>
      </div>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-dark-300 uppercase tracking-wider mb-2">{label}</label>
      {children}
    </div>
  );
}
