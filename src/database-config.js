import * as SQLite from 'expo-sqlite';

let db = null;

async function getDb() {
  if (!db) {
    db = await SQLite.openDatabaseAsync('car-check.db');
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS configuracion (
        clave TEXT PRIMARY KEY,
        valor TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS tipos_mantenimiento (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL UNIQUE
      );

      CREATE TABLE IF NOT EXISTS combustibles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL UNIQUE,
        precio REAL NOT NULL,
        unidad TEXT NOT NULL
      );
    `);
  }
  return db;
}

export async function inicializarConfiguracion() {
  const database = await getDb();

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
      await database.runAsync('INSERT INTO tipos_mantenimiento (nombre) VALUES (?)', nombre);
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
        c.nombre,
        c.precio,
        c.unidad
      );
    }
  }
}

// ---- Tipos de mantenimiento ----

export async function obtenerTiposMantenimiento() {
  const database = await getDb();
  return await database.getAllAsync('SELECT * FROM tipos_mantenimiento ORDER BY id ASC');
}

export async function agregarTipoMantenimiento(nombre) {
  const database = await getDb();
  await database.runAsync('INSERT INTO tipos_mantenimiento (nombre) VALUES (?)', nombre);
}

export async function eliminarTipoMantenimiento(id) {
  const database = await getDb();
  await database.runAsync('DELETE FROM tipos_mantenimiento WHERE id = ?', id);
}

// ---- Combustibles ----

export async function obtenerCombustibles() {
  const database = await getDb();
  return await database.getAllAsync('SELECT * FROM combustibles ORDER BY id ASC');
}

export async function agregarCombustible(nombre, precio, unidad) {
  const database = await getDb();
  await database.runAsync(
    'INSERT INTO combustibles (nombre, precio, unidad) VALUES (?, ?, ?)',
    nombre,
    precio,
    unidad
  );
}

export async function actualizarCombustible(id, nombre, precio, unidad) {
  const database = await getDb();
  await database.runAsync(
    'UPDATE combustibles SET nombre = ?, precio = ?, unidad = ? WHERE id = ?',
    nombre,
    precio,
    unidad,
    id
  );
}

export async function eliminarCombustible(id) {
  const database = await getDb();
  await database.runAsync('DELETE FROM combustibles WHERE id = ?', id);
}

// ---- Export / Import ----

export async function obtenerTodasLasConfiguraciones() {
  const database = await getDb();
  return await database.getAllAsync('SELECT * FROM configuracion');
}

export async function limpiarDatosConfig() {
  const database = await getDb();
  await database.execAsync(`
    DELETE FROM combustibles;
    DELETE FROM tipos_mantenimiento;
    DELETE FROM configuracion;
  `);
}

// ---- Configuración simple ----

export async function obtenerConfig(clave) {
  const database = await getDb();
  const row = await database.getFirstAsync(
    'SELECT valor FROM configuracion WHERE clave = ?',
    clave
  );
  return row ? row.valor : null;
}

export async function guardarConfig(clave, valor) {
  const database = await getDb();
  await database.runAsync(
    'INSERT OR REPLACE INTO configuracion (clave, valor) VALUES (?, ?)',
    clave,
    valor
  );
}
