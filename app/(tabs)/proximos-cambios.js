import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../src/theme';

export default function ProximosCambiosScreen() {
  return (
    <View style={styles.container}>
      <Ionicons name="construct-outline" size={64} color={colors.textLight} />
      <Text style={styles.title}>Próximos cambios</Text>
      <Text style={styles.subtitle}>
        Los mantenimientos programados aparecerán aquí
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
