import { create } from 'zustand';

interface SettingsState {
  biometricEnabled: boolean;
  isLocked: boolean;
  setBiometricEnabled: (enabled: boolean) => void;
  setLocked: (locked: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  biometricEnabled: false,
  isLocked: false,
  setBiometricEnabled: (biometricEnabled) => set({ biometricEnabled }),
  setLocked: (isLocked) => set({ isLocked }),
}));
