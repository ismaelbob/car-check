import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme';

export default function ConfirmDeleteRecordModal({ visible, recordId, tipo, info, onClose, onConfirm }) {
  const [input, setInput] = useState('');
  const [checked, setChecked] = useState(false);

  const textoCoincide = input.trim().toLowerCase() === (tipo || '').toLowerCase();
  const puedeEliminar = textoCoincide && checked;

  const handleEliminar = () => {
    if (!puedeEliminar) return;
    onConfirm(recordId);
    handleClose();
  };

  const handleClose = () => {
    setInput('');
    setChecked(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Ionicons name="warning-outline" size={36} color={colors.error} />
            <Text style={styles.title}>Eliminar registro</Text>
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={18} color={colors.secondary} />
            <Text style={styles.infoText}>{info}</Text>
          </View>

          <Text style={styles.description}>
            Esta acción no se puede deshacer. Para confirmar, escribe{' '}
            <Text style={styles.bold}>{tipo}</Text> y acepta la confirmación.
          </Text>

          <View style={styles.field}>
            <Text style={styles.label}>Escribe "{tipo}" para confirmar</Text>
            <TextInput
              style={styles.input}
              placeholder={tipo}
              placeholderTextColor={colors.textLight}
              value={input}
              onChangeText={setInput}
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
              Confirmo que deseo eliminar este registro
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
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: spacing.md,
  },
  infoText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
    fontWeight: '500',
  },
  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  bold: {
    fontWeight: '700',
    color: colors.textPrimary,
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
