import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme';

export default function DeleteVehicleModal({ visible, vehiculo, onClose, onConfirm }) {
  const [placaInput, setPlacaInput] = useState('');
  const [checked, setChecked] = useState(false);

  const placaCoincide = placaInput.toUpperCase() === vehiculo?.placa.toUpperCase();
  const puedeEliminar = placaCoincide && checked;

  const handleEliminar = () => {
    if (!puedeEliminar) return;
    Alert.alert(
      'Eliminar vehículo',
      '¿Estás seguro? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            onConfirm(vehiculo.id);
            handleClose();
          },
        },
      ]
    );
  };

  const handleClose = () => {
    setPlacaInput('');
    setChecked(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Ionicons name="warning-outline" size={36} color={colors.error} />
            <Text style={styles.title}>Eliminar vehículo</Text>
          </View>

          <Text style={styles.description}>
            Esta acción no se puede deshacer. Para confirmar, ingresa la placa del
            vehículo y acepta la confirmación.
          </Text>

          <View style={styles.field}>
            <Text style={styles.label}>Ingresa la placa</Text>
            <TextInput
              style={styles.input}
              placeholder={vehiculo?.placa || ''}
              placeholderTextColor={colors.textLight}
              autoCapitalize="characters"
              value={placaInput}
              onChangeText={setPlacaInput}
            />
          </View>

          <TouchableOpacity
            style={styles.checkRow}
            onPress={() => setChecked(!checked)}
          >
            <Ionicons
              name={checked ? 'checkbox' : 'square-outline'}
              size={22}
              color={checked ? colors.error : colors.textLight}
            />
            <Text style={styles.checkLabel}>
              Confirmo que deseo eliminar este vehículo
            </Text>
          </TouchableOpacity>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.deleteButton, !puedeEliminar && styles.deleteButtonDisabled]}
              onPress={handleEliminar}
              disabled={!puedeEliminar}
            >
              <Ionicons name="trash-outline" size={18} color={colors.white} />
              <Text style={styles.deleteButtonText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modal: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    gap: spacing.md,
  },
  header: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.h2,
    color: colors.error,
  },
  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  input: {
    ...typography.body,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: 2,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  checkLabel: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 14,
  },
  cancelButtonText: {
    ...typography.button,
    color: colors.textSecondary,
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.error,
    borderRadius: 10,
    paddingVertical: 14,
  },
  deleteButtonDisabled: {
    opacity: 0.4,
  },
  deleteButtonText: {
    ...typography.button,
    color: colors.white,
  },
});
