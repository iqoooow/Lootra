import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Locale } from '@/i18n/request';

export default async function EditListingPage({
  params: { locale, id },
}: {
  params: { locale: Locale; id: string };
}) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  const { data: account } = await supabase
    .from('accounts_for_sale')
    .select('*')
    .eq('id', id)
    .eq('seller_id', user.id)
    .single();

  if (!account) redirect(`/${locale}/seller-dashboard`);

  return (
    <div className="container-page py-12 max-w-3xl">
      <h1 className="section-title mb-6">
        {locale === 'uz' ? 'E\'lonni tahrirlash' : 'Edit Listing'}
      </h1>
      <div className="card p-6">
        <p className="text-dark-300">
          {locale === 'uz' ? 'Tahrirlash funksiyasi tez orada.' : 'Edit functionality coming soon.'}
        </p>
        <p className="text-dark-400 text-sm mt-2">ID: {id}</p>
      </div>
    </div>
  );
}
