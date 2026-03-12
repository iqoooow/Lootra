'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Gift, ArrowRight, Clock } from 'lucide-react';
import type { Locale } from '@/i18n/request';

export function GiveawayBanner({ giveaway, locale }: { giveaway: any; locale: Locale }) {
  const path = 'giveaways';
  const endsAt = new Date(giveaway.ends_at);
  const now = new Date();
  const diffHours = Math.round((endsAt.getTime() - now.getTime()) / 3600000);

  return (
    <section className="py-6 container-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent-purple/20 via-brand-500/10 to-accent-blue/20 border border-accent-purple/30 p-6 md:p-8"
      >
        {/* Background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.1),transparent_70%)]" />

        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-accent-purple/20 border border-accent-purple/30 flex items-center justify-center shrink-0 animate-float">
              <Gift size={26} className="text-accent-purple" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="badge bg-accent-purple/20 text-accent-purple border border-accent-purple/30">
                  {locale === 'uz' ? 'SOVRIN' : 'GIVEAWAY'}
                </span>
                <span className="flex items-center gap-1 text-xs text-dark-300">
                  <Clock size={11} />
                  {diffHours}h {locale === 'uz' ? 'qoldi' : 'left'}
                </span>
              </div>
              <h3 className="font-display font-bold text-white text-lg">
                {locale === 'uz' ? giveaway.title_uz : (giveaway.title_en ?? giveaway.title_uz)}
              </h3>
              {giveaway.prize_uc_amount && (
                <p className="text-dark-300 text-sm mt-1">
                  🎁 {giveaway.prize_uc_amount.toLocaleString()} UC
                </p>
              )}
              <p className="text-dark-400 text-xs mt-1">
                {giveaway.entry_count.toLocaleString()} {locale === 'uz' ? 'ishtirokchi' : 'participants'}
              </p>
            </div>
          </div>

          <Link
            href={`/${locale}/${path}/${giveaway.id}`}
            className="btn-primary btn-lg shrink-0 animate-pulse-gold"
          >
            {locale === 'uz' ? 'Ishtirok etish' : 'Enter Giveaway'}
            <ArrowRight size={18} />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
