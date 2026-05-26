import * as SQLite from 'expo-sqlite';

let db = null;

async function getDb() {
  if (!db) {
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
    `);
    try {
      await db.execAsync('ALTER TABLE vehiculos ADD COLUMN combustible TEXT DEFAULT \'Gasolina\'');
    } catch (e) {
      // Column already exists — ok
    }
  }
  return db;
}

export async function obtenerVehiculos() {
  const database = await getDb();
  return await database.getAllAsync('SELECT * FROM vehiculos ORDER BY rowid DESC');
}

export async function obtenerVehiculoPorId(id) {
  const database = await getDb();
  return await database.getFirstAsync('SELECT * FROM vehiculos WHERE id = ?', id);
}

export async function insertarVehiculo(vehiculo) {
  const database = await getDb();
  await database.runAsync(
    `INSERT INTO vehiculos (id, marca, modelo, tipo, año, color, placa, kilometrajeInicial, foto, combustible)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      vehiculo.id,
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
  const database = await getDb();
  await database.runAsync('DELETE FROM vehiculos WHERE id = ?', id);
}

// ---- Mantenimientos ----

export async function insertarMantenimiento(data) {
  const database = await getDb();
  await database.runAsync(
    `INSERT INTO mantenimientos (id, vehiculo_id, tipo, descripcion, kilometraje, fecha, costo, taller)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.id, data.vehiculo_id, data.tipo, data.descripcion || null, data.kilometraje, data.fecha, data.costo || null, data.taller || null]
  );
}

export async function obtenerMantenimientos(vehiculoId) {
  const database = await getDb();
  return await database.getAllAsync(
    'SELECT * FROM mantenimientos WHERE vehiculo_id = ? ORDER BY fecha DESC',
    vehiculoId
  );
}

export async function eliminarMantenimiento(id) {
  const database = await getDb();
  await database.runAsync('DELETE FROM mantenimientos WHERE id = ?', id);
}

// ---- Cargas de combustible ----

export async function insertarCargaCombustible(data) {
  const database = await getDb();
  await database.runAsync(
    `INSERT INTO cargas_combustible (id, vehiculo_id, litros, costo, kilometraje, tipo_combustible, fecha)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [data.id, data.vehiculo_id, data.litros, data.costo, data.kilometraje, data.tipo_combustible || null, data.fecha]
  );
}

export async function obtenerCargasCombustible(vehiculoId) {
  const database = await getDb();
  return await database.getAllAsync(
    'SELECT * FROM cargas_combustible WHERE vehiculo_id = ? ORDER BY fecha DESC',
    vehiculoId
  );
}

export async function eliminarCargaCombustible(id) {
  const database = await getDb();
  await database.runAsync('DELETE FROM cargas_combustible WHERE id = ?', id);
}
