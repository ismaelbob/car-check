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
import { useTheme } from '../context/ThemeContext';
import { typography, spacing } from '../theme';

const formatDate = (d) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export default function CargaCombustibleForm({ visible, onClose, vehiculoId, ultimoKilometraje, vehiculoCombustible }) {
  const { colors } = useTheme();
  const { agregarCargaCombustible } = useVehiculos();
  const { combustibles, moneda } = useConfig();
  const [litros, setLitros] = useState('');
  const [costo, setCosto] = useState('');
  const [kilometraje, setKilometraje] = useState('');
  const [tipoCombustible, setTipoCombustible] = useState('');
  const [fecha, setFecha] = useState(formatDate(new Date()));
  const [fechaDate, setFechaDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tipoPickerVisible, setTipoPickerVisible] = useState(false);

  const combNombres = useMemo(() => combustibles.map((c) => c.nombre), [combustibles]);

  const combLookup = useMemo(() => {
    const map = {};
    combustibles.forEach((c) => { map[c.nombre] = c; });
    return map;
  }, [combustibles]);

  const vehiculoCombustibles = useMemo(() => {
    if (!vehiculoCombustible) return [];
    return vehiculoCombustible.split(',').map((s) => s.trim());
  }, [vehiculoCombustible]);

  const fuelCategory = useMemo(() => {
    const hasDiesel = vehiculoCombustibles.includes('Diesel');
    const hasGasolina = vehiculoCombustibles.includes('Gasolina');
    const hasGNV = vehiculoCombustibles.includes('GNV');

    if (hasDiesel) return 'diesel';
    if (hasGNV && !hasGasolina) return 'gnv';
    if (hasGasolina && hasGNV) return 'gasolina_gnv';
    if (hasGasolina) return 'gasolina';
    return 'unknown';
  }, [vehiculoCombustibles]);

  const filteredCombNombres = useMemo(() => {
    switch (fuelCategory) {
      case 'diesel':
        return combNombres.filter((n) => n === 'Diesel');
      case 'gnv':
        return combNombres.filter((n) => n === 'GNV');
      case 'gasolina':
        return combNombres.filter((n) => n.includes('Gasolina'));
      case 'gasolina_gnv':
        return combNombres.filter((n) => n.includes('Gasolina') || n === 'GNV');
      default:
        return combNombres;
    }
  }, [fuelCategory, combNombres]);

  const soloUnaOpcion = filteredCombNombres.length === 1;

  useEffect(() => {
    if (filteredCombNombres.length === 0) return;
    if (!tipoCombustible || !combLookup[tipoCombustible] || !filteredCombNombres.includes(tipoCombustible)) {
      let defaultTipo;
      switch (fuelCategory) {
        case 'diesel':
          defaultTipo = 'Diesel';
          break;
        case 'gnv':
          defaultTipo = 'GNV';
          break;
        case 'gasolina':
          defaultTipo = 'Gasolina';
          break;
        case 'gasolina_gnv':
          defaultTipo = 'GNV';
          break;
        default:
          defaultTipo = filteredCombNombres[0];
      }
      if (defaultTipo && filteredCombNombres.includes(defaultTipo)) {
        setTipoCombustible(defaultTipo);
      } else {
        setTipoCombustible(filteredCombNombres[0]);
      }
    }
  }, [filteredCombNombres, fuelCategory]);

  useEffect(() => {
    if (visible && ultimoKilometraje) {
      setKilometraje(ultimoKilometraje);
    }
  }, [visible, ultimoKilometraje]);

  const combustibleActual = tipoCombustible ? combLookup[tipoCombustible] : null;
  const unidad = combustibleActual ? combustibleActual.unidad : '';
  const precioUnitario = combustibleActual ? combustibleActual.precio : 0;

  const calcularLitros = (costoStr) => {
    if (!tipoCombustible || !costoStr) return '';
    const costoNum = parseFloat(costoStr);
    if (isNaN(costoNum)) return '';
    return (costoNum / precioUnitario).toFixed(2);
  };

  const calcularCosto = (litrosStr) => {
    if (!tipoCombustible || !litrosStr) return '';
    const litrosNum = parseFloat(litrosStr);
    if (isNaN(litrosNum)) return '';
    return (litrosNum * precioUnitario).toFixed(2);
  };

  const handleTipoChange = (tipo) => {
    setTipoCombustible(tipo);
    setLitros('');
    setCosto('');
  };

  const handleCostoChange = (val) => {
    setCosto(val);
    if (tipoCombustible && val) {
      const calc = calcularLitros(val);
      setLitros(calc);
    } else {
      setLitros('');
    }
  };

  const handleLitrosChange = (val) => {
    setLitros(val);
    if (tipoCombustible && val) {
      const calc = calcularCosto(val);
      setCosto(calc);
    } else {
      setCosto('');
    }
  };

  const resetForm = () => {
    setLitros('');
    setCosto('');
    setKilometraje(ultimoKilometraje || '');
    setTipoCombustible('');
    setFecha(formatDate(new Date()));
    setFechaDate(new Date());
  };

  const handleSave = async () => {
    if (!tipoCombustible || !litros || !costo || !kilometraje || !fecha) {
      Alert.alert('Campos requeridos', 'Todos los campos son obligatorios');
      return;
    }

    const fechaDateObj = new Date(fecha + 'T00:00:00');
    if (fechaDateObj > new Date()) {
      Alert.alert('Fecha inválida', 'La fecha no puede ser futura');
      return;
    }

    await agregarCargaCombustible({
      vehiculo_id: vehiculoId,
      litros: litros.trim(),
      costo: costo.trim(),
      kilometraje: kilometraje.trim(),
      tipo_combustible: tipoCombustible,
      fecha: fecha.trim(),
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
            <Text style={[styles.title, { color: colors.textPrimary }]}>Nueva carga de combustible</Text>

            <ScrollView style={styles.form} keyboardShouldPersistTaps="handled">
              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Tipo de combustible *</Text>
                {soloUnaOpcion ? (
                  <View style={[styles.input, styles.inputDisabled, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <Text style={[styles.inputDisabledText, { color: colors.textSecondary }]}>{filteredCombNombres[0]}</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.input, styles.select, { backgroundColor: colors.background, borderColor: colors.border }]}
                    onPress={() => setTipoPickerVisible(true)}
                  >
                    <Text style={[{ color: colors.textPrimary }, !tipoCombustible && { color: colors.textLight }]}>
                      {tipoCombustible || 'Seleccionar tipo'}
                    </Text>
                    <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                )}
                {tipoCombustible ? (
                  <Text style={[styles.priceInfo, { color: colors.secondary }]}>
                    Precio: {moneda} {precioUnitario.toFixed(2)} / {unidad}
                  </Text>
                ) : null}
              </View>

              <View style={styles.row}>
                <View style={[styles.field, styles.fieldHalf]}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Litros / m3 *</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
                    placeholder="Ej: 40"
                    placeholderTextColor={colors.textLight}
                    keyboardType="decimal-pad"
                    value={litros}
                    onChangeText={handleLitrosChange}
                  />
                </View>
                <View style={[styles.field, styles.fieldHalf]}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Costo total ({moneda}) *</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
                    placeholder="Ej: 278.40"
                    placeholderTextColor={colors.textLight}
                    keyboardType="decimal-pad"
                    value={costo}
                    onChangeText={handleCostoChange}
                  />
                </View>
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

              <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleSave}>
                <Ionicons name="checkmark-circle-outline" size={22} color={colors.white} />
                <Text style={[styles.buttonText, { color: colors.white }]}>Guardar</Text>
              </TouchableOpacity>
            </ScrollView>

            <Modal visible={tipoPickerVisible} transparent animationType="fade" onRequestClose={() => setTipoPickerVisible(false)}>
              <Pressable
                style={styles.pickerOverlay}
                onPress={() => setTipoPickerVisible(false)}
              >
                <Pressable style={[styles.pickerSheet, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.pickerTitle, { color: colors.textPrimary, borderBottomColor: colors.border }]}>Tipo de combustible</Text>
                  <FlatList
                    data={filteredCombNombres}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => {
                      const c = combLookup[item];
                      return (
                        <TouchableOpacity
                          style={[
                            styles.pickerOption,
                            item === tipoCombustible && [styles.pickerOptionActive, { backgroundColor: colors.background }],
                          ]}
                          onPress={() => {
                            handleTipoChange(item);
                            setTipoPickerVisible(false);
                          }}
                        >
                          <View style={styles.pickerOptionContent}>
                            <Text
                              style={[
                                styles.pickerOptionText,
                                { color: colors.textPrimary },
                                item === tipoCombustible && [styles.pickerOptionTextActive, { color: colors.primary }],
                              ]}
                            >
                              {item}
                            </Text>
                            {c && (
                              <Text style={[styles.pickerOptionPrice, { color: colors.textSecondary }]}>
                                {moneda} {c.precio.toFixed(2)} / {c.unidad}
                              </Text>
                            )}
                          </View>
                          {item === tipoCombustible && (
                            <Ionicons name="checkmark" size={20} color={colors.primary} />
                          )}
                        </TouchableOpacity>
                      );
                    }}
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
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputDisabled: {
    opacity: 0.7,
  },
  inputDisabledText: {
    ...typography.body,
  },
  priceInfo: {
    ...typography.bodySmall,
    fontWeight: '500',
    marginTop: spacing.xs,
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
  pickerOptionActive: {
  },
  pickerOptionContent: {
    gap: 2,
  },
  pickerOptionText: {
    ...typography.body,
  },
  pickerOptionTextActive: {
    fontWeight: '600',
  },
  pickerOptionPrice: {
    ...typography.bodySmall,
  },
});
