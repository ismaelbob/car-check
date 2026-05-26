import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useVehiculos } from '../context/VehiculoContext';
import { colors, typography, spacing } from '../theme';

const UNIDADES = {
  'Gasolina': 'L',
  'GNV': 'm3',
  'Gasolina premium': 'L',
  'Diesel': 'L',
};

export default function CargaCombustibleCard({ carga, vehiculoId }) {
  const { eliminarCargaCombustible } = useVehiculos();
  const litros = parseFloat(carga.litros) || 0;
  const costoTotal = parseFloat(carga.costo) || 0;
  const unidad = UNIDADES[carga.tipo_combustible] || 'L';
  const precioPorLitro = litros > 0 ? (costoTotal / litros).toFixed(2) : '—';

  const handleDelete = () => {
    Alert.alert(
      'Eliminar carga',
      '¿Estás seguro de eliminar este registro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => eliminarCargaCombustible(carga.id, vehiculoId),
        },
      ]
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.tipoRow}>
          <Ionicons name="flame-outline" size={22} color={colors.warning} />
          <Text style={styles.tipo}>
            {carga.tipo_combustible || 'Combustible'}
          </Text>
        </View>
        <TouchableOpacity onPress={handleDelete} hitSlop={10}>
          <Ionicons name="trash-outline" size={18} color={colors.textLight} />
        </TouchableOpacity>
      </View>

      <View style={styles.amountRow}>
        <Text style={styles.litros}>{carga.litros} {unidad}</Text>
        <Text style={styles.total}>Bs {carga.costo}</Text>
      </View>

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Ionicons name="speedometer-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.detailText}>{carga.kilometraje} km</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.detailText}>{carga.fecha}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="pricetag-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.detailText}>Bs {precioPorLitro}/{unidad}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tipoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  tipo: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  litros: {
    ...typography.h2,
    color: colors.warning,
  },
  total: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});
