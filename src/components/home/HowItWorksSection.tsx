'use client';

import { motion } from 'framer-motion';
import { Search, ShoppingCart, Shield, Zap } from 'lucide-react';
import type { Locale } from '@/i18n/request';

export function HowItWorksSection({ locale }: { locale: Locale }) {
  const steps = locale === 'uz' ? [
    { icon: Search, title: 'Akkaunt toping', desc: "Filtrlash yordamida o'zingizga mos PUBG akkauntini toping.", color: 'text-accent-blue', bg: 'bg-accent-blue/10' },
    { icon: ShoppingCart, title: 'Xavfsiz to\'lov', desc: "Payme yoki Click orqali xavfsiz to'lov qiling.", color: 'text-brand-400', bg: 'bg-brand-500/10' },
    { icon: Shield, title: 'Tasdiqlash', desc: "Sotuvchi akkaunt ma'lumotlarini siz bilan ulashadi.", color: 'text-accent-green', bg: 'bg-accent-green/10' },
    { icon: Zap, title: 'Akkauntni oling', desc: "10 daqiqa ichida akkaunt parolini olib o'ynashni boshlang!", color: 'text-accent-purple', bg: 'bg-accent-purple/10' },
  ] : [
    { icon: Search, title: 'Find Account', desc: 'Browse and filter thousands of PUBG accounts to find your perfect match.', color: 'text-accent-blue', bg: 'bg-accent-blue/10' },
    { icon: ShoppingCart, title: 'Secure Payment', desc: 'Pay safely via Payme, Click, or international payment methods.', color: 'text-brand-400', bg: 'bg-brand-500/10' },
    { icon: Shield, title: 'Verification', desc: 'Seller shares the account credentials securely through our platform.', color: 'text-accent-green', bg: 'bg-accent-green/10' },
    { icon: Zap, title: 'Start Playing', desc: 'Receive your account within 10 minutes and start your journey!', color: 'text-accent-purple', bg: 'bg-accent-purple/10' },
  ];

  return (
    <section className="py-16 container-page">
      <div className="text-center mb-12">
        <h2 className="section-title">
          {locale === 'uz' ? 'Qanday ishlaydi?' : 'How It Works'}
        </h2>
        <div className="section-divider mx-auto" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="card p-6 text-center relative"
          >
            {/* Step number */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center">
              <span className="text-dark-950 text-xs font-bold">{i + 1}</span>
            </div>

            <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl ${step.bg} flex items-center justify-center`}>
              <step.icon size={24} className={step.color} />
            </div>

            <h3 className="font-display font-bold text-white mb-2">{step.title}</h3>
            <p className="text-dark-300 text-sm leading-relaxed">{step.desc}</p>

            {/* Connector line */}
            {i < steps.length - 1 && (
              <div className="hidden lg:block absolute top-1/3 -right-3 w-6 h-px bg-surface-border" />
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
