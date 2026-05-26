import { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Modal, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useVehiculos } from '../context/VehiculoContext';
import DeleteVehicleModal from './DeleteVehicleModal';
import { colors, typography, spacing } from '../theme';

export default function VehicleCard({ vehiculo }) {
  const router = useRouter();
  const { eliminarVehiculo } = useVehiculos();
  const [menuVisible, setMenuVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  return (
    <View style={styles.card}>
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
          <Text style={styles.label}>Marca</Text>
          <Text style={styles.value}>{vehiculo.marca}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>Modelo</Text>
          <Text style={styles.value}>{vehiculo.modelo}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>Tipo</Text>
          <Text style={styles.value}>{vehiculo.tipo}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>Año</Text>
          <Text style={styles.value}>{vehiculo.año}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>Color</Text>
          <Text style={styles.value}>{vehiculo.color}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>Placa</Text>
          <Text style={styles.value}>{vehiculo.placa}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>Combustible</Text>
          <Text style={styles.value}>{vehiculo.combustible ? vehiculo.combustible.replace(/,/g, ' + ') : 'Gasolina'}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>Último kilometraje</Text>
          <Text style={styles.value}>{vehiculo.kilometrajeInicial} km</Text>
        </View>
      </View>

      <Modal visible={menuVisible} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <Pressable style={styles.sheet}>
            <TouchableOpacity
              style={styles.sheetOption}
              onPress={() => {
                setMenuVisible(false);
                router.push('/registro?id=' + vehiculo.id);
              }}
            >
              <Ionicons name="create-outline" size={22} color={colors.primary} />
              <Text style={styles.sheetOptionText}>Modificar datos</Text>
            </TouchableOpacity>
            <View style={styles.sheetDivider} />
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
            <View style={styles.sheetDivider} />
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
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    shadowColor: '#fff',
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
    color: colors.textSecondary,
    flex: 1,
  },
  value: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: colors.surface,
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
    color: colors.textPrimary,
    fontWeight: '500',
  },
  sheetDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
});
