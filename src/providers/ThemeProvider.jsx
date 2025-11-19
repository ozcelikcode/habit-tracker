import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEYS = {
  theme: 'ht-theme',
  mode: 'ht-mode',
};

export const THEME_PRESETS = [
  {
    id: 'emerald',
    label: 'Zümrüt',
    colors: {
      dark: {
        primary: '46 172 138',
        accent: '19 236 182',
        bg: '5 22 18',
        bgAlt: '12 32 26',
        card: '16 34 29',
        cardDeep: '9 24 21',
        border: '50 103 90',
        foreground: '244 250 247',
        muted: '183 202 196',
        onPrimary: '4 19 15',
      },
      light: {
        primary: '25 160 128',
        accent: '65 200 180',
        bg: '245 249 247',
        bgAlt: '255 255 255',
        card: '255 255 255',
        cardDeep: '232 242 238',
        border: '200 220 211',
        foreground: '19 36 33',
        muted: '104 120 117',
        onPrimary: '245 249 247',
      },
    },
  },
  {
    id: 'lavender',
    label: 'Lavanta Sis',
    colors: {
      dark: {
        primary: '167 139 250',
        accent: '129 140 248',
        bg: '18 16 36',
        bgAlt: '27 25 48',
        card: '33 30 56',
        cardDeep: '24 21 43',
        border: '93 79 140',
        foreground: '245 242 255',
        muted: '184 172 219',
        onPrimary: '20 16 36',
      },
      light: {
        primary: '139 92 246',
        accent: '167 139 250',
        bg: '249 247 255',
        bgAlt: '255 255 255',
        card: '255 255 255',
        cardDeep: '236 231 251',
        border: '214 204 244',
        foreground: '35 29 47',
        muted: '110 104 140',
        onPrimary: '249 247 255',
      },
    },
  },
  {
    id: 'sunset',
    label: 'Gün Batımı',
    colors: {
      dark: {
        primary: '248 113 113',
        accent: '252 211 77',
        bg: '29 17 18',
        bgAlt: '39 20 18',
        card: '48 22 23',
        cardDeep: '33 17 17',
        border: '119 65 63',
        foreground: '255 239 233',
        muted: '214 170 160',
        onPrimary: '38 16 16',
      },
      light: {
        primary: '239 83 80',
        accent: '255 167 38',
        bg: '255 249 247',
        bgAlt: '255 255 255',
        card: '255 255 255',
        cardDeep: '255 236 230',
        border: '253 218 206',
        foreground: '45 23 21',
        muted: '125 87 81',
        onPrimary: '255 249 247',
      },
    },
  },
];

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem(STORAGE_KEYS.mode) || 'dark');
  const [themeId, setThemeId] = useState(
    () => localStorage.getItem(STORAGE_KEYS.theme) || THEME_PRESETS[0].id
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.theme, themeId);
    localStorage.setItem(STORAGE_KEYS.mode, mode);

    const root = document.documentElement;
    const selected =
      THEME_PRESETS.find((theme) => theme.id === themeId)?.colors[mode] ??
      THEME_PRESETS[0].colors[mode];

    Object.entries(selected).forEach(([token, value]) => {
      root.style.setProperty(`--color-${token.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}`, value);
    });

    root.dataset.theme = themeId;
    root.dataset.mode = mode;
  }, [mode, themeId]);

  const value = useMemo(
    () => ({
      mode,
      themeId,
      themes: THEME_PRESETS,
      setTheme: setThemeId,
      toggleMode: () => setMode((prev) => (prev === 'dark' ? 'light' : 'dark')),
    }),
    [mode, themeId]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
