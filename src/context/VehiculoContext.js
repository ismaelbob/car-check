import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as db from '../database';

const VehiculoContext = createContext();

export function VehiculoProvider({ children }) {
  const [vehiculos, setVehiculos] = useState([]);
  const [vehiculoActivo, setVehiculoActivo] = useState(0);
  const [mantenimientos, setMantenimientos] = useState([]);
  const [cargasCombustible, setCargasCombustible] = useState([]);

  const cargarVehiculos = useCallback(async () => {
    try {
      const data = await db.obtenerVehiculos();
      setVehiculos(data);
    } catch (e) {
      console.error('Error loading vehiculos:', e);
    }
  }, []);

  useEffect(() => {
    cargarVehiculos();
  }, [cargarVehiculos]);

  const agregarVehiculo = useCallback(async (data) => {
    const nuevo = { ...data, id: Date.now().toString() };
    await db.insertarVehiculo(nuevo);
    await cargarVehiculos();
    setVehiculoActivo(0);
  }, [cargarVehiculos]);

  const actualizarVehiculo = useCallback(async (id, data) => {
    await db.actualizarVehiculo(id, data);
    await cargarVehiculos();
  }, [cargarVehiculos]);

  const eliminarVehiculo = useCallback(async (id) => {
    await db.eliminarVehiculo(id);
    await cargarVehiculos();
    setVehiculoActivo((prev) =>
      Math.min(prev, Math.max(0, vehiculos.length - 2))
    );
  }, [cargarVehiculos, vehiculos.length]);

  const obtenerVehiculoPorId = useCallback(async (id) => {
    return await db.obtenerVehiculoPorId(id);
  }, []);

  const cambiarVehiculoActivo = useCallback((index) => {
    setVehiculoActivo(index);
  }, []);

  // ---- Historial ----

  const cargarHistorial = useCallback(async (vehiculoId) => {
    try {
      const [mants, cargas] = await Promise.all([
        db.obtenerMantenimientos(vehiculoId),
        db.obtenerCargasCombustible(vehiculoId),
      ]);
      setMantenimientos(mants);
      setCargasCombustible(cargas);
    } catch (e) {
      console.error('Error loading historial:', e);
    }
  }, []);

  const agregarMantenimiento = useCallback(async (data) => {
    const nuevo = { ...data, id: Date.now().toString() };
    await db.insertarMantenimiento(nuevo);
    await cargarHistorial(data.vehiculo_id);
  }, [cargarHistorial]);

  const eliminarMantenimiento = useCallback(async (id, vehiculoId) => {
    await db.eliminarMantenimiento(id);
    await cargarHistorial(vehiculoId);
  }, [cargarHistorial]);

  const agregarCargaCombustible = useCallback(async (data) => {
    const nuevo = { ...data, id: Date.now().toString() };
    await db.insertarCargaCombustible(nuevo);
    await cargarHistorial(data.vehiculo_id);
  }, [cargarHistorial]);

  const eliminarCargaCombustible = useCallback(async (id, vehiculoId) => {
    await db.eliminarCargaCombustible(id);
    await cargarHistorial(vehiculoId);
  }, [cargarHistorial]);

  return (
    <VehiculoContext.Provider
      value={{
        vehiculos,
        vehiculoActivo,
        setVehiculoActivo: cambiarVehiculoActivo,
        recargarVehiculos: cargarVehiculos,
        agregarVehiculo,
        actualizarVehiculo,
        eliminarVehiculo,
        obtenerVehiculoPorId,
        mantenimientos,
        cargasCombustible,
        cargarHistorial,
        agregarMantenimiento,
        eliminarMantenimiento,
        agregarCargaCombustible,
        eliminarCargaCombustible,
      }}
    >
      {children}
    </VehiculoContext.Provider>
  );
}

export function useVehiculos() {
  const context = useContext(VehiculoContext);
  if (!context) {
    throw new Error('useVehiculos debe usarse dentro de VehiculoProvider');
  }
  return context;
}
