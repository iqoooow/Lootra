'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Locale } from '@/i18n/request';
import { cn } from '@/utils/cn';

interface PaginationProps {
  total: number;
  page: number;
  limit: number;
  locale: Locale;
}

export function Pagination({ total, page, limit, locale }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(total / limit);

  if (totalPages <= 1) return null;

  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', p.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    if (totalPages <= 7) return i + 1;
    if (page <= 4) return i + 1;
    if (page >= totalPages - 3) return totalPages - 6 + i;
    return page - 3 + i;
  });

  return (
    <div className="flex items-center justify-center gap-1.5">
      <button
        onClick={() => goToPage(page - 1)}
        disabled={page === 1}
        className="w-9 h-9 rounded-xl flex items-center justify-center text-dark-300 hover:text-white hover:bg-surface-overlay disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => goToPage(p)}
          className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center text-sm font-medium transition-colors',
            p === page
              ? 'bg-brand-500 text-dark-950'
              : 'text-dark-300 hover:text-white hover:bg-surface-overlay'
          )}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => goToPage(page + 1)}
        disabled={page === totalPages}
        className="w-9 h-9 rounded-xl flex items-center justify-center text-dark-300 hover:text-white hover:bg-surface-overlay disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={16} />
      </button>

      <span className="text-xs text-dark-400 ml-2">
        {locale === 'uz' ? `${total} dan ${((page-1)*limit)+1}-${Math.min(page*limit,total)}` : `${((page-1)*limit)+1}-${Math.min(page*limit,total)} of ${total}`}
      </span>
    </div>
  );
}
