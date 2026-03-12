import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { locales, defaultLocale } from './i18n/request';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

// Old localized slugs → new canonical paths (301 redirect)
const legacyRedirects: Record<string, string> = {
  'pubg-akkaunt-sotib-olish': 'marketplace',
  'buy-pubg-account': 'marketplace',
  'uc-sotib-olish': 'uc-store',
  'buy-uc': 'uc-store',
  'yangiliklar': 'blog',
  'qollanmalar': 'guides',
  'skinlar': 'skins',
  'reyting': 'leaderboard',
  'sovrinlar': 'giveaways',
  'akkaunt-qiymati': 'account-value-checker',
};

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Create supabase client for auth check
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

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = req.nextUrl.pathname;

  // Redirect legacy localized slugs to canonical paths
  const segments = pathname.split('/'); // ['', 'uz', 'pubg-akkaunt-sotib-olish']
  if (segments.length >= 3 && legacyRedirects[segments[2]]) {
    segments[2] = legacyRedirects[segments[2]];
    return NextResponse.redirect(new URL(segments.join('/'), req.url), 301);
  }

  // Protected routes (require auth)
  const protectedRoutes = [
    '/profile',
    '/seller-dashboard',
    '/orders',
    '/checkout',
  ];

  // Admin routes
  const adminRoutes = ['/admin'];

  const isProtected = protectedRoutes.some((route) =>
    pathname.includes(route)
  );
  const isAdmin = adminRoutes.some((route) => pathname.includes(route));

  if (isProtected && !session) {
    const locale = pathname.split('/')[1] || defaultLocale;
    return NextResponse.redirect(
      new URL(`/${locale}/auth/login?redirect=${encodeURIComponent(pathname)}`, req.url)
    );
  }

  if (isAdmin) {
    if (!session) {
      return NextResponse.redirect(new URL('/uz/auth/login', req.url));
    }
    // Role check happens in the page component with server-side query
  }

  // Run i18n middleware
  return intlMiddleware(req);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next/static|_next/image|favicon|robots.txt|sitemap.xml|site.webmanifest|android-chrome|apple-touch-icon|.*\\.png$|.*\\.ico$|.*\\.svg$|.*\\.jpg$|.*\\.webp$|images|icons|fonts).*)',
  ],
};
