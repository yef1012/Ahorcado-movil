import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import useAppTheme from '../hooks/useAppTheme';
import CategoriaScreen from '../screens/CategoriaScreen';
import ConfiguracionScreen from '../screens/ConfiguracionScreen';
import EstadisticasScreen from '../screens/EstadisticasScreen';
import InicioScreen from '../screens/InicioScreen';
import InstruccionesScreen from '../screens/InstruccionesScreen';
import JuegoScreen from '../screens/JuegoScreen';
import ResultadoScreen from '../screens/ResultadoScreen';
import SplashScreen from '../screens/SplashScreen';
import { ROUTES } from './routes';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const theme = useAppTheme();

  return (
    <NavigationContainer theme={theme.navigation}>
      <Stack.Navigator
        initialRouteName={ROUTES.SPLASH}
        screenOptions={{
          headerShown: false,
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.text,
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen
          name={ROUTES.SPLASH}
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name={ROUTES.INICIO} component={InicioScreen} />
        <Stack.Screen name={ROUTES.INSTRUCCIONES} component={InstruccionesScreen} />
        <Stack.Screen
          name={ROUTES.CATEGORIA}
          component={CategoriaScreen}
          options={{ title: 'Categoría y nivel' }}
        />
        <Stack.Screen name={ROUTES.JUEGO} component={JuegoScreen} />
        <Stack.Screen name={ROUTES.RESULTADO} component={ResultadoScreen} />
        <Stack.Screen
          name={ROUTES.ESTADISTICAS}
          component={EstadisticasScreen}
          options={{ title: 'Estadísticas' }}
        />
        <Stack.Screen
          name={ROUTES.CONFIGURACION}
          component={ConfiguracionScreen}
          options={{ title: 'Configuración' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
