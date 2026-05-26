import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../src/theme';

export default function HistorialScreen() {
  return (
    <View style={styles.container}>
      <Ionicons name="time-outline" size={64} color={colors.textLight} />
      <Text style={styles.title}>Historial</Text>
      <Text style={styles.subtitle}>
        Tus revisiones aparecerán aquí
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.primary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
