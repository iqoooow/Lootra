'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, ChevronDown, User, ShoppingCart, Bell,
  LogOut, Settings, LayoutDashboard, Shield
} from 'lucide-react';
import type { Locale } from '@/i18n/request';
import { useSupabase } from '@/hooks/useSupabase';
import { useAuthStore } from '@/store/authStore';
import { LanguageSwitcher } from './LanguageSwitcher';
import { cn } from '@/utils/cn';

interface NavbarProps {
  locale: Locale;
}

const navLinks = (locale: Locale) => [
  { href: `/${locale}`, labelKey: 'home' },
  { href: `/${locale}/marketplace`, labelKey: 'marketplace' },
  { href: `/${locale}/uc-store`, labelKey: 'ucStore' },
  {
    labelKey: 'more',
    children: [
      { href: `/${locale}/blog`, labelKey: 'blog' },
      { href: `/${locale}/guides`, labelKey: 'guides' },
      { href: `/${locale}/skins`, labelKey: 'skins' },
      { href: `/${locale}/leaderboard`, labelKey: 'leaderboard' },
      { href: `/${locale}/giveaways`, labelKey: 'giveaways' },
    ],
  },
];

export function Navbar({ locale }: NavbarProps) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const { user, profile } = useAuthStore();
  const { supabase } = useSupabase();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-dark-950/95 backdrop-blur-md border-b border-surface-border shadow-lg'
          : 'bg-transparent'
      )}
    >
      <nav className="container-page h-[var(--nav-height)] flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gold-gradient flex items-center justify-center">
            <span className="font-display font-bold text-dark-950 text-lg">S</span>
          </div>
          <span className="font-display font-bold text-xl text-white hidden sm:block">
            SHAX
            <span className="text-brand-500">.</span>UZ
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks(locale).map((link) =>
            link.children ? (
              <div
                key={link.labelKey}
                className="relative"
                onMouseEnter={() => setActiveDropdown(link.labelKey)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="nav-link flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-surface-overlay transition-colors">
                  {t(link.labelKey as any)}
                  <ChevronDown
                    size={14}
                    className={cn('transition-transform duration-200', activeDropdown === link.labelKey && 'rotate-180')}
                  />
                </button>

                <AnimatePresence>
                  {activeDropdown === link.labelKey && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-2 w-52 glass rounded-2xl border border-surface-border p-2 shadow-card"
                    >
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            'flex items-center px-3 py-2.5 rounded-xl text-sm transition-colors',
                            pathname === child.href
                              ? 'text-brand-400 bg-brand-500/10'
                              : 'text-dark-100 hover:text-white hover:bg-surface-overlay'
                          )}
                        >
                          {t(child.labelKey as any)}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                key={link.href}
                href={link.href!}
                className={cn(
                  'nav-link px-3 py-2 rounded-lg hover:bg-surface-overlay transition-colors',
                  pathname === link.href && 'nav-link-active'
                )}
              >
                {t(link.labelKey as any)}
              </Link>
            )
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher currentLocale={locale} />

          {user ? (
            <>
              {/* Notifications */}
              <button className="relative p-2 rounded-xl text-dark-200 hover:text-white hover:bg-surface-overlay transition-colors">
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-brand-500" />
              </button>

              {/* User menu */}
              <div
                className="relative"
                onMouseEnter={() => setActiveDropdown('user')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-surface-overlay transition-colors">
                  <div className="w-8 h-8 rounded-full bg-surface-overlay border border-surface-border overflow-hidden">
                    {profile?.avatar_url ? (
                      <Image src={profile.avatar_url} alt={profile.username} width={32} height={32} className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User size={16} className="text-dark-200" />
                      </div>
                    )}
                  </div>
                  <span className="hidden md:block text-sm font-medium text-white max-w-[100px] truncate">
                    {profile?.display_name ?? profile?.username}
                  </span>
                  <ChevronDown size={14} className="text-dark-300 hidden md:block" />
                </button>

                <AnimatePresence>
                  {activeDropdown === 'user' && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute top-full right-0 mt-2 w-56 glass rounded-2xl border border-surface-border p-2 shadow-card"
                    >
                      <div className="px-3 py-2 border-b border-surface-border mb-2">
                        <p className="text-sm font-semibold text-white">{profile?.display_name}</p>
                        <p className="text-xs text-dark-300">@{profile?.username}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs text-brand-400 font-semibold">
                            {Number(profile?.wallet_balance ?? 0).toLocaleString()} UZS
                          </span>
                        </div>
                      </div>

                      {[
                        { href: `/${locale}/profile`, icon: User, label: t('profile') },
                        { href: `/${locale}/seller-dashboard`, icon: LayoutDashboard, label: t('dashboard'), sellerOnly: true },
                        { href: `/${locale}/support`, icon: Settings, label: locale === 'uz' ? 'Sozlamalar' : 'Settings' },
                        ...(profile?.role === 'admin' ? [{ href: '/admin', icon: Shield, label: t('admin') }] : []),
                      ].map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-dark-100 hover:text-white hover:bg-surface-overlay transition-colors"
                        >
                          <item.icon size={15} />
                          {item.label}
                        </Link>
                      ))}

                      <hr className="border-surface-border my-2" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-accent-red hover:bg-accent-red/10 transition-colors"
                      >
                        <LogOut size={15} />
                        {t('logout')}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href={`/${locale}/auth/login`} className="btn-ghost btn-sm hidden sm:inline-flex">
                {t('login')}
              </Link>
              <Link href={`/${locale}/auth/register`} className="btn-primary btn-sm">
                {t('register')}
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            className="lg:hidden p-2 rounded-xl text-dark-200 hover:text-white hover:bg-surface-overlay transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-dark-950/98 backdrop-blur-md border-b border-surface-border overflow-hidden"
          >
            <div className="container-page py-4 flex flex-col gap-1">
              {navLinks(locale).flatMap((link) =>
                link.children
                  ? link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          'px-4 py-3 rounded-xl text-sm transition-colors',
                          pathname === child.href
                            ? 'text-brand-400 bg-brand-500/10'
                            : 'text-dark-100 hover:text-white hover:bg-surface-overlay'
                        )}
                      >
                        {t(child.labelKey as any)}
                      </Link>
                    ))
                  : [
                      <Link
                        key={link.href}
                        href={link.href!}
                        className={cn(
                          'px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                          pathname === link.href
                            ? 'text-brand-400 bg-brand-500/10'
                            : 'text-dark-100 hover:text-white hover:bg-surface-overlay'
                        )}
                      >
                        {t(link.labelKey as any)}
                      </Link>,
                    ]
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
