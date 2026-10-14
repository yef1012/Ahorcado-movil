import AsyncStorage from '@react-native-async-storage/async-storage';

import { createAppStore } from './appStore.js';

// Única instancia nativa, compartida por todos los proveedores y pantallas.
export const appStore = createAppStore(AsyncStorage);
