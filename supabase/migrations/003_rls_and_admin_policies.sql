-- ============================================================
-- SHAX PUBG MARKETPLACE — Migration 003
-- Additional RLS policies for admin/moderator operations
-- ============================================================

-- ── PROFILES: admins can read all profiles (including banned) ──
CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','moderator'))
  );

-- Admins can update any profile (role changes, bans, etc.)
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── ACCOUNTS: moderators can update status (approve/reject) ────
CREATE POLICY "Moderators can update account status"
  ON public.accounts_for_sale FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','moderator'))
  );

-- ── ORDERS: admins can view all orders ─────────────────────────
CREATE POLICY "Admins can view all orders"
  ON public.orders FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── PAYMENTS: admins can view all payments ─────────────────────
CREATE POLICY "Admins can view all payments"
  ON public.payments FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── REVIEWS: moderators can hide reviews ───────────────────────
CREATE POLICY "Moderators can update reviews"
  ON public.reviews FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','moderator'))
  );

-- ── SUPPORT TICKETS: staff can see all ─────────────────────────
CREATE POLICY "Staff can view all tickets"
  ON public.support_tickets FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','moderator'))
  );

CREATE POLICY "Staff can view all ticket messages"
  ON public.ticket_messages FOR ALL
  USING (
    auth.uid() = sender_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','moderator'))
  );

-- ── GIVEAWAYS: admins can manage ────────────────────────────────
CREATE POLICY "Admins can manage giveaways"
  ON public.giveaways FOR ALL
  USING (
    auth.uid() = creator_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── BLOG: admins can manage all posts ───────────────────────────
CREATE POLICY "Admins can manage all blog posts"
  ON public.blog_posts FOR ALL
  USING (
    auth.uid() = author_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── GUIDES: admins can manage all guides ────────────────────────
CREATE POLICY "Admins can manage all guides"
  ON public.guides FOR ALL
  USING (
    auth.uid() = author_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── SKINS: admins can manage ────────────────────────────────────
CREATE POLICY "Admins can manage skins"
  ON public.skins FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── AD BANNERS: admins can manage ───────────────────────────────
CREATE POLICY "Admins can manage ad banners"
  ON public.ad_banners FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── UC PACKAGES: admins can manage ──────────────────────────────
ALTER TABLE public.uc_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "UC packages publicly readable"
  ON public.uc_packages FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage UC packages"
  ON public.uc_packages FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── FEATURED SLOTS: sellers can create, admins manage ───────────
CREATE POLICY "Sellers can create featured slots"
  ON public.featured_slots FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Public can view active featured slots"
  ON public.featured_slots FOR SELECT
  USING (is_active = true AND ends_at > NOW());

CREATE POLICY "Admins can manage all featured slots"
  ON public.featured_slots FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── GIVEAWAY ENTRIES: users can enter ───────────────────────────
CREATE POLICY "Users can enter giveaways"
  ON public.giveaway_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own entries"
  ON public.giveaway_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all entries"
  ON public.giveaway_entries FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── NOTIFICATIONS: users can mark own as read ───────────────────
-- Already covered by "Users see own notifications" policy (FOR ALL)

-- ============================================================
-- HELPER FUNCTION: get_user_role (used in API routes)
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT AS $$
  SELECT role::TEXT FROM public.profiles WHERE id = user_id LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- ============================================================
-- Seller apply function (users -> seller role upgrade)
-- ============================================================

CREATE OR REPLACE FUNCTION public.apply_as_seller(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET role = 'seller'
  WHERE id = p_user_id AND role = 'user';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
