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
import { typography, spacing } from '../src/theme';
import { useTheme } from '../src/context/ThemeContext';

const CUENTA_DONACION = '3500480997';

export default function AcercaDeScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Acerca de' });
  }, []);

  const handleCopyAccount = async () => {
    await Clipboard.setStringAsync(CUENTA_DONACION);
    Alert.alert('Copiado', 'Número de cuenta copiado al portapapeles');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.logoSection}>
        <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
          <Image
            source={require('../assets/icon_outline.png')}
            style={styles.logo}
          />
        </View>
        <Text style={[styles.appName, { color: colors.primary }]}>Car Check</Text>
        <Text style={[styles.version, { color: colors.textLight }]}>Versión {Constants.expoConfig?.version || '1.0.0'}</Text>
      </View>

      <Text style={[styles.description, { color: colors.textSecondary }]}>
        Aplicación para el control y registro de mantenimiento de vehículos,
        cargas de combustible y seguimiento de kilometraje.
      </Text>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="heart-outline" size={20} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Donaciones voluntarias</Text>
        </View>
        <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
          Si esta aplicación te es útil, puedes apoyar su desarrollo con una
          donación voluntaria. Escanea el código QR para realizar tu depósito.
        </Text>
        <View style={[styles.qrContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Image
            source={require('../assets/qr-donacion.png')}
            style={styles.qrImage}
            resizeMode="contain"
          />
          <View style={styles.accountSection}>
            <Text style={[styles.accountLabel, { color: colors.textSecondary }]}>O deposita a la cuenta:</Text>
            <TouchableOpacity style={[styles.accountRow, { backgroundColor: colors.background, borderColor: colors.border }]} onPress={handleCopyAccount}>
              <Text style={[styles.accountNumber, { color: colors.textPrimary }]}>{CUENTA_DONACION}</Text>
              <Ionicons name="copy-outline" size={18} color={colors.secondary} />
            </TouchableOpacity>
            <Text style={[styles.accountHint, { color: colors.textLight }]}>Toca el número para copiarlo</Text>
          </View>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="person-outline" size={20} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Desarrollado por: Ismael Jancko</Text>
        </View>
        <TouchableOpacity
          style={[styles.contactRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => Linking.openURL('mailto:bobismaeljg@gmail.com')}
        >
          <Ionicons name="mail-outline" size={20} color={colors.secondary} />
          <Text style={[styles.contactText, { color: colors.secondary }]}>bobismaeljg@gmail.com</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  version: {
    ...typography.body,
  },
  description: {
    ...typography.body,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.md,
  },
  divider: {
    width: '100%',
    height: 1,
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
  },
  sectionDesc: {
    ...typography.bodySmall,
    lineHeight: 20,
  },
  qrContainer: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
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
    textAlign: 'center',
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
  },
  accountNumber: {
    ...typography.body,
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 1,
  },
  accountHint: {
    ...typography.caption,
    textAlign: 'center',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
  },
  contactText: {
    ...typography.body,
  },
});
