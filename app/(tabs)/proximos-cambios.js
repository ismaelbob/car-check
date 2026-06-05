import { useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useVehiculos } from '../../src/context/VehiculoContext';
import { colors, typography, spacing } from '../../src/theme';

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

function daysBetween(a, b) {
  const d1 = new Date(a + 'T00:00:00');
  const d2 = new Date(b + 'T00:00:00');
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
}

function formatDate(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatTimeAgo(days) {
  if (days < 30) {
    return `hace ${days} ${days === 1 ? 'día' : 'días'}`;
  }
  const months = Math.round(days / 30.44);
  if (months < 12) {
    return `hace ${months} ${months === 1 ? 'mes' : 'meses'}`;
  }
  const years = Math.floor(days / 365.25);
  const remainingMonths = Math.round((days - years * 365.25) / 30.44);
  if (remainingMonths === 0) {
    return `hace ${years} ${years === 1 ? 'año' : 'años'}`;
  }
  return `hace ${years} ${years === 1 ? 'año' : 'años'} y ${remainingMonths} ${remainingMonths === 1 ? 'mes' : 'meses'}`;
}

function formatTimeRemaining(days) {
  const abs = Math.abs(days);
  const prefix = days <= 0 ? 'excedido' : 'restantes';

  if (abs < 30) {
    return `${abs} ${abs === 1 ? 'día' : 'días'} ${prefix}`;
  }
  const months = Math.round(abs / 30.44);
  if (months < 12) {
    return `${months} ${months === 1 ? 'mes' : 'meses'} ${prefix}`;
  }
  const years = Math.floor(abs / 365.25);
  const remainingMonths = Math.round((abs - years * 365.25) / 30.44);
  if (remainingMonths === 0) {
    return `${years} ${years === 1 ? 'año' : 'años'} ${prefix}`;
  }
  return `${years} ${years === 1 ? 'año' : 'años'} y ${remainingMonths} ${remainingMonths === 1 ? 'mes' : 'meses'} ${prefix}`;
}

export default function ProximosCambiosScreen() {
  const {
    vehiculos,
    vehiculoActivo,
    mantenimientos,
    cargasCombustible,
    cargarHistorial,
  } = useVehiculos();

  const vehiculo = vehiculos[vehiculoActivo];

  useEffect(() => {
    if (vehiculo?.id) {
      cargarHistorial(vehiculo.id);
    }
  }, [vehiculo?.id]);

  const currentKm = useMemo(() => {
    if (!vehiculo) return 0;
    const kms = [parseFloat(vehiculo.kilometrajeInicial) || 0];
    mantenimientos.forEach((m) => kms.push(parseFloat(m.kilometraje) || 0));
    cargasCombustible.forEach((c) => kms.push(parseFloat(c.kilometraje) || 0));
    return Math.max(...kms);
  }, [vehiculo?.kilometrajeInicial, mantenimientos, cargasCombustible]);

  const sugerencias = useMemo(() => {
    if (!vehiculo) return [];

    const grouped = {};
    mantenimientos.forEach((m) => {
      if (!grouped[m.tipo]) grouped[m.tipo] = [];
      grouped[m.tipo].push(m);
    });

    const results = [];

    Object.keys(grouped).forEach((tipo) => {
      const records = grouped[tipo];

      if (records.length < 2) {
        const r = records[0];
        const diasDesde = Math.round(
          (new Date() - new Date(r.fecha + 'T00:00:00')) / (1000 * 60 * 60 * 24)
        );
        results.push({
          tipo,
          hasPrediction: false,
          lastKm: parseFloat(r.kilometraje),
          lastDate: r.fecha,
          diasDesde,
        });
        return;
      }

      records.sort((a, b) => parseFloat(a.kilometraje) - parseFloat(b.kilometraje));

      const last = records[records.length - 1];
      const lastKm = parseFloat(last.kilometraje);
      const diasDesde = Math.round(
        (new Date() - new Date(last.fecha + 'T00:00:00')) / (1000 * 60 * 60 * 24)
      );

      let totalKmDiff = 0;
      let totalDaysDiff = 0;
      let pairs = 0;

      for (let i = 1; i < records.length; i++) {
        const kmDiff = parseFloat(records[i].kilometraje) - parseFloat(records[i - 1].kilometraje);
        const daysDiff = daysBetween(records[i - 1].fecha, records[i].fecha);
        if (kmDiff > 0 || daysDiff > 0) {
          totalKmDiff += kmDiff;
          totalDaysDiff += daysDiff;
          pairs++;
        }
      }

      if (pairs === 0) {
        results.push({
          tipo,
          hasPrediction: false,
          lastKm,
          lastDate: last.fecha,
          diasDesde,
        });
        return;
      }

      const avgKmInterval = totalKmDiff / pairs;
      const avgDaysInterval = totalDaysDiff / pairs;

      const nextKm = lastKm + avgKmInterval;

      const nextDateObj = new Date(last.fecha + 'T00:00:00');
      nextDateObj.setDate(nextDateObj.getDate() + Math.round(avgDaysInterval));

      const kmRemaining = nextKm - currentKm;
      const daysRemaining = Math.round((nextDateObj - new Date()) / (1000 * 60 * 60 * 24));

      results.push({
        tipo,
        hasPrediction: true,
        lastKm,
        lastDate: last.fecha,
        diasDesde,
        nextKm: Math.round(nextKm),
        nextDate: formatDate(nextDateObj),
        kmRemaining: Math.round(kmRemaining),
        daysRemaining,
        avgKmInterval: Math.round(avgKmInterval),
        avgDaysInterval: Math.round(avgDaysInterval),
        pairs,
      });
    });

    results.sort((a, b) => {
      if (a.hasPrediction !== b.hasPrediction) return a.hasPrediction ? -1 : 1;
      if (!a.hasPrediction) return b.diasDesde - a.diasDesde;
      const aDone = a.kmRemaining <= 0 || a.daysRemaining <= 0 ? 0 : 1;
      const bDone = b.kmRemaining <= 0 || b.daysRemaining <= 0 ? 0 : 1;
      if (aDone !== bDone) return aDone - bDone;
      return Math.min(a.kmRemaining, a.daysRemaining * 33) - Math.min(b.kmRemaining, b.daysRemaining * 33);
    });

    return results;
  }, [mantenimientos, currentKm, vehiculo]);

  if (!vehiculo) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="construct-outline" size={80} color={colors.textLight} />
        <Text style={styles.emptyTitle}>Sin vehículo activo</Text>
        <Text style={styles.emptySubtitle}>
          Agrega un vehículo en Inicio para ver tus próximos cambios
        </Text>
      </View>
    );
  }

  if (mantenimientos.length === 0) {
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
        <View style={styles.emptyTab}>
          <Ionicons name="analytics-outline" size={64} color={colors.textLight} />
          <Text style={styles.emptyTabTitle}>Sin mantenimientos registrados</Text>
          <Text style={styles.emptyTabSubtitle}>
            Agrega mantenimientos en la sección Historial para comenzar a ver sugerencias
          </Text>
        </View>
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

      <FlatList
        data={sugerencias}
        keyExtractor={(item) => item.tipo}
        renderItem={({ item }) => {
          const isOverdue = item.hasPrediction && (item.kmRemaining <= 0 || item.daysRemaining <= 0);
          const accentColor = isOverdue ? colors.error : item.hasPrediction ? colors.warning : colors.textLight;

          return (
            <View style={[styles.card, isOverdue && styles.cardOverdue]}>
              <View style={styles.cardHeader}>
                <View style={styles.tipoRow}>
                  <View style={[styles.iconCircle, { borderColor: accentColor }]}>
                    <Ionicons
                      name={ICONOS_TIPO[item.tipo] || 'build-outline'}
                      size={22}
                      color={accentColor}
                    />
                  </View>
                  <View>
                    <Text style={styles.tipo}>{item.tipo}</Text>
                    {item.hasPrediction ? (
                      <Text style={styles.sinceInfo}>
                        Basado en {item.pairs + 1} registros
                      </Text>
                    ) : (
                      <Text style={styles.sinceInfo}>
                        1 registro — sin proyección
                      </Text>
                    )}
                  </View>
                </View>
                {item.hasPrediction && (
                  <View style={[styles.badge, { backgroundColor: accentColor + '20' }]}>
                    <Text style={[styles.badgeText, { color: accentColor }]}>
                      {isOverdue ? 'Vencido' : 'Próximo'}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.details}>
                <View style={styles.detailCol}>
                  <Text style={styles.detailLabel}>Último cambio</Text>
                  <Text style={styles.detailValue}>{Number(item.lastKm).toLocaleString()} km</Text>
                  <Text style={styles.detailDate}>{item.lastDate}</Text>
                  <Text style={styles.detailDate}>{formatTimeAgo(item.diasDesde)}</Text>
                </View>
                {item.hasPrediction && (
                  <>
                    <Ionicons name="arrow-forward" size={18} color={colors.textLight} style={styles.arrow} />
                    <View style={styles.detailCol}>
                      <Text style={styles.detailLabel}>Próximo sugerido</Text>
                      <Text style={styles.detailValue}>{Number(item.nextKm).toLocaleString()} km</Text>
                      <Text style={styles.detailDate}>{item.nextDate}</Text>
                    </View>
                  </>
                )}
              </View>

              {item.hasPrediction && (
                <View style={styles.remainingRow}>
                  <View style={styles.remainingItem}>
                    <Ionicons name="speedometer-outline" size={16} color={accentColor} />
                    <Text style={[styles.remainingText, isOverdue && styles.remainingOverdue]}>
                      {`${Number(Math.abs(item.kmRemaining)).toLocaleString()} km ${isOverdue ? 'excedido' : 'restantes'}`}
                    </Text>
                  </View>
                  <View style={styles.remainingItem}>
                    <Ionicons name="calendar-outline" size={16} color={accentColor} />
                    <Text style={[styles.remainingText, isOverdue && styles.remainingOverdue]}>
                      {formatTimeRemaining(item.daysRemaining)}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          );
        }}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
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
  list: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardOverdue: {
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tipoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipo: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  sinceInfo: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: 2,
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    ...typography.caption,
    fontWeight: '600',
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailCol: {
    flex: 1,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.textLight,
    marginBottom: 2,
  },
  detailValue: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  detailDate: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  arrow: {
    marginBottom: spacing.md,
  },
  remainingRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  remainingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  remainingText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  remainingOverdue: {
    color: colors.error,
  },
});
