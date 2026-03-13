import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { locales, defaultLocale } from './i18n/request';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

// Old localized slugs → canonical paths (301 redirect)
const legacyRedirects: Record<string, string> = {
  'pubg-akkaunt-sotib-olish': 'marketplace',
  'buy-pubg-account':         'marketplace',
  'uc-sotib-olish':           'uc-store',
  'buy-uc':                   'uc-store',
  'yangiliklar':              'blog',
  'qollanmalar':              'guides',
  'skinlar':                  'skins',
  'reyting':                  'leaderboard',
  'sovrinlar':                'giveaways',
  'akkaunt-qiymati':          'account-value-checker',
};

// Routes that require the user to be logged in (locale-prefixed)
const AUTH_REQUIRED_ROUTES = [
  '/profile',
  '/dashboard',
  '/seller-dashboard',
  '/orders',
  '/checkout',
];

// Routes that require role = 'admin' only
const ADMIN_ROUTES = ['/admin'];

// Routes that require role = 'moderator' only
const MODERATOR_ROUTES = ['/moderator'];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;

  // ── 1. Legacy slug redirects ────────────────────────────────
  const segments = pathname.split('/'); // ['', 'uz', 'slug', ...]
  if (segments.length >= 3 && legacyRedirects[segments[2]]) {
    segments[2] = legacyRedirects[segments[2]];
    return NextResponse.redirect(new URL(segments.join('/'), req.url), 301);
  }

  // ── 2. Create Supabase client (read-only for auth check) ─────
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  const locale = segments[1] || defaultLocale;

  // ── 3. Admin routes → require admin role ───────────────────
  if (ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!session) {
      return NextResponse.redirect(new URL(`/uz/auth/login?redirect=${encodeURIComponent(pathname)}`, req.url));
    }
    // Role check is enforced server-side in /admin/layout.tsx
    return res;
  }

  // ── 4. Moderator routes → require moderator role ───────────
  if (MODERATOR_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!session) {
      return NextResponse.redirect(new URL(`/uz/auth/login?redirect=${encodeURIComponent(pathname)}`, req.url));
    }
    // Role check enforced in /moderator/layout.tsx
    return res;
  }

  // ── 5. Protected locale routes → require login ─────────────
  const isProtected = AUTH_REQUIRED_ROUTES.some((route) =>
    pathname.includes(route)
  );

  if (isProtected && !session) {
    return NextResponse.redirect(
      new URL(`/${locale}/auth/login?redirect=${encodeURIComponent(pathname)}`, req.url)
    );
  }

  // ── 6. Run i18n middleware for all other routes ─────────────
  return intlMiddleware(req);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon|robots.txt|sitemap.xml|site.webmanifest|android-chrome|apple-touch-icon|.*\\.png$|.*\\.ico$|.*\\.svg$|.*\\.jpg$|.*\\.webp$|images|icons|fonts).*)',
  ],
};
