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
import { useVehiculos } from '../src/context/VehiculoContext';
import { useTheme } from '../src/context/ThemeContext';
import { exportarDatos, importarDatos } from '../src/export-import';
import { typography, spacing } from '../src/theme';

const UNIDADES_OPCIONES = ['L', 'm3', 'kg', 'gal'];

const TEMAS_OPCIONES = [
  { value: 'light', label: 'Claro', icon: 'sunny-outline' },
  { value: 'dark', label: 'Oscuro', icon: 'moon-outline' },
  { value: 'system', label: 'Sistema', icon: 'phone-portrait-outline' },
];

export default function ConfiguracionScreen() {
  const navigation = useNavigation();
  const { colors, themeMode, cambiarTema } = useTheme();
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

  const { recargarVehiculos, setVehiculoActivo } = useVehiculos();
  const { recargarConfig } = useConfig();

  const [nuevoTipo, setNuevoTipo] = useState('');
  const [combEditId, setCombEditId] = useState(null);
  const [combNombre, setCombNombre] = useState('');
  const [combPrecio, setCombPrecio] = useState('');
  const [combUnidad, setCombUnidad] = useState('L');
  const [showCombForm, setShowCombForm] = useState(false);
  const [monedaInput, setMonedaInput] = useState(moneda);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

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

  const handleExportar = async () => {
    setExporting(true);
    try {
      await exportarDatos();
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo exportar los datos');
    } finally {
      setExporting(false);
    }
  };

  const handleImportar = async () => {
    Alert.alert(
      'Importar datos',
      'Todos los datos actuales serán reemplazados por los del archivo. Esta acción no se puede deshacer. ¿Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Importar',
          style: 'destructive',
          onPress: async () => {
            setImporting(true);
            try {
              const result = await importarDatos();
              if (result.cancelled) {
                setImporting(false);
                return;
              }
              await Promise.all([recargarVehiculos(), recargarConfig()]);
              setVehiculoActivo(0);
              Alert.alert('Importación exitosa', 'Los datos fueron importados correctamente');
            } catch (e) {
              Alert.alert('Error', e.message || 'No se pudo importar los datos');
            } finally {
              setImporting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      {/* === Tipos de mantenimiento === */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="settings-outline" size={20} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Tipos de mantenimiento</Text>
        </View>
        <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
          Estos tipos aparecerán en el formulario de mantenimiento.
        </Text>
        <View style={styles.chipsWrap}>
          {tiposMantenimiento.map((t) => (
            <View key={t.id} style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.chipText, { color: colors.textPrimary }]}>{t.nombre}</Text>
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
            style={[styles.input, styles.addInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="Nuevo tipo"
            placeholderTextColor={colors.textLight}
            value={nuevoTipo}
            onChangeText={setNuevoTipo}
          />
          <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.secondary }]} onPress={handleAgregarTipo}>
            <Ionicons name="add" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* === Combustibles === */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="flame-outline" size={20} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Combustibles</Text>
        </View>
        <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
          Gestiona los combustibles, precios y unidades para el formulario de carga.
        </Text>

        {combustibles.map((c) => (
          <View key={c.id} style={[styles.combItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.combInfo}>
              <Text style={[styles.combNombre, { color: colors.textPrimary }]}>{c.nombre}</Text>
              <Text style={[styles.combDetalle, { color: colors.textSecondary }]}>
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
          <View style={[styles.combForm, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
              placeholder="Nombre"
              placeholderTextColor={colors.textLight}
              value={combNombre}
              onChangeText={setCombNombre}
            />
            <View style={styles.combFormRow}>
              <TextInput
                style={[styles.input, styles.combFormInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
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
                    style={[styles.unidadOpt, { borderColor: colors.border }, combUnidad === u && { borderColor: colors.secondary, backgroundColor: colors.secondary + '15' }]}
                    onPress={() => setCombUnidad(u)}
                  >
                    <Text
                      style={[styles.unidadOptText, { color: colors.textSecondary }, combUnidad === u && { color: colors.secondary, fontWeight: '600' }]}
                    >
                      {u}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.combFormActions}>
              <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={resetCombForm}>
                <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleGuardarCombustible}>
                <Text style={[styles.saveBtnText, { color: colors.white }]}>
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
            <Text style={[styles.addCombBtnText, { color: colors.secondary }]}>Agregar combustible</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* === Moneda === */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="cash-outline" size={20} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Moneda</Text>
        </View>
        <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
          Símbolo monetario usado en toda la app.
        </Text>
        <View style={styles.monedaRow}>
          <TextInput
            style={[styles.input, styles.monedaInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="Bs"
            placeholderTextColor={colors.textLight}
            value={monedaInput}
            onChangeText={setMonedaInput}
            maxLength={5}
          />
          <TouchableOpacity style={[styles.saveMonedaBtn, { backgroundColor: colors.primary }]} onPress={handleGuardarMoneda}>
            <Ionicons name="checkmark" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* === Apariencia === */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="color-palette-outline" size={20} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Apariencia</Text>
        </View>
        <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
          Selecciona el tema de la aplicación.
        </Text>
        <View style={styles.themeRow}>
          {TEMAS_OPCIONES.map((t) => {
            const isActive = themeMode === t.value;
            return (
              <TouchableOpacity
                key={t.value}
                style={[
                  styles.themeOption,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  isActive && { borderColor: colors.primary, backgroundColor: colors.primary + '15' },
                ]}
                onPress={() => cambiarTema(t.value)}
              >
                <Ionicons
                  name={t.icon}
                  size={24}
                  color={isActive ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.themeOptionText,
                    { color: isActive ? colors.primary : colors.textSecondary },
                    isActive && { fontWeight: '600' },
                  ]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* === Exportar / Importar === */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="cloud-download-outline" size={20} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Exportar / Importar</Text>
        </View>
        <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
          Exporta todos tus datos como respaldo o impórtalos desde un archivo.
        </Text>
        <View style={styles.exportRow}>
          <TouchableOpacity
            style={[styles.exportBtn, { backgroundColor: colors.primary }, exporting && styles.exportBtnDisabled]}
            onPress={handleExportar}
            disabled={exporting}
          >
            <Ionicons name="share-outline" size={20} color={colors.white} />
            <Text style={[styles.exportBtnText, { color: colors.white }]}>
              {exporting ? 'Exportando…' : 'Exportar datos'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.exportBtn, styles.importBtn, { backgroundColor: colors.secondary }, importing && styles.exportBtnDisabled]}
            onPress={handleImportar}
            disabled={importing}
          >
            <Ionicons name="cloud-download-outline" size={20} color={colors.white} />
            <Text style={[styles.exportBtnText, { color: colors.white }]}>
              {importing ? 'Importando…' : 'Importar datos'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  sectionDesc: {
    ...typography.bodySmall,
  },
  divider: {
    height: 1,
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
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  chipText: {
    ...typography.body,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    ...typography.body,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  combItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderWidth: 1,
  },
  combInfo: {
    flex: 1,
    gap: 2,
  },
  combNombre: {
    ...typography.body,
    fontWeight: '600',
  },
  combDetalle: {
    ...typography.bodySmall,
  },
  combActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  combActionBtn: {
    padding: 6,
  },
  combForm: {
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
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
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  unidadOptActive: {},
  unidadOptText: {
    ...typography.bodySmall,
  },
  unidadOptTextActive: {},
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
  },
  cancelBtnText: {
    ...typography.body,
  },
  saveBtn: {
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
  },
  saveBtnText: {
    ...typography.body,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
  },
  themeOptionText: {
    ...typography.bodySmall,
  },
  exportRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  exportBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: 12,
    paddingVertical: 14,
  },
  importBtn: {},
  exportBtnDisabled: {
    opacity: 0.6,
  },
  exportBtnText: {
    ...typography.button,
  },
});
