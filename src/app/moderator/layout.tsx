import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ModeratorSidebar } from '@/components/moderator/ModeratorSidebar';
import { ModeratorHeader } from '@/components/moderator/ModeratorHeader';

export default async function ModeratorLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/uz/auth/login?redirect=/moderator/dashboard');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, username, display_name, avatar_url')
    .eq('id', user.id)
    .single();

  // Only moderators — admins have their own panel at /admin
  if (!profile || profile.role !== 'moderator') {
    if (profile?.role === 'admin') redirect('/admin/dashboard');
    redirect('/uz');
  }

  return (
    <div className="min-h-screen bg-dark-950 flex">
      <ModeratorSidebar profile={profile} />
      <div className="flex-1 flex flex-col min-w-0">
        <ModeratorHeader profile={profile} />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
