import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useVehiculos } from '../../src/context/VehiculoContext';
import VehicleCard from '../../src/components/VehicleCard';
import { colors } from '../../src/theme';

export default function HomeScreen() {
  const router = useRouter();
  const {
    vehiculos,
    vehiculoActivo,
    mantenimientos,
    cargasCombustible,
    cargarHistorial,
  } = useVehiculos();

  const vehiculo = vehiculos[vehiculoActivo];

  useEffect(() => {
    if (vehiculos.length === 0) {
      router.replace('/bienvenida');
    }
  }, [vehiculos.length]);

  useEffect(() => {
    if (vehiculo) {
      cargarHistorial(vehiculo.id);
    }
  }, [vehiculo?.id]);

  const ultimoKilometraje = useMemo(() => {
    if (!vehiculo) return '';
    const kms = [parseFloat(vehiculo.kilometrajeInicial) || 0];
    mantenimientos.forEach((m) => kms.push(parseFloat(m.kilometraje) || 0));
    cargasCombustible.forEach((c) => kms.push(parseFloat(c.kilometraje) || 0));
    return Math.max(...kms).toLocaleString();
  }, [vehiculo?.kilometrajeInicial, mantenimientos, cargasCombustible]);

  if (!vehiculo) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <VehicleCard
        vehiculo={vehiculo}
        ultimoKilometraje={ultimoKilometraje}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
