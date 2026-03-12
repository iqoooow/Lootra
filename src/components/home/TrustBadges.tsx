import { Shield, Zap, Star, Clock, HeartHandshake, Lock } from 'lucide-react';

const badges = [
  { icon: Shield, label_uz: 'Xavfsiz savdo', label_en: 'Safe Trading' },
  { icon: Zap, label_uz: 'Tezkor yetkazish', label_en: 'Fast Delivery' },
  { icon: Star, label_uz: 'Tasdiqlangan sotuvchilar', label_en: 'Verified Sellers' },
  { icon: Clock, label_uz: '24/7 Yordam', label_en: '24/7 Support' },
  { icon: HeartHandshake, label_uz: 'Pul qaytarish kafolati', label_en: 'Money-Back Guarantee' },
  { icon: Lock, label_uz: 'Shifrlangan to\'lov', label_en: 'Encrypted Payments' },
];

export function TrustBadges() {
  return (
    <div className="border-y border-surface-border bg-dark-900/50 py-5">
      <div className="container-page">
        <div className="flex items-center justify-between gap-4 overflow-x-auto scroll-x">
          {badges.map(({ icon: Icon, label_uz, label_en }) => (
            <div key={label_en} className="flex items-center gap-2.5 shrink-0 px-1">
              <Icon size={16} className="text-brand-400" />
              <span className="text-dark-200 text-sm whitespace-nowrap">{label_uz}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
