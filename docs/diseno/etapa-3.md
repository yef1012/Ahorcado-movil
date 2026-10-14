# Etapa 3: integración visual de Figma

Se retomó la implementación existente sin crear otro proyecto. Se conservaron
JavaScript, Expo, React Navigation Native Stack, las ocho rutas y las ilustraciones
SVG ya convertidas. Las nueve capturas, `REFERENCIA_VISUAL.md`, `src/App.tsx` y
`src/index.css` originales se consultaron en:

`docs/diseno/Ahorcado_Figma_9_Capturas_y_Codigo_para_Codex/figma-make-referencia/`.

La referencia web permanece como documentación; la aplicación no importa HTML,
ReactDOM, Vite, CSS web, localStorage ni capturas como fondos.

| Pantalla | Integración conservada |
|---|---|
| Splash | Logotipo, ilustración, degradado verde, tipografías, carga real de fuentes y entrada a Inicio. |
| Inicio | Encabezado, saludo, ilustración, tarjeta principal, botón Jugar y tres accesos secundarios. |
| Instrucciones | Cinco tarjetas con iconos, jerarquía tipográfica y resumen de niveles académicos. |
| Categoría y nivel | Cuatro categorías y Aleatoria, selección visual, tres niveles, detalles y resumen. |
| Juego | Cabecera, vidas, reloj, dibujo, casillas, teclado con Ñ y botón de pista. Conectados a la lógica real en la etapa 4. |
| Resultado | Tarjeta de palabra, métricas, victoria con confeti y variante de derrota; conectadas a resultados reales en la etapa 4. |
| Estadísticas | Tarjeta de porcentaje, cuatro métricas y clasificación vacía; no se usan los datos ficticios de Figma. |
| Configuración | Tarjetas de sonido/vibración, temas y datos; funciones futuras deshabilitadas y etiquetadas. |

La novena captura corresponde al modal de nombre: entrada nativa, validación de
nombre vacío, guardado en memoria y edición desde el perfil de Inicio. No persiste
al cerrar/reiniciar la aplicación. El modal tiene desplazamiento y adaptación al
teclado; estas interacciones requieren revisión final en Android.

## Archivos de la integración

- `App.js`: proveedores de fuentes, tema y jugador.
- `src/screens/`: los ocho archivos de pantalla.
- `src/navigation/AppNavigator.js`: encabezados propios y las rutas conservadas.
- `src/components/AppButton.js`, `AppText.js`, `AppIcon.js`, `ScreenHeader.js`,
  `ScreenLayout.js`, `PlayerNameModal.js`, `Illustrations.js`: controles reutilizables
  e ilustraciones con primitivas de `react-native-svg`.
- `src/hooks/usePlayer.js`, `useFontStatus.js`: nombre de sesión y estado de fuentes.
- `src/data/gameOptions.js`: configuración compartida de categorías y dificultades.
- `src/theme/tokens.js`, `colors.js`, `styles.js`, `homeStyles.js`,
  `secondaryStyles.js`, `gameStyles.js`: paleta, fuentes y estilos centralizados.
- `package.json`, `package-lock.json`, `app.json`: dependencias visuales y plugin de fuentes.
- `eslint.config.js`: excluye el código web que solo sirve como referencia.

Se agregaron `react-native-svg 15.15.4`, `expo-font ~57.0.4`,
`expo-linear-gradient ~57.0.2`, `@expo-google-fonts/dm-sans ^0.4.2` y
`@expo-google-fonts/manrope ^0.4.2`. SVG, fuentes y gradientes corresponden a las
versiones de Expo SDK 57 incluidas en Expo Go. Las fuentes se empaquetan localmente.

## Adaptaciones y revisión visual pendiente

- Se conservaron los verdes `#086B45`, `#168B55`, `#2E7D32`, `#4CAF50`, el fondo
  `#F7FCF8`, las tarjetas blancas y las familias Manrope/DM Sans.
- Los filtros de sombra del SVG web se aproximaron con formas translúcidas nativas.
- El modal oscurece el fondo; no reproduce el desenfoque del navegador.
- El teclado usa seis columnas en anchos habituales y cinco en móviles estrechos,
  con objetivos táctiles de al menos 48 dp. Las pantallas pueden desplazarse y
  respetan áreas seguras; en la etapa 4 las palabras largas también se distribuyen
  en varias filas.
- Estadísticas vacías, controles futuros deshabilitados y longitudes académicas
  reemplazan intencionalmente los datos de demostración de Figma.
- La referencia incluye captura de victoria, pero no una captura independiente
  de derrota: esta variante sigue el código y el lenguaje visual suministrados.
- Deben cotejarse en un dispositivo los márgenes, alturas, tipografías, sombras,
  barras del sistema y el modal con teclado abierto. No se afirma equivalencia
  visual píxel a píxel ni una comparación de la aplicación ejecutada en Android.

La implementación visual dio paso a la etapa 4 por autorización expresa del usuario.
Las comprobaciones finales del conjunto están registradas en [etapa-4.md](etapa-4.md).
