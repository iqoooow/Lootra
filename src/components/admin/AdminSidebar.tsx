'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, ShoppingBag, Package, BookOpen,
  Gift, Zap, BarChart2, Settings, MessageSquare, Shield, Image
} from 'lucide-react';
import { cn } from '@/utils/cn';

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/accounts', icon: ShoppingBag, label: 'Accounts' },
  { href: '/admin/orders', icon: Package, label: 'Orders' },
  { href: '/admin/uc-packages', icon: Zap, label: 'UC Packages' },
  { href: '/admin/blog', icon: BookOpen, label: 'Blog Posts' },
  { href: '/admin/guides', icon: Shield, label: 'Guides' },
  { href: '/admin/skins', icon: Image, label: 'Skins' },
  { href: '/admin/giveaways', icon: Gift, label: 'Giveaways' },
  { href: '/admin/tickets', icon: MessageSquare, label: 'Support' },
  { href: '/admin/analytics', icon: BarChart2, label: 'Analytics' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
];

export function AdminSidebar({ profile }: { profile: any }) {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 bg-dark-900 border-r border-surface-border flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-surface-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gold-gradient flex items-center justify-center">
            <span className="font-display font-bold text-dark-950">S</span>
          </div>
          <div>
            <p className="font-display font-bold text-white text-sm">SHAX Admin</p>
            <p className="text-2xs text-dark-400 capitalize">{profile.role}</p>
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
                  ? 'bg-brand-500/15 text-brand-400 font-medium'
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
          <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center">
            <span className="text-xs font-bold text-brand-400">
              {(profile.display_name ?? profile.username)?.[0]?.toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{profile.display_name ?? profile.username}</p>
            <p className="text-xs text-dark-400 capitalize">{profile.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
