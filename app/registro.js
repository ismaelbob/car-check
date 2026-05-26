import { useState, useEffect, useLayoutEffect } from 'react';
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
import { colors, typography, spacing } from '../src/theme';

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

export default function RegistroScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams();
  const { agregarVehiculo, actualizarVehiculo, obtenerVehiculoPorId } = useVehiculos();
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

  const handleGuardar = async () => {
    if (!marca.trim() || !modelo.trim() || !tipo.trim() || !año.trim() || !color.trim() || !placa.trim() || !kilometrajeInicial.trim()) {
      Alert.alert('Campos requeridos', 'Todos los campos son obligatorios');
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
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.photoSection}>
          <View style={styles.photoPreview}>
            {foto ? (
              <Image source={{ uri: foto }} style={styles.photoImage} />
            ) : (
              <Ionicons name="car-sport-outline" size={64} color={colors.textLight} />
            )}
          </View>

          <View style={styles.photoButtons}>
            <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
              <Ionicons name="camera-outline" size={20} color={colors.primary} />
              <Text style={styles.photoButtonText}>Cámara</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoButton} onPress={pickFromGallery}>
              <Ionicons name="images-outline" size={20} color={colors.primary} />
              <Text style={styles.photoButtonText}>Galería</Text>
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
            <Text style={styles.label}>Marca</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Toyota"
              placeholderTextColor={colors.textLight}
              value={marca}
              onChangeText={setMarca}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Modelo</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Corolla"
              placeholderTextColor={colors.textLight}
              value={modelo}
              onChangeText={setModelo}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Tipo</Text>
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

          <View style={styles.row}>
            <View style={[styles.field, styles.fieldHalf]}>
              <Text style={styles.label}>Año</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 2020"
                placeholderTextColor={colors.textLight}
                keyboardType="number-pad"
                value={año}
                onChangeText={setAño}
                maxLength={4}
              />
            </View>
            <View style={[styles.field, styles.fieldHalf]}>
              <Text style={styles.label}>Color</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Rojo"
                placeholderTextColor={colors.textLight}
                value={color}
                onChangeText={setColor}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Placa</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: ABC-1234"
              placeholderTextColor={colors.textLight}
              autoCapitalize="characters"
              value={placa}
              onChangeText={setPlaca}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Kilometraje inicial</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 50000"
              placeholderTextColor={colors.textLight}
              keyboardType="number-pad"
              value={kilometrajeInicial}
              onChangeText={setKilometrajeInicial}
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleGuardar}>
            <Ionicons name="checkmark-circle-outline" size={22} color={colors.white} />
            <Text style={styles.buttonText}>
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
          <Pressable style={styles.pickerSheet}>
            <Text style={styles.pickerTitle}>Seleccionar tipo</Text>
            <FlatList
              data={TIPOS_OPCIONES}
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
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
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
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
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  photoButtonText: {
    ...typography.bodySmall,
    color: colors.primary,
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
    color: colors.textSecondary,
    fontWeight: '500',
  },
  input: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    color: colors.textPrimary,
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
  button: {
    backgroundColor: colors.primary,
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
    color: colors.white,
  },
});
