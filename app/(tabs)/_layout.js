import { Tabs, usePathname } from 'expo-router';
import { TouchableOpacity, View, BackHandler } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { useTheme } from '../../src/context/ThemeContext';
import { spacing } from '../../src/theme';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';

export default function TabLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { isDark, colors } = useTheme();

  const navigationTheme = isDark
    ? { ...DarkTheme, colors: { ...DarkTheme.colors, background: colors.background, card: colors.surface } }
    : { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: colors.background, card: colors.surface } };

  useEffect(() => {
    const onBackPress = () => {
      if (pathname === '/historial' || pathname === '/proximos-cambios') {
        router.navigate('/home');
        return true;
      }
      if (pathname === '/home') {
        router.replace('/');
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [pathname]);

  return (
    <Tabs
      initialRouteName="home"
      theme={navigationTheme}
      contentStyle={{ backgroundColor: colors.background }}
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '600' },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.surface,
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
        name="home"
        options={{
          title: 'Inicio',
          headerTitle: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="car-sport-outline" size={size} color={color} />
          ),
          headerRight: () => (
            <View style={{ flexDirection: 'row', marginRight: 16, gap: spacing.md }}>
              <TouchableOpacity onPress={() => router.replace('/')}>
                <Ionicons name="home-outline" size={24} color={colors.white} />
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
