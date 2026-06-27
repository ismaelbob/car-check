import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useVehiculos } from '../src/context/VehiculoContext';
import { useConfig } from '../src/context/ConfigContext';
import { importarDatos } from '../src/export-import';
import { colors, typography, spacing } from '../src/theme';

export default function WelcomeScreen() {
  const router = useRouter();
  const { vehiculos, setVehiculoActivo, recargarVehiculos } = useVehiculos();
  const { recargarConfig } = useConfig();
  const [importing, setImporting] = useState(false);

  const handleSelectVehicle = (index) => {
    setVehiculoActivo(index);
    router.replace('/home');
  };

  const handleSettings = () => {
    router.push('/configuracion');
  };

  const handleAddVehicle = () => {
    router.push('/registro');
  };

  const handleImportar = async () => {
    Alert.alert(
      'Importar datos',
      'Todos los datos actuales serán reemplazados por los del archivo. Esta acción no se puede deshacer. ¿Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Importar',
          style: 'destructive',
          onPress: async () => {
            setImporting(true);
            try {
              const result = await importarDatos();
              if (result.cancelled) {
                setImporting(false);
                return;
              }
              await Promise.all([recargarVehiculos(), recargarConfig()]);
              setVehiculoActivo(0);
              Alert.alert('Importación exitosa', 'Los datos fueron importados correctamente');
            } catch (e) {
              Alert.alert('Error', e.message || 'No se pudo importar los datos');
            } finally {
              setImporting(false);
            }
          },
        },
      ]
    );
  };

  if (vehiculos.length === 0) {
    return (
      <View style={styles.wrapper}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyBrand}>
            <Image source={require('../assets/icon_outline.png')} style={styles.emptyBrandIcon} />
            <Text style={styles.appTitle}>Car Check</Text>
          </View>
          <View style={styles.emptyBody}>
            <Text style={styles.emptyTitle}>Bienvenido</Text>
            <Text style={styles.emptySubtitle}>
              Registra tu primer vehículo para comenzar
            </Text>
            <TouchableOpacity style={styles.button} onPress={handleAddVehicle}>
              <Ionicons name="add-circle-outline" size={22} color={colors.white} />
              <Text style={styles.buttonText}>Agregar vehículo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.importBtn, importing && styles.importBtnDisabled]}
              onPress={handleImportar}
              disabled={importing}
            >
              <Ionicons name="cloud-download-outline" size={22} color={colors.white} />
              <Text style={styles.buttonText}>
                {importing ? 'Importando…' : 'Importar datos'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      <TouchableOpacity
        style={styles.footer}
        onPress={() => router.push('/acerca-de')}
      >
        <Text style={styles.footerText}>Development by IsmaelBob</Text>
        <Ionicons name="chevron-forward-outline" size={14} color={colors.secondary} />
      </TouchableOpacity>
    </View>
    );
  }
  
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Image source={require('../assets/icon_outline.png')} style={styles.headerIcon} />
          <Text style={styles.headerTitle}>Car Check</Text>
          <Text style={styles.headerSubtitle}>Selecciona un vehículo para ingresar</Text>
        </View>
        <FlatList
          data={vehiculos}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.vehicleCard}
              onPress={() => handleSelectVehicle(index)}
              activeOpacity={0.7}
            >
              <View style={styles.vehiclePhoto}>
                {item.foto ? (
                  <Image source={{ uri: item.foto }} style={styles.vehicleImage} />
                ) : (
                  <Ionicons name="car-sport-outline" size={36} color={colors.primary} />
                )}
              </View>
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleName}>
                  {item.marca} {item.modelo}
                </Text>
                <Text style={styles.vehicleDetail}>
                  {item.placa} · {item.año}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color={colors.textLight} />
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.fabContainer}>
          <TouchableOpacity style={styles.fabSecondary} onPress={handleSettings}>
            <Ionicons name="settings-outline" size={24} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.fab} onPress={handleAddVehicle}>
            <Ionicons name="add" size={28} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        style={styles.footer}
        onPress={() => router.push('/acerca-de')}
      >
        <Text style={styles.footerText}>Development by IsmaelBob</Text>
        <Ionicons name="chevron-forward-outline" size={14} color={colors.secondary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 60,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  headerIcon: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginBottom: -10,
  },
  emptyBrandIcon: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  headerTitle: {
    ...typography.h1,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.white,
    opacity: 0.8,
  },
  list: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  vehiclePhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  vehicleImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  vehicleInfo: {
    flex: 1,
    gap: 2,
  },
  vehicleName: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  vehicleDetail: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  emptyBrand: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: spacing.xl,
  },
  appTitle: {
    ...typography.h1,
    color: colors.white,
    marginTop: -10,
  },
  emptyBody: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.primary,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  button: {
    backgroundColor: colors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: spacing.xl,
  },
  importBtn: {
    backgroundColor: colors.primary,
  },
  importBtnDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    ...typography.button,
    color: colors.white,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    alignItems: 'center',
    gap: 12,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  fabSecondary: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    ...typography.caption,
    color: colors.secondary,
  },
});
