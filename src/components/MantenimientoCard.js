import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useVehiculos } from '../context/VehiculoContext';
import { useConfig } from '../context/ConfigContext';
import ConfirmDeleteRecordModal from './ConfirmDeleteRecordModal';
import { colors, typography, spacing } from '../theme';

const ICONOS_TIPO = {
  Aceite: 'water-outline',
  Frenos: 'disc-outline',
  Llantas: 'ellipse-outline',
  Afinación: 'settings-outline',
  Batería: 'battery-charging-outline',
  Transmisión: 'cog-outline',
  Suspensión: 'car-sport-outline',
  Otro: 'build-outline',
};

export default function MantenimientoCard({ mantenimiento, vehiculoId }) {
  const { eliminarMantenimiento } = useVehiculos();
  const { moneda } = useConfig();
  const [deleteVisible, setDeleteVisible] = useState(false);

  const info = `${mantenimiento.tipo} — ${mantenimiento.kilometraje} km`;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.tipoRow}>
          <Ionicons
            name={ICONOS_TIPO[mantenimiento.tipo] || 'build-outline'}
            size={22}
            color={colors.secondary}
          />
          <Text style={styles.tipo}>{mantenimiento.tipo}</Text>
        </View>
        <TouchableOpacity onPress={() => setDeleteVisible(true)} hitSlop={10}>
          <Ionicons name="trash-outline" size={18} color={colors.textLight} />
        </TouchableOpacity>
      </View>

      {mantenimiento.descripcion ? (
        <Text style={styles.descripcion}>{mantenimiento.descripcion}</Text>
      ) : null}

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Ionicons name="speedometer-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.detailText}>{mantenimiento.kilometraje} km</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.detailText}>{mantenimiento.fecha}</Text>
        </View>
        {mantenimiento.costo ? (
          <View style={styles.detailItem}>
            <Ionicons name="cash-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.detailText}>{moneda} {mantenimiento.costo}</Text>
          </View>
        ) : null}
      </View>

      {mantenimiento.taller ? (
        <View style={styles.tallerRow}>
          <Ionicons name="business-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.tallerText}>{mantenimiento.taller}</Text>
        </View>
      ) : null}

      <ConfirmDeleteRecordModal
        visible={deleteVisible}
        recordId={mantenimiento.id}
        tipo={mantenimiento.tipo}
        info={info}
        onClose={() => setDeleteVisible(false)}
        onConfirm={(id) => eliminarMantenimiento(id, vehiculoId)}
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
  descripcion: {
    ...typography.bodySmall,
    color: colors.textSecondary,
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
  tallerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  tallerText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});
