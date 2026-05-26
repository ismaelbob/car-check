import { StyleSheet, Text, View, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme';

export default function AddRecordSheet({ visible, onClose, onSelectMantenimiento, onSelectCarga }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet}>
          <Text style={styles.title}>Agregar registro</Text>

          <TouchableOpacity
            style={styles.option}
            onPress={() => {
              onClose();
              onSelectMantenimiento();
            }}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.secondary + '20' }]}>
              <Ionicons name="settings-outline" size={24} color={colors.secondary} />
            </View>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Mantenimiento</Text>
              <Text style={styles.optionDesc}>Aceite, frenos, llantas, etc.</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.option}
            onPress={() => {
              onClose();
              onSelectCarga();
            }}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.warning + '20' }]}>
              <Ionicons name="flame-outline" size={24} color={colors.warning} />
            </View>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Carga de combustible</Text>
              <Text style={styles.optionDesc}>Registra litros, costo y kilometraje</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 14,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionInfo: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  optionDesc: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: spacing.sm,
  },
  cancelText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
