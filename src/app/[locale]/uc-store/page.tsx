import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/request';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { UCPackageGrid } from '@/components/uc/UCPackageGrid';
import { UCOrderForm } from '@/components/uc/UCOrderForm';
import { UCStoreSEO } from '@/components/seo/UCStoreSEO';
import { Zap, Clock, Shield, Star } from 'lucide-react';

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'seo' });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://shax.uz';

  return {
    title: t('uc_title'),
    description: locale === 'uz'
      ? "Arzon PUBG UC sotib olish. Tezkor yetkazib berish, xavfsiz to'lov. Barcha UC paketlari mavjud."
      : 'Buy cheap PUBG UC. Fast delivery, secure payment. All UC packages available.',
    alternates: {
      canonical: `${siteUrl}/${locale}/uc-store`,
      languages: {
        'uz-UZ': `${siteUrl}/uz/uc-store`,
        'en-US': `${siteUrl}/en/uc-store`,
      },
    },
  };
}

async function getUCPackages() {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from('uc_packages')
    .select('*')
    .eq('is_active', true)
    .order('uc_amount', { ascending: true });
  return data ?? [];
}

export default async function UCStorePage({ params: { locale } }: { params: { locale: Locale } }) {
  const [t, packages] = await Promise.all([
    getTranslations({ locale, namespace: 'uc_store' }),
    getUCPackages(),
  ]);

  const features = [
    { icon: Zap, label: locale === 'uz' ? '5 daqiqada yetkazib berish' : '5-minute delivery', color: 'text-brand-400' },
    { icon: Shield, label: locale === 'uz' ? "Xavfsiz to'lov" : 'Secure payment', color: 'text-accent-green' },
    { icon: Clock, label: locale === 'uz' ? "24/7 qo'llab-quvvatlash" : '24/7 support', color: 'text-accent-blue' },
    { icon: Star, label: locale === 'uz' ? '10,000+ muvaffaqiyatli buyurtma' : '10,000+ successful orders', color: 'text-accent-purple' },
  ];

  return (
    <>
      <UCStoreSEO locale={locale} />

      <section className="bg-gradient-to-b from-dark-900 to-dark-950 pt-12 pb-6">
        <div className="container-page text-center">
          <div className="inline-flex items-center gap-2 badge-gold mb-4">
            <Zap size={12} />
            PUBG Mobile UC
          </div>
          <h1 className="section-title mb-3">{t('title')}</h1>
          <p className="text-dark-300 max-w-lg mx-auto">{t('subtitle')}</p>

          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {features.map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-overlay border border-surface-border text-sm">
                <Icon size={14} className={color} />
                <span className="text-dark-100">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container-page py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-display font-bold text-white mb-6">
              {locale === 'uz' ? 'Paketni tanlang' : 'Select a Package'}
            </h2>
            <UCPackageGrid packages={packages} locale={locale} />
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <UCOrderForm locale={locale} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
