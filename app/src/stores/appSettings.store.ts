import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const LANG_KEY = 'fb_stt_language';

interface AppSettingsState {
  sttLanguage: string; // ISO 639-1 code, empty = auto-detect
  setSttLanguage: (lang: string) => void;
  loadSettings: () => Promise<void>;
}

export const useAppSettingsStore = create<AppSettingsState>((set) => ({
  sttLanguage: 'en',
  setSttLanguage: (lang) => {
    set({ sttLanguage: lang });
    SecureStore.setItemAsync(LANG_KEY, lang).catch(() => {});
  },
  loadSettings: async () => {
    const lang = await SecureStore.getItemAsync(LANG_KEY);
    if (lang !== null) set({ sttLanguage: lang });
  },
}));
