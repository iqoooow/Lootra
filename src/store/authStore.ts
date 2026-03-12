import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: 'user' | 'seller' | 'admin' | 'moderator';
  locale: 'uz' | 'en';
  wallet_balance: number;
  seller_verified: boolean;
  seller_rating: number | null;
  seller_total_sales: number;
  total_reviews: number;
  total_purchases: number;
  is_active: boolean;
  is_banned: boolean;
  phone_number: string | null;
  telegram_handle: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  isAdmin: () => boolean;
  isSeller: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  isAdmin: () => {
    const role = get().profile?.role;
    return role === 'admin' || role === 'moderator';
  },
  isSeller: () => {
    const role = get().profile?.role;
    return role === 'seller' || role === 'admin';
  },
}));
