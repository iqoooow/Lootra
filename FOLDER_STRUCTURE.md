# SHAX PUBG Marketplace — Complete Folder Structure

```
shax/
├── .env.local.example              ← Environment variables template
├── .eslintrc.json                  ← ESLint config
├── .gitignore
├── next.config.js                  ← Next.js config (i18n, images, CSP headers)
├── package.json
├── postcss.config.js
├── tailwind.config.ts              ← Custom dark gaming theme
├── tsconfig.json
│
├── ARCHITECTURE.md                 ← System architecture docs
├── DEPLOYMENT.md                   ← Step-by-step deployment guide
├── MONETIZATION.md                 ← Revenue streams & projections
├── FOLDER_STRUCTURE.md             ← This file
│
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql  ← Full schema (11 tables + RLS + indexes)
│   │   └── 002_realtime_and_views.sql ← Materialized views + search functions
│   └── functions/
│       └── refresh-views/          ← Cron edge function (hourly MV refresh)
│           └── index.ts
│
├── public/
│   ├── favicon.ico
│   ├── apple-touch-icon.png
│   ├── site.webmanifest
│   ├── robots.txt
│   ├── og-image.jpg
│   └── images/
│       └── hero-pubg.webp
│
└── src/
    ├── app/
    │   ├── [locale]/               ← i18n root (uz | en)
    │   │   ├── layout.tsx          ← Root layout (fonts, providers, SEO)
    │   │   ├── page.tsx            ← Homepage (SSG + ISR)
    │   │   ├── loading.tsx         ← Global loading UI
    │   │   ├── error.tsx           ← Error boundary
    │   │   ├── not-found.tsx       ← 404 page
    │   │   │
    │   │   ├── [slug]/             ← Localized page routing
    │   │   │   ├── marketplace/page.tsx           ← Account marketplace
    │   │   │   ├── uc-store/page.tsx              ← UC packages store
    │   │   │   ├── blog/page.tsx                  ← Blog listing
    │   │   │   ├── blog/[slug]/page.tsx            ← Blog post detail
    │   │   │   ├── guides/page.tsx                ← Guides listing
    │   │   │   ├── guides/[slug]/page.tsx          ← Guide detail
    │   │   │   ├── skins/page.tsx                 ← Skin gallery
    │   │   │   ├── leaderboard/page.tsx            ← Leaderboard
    │   │   │   ├── giveaways/page.tsx              ← Giveaway listing
    │   │   │   ├── giveaways/[id]/page.tsx         ← Giveaway detail
    │   │   │   ├── account/[slug]/page.tsx         ← Account detail + purchase
    │   │   │   └── account-value-checker/page.tsx  ← Value estimator tool
    │   │   │
    │   │   ├── auth/
    │   │   │   ├── login/page.tsx
    │   │   │   ├── register/page.tsx
    │   │   │   ├── forgot-password/page.tsx
    │   │   │   └── callback/route.ts              ← OAuth callback
    │   │   │
    │   │   ├── profile/
    │   │   │   ├── page.tsx                       ← User profile
    │   │   │   ├── orders/page.tsx                ← Order history
    │   │   │   ├── wallet/page.tsx                ← Wallet & top-up
    │   │   │   ├── saved/page.tsx                 ← Saved accounts
    │   │   │   └── settings/page.tsx              ← Profile settings
    │   │   │
    │   │   ├── seller-dashboard/
    │   │   │   ├── page.tsx                       ← Dashboard overview
    │   │   │   ├── new-listing/page.tsx            ← Create account listing
    │   │   │   ├── listings/page.tsx              ← Manage all listings
    │   │   │   ├── analytics/page.tsx             ← Sales analytics
    │   │   │   ├── earnings/page.tsx              ← Earnings & withdrawal
    │   │   │   └── boost/[id]/page.tsx            ← Feature account (paid)
    │   │   │
    │   │   ├── checkout/
    │   │   │   ├── [orderId]/page.tsx             ← Checkout flow
    │   │   │   └── success/page.tsx               ← Order success
    │   │   │
    │   │   └── support/
    │   │       ├── page.tsx                       ← FAQ + new ticket
    │   │       └── tickets/[id]/page.tsx          ← Ticket thread
    │   │
    │   ├── admin/                  ← Admin panel (no locale prefix)
    │   │   ├── layout.tsx          ← Admin layout (sidebar + header)
    │   │   ├── page.tsx            ← Dashboard overview
    │   │   ├── users/page.tsx      ← User management
    │   │   ├── accounts/page.tsx   ← Account moderation
    │   │   ├── orders/page.tsx     ← Order management
    │   │   ├── uc-packages/page.tsx ← UC package CRUD
    │   │   ├── blog/page.tsx       ← Blog post CRUD
    │   │   ├── guides/page.tsx     ← Guides CRUD
    │   │   ├── skins/page.tsx      ← Skin catalog management
    │   │   ├── giveaways/page.tsx  ← Giveaway management
    │   │   ├── tickets/page.tsx    ← Support ticket queue
    │   │   ├── analytics/page.tsx  ← Platform analytics
    │   │   └── settings/page.tsx   ← Platform settings
    │   │
    │   └── api/
    │       ├── sitemap/route.ts    ← Dynamic XML sitemap (uz + en)
    │       ├── robots/route.ts     ← robots.txt
    │       ├── estimate-value/route.ts ← Account value API
    │       ├── upload/route.ts     ← Image upload handler
    │       ├── webhooks/
    │       │   ├── payme/route.ts  ← Payme payment webhook
    │       │   └── click/route.ts  ← Click payment webhook
    │       └── admin/
    │           ├── approve-account/route.ts
    │           └── ban-user/route.ts
    │
    ├── components/
    │   ├── layout/
    │   │   ├── Navbar.tsx          ← Top navigation (scroll-aware, auth-aware)
    │   │   ├── Footer.tsx          ← Site footer with links
    │   │   ├── MobileNav.tsx       ← Bottom tab bar (mobile)
    │   │   └── LanguageSwitcher.tsx ← uz/en switcher
    │   │
    │   ├── home/
    │   │   ├── HeroSection.tsx     ← Animated hero with stats
    │   │   ├── FeaturedAccounts.tsx ← Featured account grid
    │   │   ├── UCPromoSection.tsx  ← UC packages promotion
    │   │   ├── StatsSection.tsx    ← Animated platform counters
    │   │   ├── HowItWorksSection.tsx ← Steps explanation
    │   │   ├── BlogHighlights.tsx  ← Latest 3 blog posts
    │   │   ├── GuideHighlights.tsx ← Popular guides
    │   │   ├── GiveawayBanner.tsx  ← Active giveaway CTA
    │   │   └── TrustBadges.tsx     ← Security/trust indicators
    │   │
    │   ├── marketplace/
    │   │   ├── MarketplaceFilters.tsx ← Rank/price/level/server filters
    │   │   ├── AccountGrid.tsx     ← Paginated account grid
    │   │   └── SearchBar.tsx       ← Full-text search
    │   │
    │   ├── uc/
    │   │   ├── UCPackageGrid.tsx   ← UC package cards
    │   │   └── UCOrderForm.tsx     ← PUBG ID + payment form
    │   │
    │   ├── seller/
    │   │   ├── NewListingForm.tsx  ← Multi-step account listing form
    │   │   ├── SellerStats.tsx     ← Revenue/listing stat cards
    │   │   ├── MyListings.tsx      ← Listing management table
    │   │   ├── RecentOrders.tsx    ← Order history widget
    │   │   └── EarningsChart.tsx   ← Recharts earnings graph
    │   │
    │   ├── admin/
    │   │   ├── AdminSidebar.tsx    ← Navigation sidebar
    │   │   ├── AdminHeader.tsx     ← Top bar with profile
    │   │   ├── AdminStatCard.tsx   ← KPI stat card
    │   │   ├── AccountsTable.tsx   ← Account moderation table
    │   │   ├── UsersTable.tsx      ← User management table
    │   │   ├── PendingAccountsTable.tsx
    │   │   └── RecentActivityTable.tsx
    │   │
    │   ├── seo/
    │   │   ├── HomeSEO.tsx         ← Homepage JSON-LD schemas
    │   │   ├── MarketplaceSEO.tsx  ← Marketplace JSON-LD
    │   │   ├── UCStoreSEO.tsx      ← UC Store JSON-LD
    │   │   └── AccountDetailSEO.tsx ← Product schema for accounts
    │   │
    │   ├── providers/
    │   │   ├── SupabaseProvider.tsx ← Supabase client + auth listener
    │   │   └── ThemeProvider.tsx   ← Dark theme provider
    │   │
    │   └── ui/
    │       ├── AccountCard.tsx     ← Marketplace listing card
    │       ├── UCPackageCard.tsx   ← UC package card
    │       ├── BlogCard.tsx        ← Blog post card
    │       ├── GuideCard.tsx       ← Guide card
    │       ├── SkinCard.tsx        ← Skin item card
    │       ├── CounterAnimation.tsx ← Animated number counter
    │       ├── AdBanner.tsx        ← Ad placement component
    │       ├── StarRating.tsx      ← 5-star rating display
    │       ├── Pagination.tsx      ← Page navigation
    │       ├── Modal.tsx           ← Radix Dialog wrapper
    │       ├── Select.tsx          ← Radix Select wrapper
    │       ├── Tooltip.tsx         ← Radix Tooltip wrapper
    │       └── skeletons.tsx       ← Loading skeleton components
    │
    ├── hooks/
    │   ├── useSupabase.ts          ← Supabase client hook
    │   ├── useAuth.ts              ← Auth state (from Zustand)
    │   ├── useRealtimeOrders.ts    ← Realtime order updates
    │   ├── useRealtimeNotifications.ts ← Push notifications
    │   └── useInfiniteAccounts.ts  ← Infinite scroll for marketplace
    │
    ├── lib/
    │   └── supabase/
    │       ├── client.ts           ← Browser client (singleton)
    │       └── server.ts           ← Server client + admin client
    │
    ├── store/
    │   ├── authStore.ts            ← Zustand auth state
    │   └── cartStore.ts            ← UC purchase state
    │
    ├── types/
    │   ├── supabase.ts             ← Auto-generated Supabase types
    │   └── index.ts                ← Shared application types
    │
    ├── utils/
    │   ├── cn.ts                   ← clsx + tailwind-merge
    │   ├── format.ts               ← Price, date, number formatters
    │   └── pubg.ts                 ← PUBG ranks, servers, rarities
    │
    ├── i18n/
    │   ├── request.ts              ← next-intl config
    │   └── messages/
    │       ├── uz.json             ← Uzbek translations
    │       └── en.json             ← English translations
    │
    ├── styles/
    │   └── globals.css             ← Tailwind + custom CSS
    │
    ├── middleware.ts               ← i18n routing + auth protection
    └── Analytics.tsx               ← GA4 + Yandex Metrica
```
