import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const VehiculoContext = createContext();

const STORAGE_KEY = 'vehiculos';

export function VehiculoProvider({ children }) {
  const [vehiculos, setVehiculos] = useState([]);
  const [vehiculoActivo, setVehiculoActivo] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setVehiculos(parsed);
        }
      } catch (e) {
        console.error('Error loading vehiculos:', e);
      }
    })();
  }, []);

  const persist = useCallback(async (nuevos) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nuevos));
    } catch (e) {
      console.error('Error saving vehiculos:', e);
    }
  }, []);

  const agregarVehiculo = useCallback(async (data) => {
    const nuevo = { ...data, id: Date.now().toString() };
    const nuevos = [...vehiculos, nuevo];
    setVehiculos(nuevos);
    setVehiculoActivo(nuevos.length - 1);
    await persist(nuevos);
  }, [vehiculos, persist]);

  const actualizarVehiculo = useCallback(async (id, data) => {
    const nuevos = vehiculos.map((v) =>
      v.id === id ? { ...v, ...data } : v
    );
    setVehiculos(nuevos);
    await persist(nuevos);
  }, [vehiculos, persist]);

  const eliminarVehiculo = useCallback(async (id) => {
    const nuevos = vehiculos.filter((v) => v.id !== id);
    setVehiculos(nuevos);
    setVehiculoActivo(Math.min(vehiculoActivo, Math.max(0, nuevos.length - 1)));
    await persist(nuevos);
  }, [vehiculos, vehiculoActivo, persist]);

  const obtenerVehiculoPorId = useCallback((id) => {
    return vehiculos.find((v) => v.id === id) || null;
  }, [vehiculos]);

  const cambiarVehiculoActivo = useCallback((index) => {
    setVehiculoActivo(index);
  }, []);

  return (
    <VehiculoContext.Provider
      value={{
        vehiculos,
        vehiculoActivo,
        setVehiculoActivo: cambiarVehiculoActivo,
        agregarVehiculo,
        actualizarVehiculo,
        eliminarVehiculo,
        obtenerVehiculoPorId,
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
