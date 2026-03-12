# SHAX PUBG Marketplace — System Architecture

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USERS (1M+)                          │
│              Mobile / Desktop / Chrome / Safari             │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS
┌───────────────────────────▼─────────────────────────────────┐
│                    Vercel Edge Network                       │
│         CDN • Edge Caching • Edge Middleware                 │
│              (Global — 50+ PoPs worldwide)                   │
└───────┬──────────────────────────────────────┬──────────────┘
        │ Static/ISR                            │ API/RSC
┌───────▼──────────┐                ┌──────────▼──────────────┐
│  Next.js 14 App  │                │  Next.js API Routes      │
│  (React Server   │                │  + Edge Functions        │
│   Components)    │                │  (Serverless)            │
└───────┬──────────┘                └──────────┬──────────────┘
        │                                       │
┌───────▼───────────────────────────────────────▼─────────────┐
│                     SUPABASE PLATFORM                        │
│  ┌─────────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐  │
│  │  PostgreSQL │  │   Auth   │  │  Storage │  │Realtime │  │
│  │  (Primary   │  │  (JWT +  │  │  (S3-    │  │(WS Sub- │  │
│  │   DB)       │  │  OAuth)  │  │  compat) │  │scription│  │
│  └─────────────┘  └──────────┘  └──────────┘  └─────────┘  │
│  ┌─────────────┐  ┌──────────┐                              │
│  │  REST API   │  │   Edge   │                              │
│  │  (PostgREST)│  │Functions │                              │
│  └─────────────┘  └──────────┘                              │
└─────────────────────────────────────────────────────────────┘
```

## 2. Frontend Architecture

### Technology Stack
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 14 (App Router) | SSR/SSG/ISR + React Server Components |
| Language | TypeScript 5.5 | Type safety |
| Styling | TailwindCSS 3.4 | Utility-first CSS |
| Animations | Framer Motion 11 | Smooth UI animations |
| State | Zustand | Client-side global state |
| Forms | React Hook Form + Zod | Validated forms |
| i18n | next-intl 3 | Multilingual (uz/en) |
| Auth | Supabase SSR | JWT + OAuth |

### Rendering Strategy
- **Homepage**: ISR (revalidate: 300s) — fast initial load, auto-refresh
- **Marketplace**: SSR — always fresh, SEO-indexed
- **Account Detail**: ISR (revalidate: 60s) — dynamic but cached
- **Blog Posts**: ISR (revalidate: 3600s) — SEO-critical, long cache
- **Dashboard**: SSR + Client — auth-protected, real-time
- **Admin**: SSR — auth-protected, no caching

## 3. Database Architecture

### Core Tables (11)
```
profiles          ← extends auth.users
accounts_for_sale ← PUBG account listings (main marketplace entity)
uc_packages       ← UC bundles with pricing
orders            ← purchase records (account & UC)
payments          ← payment transactions
reviews           ← seller ratings
blog_posts        ← news/articles (bilingual)
guides            ← gameplay guides (bilingual)
skins             ← PUBG skin catalog
giveaways         ← giveaway campaigns
giveaway_entries  ← user participation records
```

### Supporting Tables
```
saved_accounts    ← user favorites
support_tickets   ← customer support
ticket_messages   ← ticket replies
notifications     ← user notifications
featured_slots    ← paid featured placement
ad_banners        ← advertising
```

### Performance Features
- **11 composite indexes** on hot query paths
- **GIN full-text search indexes** (uz + en)
- **Materialized views** for leaderboards (refreshed hourly)
- **Row-Level Security** on all tables
- **JSONB** for flexible metadata

## 4. SEO Architecture

### URL Structure
```
/uz/                              → Uzbek homepage
/en/                              → English homepage

/uz/pubg-akkaunt-sotib-olish      → Marketplace (UZ)
/en/buy-pubg-account              → Marketplace (EN)

/uz/uc-sotib-olish                → UC Store (UZ)
/en/buy-uc                        → UC Store (EN)

/uz/yangiliklar                   → Blog (UZ)
/en/blog                          → Blog (EN)

/uz/yangiliklar/[slug]            → Blog Post (UZ)
/en/blog/[slug]                   → Blog Post (EN)

/uz/qollanmalar                   → Guides (UZ)
/en/guides                        → Guides (EN)

/uz/akkaunt/[slug]                → Account Detail (UZ)
/en/account/[slug]                → Account Detail (EN)

/uz/skinlar                       → Skin Gallery (UZ)
/en/skins                         → Skin Gallery (EN)

/uz/reyting                       → Leaderboard (UZ)
/en/leaderboard                   → Leaderboard (EN)

/uz/akkaunt-qiymati               → Value Checker (UZ)
/en/account-value-checker         → Value Checker (EN)
```

### Technical SEO
- ✅ hreflang tags on every page (uz-UZ, en-US, x-default)
- ✅ Dynamic XML sitemap with all localized URLs
- ✅ JSON-LD structured data (WebSite, Organization, Product, BreadcrumbList, Article)
- ✅ Dynamic Open Graph + Twitter Card meta per page
- ✅ Canonical URLs
- ✅ robots.txt
- ✅ Core Web Vitals optimization (LCP < 2.5s, CLS < 0.1, FID < 100ms)

## 5. Scalability Plan (1M Users)

### Database
- Supabase Pro tier (8 GB RAM, 4 vCPUs)
- Upgrade to Supabase Enterprise at 500K users
- Read replicas for heavy query load
- PgBouncer connection pooling (default in Supabase)
- Materialized view refresh: every 60 minutes via Edge Function cron

### Caching Strategy
```
Layer 1: Vercel Edge CDN (static assets, ISR pages)
Layer 2: Next.js Data Cache (fetch() with revalidation)
Layer 3: Supabase PostgREST cache headers
Layer 4: Materialized views (pre-computed aggregates)
```

### CDN Assets
- Account images → Supabase Storage (served via CDN)
- Static assets → Vercel Edge (Next.js static)
- Custom domain: cdn.shax.uz → Supabase Storage bucket

## 6. Payment Integration

### Supported Methods
| Method | Currency | Integration |
|--------|---------|-------------|
| Payme | UZS | REST API |
| Click | UZS | REST API |
| Stripe | USD | REST API |
| Wallet | UZS/USD | Internal balance |

### Commission Structure
- Account sales: 8% platform fee
- UC sales: 5% platform fee
- Featured slots: Fixed pricing
- Minimum commission: 5,000 UZS

## 7. Security

- **RLS**: Row-Level Security on ALL tables
- **JWT**: Supabase Auth (short-lived tokens, auto-refresh)
- **CSP**: Content Security Policy headers
- **Input validation**: Zod schemas on all API routes
- **Rate limiting**: Vercel middleware + Supabase
- **File uploads**: Server-side validation + Supabase Storage CORS

## 8. Monitoring & Analytics

- **Google Analytics 4**: User behavior
- **Yandex Metrica**: Uzbekistan traffic (better local coverage)
- **Vercel Analytics**: Core Web Vitals
- **Supabase Dashboard**: DB metrics, slow queries
