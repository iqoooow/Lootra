'use client';

import Link from 'next/link';
import { Bell, ExternalLink, LogOut } from 'lucide-react';
import { useSupabase } from '@/hooks/useSupabase';
import { useRouter } from 'next/navigation';

export function AdminHeader({ profile }: { profile: any }) {
  const { supabase } = useSupabase();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/uz/auth/login');
  };

  return (
    <header className="h-16 bg-dark-900 border-b border-surface-border flex items-center justify-between px-6 shrink-0">
      <div>
        <h2 className="text-sm font-semibold text-white">Admin Panel</h2>
        <p className="text-xs text-dark-400">shax.uz</p>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/uz"
          target="_blank"
          className="flex items-center gap-1.5 text-xs text-dark-300 hover:text-white transition-colors"
        >
          <ExternalLink size={13} />
          View Site
        </Link>

        <button className="relative p-2 rounded-xl text-dark-300 hover:text-white hover:bg-surface-overlay transition-colors">
          <Bell size={16} />
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs text-dark-300 hover:text-accent-red transition-colors"
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </header>
  );
}
