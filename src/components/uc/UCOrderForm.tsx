'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Zap, CreditCard, Shield, Clock } from 'lucide-react';
import type { Locale } from '@/i18n/request';
import { cn } from '@/utils/cn';

const schema = z.object({
  pubg_id: z.string().min(5, 'Min 5 belgi').max(20, 'Max 20 belgi'),
  payment_method: z.enum(['payme', 'click', 'wallet']),
});

type FormData = z.infer<typeof schema>;

export function UCOrderForm({ locale }: { locale: Locale }) {
  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form');

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { payment_method: 'payme' },
  });

  const l = locale === 'uz' ? {
    title: "To'lov ma'lumotlari",
    pubgId: 'PUBG ID ingiz',
    pubgIdHint: "PUBG ID ni to'g'ri kiriting. Noto'g'ri ID ga UC yuborilmaydi.",
    method: "To'lov usuli",
    payme: 'Payme',
    click: 'Click',
    wallet: 'Hamyon',
    buy: 'Sotib olish',
    selected: 'Tanlangan paket',
    none: 'Paket tanlanmagan',
  } : {
    title: 'Order Details',
    pubgId: 'Your PUBG ID',
    pubgIdHint: 'Enter your PUBG ID correctly. UC cannot be refunded for wrong IDs.',
    method: 'Payment Method',
    payme: 'Payme',
    click: 'Click',
    wallet: 'Wallet',
    buy: 'Buy Now',
    selected: 'Selected Package',
    none: 'No package selected',
  };

  const onSubmit = (data: FormData) => {
    setStep('confirm');
  };

  return (
    <div className="card p-6 space-y-5">
      <h3 className="font-semibold text-white">{l.title}</h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* PUBG ID */}
        <div>
          <label className="block text-sm font-medium text-dark-200 mb-1.5">{l.pubgId}</label>
          <input
            {...register('pubg_id')}
            className={cn('input', errors.pubg_id && 'border-accent-red')}
            placeholder="e.g. 5123456789"
          />
          {errors.pubg_id && <p className="text-xs text-accent-red mt-1">{errors.pubg_id.message}</p>}
          <p className="text-xs text-dark-400 mt-1 flex items-start gap-1">
            <Shield size={10} className="mt-0.5 shrink-0 text-brand-400" />
            {l.pubgIdHint}
          </p>
        </div>

        {/* Payment method */}
        <div>
          <label className="block text-sm font-medium text-dark-200 mb-2">{l.method}</label>
          <div className="grid grid-cols-3 gap-2">
            {(['payme', 'click', 'wallet'] as const).map((method) => (
              <label
                key={method}
                className={cn(
                  'flex flex-col items-center gap-1.5 p-3 rounded-xl border cursor-pointer transition-all',
                  watch('payment_method') === method
                    ? 'border-brand-500/60 bg-brand-500/10'
                    : 'border-surface-border bg-surface-overlay hover:border-brand-500/30'
                )}
              >
                <input type="radio" value={method} {...register('payment_method')} className="sr-only" />
                <CreditCard size={16} className={watch('payment_method') === method ? 'text-brand-400' : 'text-dark-400'} />
                <span className="text-xs font-medium capitalize">
                  {method === 'payme' ? l.payme : method === 'click' ? l.click : l.wallet}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Trust indicators */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-accent-green/5 border border-accent-green/20">
          <Clock size={14} className="text-accent-green shrink-0" />
          <p className="text-xs text-dark-300">
            {locale === 'uz' ? '5-10 daqiqada yetkazib beriladi' : 'Delivered in 5-10 minutes'}
          </p>
        </div>

        <button type="submit" className="btn-primary w-full btn-lg">
          <Zap size={18} />
          {l.buy}
        </button>
      </form>
    </div>
  );
}
