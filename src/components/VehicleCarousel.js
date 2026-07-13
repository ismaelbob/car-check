import { useRef } from 'react';
import { StyleSheet, View, FlatList, Dimensions } from 'react-native';
import VehicleCard from './VehicleCard';
import { spacing } from '../theme';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function VehicleCarousel({ vehiculos, vehiculoActivo, onIndexChange, ultimoKilometraje = '' }) {
  const ref = useRef(null);
  const { colors } = useTheme();

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      onIndexChange(viewableItems[0].index);
    }
  }).current;

  const renderItem = ({ item }) => (
    <View style={{ width }}>
      <VehicleCard vehiculo={item} ultimoKilometraje={ultimoKilometraje} />
    </View>
  );

  const keyExtractor = (item) => item.id;

  return (
    <View style={styles.container}>
      <FlatList
        ref={ref}
        data={vehiculos}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        initialScrollIndex={vehiculoActivo}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />

      <View style={styles.dotsContainer}>
        {vehiculos.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              { backgroundColor: index === vehiculoActivo ? colors.primary : colors.border },
              index === vehiculoActivo && styles.dotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotActive: {
    width: 28,
    borderRadius: 5,
  },
});
