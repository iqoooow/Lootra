import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

function roleDashboard(role: string, locale: string): string {
  switch (role) {
    case 'admin':     return '/admin/dashboard';
    case 'moderator': return '/moderator/dashboard';
    case 'seller':    return `/${locale}/seller-dashboard`;
    default:          return `/${locale}/dashboard`;
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { locale: string } }
) {
  const { searchParams, origin } = req.nextUrl;
  const code = searchParams.get('code');
  const next = searchParams.get('next');
  const locale = params.locale === 'en' ? 'en' : 'uz';

  if (code) {
    const supabase = createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.exchangeCodeForSession(code);

    if (session?.user) {
      if (next) return NextResponse.redirect(`${origin}${next}`);

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      const destination = roleDashboard(profile?.role ?? 'user', locale);
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  return NextResponse.redirect(`${origin}/${locale}/auth/login?error=auth_failed`);
}
