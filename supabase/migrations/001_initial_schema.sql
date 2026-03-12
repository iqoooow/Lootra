-- ============================================================
-- SHAX PUBG MARKETPLACE — Initial Database Schema
-- Supabase PostgreSQL Migration 001
-- ============================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- fuzzy text search
CREATE EXTENSION IF NOT EXISTS "btree_gin";      -- composite GIN indexes
CREATE EXTENSION IF NOT EXISTS "unaccent";       -- accent-insensitive search

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('user', 'seller', 'admin', 'moderator');
CREATE TYPE account_status AS ENUM ('draft', 'pending_review', 'active', 'sold', 'suspended');
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'processing', 'completed', 'cancelled', 'refunded', 'disputed');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('payme', 'click', 'stripe', 'wallet');
CREATE TYPE pubg_rank AS ENUM (
  'bronze', 'silver', 'gold', 'platinum', 'diamond',
  'crown', 'ace', 'ace_master', 'ace_dominator', 'conqueror'
);
CREATE TYPE giveaway_status AS ENUM ('upcoming', 'active', 'ended', 'cancelled');
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE locale AS ENUM ('uz', 'en');

-- ============================================================
-- TABLE: users (extends Supabase auth.users)
-- ============================================================

CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      TEXT UNIQUE NOT NULL CHECK (length(username) BETWEEN 3 AND 30),
  display_name  TEXT,
  avatar_url    TEXT,
  bio           TEXT CHECK (length(bio) <= 500),
  role          user_role NOT NULL DEFAULT 'user',
  locale        locale NOT NULL DEFAULT 'uz',
  -- Wallet
  wallet_balance NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (wallet_balance >= 0),
  -- Seller fields
  seller_verified    BOOLEAN NOT NULL DEFAULT false,
  seller_rating      NUMERIC(3,2) CHECK (seller_rating BETWEEN 0 AND 5),
  seller_total_sales INTEGER NOT NULL DEFAULT 0,
  total_reviews      INTEGER NOT NULL DEFAULT 0,
  -- Counters
  total_purchases INTEGER NOT NULL DEFAULT 0,
  -- Flags
  is_active      BOOLEAN NOT NULL DEFAULT true,
  is_banned      BOOLEAN NOT NULL DEFAULT false,
  ban_reason     TEXT,
  -- Metadata
  phone_number   TEXT,
  telegram_handle TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: accounts_for_sale
-- ============================================================

CREATE TABLE public.accounts_for_sale (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  -- Identity
  title            TEXT NOT NULL CHECK (length(title) BETWEEN 5 AND 100),
  slug             TEXT UNIQUE NOT NULL,
  description      TEXT CHECK (length(description) <= 5000),
  -- PUBG Stats
  pubg_id          TEXT,
  pubg_level       INTEGER CHECK (pubg_level BETWEEN 1 AND 100),
  pubg_rank        pubg_rank NOT NULL DEFAULT 'bronze',
  season_highest_rank pubg_rank,
  pubg_server      TEXT NOT NULL DEFAULT 'asia', -- asia, eu, na, sa, krjp
  -- Inventory
  uc_balance       INTEGER NOT NULL DEFAULT 0,
  skin_count       INTEGER NOT NULL DEFAULT 0,
  outfit_count     INTEGER NOT NULL DEFAULT 0,
  gun_skin_count   INTEGER NOT NULL DEFAULT 0,
  legendary_count  INTEGER NOT NULL DEFAULT 0,
  -- Pricing
  price            NUMERIC(12,2) NOT NULL CHECK (price > 0),
  original_price   NUMERIC(12,2),
  discount_pct     INTEGER CHECK (discount_pct BETWEEN 0 AND 90),
  is_negotiable    BOOLEAN NOT NULL DEFAULT false,
  -- Status
  status           account_status NOT NULL DEFAULT 'pending_review',
  is_featured      BOOLEAN NOT NULL DEFAULT false,
  is_instant_buy   BOOLEAN NOT NULL DEFAULT true,
  view_count       INTEGER NOT NULL DEFAULT 0,
  favorite_count   INTEGER NOT NULL DEFAULT 0,
  -- Media
  images           TEXT[] NOT NULL DEFAULT '{}',
  video_url        TEXT,
  -- SEO / i18n
  title_uz         TEXT,
  title_en         TEXT,
  description_uz   TEXT,
  description_en   TEXT,
  -- Metadata
  sold_at          TIMESTAMPTZ,
  expires_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: uc_packages
-- ============================================================

CREATE TABLE public.uc_packages (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           TEXT NOT NULL,
  name_uz        TEXT,
  name_en        TEXT,
  uc_amount      INTEGER NOT NULL CHECK (uc_amount > 0),
  bonus_uc       INTEGER NOT NULL DEFAULT 0,
  price_uzs      NUMERIC(12,2) NOT NULL CHECK (price_uzs > 0),
  price_usd      NUMERIC(8,2),
  original_price NUMERIC(12,2),
  discount_pct   INTEGER NOT NULL DEFAULT 0 CHECK (discount_pct BETWEEN 0 AND 100),
  image_url      TEXT,
  is_popular     BOOLEAN NOT NULL DEFAULT false,
  is_active      BOOLEAN NOT NULL DEFAULT true,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: orders
-- ============================================================

CREATE TABLE public.orders (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number     TEXT UNIQUE NOT NULL DEFAULT 'ORD-' || UPPER(SUBSTR(MD5(uuid_generate_v4()::TEXT), 1, 8)),
  buyer_id         UUID NOT NULL REFERENCES public.profiles(id),
  seller_id        UUID REFERENCES public.profiles(id),
  -- What was ordered
  order_type       TEXT NOT NULL CHECK (order_type IN ('account', 'uc')),
  account_id       UUID REFERENCES public.accounts_for_sale(id),
  uc_package_id    UUID REFERENCES public.uc_packages(id),
  -- Pricing
  subtotal         NUMERIC(12,2) NOT NULL,
  platform_fee     NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount_amount  NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_amount     NUMERIC(12,2) NOT NULL,
  -- Status
  status           order_status NOT NULL DEFAULT 'pending',
  -- Delivery details (for UC)
  pubg_id_delivery TEXT,
  delivery_note    TEXT,
  -- Timestamps
  paid_at          TIMESTAMPTZ,
  completed_at     TIMESTAMPTZ,
  cancelled_at     TIMESTAMPTZ,
  cancel_reason    TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: payments
-- ============================================================

CREATE TABLE public.payments (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id            UUID NOT NULL REFERENCES public.orders(id),
  user_id             UUID NOT NULL REFERENCES public.profiles(id),
  amount              NUMERIC(12,2) NOT NULL,
  currency            TEXT NOT NULL DEFAULT 'UZS',
  method              payment_method NOT NULL,
  status              payment_status NOT NULL DEFAULT 'pending',
  -- Provider data
  provider_txn_id     TEXT,
  provider_response   JSONB,
  -- Timestamps
  processed_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: reviews
-- ============================================================

CREATE TABLE public.reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id),
  seller_id   UUID NOT NULL REFERENCES public.profiles(id),
  order_id    UUID NOT NULL REFERENCES public.orders(id),
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT CHECK (length(comment) <= 1000),
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_hidden   BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(reviewer_id, order_id)
);

-- ============================================================
-- TABLE: blog_posts
-- ============================================================

CREATE TABLE public.blog_posts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id       UUID NOT NULL REFERENCES public.profiles(id),
  slug            TEXT UNIQUE NOT NULL,
  category        TEXT NOT NULL DEFAULT 'news'
                    CHECK (category IN ('news','patch_notes','esports','tips','guides')),
  -- Content (bilingual)
  title_uz        TEXT NOT NULL,
  title_en        TEXT,
  excerpt_uz      TEXT,
  excerpt_en      TEXT,
  content_uz      TEXT NOT NULL,
  content_en      TEXT,
  -- Media
  cover_image     TEXT,
  -- SEO
  meta_title_uz   TEXT,
  meta_title_en   TEXT,
  meta_desc_uz    TEXT,
  meta_desc_en    TEXT,
  -- Status
  is_published    BOOLEAN NOT NULL DEFAULT false,
  is_featured     BOOLEAN NOT NULL DEFAULT false,
  view_count      INTEGER NOT NULL DEFAULT 0,
  read_time_min   INTEGER,
  tags            TEXT[] NOT NULL DEFAULT '{}',
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: guides
-- ============================================================

CREATE TABLE public.guides (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id       UUID NOT NULL REFERENCES public.profiles(id),
  slug            TEXT UNIQUE NOT NULL,
  category        TEXT NOT NULL DEFAULT 'general'
                    CHECK (category IN ('sensitivity','rank_push','weapons','beginners','advanced','device')),
  difficulty      TEXT NOT NULL DEFAULT 'beginner'
                    CHECK (difficulty IN ('beginner','intermediate','advanced')),
  -- Content
  title_uz        TEXT NOT NULL,
  title_en        TEXT,
  content_uz      TEXT NOT NULL,
  content_en      TEXT,
  cover_image     TEXT,
  video_url       TEXT,
  -- SEO
  meta_title_uz   TEXT,
  meta_title_en   TEXT,
  meta_desc_uz    TEXT,
  meta_desc_en    TEXT,
  -- Status
  is_published    BOOLEAN NOT NULL DEFAULT false,
  view_count      INTEGER NOT NULL DEFAULT 0,
  like_count      INTEGER NOT NULL DEFAULT 0,
  tags            TEXT[] NOT NULL DEFAULT '{}',
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: skins
-- ============================================================

CREATE TABLE public.skins (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  name_uz      TEXT,
  name_en      TEXT,
  category     TEXT NOT NULL CHECK (category IN (
    'outfit','gun_skin','helmet','backpack','parachute',
    'vehicle','emote','title','frame','special'
  )),
  rarity       TEXT NOT NULL CHECK (rarity IN (
    'uncommon','rare','epic','legendary','mythic','ultimate'
  )),
  image_url    TEXT NOT NULL,
  thumbnail_url TEXT,
  uc_cost      INTEGER,
  release_date DATE,
  is_limited   BOOLEAN NOT NULL DEFAULT false,
  is_available BOOLEAN NOT NULL DEFAULT true,
  description  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: giveaways
-- ============================================================

CREATE TABLE public.giveaways (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id      UUID NOT NULL REFERENCES public.profiles(id),
  title_uz        TEXT NOT NULL,
  title_en        TEXT,
  description_uz  TEXT,
  description_en  TEXT,
  prize_type      TEXT NOT NULL CHECK (prize_type IN ('uc', 'account', 'skin', 'custom')),
  prize_value     NUMERIC(12,2),
  prize_uc_amount INTEGER,
  prize_account_id UUID REFERENCES public.accounts_for_sale(id),
  prize_description TEXT,
  status          giveaway_status NOT NULL DEFAULT 'upcoming',
  max_entries     INTEGER,
  entry_count     INTEGER NOT NULL DEFAULT 0,
  winner_count    INTEGER NOT NULL DEFAULT 1,
  requirements    JSONB NOT NULL DEFAULT '{}',
  -- e.g. {"follow_telegram": true, "min_level": 10, "share_required": false}
  cover_image     TEXT,
  starts_at       TIMESTAMPTZ NOT NULL,
  ends_at         TIMESTAMPTZ NOT NULL,
  winner_ids      UUID[],
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: giveaway_entries
-- ============================================================

CREATE TABLE public.giveaway_entries (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  giveaway_id UUID NOT NULL REFERENCES public.giveaways(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id),
  entry_data  JSONB NOT NULL DEFAULT '{}',
  is_winner   BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(giveaway_id, user_id)
);

-- ============================================================
-- TABLE: saved_accounts (favorites)
-- ============================================================

CREATE TABLE public.saved_accounts (
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.accounts_for_sale(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, account_id)
);

-- ============================================================
-- TABLE: support_tickets
-- ============================================================

CREATE TABLE public.support_tickets (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id),
  order_id    UUID REFERENCES public.orders(id),
  subject     TEXT NOT NULL,
  status      ticket_status NOT NULL DEFAULT 'open',
  priority    ticket_priority NOT NULL DEFAULT 'medium',
  category    TEXT NOT NULL DEFAULT 'general'
                CHECK (category IN ('payment','account','delivery','complaint','other')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE public.ticket_messages (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id  UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_id  UUID NOT NULL REFERENCES public.profiles(id),
  message    TEXT NOT NULL,
  is_staff   BOOLEAN NOT NULL DEFAULT false,
  attachments TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: notifications
-- ============================================================

CREATE TABLE public.notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  title      TEXT NOT NULL,
  body       TEXT,
  data       JSONB NOT NULL DEFAULT '{}',
  is_read    BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: featured_slots (monetization)
-- ============================================================

CREATE TABLE public.featured_slots (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id   UUID NOT NULL REFERENCES public.accounts_for_sale(id),
  seller_id    UUID NOT NULL REFERENCES public.profiles(id),
  slot_type    TEXT NOT NULL CHECK (slot_type IN ('homepage_hero','homepage_grid','search_top','category_top')),
  price_paid   NUMERIC(12,2) NOT NULL,
  starts_at    TIMESTAMPTZ NOT NULL,
  ends_at      TIMESTAMPTZ NOT NULL,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: ad_banners
-- ============================================================

CREATE TABLE public.ad_banners (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  image_url   TEXT NOT NULL,
  link_url    TEXT,
  placement   TEXT NOT NULL CHECK (placement IN ('header','sidebar','content','footer','popup')),
  is_active   BOOLEAN NOT NULL DEFAULT true,
  click_count INTEGER NOT NULL DEFAULT 0,
  view_count  INTEGER NOT NULL DEFAULT 0,
  starts_at   TIMESTAMPTZ,
  ends_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES — Optimized for 1M+ users
-- ============================================================

-- profiles
CREATE INDEX idx_profiles_username ON public.profiles USING btree (username);
CREATE INDEX idx_profiles_role ON public.profiles USING btree (role);
CREATE INDEX idx_profiles_seller_rating ON public.profiles USING btree (seller_rating DESC NULLS LAST)
  WHERE seller_verified = true;

-- accounts_for_sale
CREATE INDEX idx_accounts_status ON public.accounts_for_sale (status);
CREATE INDEX idx_accounts_seller ON public.accounts_for_sale (seller_id);
CREATE INDEX idx_accounts_rank ON public.accounts_for_sale (pubg_rank);
CREATE INDEX idx_accounts_price ON public.accounts_for_sale (price);
CREATE INDEX idx_accounts_level ON public.accounts_for_sale (pubg_level);
CREATE INDEX idx_accounts_featured ON public.accounts_for_sale (is_featured, created_at DESC)
  WHERE status = 'active';
CREATE INDEX idx_accounts_active_price ON public.accounts_for_sale (price, pubg_rank, pubg_level)
  WHERE status = 'active';
CREATE INDEX idx_accounts_search ON public.accounts_for_sale
  USING gin (to_tsvector('english', COALESCE(title_en,'') || ' ' || COALESCE(description_en,'')));
CREATE INDEX idx_accounts_search_uz ON public.accounts_for_sale
  USING gin (to_tsvector('simple', COALESCE(title_uz,'') || ' ' || COALESCE(description_uz,'')));
CREATE INDEX idx_accounts_created_desc ON public.accounts_for_sale (created_at DESC)
  WHERE status = 'active';

-- orders
CREATE INDEX idx_orders_buyer ON public.orders (buyer_id, created_at DESC);
CREATE INDEX idx_orders_seller ON public.orders (seller_id, created_at DESC);
CREATE INDEX idx_orders_status ON public.orders (status, created_at DESC);
CREATE INDEX idx_orders_number ON public.orders (order_number);

-- payments
CREATE INDEX idx_payments_order ON public.payments (order_id);
CREATE INDEX idx_payments_user ON public.payments (user_id, created_at DESC);

-- reviews
CREATE INDEX idx_reviews_seller ON public.reviews (seller_id, created_at DESC);

-- blog_posts
CREATE INDEX idx_blog_published ON public.blog_posts (is_published, published_at DESC)
  WHERE is_published = true;
CREATE INDEX idx_blog_category ON public.blog_posts (category, published_at DESC);
CREATE INDEX idx_blog_search ON public.blog_posts
  USING gin (to_tsvector('simple', COALESCE(title_uz,'') || ' ' || COALESCE(title_en,'')));

-- guides
CREATE INDEX idx_guides_category ON public.guides (category, published_at DESC);
CREATE INDEX idx_guides_published ON public.guides (is_published, published_at DESC);

-- skins
CREATE INDEX idx_skins_category ON public.skins (category, rarity);
CREATE INDEX idx_skins_rarity ON public.skins (rarity);
CREATE INDEX idx_skins_search ON public.skins
  USING gin (to_tsvector('simple', name));

-- giveaways
CREATE INDEX idx_giveaways_status ON public.giveaways (status, ends_at);

-- notifications
CREATE INDEX idx_notifications_user ON public.notifications (user_id, is_read, created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts_for_sale ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.giveaways ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.giveaway_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_banners ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (is_active = true AND is_banned = false);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ACCOUNTS policies
CREATE POLICY "Active accounts are viewable by everyone"
  ON public.accounts_for_sale FOR SELECT USING (status = 'active');

CREATE POLICY "Sellers can manage own accounts"
  ON public.accounts_for_sale FOR ALL USING (auth.uid() = seller_id);

CREATE POLICY "Admins can manage all accounts"
  ON public.accounts_for_sale FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','moderator')));

-- ORDERS policies
CREATE POLICY "Users can see own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can create orders"
  ON public.orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- REVIEWS policies
CREATE POLICY "Reviews are publicly readable"
  ON public.reviews FOR SELECT USING (is_hidden = false);

CREATE POLICY "Verified buyers can write reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_id AND buyer_id = auth.uid() AND status = 'completed'
    )
  );

-- BLOG policies
CREATE POLICY "Published posts are public"
  ON public.blog_posts FOR SELECT USING (is_published = true);

-- GUIDES policies
CREATE POLICY "Published guides are public"
  ON public.guides FOR SELECT USING (is_published = true);

-- SKINS policies
CREATE POLICY "Skins are publicly readable"
  ON public.skins FOR SELECT USING (true);

-- GIVEAWAYS policies
CREATE POLICY "Active giveaways are public"
  ON public.giveaways FOR SELECT USING (status IN ('active','upcoming','ended'));

-- NOTIFICATIONS policies
CREATE POLICY "Users see own notifications"
  ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- SAVED ACCOUNTS policies
CREATE POLICY "Users manage own favorites"
  ON public.saved_accounts FOR ALL USING (auth.uid() = user_id);

-- SUPPORT TICKETS policies
CREATE POLICY "Users see own tickets"
  ON public.support_tickets FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users create own tickets"
  ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);

-- AD BANNERS public read
CREATE POLICY "Ad banners are publicly readable"
  ON public.ad_banners FOR SELECT USING (is_active = true);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_accounts_updated_at
  BEFORE UPDATE ON public.accounts_for_sale
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || SUBSTR(NEW.id::TEXT, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update seller rating when review added
CREATE OR REPLACE FUNCTION public.update_seller_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET
    seller_rating = (
      SELECT ROUND(AVG(rating)::NUMERIC, 2)
      FROM public.reviews
      WHERE seller_id = NEW.seller_id AND is_hidden = false
    ),
    total_reviews = (
      SELECT COUNT(*) FROM public.reviews
      WHERE seller_id = NEW.seller_id AND is_hidden = false
    )
  WHERE id = NEW.seller_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_seller_rating
  AFTER INSERT OR UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_seller_rating();

-- Slug generator for accounts
CREATE OR REPLACE FUNCTION public.generate_account_slug(title TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  base_slug := LOWER(REGEXP_REPLACE(TRIM(title), '[^a-z0-9\s-]', '', 'g'));
  base_slug := REGEXP_REPLACE(base_slug, '\s+', '-', 'g');
  base_slug := REGEXP_REPLACE(base_slug, '-+', '-', 'g');
  base_slug := SUBSTR(base_slug, 1, 60);
  final_slug := base_slug;

  WHILE EXISTS (SELECT 1 FROM public.accounts_for_sale WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;

  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Platform fee calculation
CREATE OR REPLACE FUNCTION public.calculate_platform_fee(amount NUMERIC)
RETURNS NUMERIC AS $$
BEGIN
  -- 8% commission, minimum 5000 UZS
  RETURN GREATEST(ROUND(amount * 0.08, 2), 5000);
END;
$$ LANGUAGE plpgsql IMMUTABLE;
