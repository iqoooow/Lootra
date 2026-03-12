import { AccountCard } from '@/components/ui/AccountCard';
import { Pagination } from '@/components/ui/Pagination';
import type { Locale } from '@/i18n/request';
import { ShoppingBag } from 'lucide-react';

interface AccountGridProps {
  accounts: any[];
  locale: Locale;
  total: number;
  page: number;
  limit: number;
}

export function AccountGrid({ accounts, locale, total, page, limit }: AccountGridProps) {
  if (!accounts.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShoppingBag size={48} className="text-dark-500 mb-4" />
        <p className="text-dark-300">
          {locale === 'uz' ? 'Akkaunt topilmadi' : 'No accounts found'}
        </p>
        <p className="text-dark-500 text-sm mt-1">
          {locale === 'uz' ? 'Boshqa filtrlarni sinab ko\'ring' : 'Try different filters'}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {accounts.map((account) => (
          <AccountCard key={account.id} account={account} locale={locale} />
        ))}
      </div>

      <Pagination total={total} page={page} limit={limit} locale={locale} />
    </div>
  );
}
