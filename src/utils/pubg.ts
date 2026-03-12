import type { Locale } from '@/i18n/request';

export const RANKS = [
  { value: 'conqueror', label: { uz: 'Conqueror', en: 'Conqueror' } },
  { value: 'ace_dominator', label: { uz: 'Ace Dominator', en: 'Ace Dominator' } },
  { value: 'ace_master', label: { uz: 'Ace Master', en: 'Ace Master' } },
  { value: 'ace', label: { uz: 'Ace', en: 'Ace' } },
  { value: 'crown', label: { uz: 'Crown', en: 'Crown' } },
  { value: 'diamond', label: { uz: 'Diamond', en: 'Diamond' } },
  { value: 'platinum', label: { uz: 'Platinum', en: 'Platinum' } },
  { value: 'gold', label: { uz: 'Gold', en: 'Gold' } },
  { value: 'silver', label: { uz: 'Silver', en: 'Silver' } },
  { value: 'bronze', label: { uz: 'Bronze', en: 'Bronze' } },
] as const;

export const RANK_LABELS: Record<string, Record<Locale, string>> = {
  conqueror:      { uz: 'Conqueror', en: 'Conqueror' },
  ace_dominator:  { uz: 'Ace Dominator', en: 'Ace Dominator' },
  ace_master:     { uz: 'Ace Master', en: 'Ace Master' },
  ace:            { uz: 'Ace', en: 'Ace' },
  crown:          { uz: 'Crown', en: 'Crown' },
  diamond:        { uz: 'Diamond', en: 'Diamond' },
  platinum:       { uz: 'Platinum', en: 'Platinum' },
  gold:           { uz: 'Gold', en: 'Gold' },
  silver:         { uz: 'Silver', en: 'Silver' },
  bronze:         { uz: 'Bronze', en: 'Bronze' },
};

export const RANK_COLORS: Record<string, string> = {
  conqueror:     'bg-brand-500/20 text-brand-300 border border-brand-500/50',
  ace_dominator: 'bg-red-600/20 text-red-400 border border-red-600/30',
  ace_master:    'bg-red-500/20 text-red-400 border border-red-500/30',
  ace:           'bg-red-400/20 text-red-300 border border-red-400/30',
  crown:         'bg-purple-500/20 text-purple-400 border border-purple-500/30',
  diamond:       'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
  platinum:      'bg-teal-500/20 text-teal-400 border border-teal-500/30',
  gold:          'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  silver:        'bg-gray-400/20 text-gray-300 border border-gray-400/30',
  bronze:        'bg-orange-700/20 text-orange-400 border border-orange-700/30',
};

export const RANK_ORDER: Record<string, number> = {
  conqueror: 10, ace_dominator: 9, ace_master: 8, ace: 7,
  crown: 6, diamond: 5, platinum: 4, gold: 3, silver: 2, bronze: 1,
};

export const SERVERS = [
  { value: 'asia', label: 'Asia' },
  { value: 'eu', label: 'Europe' },
  { value: 'na', label: 'North America' },
  { value: 'krjp', label: 'Korea/Japan' },
  { value: 'sa', label: 'South America' },
];

export const RARITY_COLORS: Record<string, string> = {
  uncommon:  'bg-gray-500/20 text-gray-300 border border-gray-500/30',
  rare:      'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  epic:      'bg-purple-500/20 text-purple-400 border border-purple-500/30',
  legendary: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  mythic:    'bg-red-500/20 text-red-400 border border-red-500/30',
  ultimate:  'bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300 border border-pink-500/30',
};
