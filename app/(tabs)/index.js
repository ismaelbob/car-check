import { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useVehiculos } from '../../src/context/VehiculoContext';
import VehicleCard from '../../src/components/VehicleCard';
import { colors, typography, spacing } from '../../src/theme';

export default function HomeScreen() {
  const router = useRouter();
  const {
    vehiculos,
    vehiculoActivo,
    mantenimientos,
    cargasCombustible,
    cargarHistorial,
  } = useVehiculos();

  const vehiculo = vehiculos[vehiculoActivo];

  useEffect(() => {
    if (vehiculo) {
      cargarHistorial(vehiculo.id);
    }
  }, [vehiculo?.id]);

  const ultimoKilometraje = useMemo(() => {
    if (!vehiculo) return '';
    const kms = [parseFloat(vehiculo.kilometrajeInicial) || 0];
    mantenimientos.forEach((m) => kms.push(parseFloat(m.kilometraje) || 0));
    cargasCombustible.forEach((c) => kms.push(parseFloat(c.kilometraje) || 0));
    return Math.max(...kms).toLocaleString();
  }, [vehiculo?.kilometrajeInicial, mantenimientos, cargasCombustible]);

  if (vehiculos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="car-sport-outline" size={80} color={colors.textLight} />
        <Text style={styles.emptyTitle}>Aún no tienes vehículos</Text>
        <Text style={styles.emptySubtitle}>
          Registra tu primer vehículo para comenzar
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/registro')}
        >
          <Ionicons name="add-circle-outline" size={22} color={colors.white} />
          <Text style={styles.addButtonText}>Agregar nuevo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <VehicleCard
        vehiculo={vehiculo}
        ultimoKilometraje={ultimoKilometraje}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: colors.background,
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
  addButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: spacing.xl,
  },
  addButtonText: {
    ...typography.button,
    color: colors.white,
  },
});
