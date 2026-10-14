# Etapa 1: configuración y estructura

Aplicación universitaria El Ahorcado Móvil, basada en la plantilla Expo blank
con JavaScript. Se conserva `index.js` como entrada y se usa React Navigation
Native Stack. No se utiliza Expo Router.

## Estructura

```text
App.js                        Proveedores globales, barra de estado y navegación
src/
  components/                 AppButton y ScreenLayout reutilizables
  screens/                    Las ocho pantallas de esta etapa
  navigation/                 AppNavigator y constantes ROUTES
  hooks/                      useAppTheme
  data/                       Reservado para etapas posteriores
  storage/                    Reservado para etapas posteriores
  theme/                      Paletas, estilos, tamaños y ThemeProvider
  utils/                      Reservado para etapas posteriores
assets/
  images/                     Reservado para imágenes futuras
  sounds/                     Reservado para sonidos futuros
docs/
  diseno/                     Documentación del diseño
```

Los iconos originales permanecen en `assets/` y conservan sus referencias en
`app.json`. Los archivos `.gitkeep` conservan los directorios todavía vacíos.

Las ocho pantallas creadas en `src/screens/` son `SplashScreen.js`,
`InicioScreen.js`, `InstruccionesScreen.js`, `CategoriaScreen.js`, `JuegoScreen.js`,
`ResultadoScreen.js`, `EstadisticasScreen.js` y `ConfiguracionScreen.js`.

## Navegación

```text
Splash → Inicio
           ├─ Instrucciones
           ├─ Categoría y nivel → Juego → Resultado
           ├─ Estadísticas
           └─ Configuración
```

- Splash es una pantalla React de bienvenida, distinta de la pantalla nativa de
  arranque de Expo. Su botón «Entrar» usa `replace` para que no vuelva a aparecer
  al retroceder desde Inicio. El paso es manual en esta etapa.
- Inicio abre las cuatro opciones con `navigate`.
- Categoría abre Juego sin seleccionar ni enviar datos todavía.
- Juego incluye un botón provisional «Ver Resultado» para comprobar la ruta.
  Usa `replace`: posteriormente se activará al finalizar una partida.
- Las pantallas secundarias permiten volver. `popToTop` regresa a Inicio sin
  acumular copias de esa pantalla en la pila.

## Presentación y tema

`ScreenLayout` muestra el nombre de cada pantalla, una descripción y sus botones.
Usa áreas seguras y contenido desplazable para pantallas pequeñas y texto grande.
Los encabezados de Native Stack gestionan el margen superior; Splash lo aplica
mediante `includeTopInset` porque no tiene encabezado.

`colors.js` define paletas con nombres semánticos; `styles.js` concentra estilos,
espaciado y tipografía. `ThemeProvider` adapta los colores a React Navigation y
`useAppTheme` los expone a los componentes. La paleta clara está activa, de acuerdo
con `userInterfaceStyle: "light"`. Existe una paleta oscura de base; el selector,
la detección del tema del sistema y la persistencia quedan para etapas futuras.

## Alcance

Las pantallas de instrucciones, categoría, juego, resultado, estadísticas y
configuración son interfaces iniciales. No hay banco de palabras, teclado, dibujo
del ahorcado, puntuaciones, partidas ni almacenamiento con AsyncStorage.

## Comprobación manual pendiente en un dispositivo

1. Abrir la app y pulsar «Entrar». Debe aparecer Inicio sin botón para volver a Splash.
2. Abrir y regresar desde Instrucciones, Estadísticas y Configuración.
3. Recorrer Categoría y nivel → Juego → Resultado → Inicio.
4. Repetir el recorrido y verificar que Inicio no se duplica en la pila.
5. Probar los botones de volver, el gesto de iOS y el botón Atrás de Android.
6. Comprobar áreas seguras y desplazamiento con tamaño de texto grande.

## Referencias

- [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/)
- [Instalación de React Navigation](https://reactnavigation.org/docs/getting-started/)
- [Native Stack](https://reactnavigation.org/docs/native-stack-navigator/)
- [Safe Area Context en Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/safe-area-context/)
- [React Native Screens en Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/screens/)
