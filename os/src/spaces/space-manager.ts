import AsyncStorage from '@react-native-async-storage/async-storage';
import { uid } from '../utils/uid';
import type { Space, Buddy, SpaceApp, SpaceData } from './types';

const SPACES_KEY = '@futurebuddy/spaces';
const spaceDataKey = (id: string) => `@futurebuddy/space/${id}/data`;
const spaceConvosKey = (id: string) => `@futurebuddy/space/${id}/convos`;

export async function listSpaces(): Promise<Space[]> {
  const raw = await AsyncStorage.getItem(SPACES_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function getSpace(id: string): Promise<Space | null> {
  const spaces = await listSpaces();
  return spaces.find((s) => s.id === id) ?? null;
}

export async function createSpace(params: {
  slug: string;
  name: string;
  icon: string;
  color: string;
  buddy: Buddy;
  apps?: SpaceApp[];
}): Promise<Space> {
  const spaces = await listSpaces();
  const space: Space = {
    id: uid(12),
    slug: params.slug,
    name: params.name,
    icon: params.icon,
    color: params.color,
    buddy: params.buddy,
    apps: params.apps ?? [],
    createdAt: new Date().toISOString(),
  };
  spaces.push(space);
  await AsyncStorage.setItem(SPACES_KEY, JSON.stringify(spaces));
  return space;
}

export async function updateSpace(id: string, updates: Partial<Omit<Space, 'id' | 'createdAt'>>): Promise<Space | null> {
  const spaces = await listSpaces();
  const idx = spaces.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  spaces[idx] = { ...spaces[idx], ...updates };
  await AsyncStorage.setItem(SPACES_KEY, JSON.stringify(spaces));
  return spaces[idx];
}

export async function deleteSpace(id: string): Promise<boolean> {
  const spaces = await listSpaces();
  const filtered = spaces.filter((s) => s.id !== id);
  if (filtered.length === spaces.length) return false;
  await AsyncStorage.setItem(SPACES_KEY, JSON.stringify(filtered));
  await AsyncStorage.removeItem(spaceDataKey(id));
  await AsyncStorage.removeItem(spaceConvosKey(id));
  return true;
}

export async function getSpaceData(id: string): Promise<SpaceData> {
  const raw = await AsyncStorage.getItem(spaceDataKey(id));
  return raw ? JSON.parse(raw) : {};
}

export async function setSpaceData(id: string, data: SpaceData): Promise<void> {
  await AsyncStorage.setItem(spaceDataKey(id), JSON.stringify(data));
}

export async function mergeSpaceData(id: string, partial: SpaceData): Promise<SpaceData> {
  const existing = await getSpaceData(id);
  const merged = { ...existing, ...partial };
  await AsyncStorage.setItem(spaceDataKey(id), JSON.stringify(merged));
  return merged;
}
