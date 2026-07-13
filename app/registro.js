import { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
  Pressable,
  FlatList,
} from 'react-native';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useVehiculos } from '../src/context/VehiculoContext';
import { typography, spacing } from '../src/theme';
import { useTheme } from '../src/context/ThemeContext';

const TIPOS_OPCIONES = [
  'Sedan',
  'Vagoneta',
  'Camioneta',
  'Furgoneta',
  'Minibus',
  'Microbus',
  'Bus',
  'Camion',
  'Tractocamion',
  'Otro',
];

const TIPOS_COMBUSTIBLE = ['Gasolina', 'GNV', 'Diesel'];

export default function RegistroScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams();
  const { agregarVehiculo, actualizarVehiculo, obtenerVehiculoPorId } = useVehiculos();
  const { colors } = useTheme();
  const esEdicion = !!id;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: esEdicion ? 'Editar vehículo' : 'Nuevo vehículo',
    });
  }, [esEdicion]);

  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [tipo, setTipo] = useState('');
  const [año, setAño] = useState('');
  const [color, setColor] = useState('');
  const [placa, setPlaca] = useState('');
  const [kilometrajeInicial, setKilometrajeInicial] = useState('');
  const [foto, setFoto] = useState(null);
  const [combustibles, setCombustibles] = useState([]);
  const [tipoPickerVisible, setTipoPickerVisible] = useState(false);

  useEffect(() => {
    if (id) {
      (async () => {
        const vehiculo = await obtenerVehiculoPorId(id);
        if (vehiculo) {
          setMarca(vehiculo.marca);
          setModelo(vehiculo.modelo);
          setTipo(vehiculo.tipo);
          setAño(vehiculo.año);
          setColor(vehiculo.color);
          setPlaca(vehiculo.placa);
          setKilometrajeInicial(vehiculo.kilometrajeInicial);
          setFoto(vehiculo.foto || null);
          setCombustibles(
            vehiculo.combustible ? vehiculo.combustible.split(',').map((s) => s.trim()) : []
          );
        }
      })();
    }
  }, [id]);

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled) {
      setFoto(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a la cámara');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled) {
      setFoto(result.assets[0].uri);
    }
  };

  const toggleCombustible = useCallback((item) => {
    setCombustibles((prev) =>
      prev.includes(item) ? prev.filter((c) => c !== item) : [...prev, item]
    );
  }, []);

  const handleGuardar = async () => {
    if (!marca.trim() || !modelo.trim() || !tipo.trim() || !año.trim() || !color.trim() || !placa.trim() || !kilometrajeInicial.trim()) {
      Alert.alert('Campos requeridos', 'Todos los campos son obligatorios');
      return;
    }

    if (combustibles.length === 0) {
      Alert.alert('Campo requerido', 'Selecciona al menos un tipo de combustible');
      return;
    }

    const data = {
      marca: marca.trim(),
      modelo: modelo.trim(),
      tipo: tipo.trim(),
      año: año.trim(),
      color: color.trim(),
      placa: placa.trim(),
      kilometrajeInicial: kilometrajeInicial.trim(),
      foto: foto || null,
      combustible: combustibles.join(','),
    };

    if (esEdicion) {
      await actualizarVehiculo(id, data);
    } else {
      await agregarVehiculo(data);
    }

    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.photoSection}>
          <View style={[styles.photoPreview, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {foto ? (
              <Image source={{ uri: foto }} style={styles.photoImage} />
            ) : (
              <Ionicons name="car-sport-outline" size={64} color={colors.textLight} />
            )}
          </View>

          <View style={styles.photoButtons}>
            <TouchableOpacity style={[styles.photoButton, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={takePhoto}>
              <Ionicons name="camera-outline" size={20} color={colors.primary} />
              <Text style={[styles.photoButtonText, { color: colors.primary }]}>Cámara</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.photoButton, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={pickFromGallery}>
              <Ionicons name="images-outline" size={20} color={colors.primary} />
              <Text style={[styles.photoButtonText, { color: colors.primary }]}>Galería</Text>
            </TouchableOpacity>
            {foto && (
              <TouchableOpacity style={styles.photoButton} onPress={() => setFoto(null)}>
                <Ionicons name="close-outline" size={20} color={colors.error} />
                <Text style={[styles.photoButtonText, { color: colors.error }]}>Quitar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Marca</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
              placeholder="Ej: Toyota"
              placeholderTextColor={colors.textLight}
              value={marca}
              onChangeText={setMarca}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Modelo</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
              placeholder="Ej: Corolla"
              placeholderTextColor={colors.textLight}
              value={modelo}
              onChangeText={setModelo}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Tipo</Text>
            <TouchableOpacity
              style={[styles.input, styles.select, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
              onPress={() => setTipoPickerVisible(true)}
            >
              <Text style={[!tipo && { color: colors.textLight }]}>
                {tipo || 'Seleccionar tipo'}
              </Text>
              <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <View style={[styles.field, styles.fieldHalf]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Año</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="Ej: 2020"
                placeholderTextColor={colors.textLight}
                keyboardType="number-pad"
                value={año}
                onChangeText={setAño}
                maxLength={4}
              />
            </View>
            <View style={[styles.field, styles.fieldHalf]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Color</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="Ej: Rojo"
                placeholderTextColor={colors.textLight}
                value={color}
                onChangeText={setColor}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Placa</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
              placeholder="Ej: ABC-1234"
              placeholderTextColor={colors.textLight}
              autoCapitalize="characters"
              value={placa}
              onChangeText={setPlaca}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Kilometraje inicial</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
              placeholder="Ej: 50000"
              placeholderTextColor={colors.textLight}
              keyboardType="number-pad"
              value={kilometrajeInicial}
              onChangeText={setKilometrajeInicial}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Combustible</Text>
            <View style={styles.chipsRow}>
              {TIPOS_COMBUSTIBLE.map((item) => {
                const active = combustibles.includes(item);
                return (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.chip,
                      { borderColor: colors.border, backgroundColor: colors.surface },
                      active && styles.chipActive,
                      active && { borderColor: colors.secondary, backgroundColor: colors.secondary + '15' },
                    ]}
                    onPress={() => toggleCombustible(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, { color: colors.textSecondary }, active && styles.chipTextActive, active && { color: colors.secondary }]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleGuardar}>
            <Ionicons name="checkmark-circle-outline" size={22} color={colors.white} />
            <Text style={[styles.buttonText, { color: colors.white }]}>
              {esEdicion ? 'Guardar cambios' : 'Guardar'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={tipoPickerVisible} transparent animationType="fade">
        <Pressable
          style={styles.pickerOverlay}
          onPress={() => setTipoPickerVisible(false)}
        >
          <Pressable style={[styles.pickerSheet, { backgroundColor: colors.surface }]}>
            <Text style={[styles.pickerTitle, { color: colors.textPrimary, borderBottomColor: colors.border }]}>Seleccionar tipo</Text>
            <FlatList
              data={TIPOS_OPCIONES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.pickerOption,
                    item === tipo && styles.pickerOptionActive,
                    item === tipo && { backgroundColor: colors.background },
                  ]}
                  onPress={() => {
                    setTipo(item);
                    setTipoPickerVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerOptionText,
                      { color: colors.textPrimary },
                      item === tipo && styles.pickerOptionTextActive,
                      item === tipo && { color: colors.primary },
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl * 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  photoPreview: {
    width: 160,
    height: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    resizeMode: 'cover',
  },
  photoButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  photoButtonText: {
    ...typography.bodySmall,
    fontWeight: '500',
  },
  form: {
    gap: spacing.md,
  },
  field: {
    gap: spacing.xs,
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
  chipsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  chip: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
  },
  chipActive: {},
  chipText: {
    ...typography.body,
  },
  chipTextActive: {
    fontWeight: '600',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: spacing.md,
  },
  buttonText: {
    ...typography.button,
  },
});
