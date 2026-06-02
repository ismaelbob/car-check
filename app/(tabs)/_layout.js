import { Tabs } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../src/theme';

export default function TabLayout() {
  const router = useRouter();
  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '600' },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          paddingBottom: 6,
          paddingTop: 6,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="historial"
        options={{
          title: 'Historial',
          headerTitle: 'Historial',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          headerTitle: 'Car Check',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="car-sport-outline" size={size} color={color} />
          ),
          headerRight: () => (
            <View style={{ flexDirection: 'row', marginRight: 16, gap: spacing.md }}>
              <TouchableOpacity onPress={() => router.push('/bienvenida')}>
                <Ionicons name="home-outline" size={24} color={colors.white} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/configuracion')}>
                <Ionicons name="settings-outline" size={24} color={colors.white} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="proximos-cambios"
        options={{
          title: 'Próximos cambios',
          headerTitle: 'Próximos cambios',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="construct-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
