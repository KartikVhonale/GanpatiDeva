import React, { createContext, useContext, useState, useEffect } from 'react';

export const THEMES = [
  {
    id: 'terracotta',
    name: {
      mr: 'White',
      en: 'White',
    },
    shortName: {
      mr: 'White',
      en: 'White',
    },
    subtitle: {
      mr: 'शांत',
      en: 'Calm',
    },
    description: {
      mr: 'शांत',
      en: 'Calm',
    },
    isLight: true,
    bgHex: '#FFFDD0',
    bgAltHex: '#F5F5DC',
    accentHex: '#CC5500',
    accentDarkHex: '#B7410E',
    textDarkHex: '#2B2B2B',
    previewSwatches: ['#FFFDD0', '#F5F5DC', '#CC5500', '#B7410E', '#2B2B2B'],
  },
  {
    id: 'midnight',
    name: {
      mr: 'Dark',
      en: 'Dark',
    },
    shortName: {
      mr: 'Dark',
      en: 'Dark',
    },
    subtitle: {
      mr: 'उत्सवी',
      en: 'Festive',
    },
    description: {
      mr: 'उत्सवी',
      en: 'Festive',
    },
    isLight: false,
    bgHex: '#0d0705',
    bgAltHex: '#1f0d07',
    accentHex: '#ea580c',
    accentDarkHex: '#c2410c',
    textDarkHex: '#fff7ed',
    previewSwatches: ['#0d0705', '#1a0b06', '#ea580c', '#f59e0b', '#fbbf24'],
  },
];

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem('ganpati_selected_theme');
      if (saved && THEMES.some((t) => t.id === saved)) {
        return saved;
      }
    } catch {
      // ignore
    }
    // Default to White (terracotta)
    return 'terracotta';
  });

  const [themeModalOpen, setThemeModalOpen] = useState(false);

  const currentTheme = THEMES.find((t) => t.id === theme) || THEMES[0];
  const isLight = theme === 'terracotta';
  const isTerracotta = theme === 'terracotta';
  const isMidnight = theme === 'midnight';
  const isRoyal = theme === 'royal';
  const isGold = theme === 'gold';

  const setTheme = (newThemeId) => {
    if (!THEMES.some((t) => t.id === newThemeId)) return;
    setThemeState(newThemeId);
    try {
      localStorage.setItem('ganpati_selected_theme', newThemeId);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    // Apply data-theme on root HTML and body
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    THEMES.forEach((t) => {
      root.classList.remove(`theme-${t.id}`);
    });
    root.classList.add(`theme-${theme}`);

    // Update meta theme-color tag
    let metaTag = document.querySelector('meta[name="theme-color"]');
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.name = 'theme-color';
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute('content', currentTheme.accentHex || '#CC5500');
  }, [theme, currentTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        currentTheme,
        isLight,
        isTerracotta,
        isMidnight,
        isRoyal,
        isGold,
        themes: THEMES,
        themeModalOpen,
        setThemeModalOpen,
        openThemeModal: () => setThemeModalOpen(true),
        closeThemeModal: () => setThemeModalOpen(false),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
