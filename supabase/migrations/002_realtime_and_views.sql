-- ============================================================
-- SHAX PUBG MARKETPLACE — Realtime + Views + Analytics
-- Supabase PostgreSQL Migration 002
-- ============================================================

-- ============================================================
-- ENABLE REALTIME
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.giveaway_entries;

-- ============================================================
-- MATERIALIZED VIEWS (for dashboard analytics)
-- ============================================================

-- Leaderboard: Top Sellers
CREATE MATERIALIZED VIEW public.mv_top_sellers AS
SELECT
  p.id,
  p.username,
  p.display_name,
  p.avatar_url,
  p.seller_rating,
  p.seller_total_sales,
  p.total_reviews,
  COUNT(DISTINCT a.id) AS active_listings,
  SUM(o.total_amount) FILTER (WHERE o.status = 'completed') AS total_revenue
FROM public.profiles p
LEFT JOIN public.accounts_for_sale a ON a.seller_id = p.id AND a.status = 'active'
LEFT JOIN public.orders o ON o.seller_id = p.id
WHERE p.seller_verified = true AND p.is_banned = false
GROUP BY p.id, p.username, p.display_name, p.avatar_url, p.seller_rating,
         p.seller_total_sales, p.total_reviews
ORDER BY total_revenue DESC NULLS LAST
LIMIT 100;

CREATE UNIQUE INDEX idx_mv_top_sellers ON public.mv_top_sellers (id);

-- Leaderboard: Top Players (by PUBG rank on listed accounts)
CREATE MATERIALIZED VIEW public.mv_top_players AS
SELECT
  p.id,
  p.username,
  p.display_name,
  p.avatar_url,
  MAX(a.pubg_rank) AS best_rank,
  MAX(a.pubg_level) AS best_level,
  COUNT(a.id) AS accounts_listed
FROM public.profiles p
JOIN public.accounts_for_sale a ON a.seller_id = p.id AND a.status IN ('active','sold')
WHERE p.is_banned = false
GROUP BY p.id, p.username, p.display_name, p.avatar_url
ORDER BY best_rank DESC, best_level DESC;

CREATE UNIQUE INDEX idx_mv_top_players ON public.mv_top_players (id);

-- Market Stats
CREATE MATERIALIZED VIEW public.mv_market_stats AS
SELECT
  COUNT(*) FILTER (WHERE status = 'active') AS active_listings,
  COUNT(*) FILTER (WHERE status = 'sold') AS total_sold,
  AVG(price) FILTER (WHERE status = 'active') AS avg_price,
  MIN(price) FILTER (WHERE status = 'active') AS min_price,
  MAX(price) FILTER (WHERE status = 'active') AS max_price,
  COUNT(DISTINCT seller_id) FILTER (WHERE status = 'active') AS active_sellers,
  NOW() AS last_updated
FROM public.accounts_for_sale;

-- Function to refresh all MVs (called by Edge Function cron)
CREATE OR REPLACE FUNCTION public.refresh_materialized_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_top_sellers;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_top_players;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_market_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- VIEWS (non-materialized, always fresh)
-- ============================================================

-- Account listings with seller info
CREATE OR REPLACE VIEW public.vw_account_listings AS
SELECT
  a.*,
  p.username AS seller_username,
  p.display_name AS seller_display_name,
  p.avatar_url AS seller_avatar,
  p.seller_rating,
  p.seller_verified,
  p.total_reviews AS seller_review_count
FROM public.accounts_for_sale a
JOIN public.profiles p ON p.id = a.seller_id
WHERE a.status = 'active';

-- Order details
CREATE OR REPLACE VIEW public.vw_order_details AS
SELECT
  o.*,
  a.title AS account_title,
  a.images AS account_images,
  a.pubg_rank AS account_rank,
  u.uc_amount,
  u.name AS uc_package_name,
  buyer.username AS buyer_username,
  buyer.display_name AS buyer_display_name,
  seller.username AS seller_username
FROM public.orders o
LEFT JOIN public.accounts_for_sale a ON a.id = o.account_id
LEFT JOIN public.uc_packages u ON u.id = o.uc_package_id
JOIN public.profiles buyer ON buyer.id = o.buyer_id
LEFT JOIN public.profiles seller ON seller.id = o.seller_id;

-- ============================================================
-- FULL TEXT SEARCH FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION public.search_accounts(
  query TEXT,
  p_locale locale DEFAULT 'uz',
  p_min_price NUMERIC DEFAULT NULL,
  p_max_price NUMERIC DEFAULT NULL,
  p_rank pubg_rank DEFAULT NULL,
  p_min_level INTEGER DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID, title TEXT, slug TEXT, pubg_rank pubg_rank,
  pubg_level INTEGER, price NUMERIC, images TEXT[],
  seller_username TEXT, seller_rating NUMERIC,
  view_count INTEGER, is_featured BOOLEAN,
  rank REAL
) AS $$
DECLARE
  search_col TEXT;
  title_col TEXT;
  desc_col TEXT;
BEGIN
  IF p_locale = 'en' THEN
    search_col := 'english';
    title_col := 'title_en';
    desc_col := 'description_en';
  ELSE
    search_col := 'simple';
    title_col := 'title_uz';
    desc_col := 'description_uz';
  END IF;

  RETURN QUERY EXECUTE format(
    'SELECT
      a.id, COALESCE(a.%I, a.title) AS title,
      a.slug, a.pubg_rank, a.pubg_level, a.price, a.images,
      p.username AS seller_username, p.seller_rating,
      a.view_count, a.is_featured,
      ts_rank(to_tsvector($3, COALESCE(a.%I, a.title)), plainto_tsquery($3, $1)) AS rank
    FROM public.accounts_for_sale a
    JOIN public.profiles p ON p.id = a.seller_id
    WHERE
      a.status = ''active''
      AND ($1 = '''' OR to_tsvector($3, COALESCE(a.%I, a.title) || '' '' || COALESCE(a.%I, '''')) @@ plainto_tsquery($3, $1))
      AND ($4 IS NULL OR a.price >= $4)
      AND ($5 IS NULL OR a.price <= $5)
      AND ($6 IS NULL OR a.pubg_rank = $6)
      AND ($7 IS NULL OR a.pubg_level >= $7)
    ORDER BY a.is_featured DESC, rank DESC, a.created_at DESC
    LIMIT $8 OFFSET $9',
    title_col, title_col, title_col, desc_col
  )
  USING query, p_locale, search_col, p_min_price, p_max_price,
        p_rank, p_min_level, p_limit, p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================
-- ACCOUNT VALUE ESTIMATOR
-- ============================================================

CREATE OR REPLACE FUNCTION public.estimate_account_value(
  p_rank pubg_rank,
  p_level INTEGER,
  p_uc_balance INTEGER,
  p_skin_count INTEGER,
  p_legendary_count INTEGER
)
RETURNS JSONB AS $$
DECLARE
  base_price NUMERIC;
  rank_multiplier NUMERIC;
  result JSONB;
BEGIN
  -- Base value by rank
  rank_multiplier := CASE p_rank
    WHEN 'bronze'         THEN 1.0
    WHEN 'silver'         THEN 1.2
    WHEN 'gold'           THEN 1.5
    WHEN 'platinum'       THEN 2.0
    WHEN 'diamond'        THEN 3.0
    WHEN 'crown'          THEN 5.0
    WHEN 'ace'            THEN 8.0
    WHEN 'ace_master'     THEN 12.0
    WHEN 'ace_dominator'  THEN 18.0
    WHEN 'conqueror'      THEN 30.0
    ELSE 1.0
  END;

  base_price :=
    (p_level * 5000) +                       -- 5000 UZS per level
    (p_uc_balance * 700) +                   -- UC at ~700 UZS each
    (p_skin_count * 30000) +                 -- avg skin value
    (p_legendary_count * 150000);            -- legendary premium

  base_price := base_price * rank_multiplier;

  result := jsonb_build_object(
    'estimated_min', ROUND(base_price * 0.85),
    'estimated_max', ROUND(base_price * 1.15),
    'estimated_mid', ROUND(base_price),
    'currency', 'UZS',
    'breakdown', jsonb_build_object(
      'rank_factor', rank_multiplier,
      'level_value', p_level * 5000,
      'uc_value', p_uc_balance * 700,
      'skins_value', p_skin_count * 30000,
      'legendary_value', p_legendary_count * 150000
    )
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
