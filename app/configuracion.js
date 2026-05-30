import { useState, useLayoutEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../src/context/ConfigContext';
import { colors, typography, spacing } from '../src/theme';

const UNIDADES_OPCIONES = ['L', 'm3', 'kg', 'gal'];

export default function ConfiguracionScreen() {
  const navigation = useNavigation();
  const {
    tiposMantenimiento,
    combustibles,
    moneda,
    agregarTipoMantenimiento,
    eliminarTipoMantenimiento,
    agregarCombustible,
    actualizarCombustible,
    eliminarCombustible,
    actualizarMoneda,
  } = useConfig();

  const [nuevoTipo, setNuevoTipo] = useState('');
  const [combEditId, setCombEditId] = useState(null);
  const [combNombre, setCombNombre] = useState('');
  const [combPrecio, setCombPrecio] = useState('');
  const [combUnidad, setCombUnidad] = useState('L');
  const [showCombForm, setShowCombForm] = useState(false);
  const [monedaInput, setMonedaInput] = useState(moneda);

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Configuración' });
  }, []);

  const handleAgregarTipo = async () => {
    const nombre = nuevoTipo.trim();
    if (!nombre) {
      Alert.alert('Campo requerido', 'Ingresa un nombre para el tipo');
      return;
    }
    try {
      await agregarTipoMantenimiento(nombre);
      setNuevoTipo('');
    } catch (e) {
      Alert.alert('Error', 'Ese tipo ya existe');
    }
  };

  const handleEliminarTipo = (id, nombre) => {
    Alert.alert(
      'Eliminar tipo',
      `¿Eliminar "${nombre}"? Los mantenimientos existentes no se verán afectados.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => eliminarTipoMantenimiento(id) },
      ]
    );
  };

  const resetCombForm = () => {
    setCombEditId(null);
    setCombNombre('');
    setCombPrecio('');
    setCombUnidad('L');
    setShowCombForm(false);
  };

  const handleGuardarCombustible = async () => {
    const nombre = combNombre.trim();
    const precio = parseFloat(combPrecio);
    if (!nombre || isNaN(precio) || precio <= 0) {
      Alert.alert('Campos inválidos', 'Nombre y precio son obligatorios');
      return;
    }
    try {
      if (combEditId !== null) {
        await actualizarCombustible(combEditId, nombre, precio, combUnidad);
      } else {
        await agregarCombustible(nombre, precio, combUnidad);
      }
      resetCombForm();
    } catch (e) {
      Alert.alert('Error', 'Ese combustible ya existe');
    }
  };

  const handleEditarCombustible = (item) => {
    setCombEditId(item.id);
    setCombNombre(item.nombre);
    setCombPrecio(String(item.precio));
    setCombUnidad(item.unidad);
    setShowCombForm(true);
  };

  const handleEliminarCombustible = (id, nombre) => {
    Alert.alert(
      'Eliminar combustible',
      `¿Eliminar "${nombre}"? Las cargas existentes no se verán afectadas.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => eliminarCombustible(id) },
      ]
    );
  };

  const handleGuardarMoneda = async () => {
    const val = monedaInput.trim();
    if (!val) {
      Alert.alert('Campo requerido', 'Ingresa un símbolo de moneda');
      return;
    }
    await actualizarMoneda(val);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      {/* === Tipos de mantenimiento === */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="settings-outline" size={20} color={colors.primary} />
          <Text style={styles.sectionTitle}>Tipos de mantenimiento</Text>
        </View>
        <Text style={styles.sectionDesc}>
          Estos tipos aparecerán en el formulario de mantenimiento.
        </Text>
        <View style={styles.chipsWrap}>
          {tiposMantenimiento.map((t) => (
            <View key={t.id} style={styles.chip}>
              <Text style={styles.chipText}>{t.nombre}</Text>
              <TouchableOpacity
                onPress={() => handleEliminarTipo(t.id, t.nombre)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={18} color={colors.textLight} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
        <View style={styles.addRow}>
          <TextInput
            style={[styles.input, styles.addInput]}
            placeholder="Nuevo tipo"
            placeholderTextColor={colors.textLight}
            value={nuevoTipo}
            onChangeText={setNuevoTipo}
          />
          <TouchableOpacity style={styles.addBtn} onPress={handleAgregarTipo}>
            <Ionicons name="add" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.divider} />

      {/* === Combustibles === */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="flame-outline" size={20} color={colors.primary} />
          <Text style={styles.sectionTitle}>Combustibles</Text>
        </View>
        <Text style={styles.sectionDesc}>
          Gestiona los combustibles, precios y unidades para el formulario de carga.
        </Text>

        {combustibles.map((c) => (
          <View key={c.id} style={styles.combItem}>
            <View style={styles.combInfo}>
              <Text style={styles.combNombre}>{c.nombre}</Text>
              <Text style={styles.combDetalle}>
                {moneda} {c.precio.toFixed(2)} / {c.unidad}
              </Text>
            </View>
            <View style={styles.combActions}>
              <TouchableOpacity
                style={styles.combActionBtn}
                onPress={() => handleEditarCombustible(c)}
              >
                <Ionicons name="create-outline" size={18} color={colors.secondary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.combActionBtn}
                onPress={() => handleEliminarCombustible(c.id, c.nombre)}
              >
                <Ionicons name="trash-outline" size={18} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {showCombForm ? (
          <View style={styles.combForm}>
            <TextInput
              style={styles.input}
              placeholder="Nombre"
              placeholderTextColor={colors.textLight}
              value={combNombre}
              onChangeText={setCombNombre}
            />
            <View style={styles.combFormRow}>
              <TextInput
                style={[styles.input, styles.combFormInput]}
                placeholder="Precio"
                placeholderTextColor={colors.textLight}
                keyboardType="decimal-pad"
                value={combPrecio}
                onChangeText={setCombPrecio}
              />
              <View style={styles.unidadPicker}>
                {UNIDADES_OPCIONES.map((u) => (
                  <TouchableOpacity
                    key={u}
                    style={[styles.unidadOpt, combUnidad === u && styles.unidadOptActive]}
                    onPress={() => setCombUnidad(u)}
                  >
                    <Text
                      style={[styles.unidadOptText, combUnidad === u && styles.unidadOptTextActive]}
                    >
                      {u}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.combFormActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={resetCombForm}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleGuardarCombustible}>
                <Text style={styles.saveBtnText}>
                  {combEditId !== null ? 'Guardar' : 'Agregar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addCombBtn}
            onPress={() => setShowCombForm(true)}
          >
            <Ionicons name="add-circle-outline" size={20} color={colors.secondary} />
            <Text style={styles.addCombBtnText}>Agregar combustible</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.divider} />

      {/* === Moneda === */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="cash-outline" size={20} color={colors.primary} />
          <Text style={styles.sectionTitle}>Moneda</Text>
        </View>
        <Text style={styles.sectionDesc}>
          Símbolo monetario usado en toda la app.
        </Text>
        <View style={styles.monedaRow}>
          <TextInput
            style={[styles.input, styles.monedaInput]}
            placeholder="Bs"
            placeholderTextColor={colors.textLight}
            value={monedaInput}
            onChangeText={setMonedaInput}
            maxLength={5}
          />
          <TouchableOpacity style={styles.saveMonedaBtn} onPress={handleGuardarMoneda}>
            <Ionicons name="checkmark" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 2,
  },
  section: {
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  sectionDesc: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  chipText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  addRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  addInput: {
    flex: 1,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: colors.textPrimary,
  },
  combItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  combInfo: {
    flex: 1,
    gap: 2,
  },
  combNombre: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  combDetalle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  combActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  combActionBtn: {
    padding: 6,
  },
  combForm: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  combFormRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  combFormInput: {
    flex: 1,
  },
  unidadPicker: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  unidadOpt: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  unidadOptActive: {
    borderColor: colors.secondary,
    backgroundColor: colors.secondary + '15',
  },
  unidadOptText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  unidadOptTextActive: {
    color: colors.secondary,
    fontWeight: '600',
  },
  combFormActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelBtnText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  saveBtn: {
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  saveBtnText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
  addCombBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 12,
  },
  addCombBtnText: {
    ...typography.body,
    color: colors.secondary,
    fontWeight: '500',
  },
  monedaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  monedaInput: {
    width: 100,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
  },
  saveMonedaBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
