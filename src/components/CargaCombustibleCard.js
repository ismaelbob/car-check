import { useState, useMemo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useVehiculos } from '../context/VehiculoContext';
import { useConfig } from '../context/ConfigContext';
import ConfirmDeleteRecordModal from './ConfirmDeleteRecordModal';
import { colors, typography, spacing } from '../theme';

export default function CargaCombustibleCard({ carga, vehiculoId }) {
  const { eliminarCargaCombustible } = useVehiculos();
  const { combustibles, moneda } = useConfig();
  const [deleteVisible, setDeleteVisible] = useState(false);
  const litros = parseFloat(carga.litros) || 0;
  const costoTotal = parseFloat(carga.costo) || 0;
  const combMap = useMemo(() => {
    const m = {};
    combustibles.forEach((c) => { m[c.nombre] = c; });
    return m;
  }, [combustibles]);
  const combData = combMap[carga.tipo_combustible];
  const unidad = combData ? combData.unidad : 'L';
  const precioPorLitro = litros > 0 ? (costoTotal / litros).toFixed(2) : '—';

  const tipo = carga.tipo_combustible || 'Combustible';
  const info = `${tipo} — ${carga.litros} ${unidad}`;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.tipoRow}>
          <Ionicons name="flame-outline" size={22} color={colors.warning} />
          <Text style={styles.tipo}>{tipo}</Text>
        </View>
        <TouchableOpacity onPress={() => setDeleteVisible(true)} hitSlop={10}>
          <Ionicons name="trash-outline" size={18} color={colors.textLight} />
        </TouchableOpacity>
      </View>

      <View style={styles.amountRow}>
        <Text style={styles.litros}>{carga.litros} {unidad}</Text>
        <Text style={styles.total}>{moneda} {carga.costo}</Text>
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
          <Text style={styles.detailText}>{moneda} {precioPorLitro}/{unidad}</Text>
        </View>
      </View>

      <ConfirmDeleteRecordModal
        visible={deleteVisible}
        recordId={carga.id}
        tipo={tipo}
        info={info}
        onClose={() => setDeleteVisible(false)}
        onConfirm={(id) => eliminarCargaCombustible(id, vehiculoId)}
      />
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
