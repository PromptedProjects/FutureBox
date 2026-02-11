import { create } from 'zustand';

type WSState = 'disconnected' | 'connecting' | 'connected';

interface ConnectionState {
  wsState: WSState;
  pendingBadgeCount: number;
  setWSState: (state: WSState) => void;
  setPendingBadgeCount: (count: number) => void;
  incrementBadge: () => void;
  decrementBadge: () => void;
}

export const useConnectionStore = create<ConnectionState>((set) => ({
  wsState: 'disconnected',
  pendingBadgeCount: 0,
  setWSState: (wsState) => set({ wsState }),
  setPendingBadgeCount: (count) => set({ pendingBadgeCount: count }),
  incrementBadge: () => set((s) => ({ pendingBadgeCount: s.pendingBadgeCount + 1 })),
  decrementBadge: () => set((s) => ({ pendingBadgeCount: Math.max(0, s.pendingBadgeCount - 1) })),
}));
