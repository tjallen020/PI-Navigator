import { create } from 'zustand';

type Mode = 'plain' | 'technical';

type SettingsState = {
  languageMode: Mode;
  setLanguageMode: (mode: Mode) => void;
};

const preferenceKey = 'qi-tool-selector-preferences';

const loadInitial = (): Mode => {
  if (typeof window === 'undefined') return 'plain';
  const stored = window.localStorage.getItem(preferenceKey);
  if (!stored) return 'plain';
  try {
    const parsed = JSON.parse(stored) as { languageMode?: Mode };
    return parsed.languageMode ?? 'plain';
  } catch (error) {
    return 'plain';
  }
};

export const useSettingsStore = create<SettingsState>((set) => ({
  languageMode: loadInitial(),
  setLanguageMode: (mode) => {
    set({ languageMode: mode });
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(preferenceKey, JSON.stringify({ languageMode: mode }));
    }
  }
}));
