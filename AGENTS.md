# Car Check — React Native / Expo

## Stack
- Expo SDK 54, React Native 0.81.5, React 19.1.0
- **JavaScript** (no TypeScript)
- Expo Router (file-based routing), expo-sqlite, expo-image-picker

## Project structure
```
app/                          # Routes (file-based, like Next.js App Router)
  _layout.js                  # Root Stack layout
  (tabs)/                     # Route group (no URL prefix)
    _layout.js                # Tab navigator (3 tabs)
    index.js                  # Inicio
    historial.js              # Historial
    proximos-cambios.js       # Próximos cambios
  registro.js                 # Add/edit vehicle form (modal)
src/
  database.js                 # SQLite init + CRUD (car-check.db)
  context/VehiculoContext.js  # Global state: vehicles, active index
  components/
    VehicleCard.js            # Card with photo/data/edit/delete
    VehicleCarousel.js        # Horizontal pager with dots
    DeleteVehicleModal.js     # Confirm delete (plate + checkbox)
  theme/                      # colors, typography, spacing
```

## Key conventions
- Import theme: `import { colors, typography, spacing } from '../src/theme'`
- Icons: `@expo/vector-icons` (Ionicons)
- Styles: `StyleSheet.create({})`, camelCase, no units
- All VehiculoContext functions are **async** (SQLite)
- `registro.js` handles both add and edit (`?id=...` param)

## Commands
```bash
npm start           # npx expo start --tunnel (avoids WiFi issues)
npm run android     # expo start --android
npm run ios         # expo start --ios
```

## Data
- SQLite database: `car-check.db` (created automatically)
- Table `vehiculos`: id, marca, modelo, tipo, año, color, placa, kilometrajeInicial, foto
- API in `src/database.js`: use these functions, never raw SQL from components

## Gotchas
- No tests, no linter, no typecheck configured
- `@react-native-async-storage/async-storage` was replaced by expo-sqlite — do not reintroduce
- `obtenerVehiculoPorId` in context is async — needs `await`
- KeyboardAvoidingView uses `behavior="padding"` on iOS, `"height"` on Android
- Photo field (`foto`) is optional — nullable column in SQLite
