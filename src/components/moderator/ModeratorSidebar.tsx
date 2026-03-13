'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ShoppingBag, MessageSquare,
  AlertTriangle, Flag, UserX, Shield
} from 'lucide-react';
import { cn } from '@/utils/cn';

const navItems = [
  { href: '/moderator/dashboard', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { href: '/moderator/listings',  icon: ShoppingBag,     label: 'Review Listings' },
  { href: '/moderator/comments',  icon: MessageSquare,   label: 'Moderate Comments' },
  { href: '/moderator/reports',   icon: Flag,            label: 'Reports' },
  { href: '/moderator/scam',      icon: AlertTriangle,   label: 'Scam Detection' },
  { href: '/moderator/sellers',   icon: UserX,           label: 'Warn / Suspend' },
];

export function ModeratorSidebar({ profile }: { profile: any }) {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 bg-dark-900 border-r border-surface-border flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-surface-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center">
            <Shield size={14} className="text-white" />
          </div>
          <div>
            <p className="font-display font-bold text-white text-sm">SHAX Mod</p>
            <p className="text-xs text-dark-400">Moderator</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        {navItems.map(({ href, icon: Icon, label, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors',
                isActive
                  ? 'bg-accent-blue/15 text-accent-blue font-medium'
                  : 'text-dark-300 hover:text-white hover:bg-surface-overlay'
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Profile */}
      <div className="p-4 border-t border-surface-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-accent-blue/20 flex items-center justify-center">
            <span className="text-xs font-bold text-accent-blue">
              {(profile?.display_name ?? profile?.username)?.[0]?.toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {profile?.display_name ?? profile?.username}
            </p>
            <p className="text-xs text-dark-400">Moderator</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
