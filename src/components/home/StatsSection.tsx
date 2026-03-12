'use client';

import { useInView } from 'react-intersection-observer';
import { CounterAnimation } from '@/components/ui/CounterAnimation';
import { ShoppingBag, Users, CheckCircle, Star } from 'lucide-react';

export function StatsSection({ stats }: { stats: any }) {
  return (
    <section className="py-12 container-page">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-surface-border rounded-2xl overflow-hidden">
        {[
          { icon: ShoppingBag, value: stats?.active_listings ?? 1240, suffix: '+', label: "Faol e'lonlar" },
          { icon: Users, value: 48000, suffix: '+', label: 'Ro\'yxatdan o\'tgan' },
          { icon: CheckCircle, value: stats?.total_sold ?? 12000, suffix: '+', label: 'Muvaffaqiyatli savdo' },
          { icon: Star, value: 4.9, suffix: '/5', label: "O'rtacha reyting", decimal: true },
        ].map(({ icon: Icon, value, suffix, label, decimal }) => (
          <div key={label} className="bg-dark-900 flex flex-col items-center justify-center py-8 px-4">
            <Icon size={20} className="text-brand-400 mb-3" />
            <div className="text-3xl font-display font-bold text-white flex items-baseline gap-0.5">
              {decimal ? (
                <span>{value}</span>
              ) : (
                <CounterAnimation target={value as number} />
              )}
              <span className="text-brand-400 text-xl">{suffix}</span>
            </div>
            <p className="text-dark-400 text-xs mt-1 text-center">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
