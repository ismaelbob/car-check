import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { VehiculoProvider } from '../src/context/VehiculoContext';
import { colors } from '../src/theme';

export default function RootLayout() {
  return (
    <VehiculoProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
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
      </Stack>
    </VehiculoProvider>
  );
}
