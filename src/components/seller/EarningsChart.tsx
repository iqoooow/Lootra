'use client';

import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSupabase } from '@/hooks/useSupabase';
import type { Locale } from '@/i18n/request';

export function EarningsChart({ locale, sellerId }: { locale: Locale; sellerId: string }) {
  const { supabase } = useSupabase();
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, created_at')
        .eq('seller_id', sellerId)
        .eq('status', 'completed')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      // Group by date
      const grouped: Record<string, number> = {};
      (orders ?? []).forEach((order) => {
        const date = order.created_at.split('T')[0];
        grouped[date] = (grouped[date] ?? 0) + Number(order.total_amount);
      });

      const chartData = Object.entries(grouped).map(([date, amount]) => ({
        date: new Date(date).toLocaleDateString(locale === 'uz' ? 'uz-UZ' : 'en-US', { month: 'short', day: 'numeric' }),
        amount: Math.round(amount),
      }));

      setData(chartData);
    };

    fetchData();
  }, [sellerId, locale]);

  const label = locale === 'uz' ? 'So\'nggi 30 kun daromadi' : 'Last 30 Days Earnings';

  return (
    <div className="card p-5 h-full">
      <h2 className="font-semibold text-white mb-5">{label}</h2>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f5b800" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#f5b800" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a45" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: '#6c6c77', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6c6c77', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
            <Tooltip
              contentStyle={{ background: '#1e1e35', border: '1px solid #2a2a45', borderRadius: '12px' }}
              labelStyle={{ color: '#ffffff' }}
              itemStyle={{ color: '#f5b800' }}
              formatter={(v: number) => [`${v.toLocaleString()} UZS`, locale === 'uz' ? 'Daromad' : 'Earnings']}
            />
            <Area type="monotone" dataKey="amount" stroke="#f5b800" strokeWidth={2} fill="url(#earningsGradient)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[220px] flex items-center justify-center text-dark-400 text-sm">
          {locale === 'uz' ? "Hali daromad yo'q" : 'No earnings yet'}
        </div>
      )}
    </div>
  );
}
