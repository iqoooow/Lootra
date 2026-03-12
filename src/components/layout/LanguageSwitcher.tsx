'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';
import type { Locale } from '@/i18n/request';

export function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (locale: Locale) => {
    // Replace current locale prefix with new one
    const newPath = pathname.replace(`/${currentLocale}`, `/${locale}`);
    router.push(newPath);
  };

  return (
    <div className="flex items-center gap-1 bg-surface-overlay border border-surface-border rounded-xl p-1">
      <Globe size={13} className="text-dark-300 ml-1.5" />
      {(['uz', 'en'] as Locale[]).map((loc) => (
        <button
          key={loc}
          onClick={() => switchLocale(loc)}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors uppercase ${
            currentLocale === loc
              ? 'bg-brand-500 text-dark-950'
              : 'text-dark-300 hover:text-white'
          }`}
        >
          {loc}
        </button>
      ))}
    </div>
  );
}
