import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Appearance } from 'react-native';
import * as configDb from '../database-config';
import { lightColors, darkColors } from '../theme/colors';

const ThemeContext = createContext();

function getSystemScheme() {
  return Appearance.getColorScheme() || 'light';
}

export function ThemeProvider({ children }) {
  const [themeMode, setThemeMode] = useState('system');
  const [systemScheme, setSystemScheme] = useState(getSystemScheme);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme || 'light');
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const saved = await configDb.obtenerConfig('tema');
        if (saved && ['light', 'dark', 'system'].includes(saved)) {
          setThemeMode(saved);
        }
      } catch (e) {
        console.error('Error loading theme:', e);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const isDark =
    themeMode === 'dark' || (themeMode === 'system' && systemScheme === 'dark');

  const colors = isDark ? darkColors : lightColors;

  const cambiarTema = useCallback(async (mode) => {
    setThemeMode(mode);
    await configDb.guardarConfig('tema', mode);
  }, []);

  return (
    <ThemeContext.Provider value={{ themeMode, isDark, colors, cambiarTema, loaded }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider');
  }
  return context;
}
