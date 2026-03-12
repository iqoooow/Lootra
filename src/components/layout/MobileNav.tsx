'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, Zap, BookOpen, User } from 'lucide-react';
import type { Locale } from '@/i18n/request';
import { cn } from '@/utils/cn';

export function MobileNav({ locale }: { locale: Locale }) {
  const pathname = usePathname();

  const tabs = [
    { href: `/${locale}`, icon: Home, label: locale === 'uz' ? 'Bosh' : 'Home' },
    { href: `/${locale}/marketplace`, icon: ShoppingBag, label: locale === 'uz' ? 'Bozor' : 'Market' },
    { href: `/${locale}/uc-store`, icon: Zap, label: 'UC', highlight: true },
    { href: `/${locale}/guides`, icon: BookOpen, label: locale === 'uz' ? "Qo'l." : 'Guides' },
    { href: `/${locale}/profile`, icon: User, label: locale === 'uz' ? 'Profil' : 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-dark-900/95 backdrop-blur-md border-t border-surface-border pb-safe">
      <div className="flex items-center justify-around h-14">
        {tabs.map(({ href, icon: Icon, label, highlight }) => {
          const isActive = pathname === href || (href !== `/${locale}` && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors',
                isActive ? 'text-brand-400' : 'text-dark-400 hover:text-dark-200'
              )}
            >
              <div className={cn(
                'w-8 h-8 flex items-center justify-center rounded-xl transition-colors',
                isActive && 'bg-brand-500/15',
                highlight && !isActive && 'bg-brand-500 text-dark-950'
              )}>
                <Icon size={18} />
              </div>
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
