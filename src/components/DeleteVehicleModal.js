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
import { typography, spacing } from '../theme';
import { useTheme } from '../context/ThemeContext';

export default function DeleteVehicleModal({ visible, vehiculo, onClose, onConfirm }) {
  const { colors } = useTheme();
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
        <View style={[styles.modal, { backgroundColor: colors.surface }]}>
          <View style={styles.header}>
            <Ionicons name="warning-outline" size={36} color={colors.error} />
            <Text style={[styles.title, { color: colors.error }]}>Eliminar vehículo</Text>
          </View>

          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Esta acción no se puede deshacer. Para confirmar, ingresa la placa del
            vehículo y acepta la confirmación.
          </Text>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Ingresa la placa</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
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
            <Text style={[styles.checkLabel, { color: colors.textPrimary }]}>
              Confirmo que deseo eliminar este vehículo
            </Text>
          </TouchableOpacity>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.cancelButton, { borderColor: colors.border }]} onPress={handleClose}>
              <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.deleteButton, { backgroundColor: colors.error }, !puedeEliminar && styles.deleteButtonDisabled]}
              onPress={handleEliminar}
              disabled={!puedeEliminar}
            >
              <Ionicons name="trash-outline" size={18} color={colors.white} />
              <Text style={[styles.deleteButtonText, { color: colors.white }]}>Eliminar</Text>
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
  },
  description: {
    ...typography.bodySmall,
    textAlign: 'center',
    lineHeight: 20,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    ...typography.bodySmall,
    fontWeight: '500',
  },
  input: {
    ...typography.body,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
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
    borderRadius: 10,
    paddingVertical: 14,
  },
  cancelButtonText: {
    ...typography.button,
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: 10,
    paddingVertical: 14,
  },
  deleteButtonDisabled: {
    opacity: 0.4,
  },
  deleteButtonText: {
    ...typography.button,
  },
});
