'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ArrowRight, ShoppingBag, Zap, Shield, Star } from 'lucide-react';
import type { Locale } from '@/i18n/request';
import { CounterAnimation } from '@/components/ui/CounterAnimation';

interface HeroProps {
  locale: Locale;
  stats: { active_listings: number; total_sold: number } | null;
}

export function HeroSection({ locale, stats }: HeroProps) {
  const t = useTranslations('home.hero');

  const heroStats = [
    { value: stats?.active_listings ?? 1240, suffix: '+', label: t('stats.accounts'), icon: ShoppingBag },
    { value: 48000, suffix: '+', label: t('stats.users'), icon: Star },
    { value: stats?.total_sold ?? 12000, suffix: '+', label: t('stats.trades'), icon: Shield },
    { value: 380, suffix: '+', label: t('stats.sellers'), icon: Zap },
  ];

  return (
    <section className="relative min-h-[90dvh] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-dark-gradient" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(245,184,0,0.08),transparent)]" />

      {/* Animated grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(245,184,0,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(245,184,0,0.5) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Hero decoration (right side) */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-r from-dark-950 via-dark-950/60 to-transparent z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_80%_50%,rgba(245,184,0,0.06),transparent)]" />
      </div>

      <div className="container-page relative z-10 py-20">
        <div className="max-w-2xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="badge-gold mb-6 inline-flex">
              <Zap size={10} />
              {locale === 'uz' ? 'O\'zbekistondagi #1 PUBG platforma' : '#1 PUBG Platform in Uzbekistan'}
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl xl:text-6xl font-display font-bold leading-tight mb-4"
          >
            {t('title')}{' '}
            <span className="text-gradient-gold glow-text-gold">{t('titleHighlight')}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-dark-200 text-base md:text-lg leading-relaxed mb-8 max-w-xl"
          >
            {t('subtitle')}
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap gap-3 mb-14"
          >
            <Link
              href={`/${locale}/marketplace`}
              className="btn-primary btn-lg group"
            >
              <ShoppingBag size={18} />
              {t('cta_primary')}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href={`/${locale}/uc-store`}
              className="btn-secondary btn-lg"
            >
              <Zap size={18} className="text-brand-400" />
              {t('cta_secondary')}
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
          >
            {heroStats.map(({ value, suffix, label, icon: Icon }) => (
              <div key={label} className="flex flex-col">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-2xl md:text-3xl font-display font-bold text-white">
                    <CounterAnimation target={value} />
                  </span>
                  <span className="text-brand-400 font-bold">{suffix}</span>
                </div>
                <span className="text-dark-300 text-xs mt-0.5">{label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-dark-400"
      >
        <div className="w-5 h-8 border-2 border-dark-400 rounded-full flex justify-center pt-1.5">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-1 h-2 bg-brand-500 rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
}
