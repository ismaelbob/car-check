import { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { Stack } from 'expo-router';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { VehiculoProvider, useVehiculos } from '../src/context/VehiculoContext';
import { ConfigProvider } from '../src/context/ConfigContext';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';

SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { isReady } = useVehiculos();
  const { isDark, colors } = useTheme();

  const navigationTheme = isDark
    ? { ...DarkTheme, colors: { ...DarkTheme.colors, background: colors.background, card: colors.surface } }
    : { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: colors.background, card: colors.surface } };

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background);
    StatusBar.setBarStyle('light-content');
  }, [colors.background]);

  return (
    <>
      <Stack theme={navigationTheme} screenOptions={{ headerShown: false, statusBarStyle: 'light' }} contentStyle={{ backgroundColor: colors.background }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="registro"
          options={{
            headerShown: true,
            headerStyle: { backgroundColor: colors.primary },
            headerTintColor: colors.white,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="configuracion"
          options={{
            headerShown: true,
            headerStyle: { backgroundColor: colors.primary },
            headerTintColor: colors.white,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="acerca-de"
          options={{
            headerShown: true,
            headerStyle: { backgroundColor: colors.primary },
            headerTintColor: colors.white,
            presentation: 'card',
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <VehiculoProvider>
        <ConfigProvider>
          <AppContent />
        </ConfigProvider>
      </VehiculoProvider>
    </ThemeProvider>
  );
}
