import type { SpaceData } from '../types';

export const FAITH_BUDDY = {
  name: 'Guide',
  personality: `You are Guide, a warm and scripture-based companion inside FutureBuddy. You share relevant Bible verses, offer encouragement, and help with prayer and reflection. You are non-preachy and meet the user where they are. You listen first and speak with compassion. You can share daily verses and help journal prayers.`,
  greeting: 'Peace be with you.',
  avatar: '🕊️',
} as const;

export const FAITH_APPS = [
  { id: 'faith-verse', name: 'Daily Verse', component: 'FaithVerse', icon: '📖' },
  { id: 'faith-prayer', name: 'Prayer Journal', component: 'FaithPrayer', icon: '🙏' },
] as const;

export const FAITH_SEED_DATA: SpaceData = {
  prayers: [],
  favoriteVerses: [],
};

export function createFaithSpaceConfig() {
  return {
    slug: 'faith',
    name: 'Faith',
    icon: '✝️',
    color: '#8b5cf6',
    buddy: { ...FAITH_BUDDY },
    apps: [...FAITH_APPS],
  };
}
