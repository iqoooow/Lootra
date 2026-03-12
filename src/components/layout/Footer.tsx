import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/i18n/request';
import { Shield, Zap, Star, MessageCircle, Send } from 'lucide-react';

export function Footer({ locale }: { locale: Locale }) {
  const t = useTranslations('nav');
  const year = new Date().getFullYear();

  const links = {
    marketplace: [
      { href: `/${locale}/marketplace`, label: t('marketplace') },
      { href: `/${locale}/uc-store`, label: t('ucStore') },
      { href: `/${locale}/skins`, label: t('skins') },
      { href: `/${locale}/leaderboard`, label: t('leaderboard') },
      { href: `/${locale}/giveaways`, label: t('giveaways') },
    ],
    learn: [
      { href: `/${locale}/guides`, label: t('guides') },
      { href: `/${locale}/blog`, label: t('blog') },
      { href: `/${locale}/account-value-checker`, label: locale === 'uz' ? 'Akkaunt qiymatini aniqlash' : 'Account Value Checker' },
    ],
    account: [
      { href: `/${locale}/profile`, label: t('profile') },
      { href: `/${locale}/seller-dashboard`, label: t('dashboard') },
      { href: `/${locale}/auth/register`, label: t('register') },
      { href: `/${locale}/support`, label: t('support') },
    ],
    legal: [
      { href: `/${locale}/terms`, label: locale === 'uz' ? 'Foydalanish shartlari' : 'Terms of Service' },
      { href: `/${locale}/privacy`, label: locale === 'uz' ? 'Maxfiylik siyosati' : 'Privacy Policy' },
      { href: `/${locale}/refund`, label: locale === 'uz' ? 'Qaytarish siyosati' : 'Refund Policy' },
    ],
  };

  return (
    <footer className="bg-dark-900 border-t border-surface-border mt-auto pb-20 lg:pb-0">
      <div className="container-page pt-16 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href={`/${locale}`} className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center">
                <span className="font-display font-bold text-dark-950 text-xl">S</span>
              </div>
              <span className="font-display font-bold text-2xl text-white">
                SHAX<span className="text-brand-500">.</span>UZ
              </span>
            </Link>
            <p className="text-dark-300 text-sm leading-relaxed max-w-xs mb-6">
              {locale === 'uz'
                ? "O'zbekistondagi eng ishonchli PUBG Mobile akkaunt va UC savdo platformasi."
                : "Uzbekistan's most trusted PUBG Mobile account and UC trading platform."}
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-3 mb-6">
              {[
                { icon: Shield, label: locale === 'uz' ? 'Xavfsiz to\'lov' : 'Secure Payment' },
                { icon: Zap, label: locale === 'uz' ? 'Tezkor yetkazish' : 'Fast Delivery' },
                { icon: Star, label: locale === 'uz' ? 'Tasdiqlangan' : 'Verified' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-overlay border border-surface-border text-xs text-dark-200">
                  <Icon size={12} className="text-brand-400" />
                  {label}
                </div>
              ))}
            </div>

            {/* Social links */}
            <div className="flex gap-3">
              <a
                href="https://t.me/shaxpubg"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-surface-overlay border border-surface-border flex items-center justify-center text-dark-200 hover:text-accent-blue hover:border-accent-blue/30 transition-colors"
                aria-label="Telegram"
              >
                <Send size={16} />
              </a>
              <a
                href="https://t.me/shaxpubgchat"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-surface-overlay border border-surface-border flex items-center justify-center text-dark-200 hover:text-accent-blue hover:border-accent-blue/30 transition-colors"
                aria-label="Telegram channel"
              >
                <MessageCircle size={16} />
              </a>
            </div>
          </div>

          {/* Links */}
          {[
            { title: locale === 'uz' ? 'Bozor' : 'Marketplace', links: links.marketplace },
            { title: locale === 'uz' ? "O'qish" : 'Learn', links: links.learn },
            { title: locale === 'uz' ? 'Akkaunt' : 'Account', links: links.account },
          ].map(({ title, links: colLinks }) => (
            <div key={title}>
              <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">{title}</h3>
              <ul className="flex flex-col gap-2.5">
                {colLinks.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-dark-300 hover:text-white text-sm transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="divider" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-dark-400 text-xs">
            © {year} Shax PUBG Marketplace.{' '}
            {locale === 'uz' ? 'Barcha huquqlar himoyalangan.' : 'All rights reserved.'}
          </p>
          <div className="flex gap-4">
            {links.legal.map(({ href, label }) => (
              <Link key={href} href={href} className="text-dark-400 hover:text-dark-200 text-xs transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
