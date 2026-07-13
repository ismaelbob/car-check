import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useVehiculos } from '../../src/context/VehiculoContext';
import VehicleCard from '../../src/components/VehicleCard';
import { useTheme } from '../../src/context/ThemeContext';

export default function HomeScreen() {
  const router = useRouter();
  const {
    vehiculos,
    vehiculoActivo,
    mantenimientos,
    cargasCombustible,
    cargarHistorial,
  } = useVehiculos();

  const { colors } = useTheme();
  const vehiculo = vehiculos[vehiculoActivo];

  useEffect(() => {
    if (vehiculos.length === 0) {
      router.replace('/');
    }
  }, [vehiculos.length]);

  useEffect(() => {
    if (vehiculo?.id) {
      cargarHistorial(vehiculo.id);
    }
  }, [vehiculo?.id]);

  const kmData = useMemo(() => {
    if (!vehiculo) return { ultimo: 0, recorridos: 0 };
    const inicial = parseFloat(vehiculo.kilometrajeInicial) || 0;
    const kms = [inicial];
    mantenimientos.forEach((m) => kms.push(parseFloat(m.kilometraje) || 0));
    cargasCombustible.forEach((c) => kms.push(parseFloat(c.kilometraje) || 0));
    const ultimo = Math.max(...kms);
    return { ultimo, recorridos: ultimo - inicial };
  }, [vehiculo?.kilometrajeInicial, mantenimientos, cargasCombustible]);

  if (!vehiculo) {
    return <View style={[styles.container, { backgroundColor: colors.background }]} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <VehicleCard
        vehiculo={vehiculo}
        ultimoKilometraje={kmData.ultimo}
        kilometrosRecorridos={kmData.recorridos}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
