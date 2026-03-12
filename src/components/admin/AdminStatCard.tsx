import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

interface AdminStatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
  trend?: string;
  urgent?: boolean;
}

export function AdminStatCard({ label, value, icon: Icon, color, trend, urgent }: AdminStatCardProps) {
  return (
    <div className={cn(
      'card p-4 relative overflow-hidden',
      urgent && 'border-accent-red/30 bg-accent-red/5'
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center bg-white/5', urgent && 'bg-accent-red/15')}>
          {urgent ? <AlertTriangle size={16} className="text-accent-red" /> : <Icon size={16} className={color} />}
        </div>
        {trend && (
          <span className={cn(
            'text-xs font-medium flex items-center gap-0.5',
            trend.startsWith('+') ? 'text-accent-green' : 'text-accent-red'
          )}>
            {trend.startsWith('+') ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {trend}
          </span>
        )}
      </div>
      <p className="text-lg font-display font-bold text-white leading-tight">{value}</p>
      <p className="text-xs text-dark-400 mt-0.5">{label}</p>
    </div>
  );
}
