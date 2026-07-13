import { useState, useEffect, useMemo } from 'react';
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
import { useConfig } from '../context/ConfigContext';
import { typography, spacing } from '../theme';
import { useTheme } from '../context/ThemeContext';

const formatDate = (d) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export default function MantenimientoForm({ visible, onClose, vehiculoId, ultimoKilometraje }) {
  const { agregarMantenimiento } = useVehiculos();
  const { tiposMantenimiento, moneda, agregarTipoMantenimiento } = useConfig();
  const { colors } = useTheme();
  const [tipo, setTipo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [kilometraje, setKilometraje] = useState('');
  const [fecha, setFecha] = useState(formatDate(new Date()));
  const [fechaDate, setFechaDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [costo, setCosto] = useState('');
  const [taller, setTaller] = useState('');
  const [tipoPickerVisible, setTipoPickerVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showNewTipoInput, setShowNewTipoInput] = useState(false);
  const [newTipoName, setNewTipoName] = useState('');

  const tiposFiltrados = useMemo(() => {
    if (!searchText.trim()) return tiposMantenimiento.map((t) => t.nombre);
    const q = searchText.trim().toLowerCase();
    return tiposMantenimiento
      .map((t) => t.nombre)
      .filter((nombre) => nombre.toLowerCase().includes(q));
  }, [tiposMantenimiento, searchText]);

  const openTipoPicker = () => {
    setSearchText('');
    setShowNewTipoInput(false);
    setNewTipoName('');
    setTipoPickerVisible(true);
  };

  const closeTipoPicker = () => {
    setSearchText('');
    setShowNewTipoInput(false);
    setNewTipoName('');
    setTipoPickerVisible(false);
  };

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
          <Pressable style={[styles.sheet, { backgroundColor: colors.surface }]} onPress={() => {}}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
            <Text style={[styles.title, { color: colors.textPrimary }]}>Nuevo mantenimiento</Text>

            <ScrollView style={styles.form} keyboardShouldPersistTaps="handled">
              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Tipo *</Text>
                <TouchableOpacity
                  style={[styles.input, styles.select, { backgroundColor: colors.background, borderColor: colors.border }]}
                  onPress={openTipoPicker}
                >
                  <Text style={[{ color: colors.textPrimary }, !tipo && { color: colors.textLight }]}>
                    {tipo || 'Seleccionar tipo'}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Descripción</Text>
                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
                  placeholder="Ej: Cambio de aceite sintético 5W-30"
                  placeholderTextColor={colors.textLight}
                  multiline
                  numberOfLines={3}
                  value={descripcion}
                  onChangeText={setDescripcion}
                />
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Kilometraje *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
                  placeholder="Ej: 50000"
                  placeholderTextColor={colors.textLight}
                  keyboardType="number-pad"
                  value={kilometraje}
                  onChangeText={setKilometraje}
                />
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Fecha *</Text>
                <TouchableOpacity
                  style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border }]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={[{ color: colors.textPrimary }, !fecha && { color: colors.textLight }]}>
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
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Costo ({moneda})</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
                    placeholder="Ej: 850"
                    placeholderTextColor={colors.textLight}
                    keyboardType="decimal-pad"
                    value={costo}
                    onChangeText={setCosto}
                  />
                </View>
                <View style={[styles.field, styles.fieldHalf]}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Taller</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
                    placeholder="Ej: Servicio XYZ"
                    placeholderTextColor={colors.textLight}
                    value={taller}
                    onChangeText={setTaller}
                  />
                </View>
              </View>

              <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleSave}>
                <Ionicons name="checkmark-circle-outline" size={22} color={colors.white} />
                <Text style={[styles.buttonText, { color: colors.white }]}>Guardar</Text>
              </TouchableOpacity>
            </ScrollView>

            <Modal visible={tipoPickerVisible} transparent animationType="fade" onRequestClose={closeTipoPicker}>
              <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              >
                <Pressable style={styles.pickerOverlay} onPress={closeTipoPicker}>
                  <Pressable style={[styles.pickerSheet, { backgroundColor: colors.surface }]} onPress={() => {}}>
                    <Text style={[styles.pickerTitle, { color: colors.textPrimary, borderBottomColor: colors.border }]}>Seleccionar tipo</Text>

                    <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
                      <Ionicons name="search" size={18} color={colors.textSecondary} style={styles.searchIcon} />
                      <TextInput
                        style={[styles.searchInput, { color: colors.textPrimary }]}
                        placeholder="Buscar tipo..."
                        placeholderTextColor={colors.textLight}
                        value={searchText}
                        onChangeText={setSearchText}
                      />
                      {searchText.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchText('')}>
                          <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                        </TouchableOpacity>
                      )}
                    </View>

                    {showNewTipoInput ? (
                      <View style={styles.newTipoSection}>
                        <TextInput
                          style={[styles.newTipoInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
                          placeholder="Nombre del nuevo tipo"
                          placeholderTextColor={colors.textLight}
                          value={newTipoName}
                          onChangeText={setNewTipoName}
                          autoFocus
                        />
                        <View style={styles.newTipoActions}>
                          <TouchableOpacity
                            style={[styles.newTipoCancel, { borderColor: colors.border }]}
                            onPress={() => {
                              setShowNewTipoInput(false);
                              setNewTipoName('');
                            }}
                          >
                            <Text style={[styles.newTipoCancelText, { color: colors.textSecondary }]}>Cancelar</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.newTipoSave, { backgroundColor: colors.primary }]}
                            onPress={async () => {
                              const name = newTipoName.trim();
                              if (!name) return;
                              try {
                                await agregarTipoMantenimiento(name);
                                setTipo(name);
                                closeTipoPicker();
                              } catch (e) {
                                Alert.alert('Error', 'El tipo de mantenimiento ya existe o no se pudo guardar');
                              }
                            }}
                          >
                            <Ionicons name="checkmark" size={18} color={colors.white} />
                            <Text style={[styles.newTipoSaveText, { color: colors.white }]}>Guardar</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <FlatList
                        data={tiposFiltrados}
                        keyboardShouldPersistTaps="handled"
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={[
                              styles.pickerOption,
                              item === tipo && [styles.pickerOptionActive, { backgroundColor: colors.background }],
                            ]}
                            onPress={() => {
                              setTipo(item);
                              closeTipoPicker();
                            }}
                          >
                            <Text
                              style={[
                                styles.pickerOptionText,
                                item === tipo && [styles.pickerOptionTextActive, { color: colors.primary }],
                              ]}
                            >
                              {item}
                            </Text>
                            {item === tipo && (
                              <Ionicons name="checkmark" size={20} color={colors.primary} />
                            )}
                          </TouchableOpacity>
                        )}
                        ListFooterComponent={() => (
                          <TouchableOpacity
                            style={[styles.addTipoButton, { borderTopColor: colors.border }]}
                            onPress={() => setShowNewTipoInput(true)}
                          >
                            <Ionicons name="add-circle-outline" size={20} color={colors.secondary} />
                            <Text style={[styles.addTipoButtonText, { color: colors.secondary }]}>Agregar nuevo tipo</Text>
                          </TouchableOpacity>
                        )}
                      />
                    )}
                  </Pressable>
                </Pressable>
              </KeyboardAvoidingView>
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: spacing.xxl,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h3,
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
    fontWeight: '500',
  },
  input: {
    ...typography.body,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
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
  },
  pickerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  pickerSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xxl,
    maxHeight: '60%',
  },
  pickerTitle: {
    ...typography.h3,
    textAlign: 'center',
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    marginHorizontal: spacing.lg,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
  },
  pickerOptionActive: {},
  pickerOptionText: {
    ...typography.body,
  },
  pickerOptionTextActive: {
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    height: 44,
    gap: spacing.sm,
  },
  searchIcon: {
    marginRight: 0,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    paddingVertical: 0,
  },
  newTipoSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  newTipoInput: {
    ...typography.body,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  newTipoActions: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'flex-end',
  },
  newTipoCancel: {
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
    borderRadius: 10,
    borderWidth: 1,
  },
  newTipoCancelText: {
    ...typography.body,
  },
  newTipoSave: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
    borderRadius: 10,
  },
  newTipoSaveText: {
    ...typography.button,
  },
  addTipoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: 14,
    marginTop: spacing.sm,
    borderTopWidth: 1,
    marginHorizontal: spacing.lg,
  },
  addTipoButtonText: {
    ...typography.body,
    fontWeight: '600',
  },
});
