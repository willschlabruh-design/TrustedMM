import { useEffect } from 'react';
import type { ThemePreference } from '../lib/user-settings';

const STORAGE_KEY = 'trustedmm-theme';

export function applyTheme(theme: ThemePreference) {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = theme;
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('theme-system-dark', prefersDark);
    document.documentElement.classList.toggle('theme-system-light', !prefersDark);
  } else {
    document.documentElement.classList.remove('theme-system-dark', 'theme-system-light');
  }
  localStorage.setItem(STORAGE_KEY, theme);
}

export function loadStoredTheme(): ThemePreference {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'system' ? 'system' : 'dark';
}

export function useThemeBootstrap() {
  useEffect(() => {
    applyTheme(loadStoredTheme());
  }, []);
}
