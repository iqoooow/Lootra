import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Locale } from '@/i18n/request';

export default async function ProfilePage({ params: { locale } }: { params: { locale: Locale } }) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/auth/login`);

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const t = await getTranslations({ locale, namespace: 'nav' });

  return (
    <div className="container-page py-20">
      <h1 className="section-title">{t('profile')}</h1>
      <div className="card mt-6 p-6">
        <p className="text-dark-200">{profile?.display_name ?? profile?.username ?? user.email}</p>
        <p className="text-dark-400 text-sm mt-1">{user.email}</p>
      </div>
    </div>
  );
}
