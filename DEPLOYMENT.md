# SHAX PUBG Marketplace — Deployment Guide

## Prerequisites

- Node.js 20+ (LTS)
- pnpm 9+ (recommended) or npm
- Supabase account (supabase.com)
- Vercel account (vercel.com)
- Custom domain: shax.uz

---

## Step 1: Supabase Setup

### 1.1 Create Project
1. Go to https://supabase.com/dashboard
2. Click **New Project**
3. Name: `shax-pubg-marketplace`
4. Region: **Frankfurt (EU)** — closest to Uzbekistan
5. Generate strong DB password — save it

### 1.2 Run Migrations
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_ID

# Run migrations
supabase db push
# or run manually in SQL editor:
# paste content of supabase/migrations/001_initial_schema.sql
# paste content of supabase/migrations/002_realtime_and_views.sql
```

### 1.3 Configure Storage Buckets
In Supabase Dashboard → Storage:
```
Create buckets:
├── account-images   (public: true, max size: 10MB, allowed: image/*)
├── avatars          (public: true, max size: 2MB,  allowed: image/*)
├── blog-covers      (public: true, max size: 5MB,  allowed: image/*)
└── skin-images      (public: true, max size: 5MB,  allowed: image/*)
```

### 1.4 Configure Auth
In Supabase Dashboard → Authentication → Settings:
- Site URL: `https://shax.uz`
- Redirect URLs: `https://shax.uz/**`
- Enable Email Auth
- Enable Google OAuth (optional)

In Auth → Email Templates — customize with Shax branding.

### 1.5 Get API Keys
In Settings → API:
- Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- Copy `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Copy `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

---

## Step 2: Local Development

```bash
# Clone / setup project
cd shax

# Install dependencies
npm install

# Copy env file
cp .env.local.example .env.local
# Fill in all values from Step 1.5

# Run development server
npm run dev
# → http://localhost:3000/uz
```

---

## Step 3: Deploy to Vercel

### 3.1 Push to GitHub
```bash
git init
git add .
git commit -m "Initial production deployment"
git remote add origin https://github.com/YOUR_USERNAME/shax-pubg
git push -u origin main
```

### 3.2 Import to Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Framework: **Next.js** (auto-detected)
4. Root Directory: `.` (default)

### 3.3 Environment Variables
In Vercel → Settings → Environment Variables, add ALL variables from `.env.local.example`:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_PROJECT_ID
NEXT_PUBLIC_SITE_URL            = https://shax.uz
NEXT_PUBLIC_SITE_NAME           = Shax PUBG Marketplace
NEXT_PUBLIC_DEFAULT_LOCALE      = uz
NEXT_PUBLIC_PAYME_MERCHANT_ID
PAYME_SECRET_KEY
NEXT_PUBLIC_CLICK_SERVICE_ID
CLICK_SECRET_KEY
NEXT_PUBLIC_CDN_URL             = https://cdn.shax.uz
NEXT_PUBLIC_GA_ID
NEXT_PUBLIC_YANDEX_METRICA_ID
RESEND_API_KEY
FROM_EMAIL                      = noreply@shax.uz
ADMIN_SECRET
```

### 3.4 Custom Domain
1. In Vercel → Domains → Add `shax.uz`
2. Add DNS records at your domain registrar:
   ```
   A     @     76.76.21.21
   CNAME www   cname.vercel-dns.com
   ```
3. Wait for SSL provisioning (~5 min)

---

## Step 4: Configure Supabase CDN

For account images served from Supabase Storage:
```
In your DNS:
CNAME  cdn   YOUR_PROJECT_ID.supabase.co
```

Update `NEXT_PUBLIC_CDN_URL=https://cdn.shax.uz`

---

## Step 5: Setup Edge Function Crons

Create `supabase/functions/refresh-views/index.ts`:
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  await supabase.rpc('refresh_materialized_views')
  return new Response('OK')
})
```

Deploy and schedule:
```bash
supabase functions deploy refresh-views
# Schedule via Supabase Dashboard → Edge Functions → Schedule
# Cron: 0 * * * *  (every hour)
```

---

## Step 6: Seed Initial Data

Run in Supabase SQL editor:
```sql
-- Seed UC packages
INSERT INTO public.uc_packages (name, name_uz, name_en, uc_amount, price_uzs, price_usd, is_popular) VALUES
('60 UC',    '60 UC',    '60 UC',    60,    25000,  2.0,  false),
('325 UC',   '325 UC',   '325 UC',   325,  110000,  9.0,  false),
('660 UC',   '660 UC',   '660 UC',   660,  210000, 17.5,  false),
('1800 UC',  '1800 UC',  '1800 UC', 1800,  540000, 45.0,  true),
('3850 UC',  '3850 UC',  '3850 UC', 3850, 1100000, 92.0,  false),
('8100 UC',  '8100 UC',  '8100 UC', 8100, 2200000,185.0,  false);

-- Create first admin (replace with your user's UUID after signing up)
-- UPDATE public.profiles SET role = 'admin' WHERE username = 'shax_admin';
```

---

## Step 7: Performance Verification

After deployment, verify:
```bash
# Core Web Vitals
npx @unlighthouse/cli https://shax.uz

# SEO check
npx @nicolo.ribaudo/xml-sitemap-check https://shax.uz/sitemap.xml

# Lighthouse
npx lighthouse https://shax.uz/uz --output=html
```

Target scores:
- Performance: > 85
- SEO: > 95
- Accessibility: > 90
- Best Practices: > 95

---

## Step 8: Monitoring Setup

### Google Search Console
1. Go to https://search.google.com/search-console
2. Add property: `https://shax.uz`
3. Submit sitemap: `https://shax.uz/sitemap.xml`
4. Submit both: `/uz` and `/en` prefixes

### Yandex Webmaster
1. https://webmaster.yandex.ru
2. Add site and verify
3. Submit sitemap

---

## Scaling Checklist (pre-100K users)

- [ ] Upgrade Supabase to Pro plan
- [ ] Enable PgBouncer (already default on Supabase)
- [ ] Add Supabase read replica
- [ ] Enable Vercel Analytics Pro
- [ ] Set up database backup schedule (daily)
- [ ] Configure Supabase WAL archiving
- [ ] Add Cloudflare in front of Vercel (optional DDoS protection)

## Scaling Checklist (pre-500K users)

- [ ] Upgrade to Supabase Enterprise
- [ ] Implement Redis caching layer (Upstash) for hot data
- [ ] Separate media CDN (Cloudflare R2 or AWS S3)
- [ ] Database sharding strategy
- [ ] Implement queue system for UC delivery (Inngest or Trigger.dev)
