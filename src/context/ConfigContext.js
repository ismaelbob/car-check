import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as configDb from '../database-config';

const ConfigContext = createContext();

export function ConfigProvider({ children }) {
  const [tiposMantenimiento, setTiposMantenimiento] = useState([]);
  const [combustibles, setCombustibles] = useState([]);
  const [moneda, setMoneda] = useState('Bs');
  const [loading, setLoading] = useState(true);

  const cargarConfig = useCallback(async () => {
    try {
      await configDb.inicializarConfiguracion();
      const tipos = await configDb.obtenerTiposMantenimiento();
      const combs = await configDb.obtenerCombustibles();
      const mon = await configDb.obtenerConfig('moneda');
      setTiposMantenimiento(tipos);
      setCombustibles(combs);
      if (mon) setMoneda(mon);
    } catch (e) {
      console.error('Error loading config:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarConfig();
  }, [cargarConfig]);

  const recargarTipos = useCallback(async () => {
    const tipos = await configDb.obtenerTiposMantenimiento();
    setTiposMantenimiento(tipos);
  }, []);

  const recargarCombustibles = useCallback(async () => {
    const combs = await configDb.obtenerCombustibles();
    setCombustibles(combs);
  }, []);

  const agregarTipoMantenimiento = useCallback(async (nombre) => {
    await configDb.agregarTipoMantenimiento(nombre);
    await recargarTipos();
  }, [recargarTipos]);

  const eliminarTipoMantenimiento = useCallback(async (id) => {
    await configDb.eliminarTipoMantenimiento(id);
    await recargarTipos();
  }, [recargarTipos]);

  const agregarCombustible = useCallback(async (nombre, precio, unidad) => {
    await configDb.agregarCombustible(nombre, precio, unidad);
    await recargarCombustibles();
  }, [recargarCombustibles]);

  const actualizarCombustible = useCallback(async (id, nombre, precio, unidad) => {
    await configDb.actualizarCombustible(id, nombre, precio, unidad);
    await recargarCombustibles();
  }, [recargarCombustibles]);

  const eliminarCombustible = useCallback(async (id) => {
    await configDb.eliminarCombustible(id);
    await recargarCombustibles();
  }, [recargarCombustibles]);

  const actualizarMoneda = useCallback(async (valor) => {
    await configDb.guardarConfig('moneda', valor);
    setMoneda(valor);
  }, []);

  return (
    <ConfigContext.Provider
      value={{
        loading,
        tiposMantenimiento,
        combustibles,
        moneda,
        recargarConfig: cargarConfig,
        agregarTipoMantenimiento,
        eliminarTipoMantenimiento,
        agregarCombustible,
        actualizarCombustible,
        eliminarCombustible,
        actualizarMoneda,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig debe usarse dentro de ConfigProvider');
  }
  return context;
}
