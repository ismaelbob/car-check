import * as SQLite from 'expo-sqlite';

let db = null;
let dbPromise = null;

async function getDb() {
  if (db) return db;
  if (dbPromise) return dbPromise;
  dbPromise = (async () => {
    db = await SQLite.openDatabaseAsync('car-check.db');
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS vehiculos (
        id TEXT PRIMARY KEY,
        marca TEXT NOT NULL,
        modelo TEXT NOT NULL,
        tipo TEXT NOT NULL,
        año TEXT NOT NULL,
        color TEXT NOT NULL,
        placa TEXT NOT NULL,
        kilometrajeInicial TEXT NOT NULL,
        foto TEXT,
        combustible TEXT DEFAULT 'Gasolina'
      );

      CREATE TABLE IF NOT EXISTS mantenimientos (
        id TEXT PRIMARY KEY,
        vehiculo_id TEXT NOT NULL,
        tipo TEXT NOT NULL,
        descripcion TEXT,
        kilometraje TEXT NOT NULL,
        fecha TEXT NOT NULL,
        costo TEXT,
        taller TEXT,
        FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS cargas_combustible (
        id TEXT PRIMARY KEY,
        vehiculo_id TEXT NOT NULL,
        litros TEXT NOT NULL,
        costo TEXT NOT NULL,
        kilometraje TEXT NOT NULL,
        tipo_combustible TEXT,
        fecha TEXT NOT NULL,
        FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE CASCADE
      );

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
    try {
      await db.execAsync('ALTER TABLE vehiculos ADD COLUMN combustible TEXT DEFAULT \'Gasolina\'');
    } catch (e) {
      // Column already exists — ok
    }
    // Clean up any rows with null id from previous corrupt state
    await db.runAsync('DELETE FROM vehiculos WHERE id IS NULL');
    return db;
  })();
  return dbPromise;
}

export { getDb };

export async function obtenerVehiculos() {
  const database = await getDb();
  return await database.getAllAsync('SELECT * FROM vehiculos ORDER BY rowid DESC');
}

export async function obtenerVehiculoPorId(id) {
  if (id == null) return null;
  const database = await getDb();
  return await database.getFirstAsync('SELECT * FROM vehiculos WHERE id = ?', [id]);
}

export async function insertarVehiculo(vehiculo) {
  const id = vehiculo.id || Date.now().toString();
  const database = await getDb();
  await database.runAsync(
    `INSERT INTO vehiculos (id, marca, modelo, tipo, año, color, placa, kilometrajeInicial, foto, combustible)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      vehiculo.marca,
      vehiculo.modelo,
      vehiculo.tipo,
      vehiculo.año,
      vehiculo.color,
      vehiculo.placa,
      vehiculo.kilometrajeInicial,
      vehiculo.foto || null,
      vehiculo.combustible || 'Gasolina',
    ]
  );
}

export async function actualizarVehiculo(id, data) {
  if (id == null) return;
  const database = await getDb();
  await database.runAsync(
    `UPDATE vehiculos
     SET marca = ?, modelo = ?, tipo = ?, año = ?, color = ?, placa = ?, kilometrajeInicial = ?, foto = ?, combustible = ?
     WHERE id = ?`,
    [
      data.marca,
      data.modelo,
      data.tipo,
      data.año,
      data.color,
      data.placa,
      data.kilometrajeInicial,
      data.foto || null,
      data.combustible || 'Gasolina',
      id,
    ]
  );
}

export async function eliminarVehiculo(id) {
  if (id == null) return;
  const database = await getDb();
  await database.runAsync('DELETE FROM vehiculos WHERE id = ?', [id]);
}

// ---- Mantenimientos ----

export async function insertarMantenimiento(data) {
  if (data.vehiculo_id == null) return;
  const id = data.id || Date.now().toString();
  const database = await getDb();
  await database.runAsync(
    `INSERT INTO mantenimientos (id, vehiculo_id, tipo, descripcion, kilometraje, fecha, costo, taller)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, data.vehiculo_id, data.tipo, data.descripcion || null, data.kilometraje, data.fecha, data.costo || null, data.taller || null]
  );
}

export async function obtenerMantenimientos(vehiculoId) {
  if (vehiculoId == null) return [];
  const database = await getDb();
  return await database.getAllAsync(
    'SELECT * FROM mantenimientos WHERE vehiculo_id = ? ORDER BY fecha DESC',
    [vehiculoId]
  );
}

export async function eliminarMantenimiento(id) {
  if (id == null) return;
  const database = await getDb();
  await database.runAsync('DELETE FROM mantenimientos WHERE id = ?', [id]);
}

// ---- Cargas de combustible ----

export async function insertarCargaCombustible(data) {
  if (data.vehiculo_id == null) return;
  const id = data.id || Date.now().toString();
  const database = await getDb();
  await database.runAsync(
    `INSERT INTO cargas_combustible (id, vehiculo_id, litros, costo, kilometraje, tipo_combustible, fecha)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, data.vehiculo_id, data.litros, data.costo, data.kilometraje, data.tipo_combustible || null, data.fecha]
  );
}

export async function obtenerCargasCombustible(vehiculoId) {
  if (vehiculoId == null) return [];
  const database = await getDb();
  return await database.getAllAsync(
    'SELECT * FROM cargas_combustible WHERE vehiculo_id = ? ORDER BY fecha DESC',
    [vehiculoId]
  );
}

export async function eliminarCargaCombustible(id) {
  if (id == null) return;
  const database = await getDb();
  await database.runAsync('DELETE FROM cargas_combustible WHERE id = ?', [id]);
}

// ---- Export / Import ----

export async function obtenerTodosLosMantenimientos() {
  const database = await getDb();
  return await database.getAllAsync('SELECT * FROM mantenimientos ORDER BY fecha DESC');
}

export async function obtenerTodasLasCargasCombustible() {
  const database = await getDb();
  return await database.getAllAsync('SELECT * FROM cargas_combustible ORDER BY fecha DESC');
}

export async function limpiarDatosVehiculos() {
  const database = await getDb();
  await database.execAsync(`
    DELETE FROM cargas_combustible;
    DELETE FROM mantenimientos;
    DELETE FROM vehiculos;
  `);
}
