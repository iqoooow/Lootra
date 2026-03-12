import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import type { Locale } from '@/i18n/request';
import { AccountCard } from '@/components/ui/AccountCard';

interface FeaturedAccountsProps {
  accounts: any[];
  locale: Locale;
}

export function FeaturedAccounts({ accounts, locale }: FeaturedAccountsProps) {
  const t = useTranslations('home');

  if (!accounts.length) return null;

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="section-title">{t('featured_accounts')}</h2>
          <div className="section-divider" />
        </div>
        <Link
          href={`/${locale}/marketplace`}
          className="btn-ghost btn-sm hidden sm:inline-flex"
        >
          {locale === 'uz' ? 'Barchasini ko\'rish' : 'See All'}
          <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {accounts.map((account) => (
          <AccountCard key={account.id} account={account} locale={locale} />
        ))}
      </div>

      <div className="mt-6 text-center sm:hidden">
        <Link
          href={`/${locale}/marketplace`}
          className="btn-secondary"
        >
          {locale === 'uz' ? 'Barcha akkauntlar' : 'View All Accounts'}
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
