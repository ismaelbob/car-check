import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Modal,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useVehiculos } from '../context/VehiculoContext';
import { colors, typography, spacing } from '../theme';

const TIPOS_MANTENIMIENTO = [
  'Aceite',
  'Frenos',
  'Llantas',
  'Afinación',
  'Batería',
  'Transmisión',
  'Suspensión',
  'Otro',
];

const formatDate = (d) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export default function MantenimientoForm({ visible, onClose, vehiculoId, ultimoKilometraje }) {
  const { agregarMantenimiento } = useVehiculos();
  const [tipo, setTipo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [kilometraje, setKilometraje] = useState('');
  const [fecha, setFecha] = useState(formatDate(new Date()));
  const [fechaDate, setFechaDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [costo, setCosto] = useState('');
  const [taller, setTaller] = useState('');
  const [tipoPickerVisible, setTipoPickerVisible] = useState(false);

  useEffect(() => {
    if (visible && ultimoKilometraje) {
      setKilometraje(ultimoKilometraje);
    }
  }, [visible, ultimoKilometraje]);

  const resetForm = () => {
    setTipo('');
    setDescripcion('');
    setKilometraje(ultimoKilometraje || '');
    setFecha(formatDate(new Date()));
    setFechaDate(new Date());
    setCosto('');
    setTaller('');
  };

  const handleSave = async () => {
    if (!tipo || !kilometraje || !fecha) {
      Alert.alert('Campos requeridos', 'Tipo, kilometraje y fecha son obligatorios');
      return;
    }

    const fechaDateObj = new Date(fecha + 'T00:00:00');
    if (fechaDateObj > new Date()) {
      Alert.alert('Fecha inválida', 'La fecha no puede ser futura');
      return;
    }

    await agregarMantenimiento({
      vehiculo_id: vehiculoId,
      tipo,
      descripcion: descripcion.trim() || null,
      kilometraje: kilometraje.trim(),
      fecha: fecha.trim(),
      costo: costo.trim() || null,
      taller: taller.trim() || null,
    });

    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={styles.overlay} onPress={handleClose}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.handle} />
            <Text style={styles.title}>Nuevo mantenimiento</Text>

            <ScrollView style={styles.form} keyboardShouldPersistTaps="handled">
              <View style={styles.field}>
                <Text style={styles.label}>Tipo *</Text>
                <TouchableOpacity
                  style={[styles.input, styles.select]}
                  onPress={() => setTipoPickerVisible(true)}
                >
                  <Text style={[!tipo && { color: colors.textLight }]}>
                    {tipo || 'Seleccionar tipo'}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Descripción</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Ej: Cambio de aceite sintético 5W-30"
                  placeholderTextColor={colors.textLight}
                  multiline
                  numberOfLines={3}
                  value={descripcion}
                  onChangeText={setDescripcion}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Kilometraje *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: 50000"
                  placeholderTextColor={colors.textLight}
                  keyboardType="number-pad"
                  value={kilometraje}
                  onChangeText={setKilometraje}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Fecha *</Text>
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={[!fecha && { color: colors.textLight }]}>
                    {fecha || 'Seleccionar fecha'}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={fechaDate}
                    mode="date"
                    maximumDate={new Date()}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(Platform.OS === 'ios');
                      if (selectedDate) {
                        setFechaDate(selectedDate);
                        setFecha(formatDate(selectedDate));
                      }
                      if (Platform.OS === 'android') {
                        setShowDatePicker(false);
                      }
                    }}
                  />
                )}
              </View>

              <View style={styles.row}>
                <View style={[styles.field, styles.fieldHalf]}>
                  <Text style={styles.label}>Costo (Bs)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: 850"
                    placeholderTextColor={colors.textLight}
                    keyboardType="decimal-pad"
                    value={costo}
                    onChangeText={setCosto}
                  />
                </View>
                <View style={[styles.field, styles.fieldHalf]}>
                  <Text style={styles.label}>Taller</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: Servicio XYZ"
                    placeholderTextColor={colors.textLight}
                    value={taller}
                    onChangeText={setTaller}
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.button} onPress={handleSave}>
                <Ionicons name="checkmark-circle-outline" size={22} color={colors.white} />
                <Text style={styles.buttonText}>Guardar</Text>
              </TouchableOpacity>
            </ScrollView>

            <Modal visible={tipoPickerVisible} transparent animationType="fade" onRequestClose={() => setTipoPickerVisible(false)}>
              <Pressable
                style={styles.pickerOverlay}
                onPress={() => setTipoPickerVisible(false)}
              >
                <Pressable style={styles.pickerSheet}>
                  <Text style={styles.pickerTitle}>Seleccionar tipo</Text>
                  <FlatList
                    data={TIPOS_MANTENIMIENTO}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.pickerOption,
                          item === tipo && styles.pickerOptionActive,
                        ]}
                        onPress={() => {
                          setTipo(item);
                          setTipoPickerVisible(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.pickerOptionText,
                            item === tipo && styles.pickerOptionTextActive,
                          ]}
                        >
                          {item}
                        </Text>
                        {item === tipo && (
                          <Ionicons name="checkmark" size={20} color={colors.primary} />
                        )}
                      </TouchableOpacity>
                    )}
                  />
                </Pressable>
              </Pressable>
            </Modal>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
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
    maxHeight: '90%',
    paddingBottom: spacing.xxl,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  form: {
    paddingHorizontal: spacing.lg,
  },
  field: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  fieldHalf: {
    flex: 1,
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
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    color: colors.textPrimary,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  buttonText: {
    ...typography.button,
    color: colors.white,
  },
  pickerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  pickerSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xxl,
    maxHeight: '60%',
  },
  pickerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginHorizontal: spacing.lg,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
  },
  pickerOptionActive: {
    backgroundColor: colors.background,
  },
  pickerOptionText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  pickerOptionTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
});
