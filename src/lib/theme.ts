import { useEffect } from 'react';
import type { ThemePreference } from './user-settings';

const THEME_STORAGE_KEY = 'trustedmm-theme';
const COMPACT_STORAGE_KEY = 'trustedmm-compact-ui';

function resolveThemeClasses(theme: ThemePreference): string[] {
  if (theme === 'system') {
    const prefersDark =
      typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? ['theme-system-dark'] : ['theme-system-light'];
  }
  if (theme === 'light') return ['theme-light'];
  return ['theme-dark'];
}

export function applyTheme(theme: ThemePreference) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.dataset.theme = theme;
  root.classList.remove('theme-dark', 'theme-light', 'theme-system-dark', 'theme-system-light');
  root.classList.add(...resolveThemeClasses(theme));
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export function applyCompactUi(compact: boolean) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('compact-ui', compact);
  localStorage.setItem(COMPACT_STORAGE_KEY, compact ? '1' : '0');
}

export function loadStoredTheme(): ThemePreference {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'system' || stored === 'dark') return stored;
  return 'dark';
}

export function loadStoredCompactUi(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(COMPACT_STORAGE_KEY) === '1';
}

export function useThemeBootstrap() {
  useEffect(() => {
    applyTheme(loadStoredTheme());
    applyCompactUi(loadStoredCompactUi());

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onSystemChange = () => {
      if (loadStoredTheme() === 'system') applyTheme('system');
    };
    media.addEventListener('change', onSystemChange);
    return () => media.removeEventListener('change', onSystemChange);
  }, []);
}
