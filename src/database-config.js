import { getDb } from './database';

async function getDatabase() {
  return await getDb();
}

export async function inicializarConfiguracion() {
  const database = await getDatabase();

  const row = await database.getFirstAsync(
    "SELECT COUNT(*) as count FROM configuracion WHERE clave = 'moneda'"
  );
  if (row.count === 0) {
    await database.runAsync("INSERT INTO configuracion (clave, valor) VALUES ('moneda', 'Bs')");
  }

  const tipoCount = await database.getFirstAsync('SELECT COUNT(*) as count FROM tipos_mantenimiento');
  if (tipoCount.count === 0) {
    const defaults = ['Aceite', 'Frenos', 'Llantas', 'Afinación', 'Batería', 'Transmisión', 'Suspensión', 'Otro'];
    for (const nombre of defaults) {
      await database.runAsync('INSERT INTO tipos_mantenimiento (nombre) VALUES (?)', [nombre]);
    }
  }

  const combCount = await database.getFirstAsync('SELECT COUNT(*) as count FROM combustibles');
  if (combCount.count === 0) {
    const defaults = [
      { nombre: 'Gasolina', precio: 6.96, unidad: 'L' },
      { nombre: 'GNV', precio: 3.72, unidad: 'm3' },
      { nombre: 'Gasolina premium', precio: 11.00, unidad: 'L' },
      { nombre: 'Diesel', precio: 9.80, unidad: 'L' },
    ];
    for (const c of defaults) {
      await database.runAsync(
        'INSERT INTO combustibles (nombre, precio, unidad) VALUES (?, ?, ?)',
        [c.nombre, c.precio, c.unidad]
      );
    }
  }
}

// ---- Tipos de mantenimiento ----

export async function obtenerTiposMantenimiento() {
  const database = await getDatabase();
  return await database.getAllAsync('SELECT * FROM tipos_mantenimiento ORDER BY id ASC');
}

export async function agregarTipoMantenimiento(nombre) {
  if (!nombre) return;
  const database = await getDatabase();
  await database.runAsync('INSERT INTO tipos_mantenimiento (nombre) VALUES (?)', [nombre]);
}

export async function eliminarTipoMantenimiento(id) {
  if (id == null) return;
  const database = await getDatabase();
  await database.runAsync('DELETE FROM tipos_mantenimiento WHERE id = ?', [id]);
}

// ---- Combustibles ----

export async function obtenerCombustibles() {
  const database = await getDatabase();
  return await database.getAllAsync('SELECT * FROM combustibles ORDER BY id ASC');
}

export async function agregarCombustible(nombre, precio, unidad) {
  if (!nombre) return;
  const database = await getDatabase();
  await database.runAsync(
    'INSERT INTO combustibles (nombre, precio, unidad) VALUES (?, ?, ?)',
    [nombre, precio, unidad]
  );
}

export async function actualizarCombustible(id, nombre, precio, unidad) {
  if (id == null) return;
  const database = await getDatabase();
  await database.runAsync(
    'UPDATE combustibles SET nombre = ?, precio = ?, unidad = ? WHERE id = ?',
    [nombre, precio, unidad, id]
  );
}

export async function eliminarCombustible(id) {
  if (id == null) return;
  const database = await getDatabase();
  await database.runAsync('DELETE FROM combustibles WHERE id = ?', [id]);
}

// ---- Export / Import ----

export async function obtenerTodasLasConfiguraciones() {
  const database = await getDatabase();
  return await database.getAllAsync('SELECT * FROM configuracion');
}

export async function limpiarDatosConfig() {
  const database = await getDatabase();
  await database.execAsync(`
    DELETE FROM combustibles;
    DELETE FROM tipos_mantenimiento;
    DELETE FROM configuracion;
  `);
}

// ---- Configuración simple ----

export async function obtenerConfig(clave) {
  if (!clave) return null;
  const database = await getDatabase();
  const row = await database.getFirstAsync(
    'SELECT valor FROM configuracion WHERE clave = ?',
    [clave]
  );
  return row ? row.valor : null;
}

export async function guardarConfig(clave, valor) {
  if (!clave) return;
  const database = await getDatabase();
  await database.runAsync(
    'INSERT OR REPLACE INTO configuracion (clave, valor) VALUES (?, ?)',
    [clave, valor]
  );
}
