import { useLayoutEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  Linking,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import Constants from 'expo-constants';
import { colors, typography, spacing } from '../src/theme';

const CUENTA_DONACION = '3500480997';

export default function AcercaDeScreen() {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Acerca de' });
  }, []);

  const handleCopyAccount = async () => {
    await Clipboard.setStringAsync(CUENTA_DONACION);
    Alert.alert('Copiado', 'Número de cuenta copiado al portapapeles');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.logoSection}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/icon_outline.png')}
            style={styles.logo}
          />
        </View>
        <Text style={styles.appName}>Car Check</Text>
        <Text style={styles.version}>Versión {Constants.expoConfig?.version || '1.0.0'}</Text>
      </View>

      <Text style={styles.description}>
        Aplicación para el control y registro de mantenimiento de vehículos,
        cargas de combustible y seguimiento de kilometraje.
      </Text>

      <View style={styles.divider} />

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="heart-outline" size={20} color={colors.primary} />
          <Text style={styles.sectionTitle}>Donaciones voluntarias</Text>
        </View>
        <Text style={styles.sectionDesc}>
          Si esta aplicación te es útil, puedes apoyar su desarrollo con una
          donación voluntaria. Escanea el código QR para realizar tu depósito.
        </Text>
        <View style={styles.qrContainer}>
          <Image
            source={require('../assets/qr-donacion.png')}
            style={styles.qrImage}
            resizeMode="contain"
          />
          <View style={styles.accountSection}>
            <Text style={styles.accountLabel}>O deposita a la cuenta:</Text>
            <TouchableOpacity style={styles.accountRow} onPress={handleCopyAccount}>
              <Text style={styles.accountNumber}>{CUENTA_DONACION}</Text>
              <Ionicons name="copy-outline" size={18} color={colors.secondary} />
            </TouchableOpacity>
            <Text style={styles.accountHint}>Toca el número para copiarlo</Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="person-outline" size={20} color={colors.primary} />
          <Text style={styles.sectionTitle}>Desarrollado por: Ismael Jancko</Text>
        </View>
        <TouchableOpacity
          style={styles.contactRow}
          onPress={() => Linking.openURL('mailto:bobismaeljg@gmail.com')}
        >
          <Ionicons name="mail-outline" size={20} color={colors.secondary} />
          <Text style={styles.contactText}>bobismaeljg@gmail.com</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl * 2,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  appName: {
    ...typography.h1,
    color: colors.primary,
  },
  version: {
    ...typography.body,
    color: colors.textLight,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.md,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  section: {
    width: '100%',
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  sectionDesc: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  qrContainer: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  qrImage: {
    width: 220,
    height: 220,
  },
  accountSection: {
    width: '100%',
    gap: spacing.sm,
  },
  accountLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
  },
  accountNumber: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 1,
  },
  accountHint: {
    ...typography.caption,
    color: colors.textLight,
    textAlign: 'center',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
  },
  contactText: {
    ...typography.body,
    color: colors.secondary,
  },
});
