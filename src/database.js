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
        foto TEXT
      )
    `);
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
    `INSERT INTO vehiculos (id, marca, modelo, tipo, año, color, placa, kilometrajeInicial, foto)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
    ]
  );
}

export async function actualizarVehiculo(id, data) {
  const database = await getDb();
  await database.runAsync(
    `UPDATE vehiculos
     SET marca = ?, modelo = ?, tipo = ?, año = ?, color = ?, placa = ?, kilometrajeInicial = ?, foto = ?
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
      id,
    ]
  );
}

export async function eliminarVehiculo(id) {
  const database = await getDb();
  await database.runAsync('DELETE FROM vehiculos WHERE id = ?', id);
}
