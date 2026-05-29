import { useEffect, useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useVehiculos } from '../../src/context/VehiculoContext';
import MantenimientoCard from '../../src/components/MantenimientoCard';
import CargaCombustibleCard from '../../src/components/CargaCombustibleCard';
import AddRecordSheet from '../../src/components/AddRecordSheet';
import MantenimientoForm from '../../src/components/MantenimientoForm';
import CargaCombustibleForm from '../../src/components/CargaCombustibleForm';
import { colors, typography, spacing } from '../../src/theme';

const TABS = ['Mantenimientos', 'Combustible'];

export default function HistorialScreen() {
  const {
    vehiculos,
    vehiculoActivo,
    mantenimientos,
    cargasCombustible,
    cargarHistorial,
  } = useVehiculos();

  const [tabActivo, setTabActivo] = useState(0);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [mantFormVisible, setMantFormVisible] = useState(false);
  const [cargaFormVisible, setCargaFormVisible] = useState(false);

  const vehiculo = vehiculos[vehiculoActivo];

  useEffect(() => {
    if (vehiculo) {
      cargarHistorial(vehiculo.id);
    }
  }, [vehiculo?.id]);

  const ultimoKilometraje = useMemo(() => {
    if (!vehiculo) return '';
    const kmInicial = parseFloat(vehiculo.kilometrajeInicial) || 0;
    const kms = [kmInicial];
    mantenimientos.forEach((m) => kms.push(parseFloat(m.kilometraje) || 0));
    cargasCombustible.forEach((c) => kms.push(parseFloat(c.kilometraje) || 0));
    return Math.max(...kms).toString();
  }, [vehiculo?.kilometrajeInicial, mantenimientos, cargasCombustible]);

  const registros = tabActivo === 0 ? mantenimientos : cargasCombustible;
  const hayRegistros = registros.length > 0;

  if (!vehiculo) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="time-outline" size={80} color={colors.textLight} />
        <Text style={styles.emptyTitle}>Sin vehículo activo</Text>
        <Text style={styles.emptySubtitle}>
          Agrega un vehículo en Inicio para ver tu historial
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.vehicleHeader}>
        <View style={styles.vehicleIcon}>
          <Ionicons name="car-sport-outline" size={20} color={colors.primary} />
        </View>
        <View>
          <Text style={styles.vehicleName}>
            {vehiculo.marca} {vehiculo.modelo}
          </Text>
          <Text style={styles.vehiclePlate}>{vehiculo.placa}</Text>
        </View>
      </View>

      <View style={styles.tabs}>
        {TABS.map((tab, index) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, index === tabActivo && styles.tabActive]}
            onPress={() => setTabActivo(index)}
          >
            <Text
              style={[styles.tabText, index === tabActivo && styles.tabTextActive]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {hayRegistros ? (
        <FlatList
          data={registros}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) =>
            tabActivo === 0 ? (
              <MantenimientoCard mantenimiento={item} vehiculoId={vehiculo.id} />
            ) : (
              <CargaCombustibleCard carga={item} vehiculoId={vehiculo.id} />
            )
          }
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyTab}>
          <Ionicons
            name={tabActivo === 0 ? 'settings-outline' : 'flame-outline'}
            size={48}
            color={colors.textLight}
          />
          <Text style={styles.emptyTabTitle}>
            No hay {tabActivo === 0 ? 'mantenimientos' : 'cargas de combustible'}
          </Text>
          <Text style={styles.emptyTabSubtitle}>
            Presiona + para agregar tu primer registro
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setSheetVisible(true)}
      >
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>

      <AddRecordSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onSelectMantenimiento={() => setMantFormVisible(true)}
        onSelectCarga={() => setCargaFormVisible(true)}
      />

      <MantenimientoForm
        visible={mantFormVisible}
        onClose={() => setMantFormVisible(false)}
        vehiculoId={vehiculo.id}
        ultimoKilometraje={ultimoKilometraje}
      />

      <CargaCombustibleForm
        visible={cargaFormVisible}
        onClose={() => setCargaFormVisible(false)}
        vehiculoId={vehiculo.id}
        combustibles={vehiculo.combustible}
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
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  vehicleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleName: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  vehiclePlate: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
  },
  emptyTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  emptyTabTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  emptyTabSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
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
});
