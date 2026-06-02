import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { VehiculoProvider } from '../src/context/VehiculoContext';
import { ConfigProvider } from '../src/context/ConfigContext';
import { colors } from '../src/theme';

export default function RootLayout() {
  return (
    <VehiculoProvider>
      <ConfigProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="bienvenida" />
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
      </ConfigProvider>
    </VehiculoProvider>
  );
}
