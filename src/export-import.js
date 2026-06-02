import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import * as db from './database';
import * as configDb from './database-config';

const BACKUP_VERSION = 1;
const FILENAME = 'car-check-backup.json';

export async function exportarDatos() {
  const [vehiculos, mantenimientos, cargasCombustible, configuracion, tiposMantenimiento, combustibles] =
    await Promise.all([
      db.obtenerVehiculos(),
      db.obtenerTodosLosMantenimientos(),
      db.obtenerTodasLasCargasCombustible(),
      configDb.obtenerTodasLasConfiguraciones(),
      configDb.obtenerTiposMantenimiento(),
      configDb.obtenerCombustibles(),
    ]);

  const payload = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    vehiculos,
    mantenimientos,
    cargasCombustible,
    configuracion,
    tiposMantenimiento,
    combustibles,
  };

  const json = JSON.stringify(payload, null, 2);
  const fileUri = FileSystem.cacheDirectory + FILENAME;

  await FileSystem.writeAsStringAsync(fileUri, json, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error('Compartir archivos no está disponible en este dispositivo');
  }

  await Sharing.shareAsync(fileUri, {
    mimeType: 'application/json',
    dialogTitle: 'Compartir respaldo de Car Check',
  });
}

export async function importarDatos() {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
  });

  if (result.canceled) {
    return { success: false, cancelled: true };
  }

  const uri = result.assets[0].uri;
  const content = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  let data;
  try {
    data = JSON.parse(content);
  } catch {
    throw new Error('El archivo no tiene un formato JSON válido');
  }

  if (!data.version || !Array.isArray(data.vehiculos)) {
    throw new Error('El archivo no parece ser un respaldo válido de Car Check');
  }

  await configDb.limpiarDatosConfig();
  await db.limpiarDatosVehiculos();

  if (data.configuracion?.length) {
    for (const item of data.configuracion) {
      await configDb.guardarConfig(item.clave, item.valor);
    }
  }

  if (data.tiposMantenimiento?.length) {
    for (const t of data.tiposMantenimiento) {
      try {
        await configDb.agregarTipoMantenimiento(t.nombre);
      } catch {
        // skip duplicates
      }
    }
  }

  if (data.combustibles?.length) {
    for (const c of data.combustibles) {
      try {
        await configDb.agregarCombustible(c.nombre, c.precio, c.unidad);
      } catch {
        // skip duplicates
      }
    }
  }

  for (const v of data.vehiculos) {
    const { id, marca, modelo, tipo, año, color, placa, kilometrajeInicial, foto, combustible } = v;
    await db.insertarVehiculo({ id, marca, modelo, tipo, año, color, placa, kilometrajeInicial, foto, combustible });
  }

  if (data.mantenimientos?.length) {
    for (const m of data.mantenimientos) {
      const { id, vehiculo_id, tipo, descripcion, kilometraje, fecha, costo, taller } = m;
      await db.insertarMantenimiento({ id, vehiculo_id, tipo, descripcion, kilometraje, fecha, costo, taller });
    }
  }

  if (data.cargasCombustible?.length) {
    for (const c of data.cargasCombustible) {
      const { id, vehiculo_id, litros, costo, kilometraje, tipo_combustible, fecha } = c;
      await db.insertarCargaCombustible({ id, vehiculo_id, litros, costo, kilometraje, tipo_combustible, fecha });
    }
  }

  return { success: true };
}
