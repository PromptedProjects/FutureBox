import { create } from 'zustand';
import type { Space } from '../spaces/types';
import { listSpaces, createSpace, deleteSpace, updateSpace } from '../spaces/space-manager';
import { seedDefaultSpaces } from '../spaces/seed';
import type { Buddy, SpaceApp } from '../spaces/types';

interface SpacesState {
  spaces: Space[];
  activeSpaceId: string | null;
  loaded: boolean;

  loadSpaces: () => Promise<void>;
  switchSpace: (id: string | null) => void;
  addSpace: (params: {
    slug: string;
    name: string;
    icon: string;
    color: string;
    buddy: Buddy;
    apps?: SpaceApp[];
  }) => Promise<Space>;
  removeSpace: (id: string) => Promise<void>;
  editSpace: (id: string, updates: Partial<Omit<Space, 'id' | 'createdAt'>>) => Promise<void>;
}

export const useSpacesStore = create<SpacesState>((set, get) => ({
  spaces: [],
  activeSpaceId: null,
  loaded: false,

  loadSpaces: async () => {
    await seedDefaultSpaces();
    const spaces = await listSpaces();
    set({ spaces, loaded: true });
  },

  switchSpace: (id) => set({ activeSpaceId: id }),

  addSpace: async (params) => {
    const space = await createSpace(params);
    set((s) => ({ spaces: [...s.spaces, space] }));
    return space;
  },

  removeSpace: async (id) => {
    await deleteSpace(id);
    set((s) => ({
      spaces: s.spaces.filter((sp) => sp.id !== id),
      activeSpaceId: s.activeSpaceId === id ? null : s.activeSpaceId,
    }));
  },

  editSpace: async (id, updates) => {
    const updated = await updateSpace(id, updates);
    if (updated) {
      set((s) => ({
        spaces: s.spaces.map((sp) => (sp.id === id ? updated : sp)),
      }));
    }
  },
}));
