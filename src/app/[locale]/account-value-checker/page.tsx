'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, TrendingUp, Info, ArrowRight } from 'lucide-react';
import type { Locale } from '@/i18n/request';
import { RANKS } from '@/utils/pubg';
import { formatPrice } from '@/utils/format';
import Link from 'next/link';

interface ValueResult {
  estimated_min: number;
  estimated_max: number;
  estimated_mid: number;
  currency: string;
  breakdown: {
    rank_factor: number;
    level_value: number;
    uc_value: number;
    skins_value: number;
    legendary_value: number;
  };
}

export default function AccountValueCheckerPage({
  params: { locale },
}: {
  params: { locale: Locale };
}) {
  const [form, setForm] = useState({
    rank: 'gold',
    level: 30,
    uc_balance: 0,
    skin_count: 10,
    legendary_count: 0,
  });
  const [result, setResult] = useState<ValueResult | null>(null);
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/estimate-value', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setResult(data);
    } finally {
      setLoading(false);
    }
  };

  const labels = {
    uz: {
      title: 'Akkaunt Qiymatini Aniqlash',
      subtitle: 'PUBG Mobile akkauntingizning taxminiy bozor narxini hisoblang',
      rank: 'Eng yuqori rang',
      level: 'Akkaunt darajasi',
      uc: 'UC balansi',
      skins: 'Umumiy skinlar soni',
      legendaries: 'Legendar narsalar soni',
      calculate: 'Qiymatni hisoblash',
      result: 'Taxminiy qiymat',
      min: 'Minimal',
      max: 'Maksimal',
      mid: "O'rtacha",
      breakdown: "Qiymat taqsimoti",
      sell: 'Shu narxda sotish',
    },
    en: {
      title: 'Account Value Checker',
      subtitle: 'Estimate the market value of your PUBG Mobile account',
      rank: 'Highest Rank',
      level: 'Account Level',
      uc: 'UC Balance',
      skins: 'Total Skins',
      legendaries: 'Legendary Items',
      calculate: 'Estimate Value',
      result: 'Estimated Value',
      min: 'Minimum',
      max: 'Maximum',
      mid: 'Average',
      breakdown: 'Value Breakdown',
      sell: 'Sell at This Price',
    },
  };

  const l = labels[locale];

  return (
    <div className="container-page py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 badge-gold mb-4">
            <Calculator size={12} />
            {locale === 'uz' ? 'Bepul vosita' : 'Free Tool'}
          </div>
          <h1 className="section-title mb-3">{l.title}</h1>
          <p className="text-dark-300">{l.subtitle}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="card p-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-dark-200 mb-2">{l.rank}</label>
              <select
                value={form.rank}
                onChange={(e) => setForm((f) => ({ ...f, rank: e.target.value }))}
                className="input"
              >
                {RANKS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label[locale]}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark-200 mb-2">
                {l.level}: <span className="text-brand-400">{form.level}</span>
              </label>
              <input
                type="range" min={1} max={100} step={1}
                value={form.level}
                onChange={(e) => setForm((f) => ({ ...f, level: parseInt(e.target.value) }))}
                className="w-full accent-brand-500"
              />
              <div className="flex justify-between text-xs text-dark-400 mt-1">
                <span>1</span><span>50</span><span>100</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark-200 mb-2">{l.uc}</label>
              <input
                type="number" min={0}
                value={form.uc_balance}
                onChange={(e) => setForm((f) => ({ ...f, uc_balance: parseInt(e.target.value) || 0 }))}
                className="input"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark-200 mb-2">
                {l.skins}: <span className="text-brand-400">{form.skin_count}</span>
              </label>
              <input
                type="range" min={0} max={500} step={5}
                value={form.skin_count}
                onChange={(e) => setForm((f) => ({ ...f, skin_count: parseInt(e.target.value) }))}
                className="w-full accent-brand-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark-200 mb-2">
                {l.legendaries}: <span className="text-accent-purple">{form.legendary_count}</span>
              </label>
              <input
                type="range" min={0} max={50} step={1}
                value={form.legendary_count}
                onChange={(e) => setForm((f) => ({ ...f, legendary_count: parseInt(e.target.value) }))}
                className="w-full accent-brand-500"
              />
            </div>

            <button onClick={calculate} disabled={loading} className="btn-primary w-full btn-lg">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-dark-950/30 border-t-dark-950 rounded-full animate-spin" />
                  {locale === 'uz' ? 'Hisoblanmoqda...' : 'Calculating...'}
                </span>
              ) : (
                <>
                  <Calculator size={18} />
                  {l.calculate}
                </>
              )}
            </button>
          </div>

          <div>
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-4"
                >
                  <div className="card p-6 border-brand-500/30 bg-brand-500/5 text-center">
                    <p className="text-dark-300 text-sm mb-2">{l.result}</p>
                    <p className="text-4xl font-display font-bold text-gradient-gold mb-1">
                      {formatPrice(result.estimated_mid)}
                    </p>
                    <p className="text-dark-400 text-xs">UZS</p>
                    <div className="flex justify-center gap-6 mt-4">
                      <div className="text-center">
                        <p className="text-xs text-dark-400">{l.min}</p>
                        <p className="text-sm font-semibold text-dark-200">{formatPrice(result.estimated_min)}</p>
                      </div>
                      <div className="w-px bg-surface-border" />
                      <div className="text-center">
                        <p className="text-xs text-dark-400">{l.max}</p>
                        <p className="text-sm font-semibold text-dark-200">{formatPrice(result.estimated_max)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="card p-5">
                    <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
                      <TrendingUp size={14} className="text-brand-400" />
                      {l.breakdown}
                    </h3>
                    <div className="space-y-3">
                      {[
                        { label: locale === 'uz' ? 'Daraja qiymati' : 'Level value', value: result.breakdown.level_value },
                        { label: locale === 'uz' ? 'UC qiymati' : 'UC value', value: result.breakdown.uc_value },
                        { label: locale === 'uz' ? 'Skinlar qiymati' : 'Skins value', value: result.breakdown.skins_value },
                        { label: locale === 'uz' ? 'Legendar narsalar' : 'Legendaries', value: result.breakdown.legendary_value },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex items-center justify-between text-sm">
                          <span className="text-dark-300">{label}</span>
                          <span className="text-white font-medium">{formatPrice(value)}</span>
                        </div>
                      ))}
                      <div className="divider" />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-dark-300">{locale === 'uz' ? 'Rang koeffitsiyenti' : 'Rank multiplier'}</span>
                        <span className="text-brand-400 font-bold">×{result.breakdown.rank_factor}</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/${locale}/seller-dashboard/new-listing?suggested_price=${result.estimated_mid}`}
                    className="btn-primary w-full"
                  >
                    {l.sell}
                    <ArrowRight size={16} />
                  </Link>

                  <p className="text-xs text-dark-400 text-center flex items-start gap-1">
                    <Info size={11} className="mt-0.5 shrink-0" />
                    {locale === 'uz'
                      ? "Bu taxminiy qiymat. Haqiqiy narx bozor sharoitiga qarab farq qilishi mumkin."
                      : "This is an estimated value. Actual price may vary based on market conditions."}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="card p-8 text-center border-dashed"
                >
                  <Calculator size={48} className="text-dark-500 mx-auto mb-4" />
                  <p className="text-dark-300">
                    {locale === 'uz'
                      ? "Akkaunt ma'lumotlarini kiriting va qiymatni hisoblang"
                      : "Enter your account details and calculate the value"}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
