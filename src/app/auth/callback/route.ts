import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams, origin } = req.nextUrl;
  const code = searchParams.get('code');
  const next = searchParams.get('next');

  if (code) {
    const supabase = createServerSupabaseClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  const localeCookie = req.cookies.get('NEXT_LOCALE')?.value;
  const locale = localeCookie === 'en' ? 'en' : 'uz';

  return NextResponse.redirect(`${origin}${next ?? `/${locale}`}`);
}
