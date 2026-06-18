import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { VehiculoProvider, useVehiculos } from '../src/context/VehiculoContext';
import { ConfigProvider } from '../src/context/ConfigContext';
import { colors } from '../src/theme';

SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { isReady } = useVehiculos();

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
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
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <VehiculoProvider>
      <ConfigProvider>
        <AppContent />
      </ConfigProvider>
    </VehiculoProvider>
  );
}
