// Auto-generated types — run `npm run db:generate` to update from your live Supabase schema
// This is a typed stub — replace with generated output after running migrations

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          role: 'user' | 'seller' | 'admin' | 'moderator'
          locale: 'uz' | 'en'
          wallet_balance: number
          seller_verified: boolean
          seller_rating: number | null
          seller_total_sales: number
          total_reviews: number
          total_purchases: number
          is_active: boolean
          is_banned: boolean
          ban_reason: string | null
          phone_number: string | null
          telegram_handle: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      accounts_for_sale: {
        Row: {
          id: string
          seller_id: string
          title: string
          slug: string
          description: string | null
          pubg_id: string | null
          pubg_level: number
          pubg_rank: string
          season_highest_rank: string | null
          pubg_server: string
          uc_balance: number
          skin_count: number
          outfit_count: number
          gun_skin_count: number
          legendary_count: number
          price: number
          original_price: number | null
          discount_pct: number | null
          is_negotiable: boolean
          status: 'draft' | 'pending_review' | 'active' | 'sold' | 'suspended'
          is_featured: boolean
          is_instant_buy: boolean
          view_count: number
          favorite_count: number
          images: string[]
          video_url: string | null
          title_uz: string | null
          title_en: string | null
          description_uz: string | null
          description_en: string | null
          sold_at: string | null
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['accounts_for_sale']['Row'], 'id' | 'view_count' | 'favorite_count' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['accounts_for_sale']['Insert']>
      }
      uc_packages: {
        Row: {
          id: string
          name: string
          name_uz: string | null
          name_en: string | null
          uc_amount: number
          bonus_uc: number
          price_uzs: number
          price_usd: number | null
          original_price: number | null
          discount_pct: number
          image_url: string | null
          is_popular: boolean
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['uc_packages']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['uc_packages']['Insert']>
      }
      orders: {
        Row: {
          id: string
          order_number: string
          buyer_id: string
          seller_id: string | null
          order_type: 'account' | 'uc'
          account_id: string | null
          uc_package_id: string | null
          subtotal: number
          platform_fee: number
          discount_amount: number
          total_amount: number
          status: 'pending' | 'paid' | 'processing' | 'completed' | 'cancelled' | 'refunded' | 'disputed'
          pubg_id_delivery: string | null
          delivery_note: string | null
          paid_at: string | null
          completed_at: string | null
          cancelled_at: string | null
          cancel_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'order_number' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['orders']['Insert']>
      }
      blog_posts: {
        Row: {
          id: string
          author_id: string
          slug: string
          category: 'news' | 'patch_notes' | 'esports' | 'tips' | 'guides'
          title_uz: string
          title_en: string | null
          excerpt_uz: string | null
          excerpt_en: string | null
          content_uz: string
          content_en: string | null
          cover_image: string | null
          meta_title_uz: string | null
          meta_title_en: string | null
          meta_desc_uz: string | null
          meta_desc_en: string | null
          is_published: boolean
          is_featured: boolean
          view_count: number
          read_time_min: number | null
          tags: string[]
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['blog_posts']['Row'], 'id' | 'view_count' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['blog_posts']['Insert']>
      }
      guides: {
        Row: {
          id: string
          author_id: string
          slug: string
          category: 'sensitivity' | 'rank_push' | 'weapons' | 'beginners' | 'advanced' | 'device'
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          title_uz: string
          title_en: string | null
          content_uz: string
          content_en: string | null
          cover_image: string | null
          video_url: string | null
          meta_title_uz: string | null
          meta_title_en: string | null
          meta_desc_uz: string | null
          meta_desc_en: string | null
          is_published: boolean
          view_count: number
          like_count: number
          tags: string[]
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['guides']['Row'], 'id' | 'view_count' | 'like_count' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['guides']['Insert']>
      }
      skins: {
        Row: {
          id: string
          name: string
          name_uz: string | null
          name_en: string | null
          category: 'outfit' | 'gun_skin' | 'helmet' | 'backpack' | 'parachute' | 'vehicle' | 'emote' | 'title' | 'frame' | 'special'
          rarity: 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'ultimate'
          image_url: string
          thumbnail_url: string | null
          uc_cost: number | null
          release_date: string | null
          is_limited: boolean
          is_available: boolean
          description: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['skins']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['skins']['Insert']>
      }
      giveaways: {
        Row: {
          id: string
          creator_id: string
          title_uz: string
          title_en: string | null
          description_uz: string | null
          description_en: string | null
          prize_type: 'uc' | 'account' | 'skin' | 'custom'
          prize_value: number | null
          prize_uc_amount: number | null
          prize_account_id: string | null
          prize_description: string | null
          status: 'upcoming' | 'active' | 'ended' | 'cancelled'
          max_entries: number | null
          entry_count: number
          winner_count: number
          requirements: Json
          cover_image: string | null
          starts_at: string
          ends_at: string
          winner_ids: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['giveaways']['Row'], 'id' | 'entry_count' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['giveaways']['Insert']>
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          body: string | null
          data: Json
          is_read: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'is_read' | 'created_at'>
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }
      ad_banners: {
        Row: {
          id: string
          title: string
          image_url: string
          link_url: string | null
          placement: 'header' | 'sidebar' | 'content' | 'footer' | 'popup'
          is_active: boolean
          click_count: number
          view_count: number
          starts_at: string | null
          ends_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['ad_banners']['Row'], 'id' | 'click_count' | 'view_count' | 'created_at'>
        Update: Partial<Database['public']['Tables']['ad_banners']['Insert']>
      }
    }
    Views: {
      vw_account_listings: { Row: any }
      vw_order_details: { Row: any }
      mv_top_sellers: { Row: any }
      mv_top_players: { Row: any }
      mv_market_stats: { Row: any }
    }
    Functions: {
      search_accounts: { Args: any; Returns: any[] }
      estimate_account_value: { Args: any; Returns: Json }
      calculate_platform_fee: { Args: { amount: number }; Returns: number }
      refresh_materialized_views: { Args: Record<never, never>; Returns: void }
    }
    Enums: {
      user_role: 'user' | 'seller' | 'admin' | 'moderator'
      account_status: 'draft' | 'pending_review' | 'active' | 'sold' | 'suspended'
      order_status: 'pending' | 'paid' | 'processing' | 'completed' | 'cancelled' | 'refunded' | 'disputed'
      pubg_rank: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'crown' | 'ace' | 'ace_master' | 'ace_dominator' | 'conqueror'
      locale: 'uz' | 'en'
    }
  }
}
