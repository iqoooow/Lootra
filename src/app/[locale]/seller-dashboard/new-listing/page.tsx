import { redirect } from 'next/navigation';
import type { Locale } from '@/i18n/request';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NewListingForm } from '@/components/seller/NewListingForm';

export default async function NewListingPage({
  params: { locale },
}: {
  params: { locale: Locale };
}) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || !['seller', 'admin'].includes(profile.role)) {
    redirect(`/${locale}/profile`);
  }

  return (
    <div className="container-page py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="section-title mb-2">
          {locale === 'uz' ? 'Yangi akkaunt qo\'shish' : 'Add New Listing'}
        </h1>
        <p className="text-dark-300 text-sm mb-8">
          {locale === 'uz'
            ? "Akkaunt ma'lumotlarini to'liq kiriting. Moderatsiyadan so'ng faol bo'ladi."
            : "Fill in all account details. It will become active after moderation."}
        </p>
        <NewListingForm locale={locale} sellerId={user.id} />
      </div>
    </div>
  );
}
