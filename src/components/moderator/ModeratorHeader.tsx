'use client';

import { useRouter } from 'next/navigation';
import { LogOut, Bell } from 'lucide-react';
import { useSupabase } from '@/hooks/useSupabase';

export function ModeratorHeader({ profile }: { profile: any }) {
  const router = useRouter();
  const { supabase } = useSupabase();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/uz/auth/login');
    router.refresh();
  };

  return (
    <header className="h-16 bg-dark-900 border-b border-surface-border flex items-center justify-between px-6 shrink-0">
      <div>
        <p className="text-sm font-medium text-white">Moderator Panel</p>
        <p className="text-xs text-dark-400">SHAX PUBG Marketplace</p>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-2 text-dark-400 hover:text-white transition-colors">
          <Bell size={18} />
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-dark-400 hover:text-white transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
}
