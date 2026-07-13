import { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Modal, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useVehiculos } from '../context/VehiculoContext';
import DeleteVehicleModal from './DeleteVehicleModal';
import { typography, spacing } from '../theme';
import { useTheme } from '../context/ThemeContext';

export default function VehicleCard({ vehiculo, ultimoKilometraje, kilometrosRecorridos }) {
  const router = useRouter();
  const { eliminarVehiculo } = useVehiculos();
  const { colors } = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => setMenuVisible(true)}
      >
        <Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      <View style={styles.imageContainer}>
        {vehiculo.foto ? (
          <Image source={{ uri: vehiculo.foto }} style={styles.image} />
        ) : (
          <Ionicons name="car-sport-outline" size={150} color={colors.primary} />
        )}
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Marca</Text>
          <Text style={[styles.value, { color: colors.textPrimary }]}>{vehiculo.marca}</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Modelo</Text>
          <Text style={[styles.value, { color: colors.textPrimary }]}>{vehiculo.modelo}</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Tipo</Text>
          <Text style={[styles.value, { color: colors.textPrimary }]}>{vehiculo.tipo}</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Año</Text>
          <Text style={[styles.value, { color: colors.textPrimary }]}>{vehiculo.año}</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Color</Text>
          <Text style={[styles.value, { color: colors.textPrimary }]}>{vehiculo.color}</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Placa</Text>
          <Text style={[styles.value, { color: colors.textPrimary }]}>{vehiculo.placa}</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Combustible</Text>
          <Text style={[styles.value, { color: colors.textPrimary }]}>{vehiculo.combustible ? vehiculo.combustible.replace(/,/g, ' + ') : 'Gasolina'}</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Kilometraje inicial</Text>
          <Text style={[styles.value, { color: colors.textPrimary }]}>{parseFloat(vehiculo.kilometrajeInicial).toLocaleString()} km</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Último kilometraje</Text>
          <Text style={[styles.value, { color: colors.textPrimary }]}>{ultimoKilometraje.toLocaleString()} km</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.row}>
          <Text style={[styles.label, styles.highlightedLabel, { color: colors.primary }]}>Kilómetros recorridos</Text>
          <Text style={[styles.value, styles.highlightedValue, { color: colors.secondary }]}>+{kilometrosRecorridos.toLocaleString()} km</Text>
        </View>
      </View>

      <Modal visible={menuVisible} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <Pressable style={[styles.sheet, { backgroundColor: colors.surface }]}>
            <TouchableOpacity
              style={styles.sheetOption}
              onPress={() => {
                setMenuVisible(false);
                router.push('/registro?id=' + vehiculo.id);
              }}
            >
              <Ionicons name="create-outline" size={22} color={colors.primary} />
              <Text style={[styles.sheetOptionText, { color: colors.textPrimary }]}>Modificar datos</Text>
            </TouchableOpacity>
            <View style={[styles.sheetDivider, { backgroundColor: colors.border }]} />
            <TouchableOpacity
              style={styles.sheetOption}
              onPress={() => {
                setMenuVisible(false);
                setDeleteModalVisible(true);
              }}
            >
              <Ionicons name="trash-outline" size={22} color={colors.error} />
              <Text style={[styles.sheetOptionText, { color: colors.error }]}>
                Eliminar
              </Text>
            </TouchableOpacity>
            <View style={[styles.sheetDivider, { backgroundColor: colors.border }]} />
            <TouchableOpacity
              style={styles.sheetOption}
              onPress={() => setMenuVisible(false)}
            >
              <Text style={[styles.sheetOptionText, { color: colors.textSecondary, textAlign: 'center' }]}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <DeleteVehicleModal
        visible={deleteModalVisible}
        vehiculo={vehiculo}
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={eliminarVehiculo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    paddingBottom: spacing.xl,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 4,
  },
  menuButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  image: {
    width: 270,
    height: 200,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  infoContainer: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  label: {
    ...typography.bodySmall,
    flex: 1,
  },
  value: {
    ...typography.body,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
  },
  highlightedLabel: {
    fontWeight: '700',
  },
  highlightedValue: {
    fontWeight: '700',
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 16,
  },
  sheetOptionText: {
    ...typography.body,
    fontWeight: '500',
  },
  sheetDivider: {
    height: 1,
  },
});
