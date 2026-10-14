ETAPA 3 — PORTAR EL DISEÑO COMPLETO DE FIGMA MAKE A EXPO/REACT NATIVE

Contexto: mi proyecto Expo ya fue creado con `npx create-expo-app@latest Ahorcado --template blank`, usa JavaScript, React Navigation Native Stack y ocho pantallas básicas. Ya se probó con Expo Go. No lo recrees ni lo migres a TypeScript.

Referencia local OBLIGATORIA: `docs/diseno/figma-make-referencia/`.

ANTES DE EDITAR:
1. Confirma cuál es el directorio raíz del proyecto que contiene App.js, app.json y package.json. Localiza la referencia correctamente (puede haber carpeta Ahorcado dentro de otra).
2. Examina las NUEVE capturas en `capturas/` y el texto `REFERENCIA_VISUAL.md`.
3. Lee `src/App.tsx`, `src/index.css`, `package.json` de la referencia WEB para entender los SVG, las pantallas y los estilos.
4. Revisa el código y los componentes YA EXISTENTES de Expo; reaprovéchalos si encajan. No sobrescribas los package.json, App.js ni configuraciones de Expo con los del prototipo web.

OBJETIVO ACTUAL: Implementar las ocho pantallas y modal de nombre como código NATIVO de React Native con la MAYOR FIDELIDAD VISUAL POSIBLE. Mantén colores, tipografía, ilustraciones, proporciones, botones, jerarquía, márgenes y tarjetas de las capturas; ajusta de forma responsive para teléfonos Android con SafeArea. Prioriza la referencia visual de las capturas frente a diseños genéricos. 

Pantallas a implementar: Splash, Inicio, Instrucciones, Categoría/Nivel, Juego, Resultado (con estados visuales victoria y derrota), Estadísticas, Configuración; modal de nombre inicial.

APLICACIÓN:
- Conserva React Navigation Native Stack, JavaScript y la arquitectura de src/.
- Convierte el contenido web `div`, `button`, `svg`, CSS y eventos de navegador a `View`, `Text`, `Pressable`, `TextInput`, `ScrollView`, `StyleSheet`, `Modal` y `react-native-svg` cuando corresponda.
- Nunca incluyas ReactDOM, Vite, Tailwind, APIs window/document o `localStorage` en la app nativa.
- Instala solo dependencias compatibles con Expo, con `npx expo install` cuando se requiera.
- Trata los SVG y rutas del fichero App.tsx como REFERENCIA VISUAL para reconstruir ilustraciones nativas vectoriales; no coloques capturas de las pantallas como fondos ni como elementos interactivos.
- Mantén navegación real en los botones existentes. Deben funcionar Inicio, Instrucciones, Categoría/Nivel, Estadísticas, Configuración, Juego, Resultado, Volver, y salir con confirmación si aplica.
- Solicita nombre del jugador si no existe, valida campo no vacío, muéstralo en Inicio. Si necesitas persistir únicamente este nombre, utiliza AsyncStorage correctamente; los datos de estadísticas/puntajes se abordarán después.
- Para la pantalla Juego puedes usar estado DEMO claramente identificado por ahora; no programes el motor completo aún. Evita que un teclado simulado provoque puntos o victorias irreales.
- En estadísticas mostrar estado vacío/0, no números ni personas ficticias como datos verdaderos; en Resultado no fijar puntuación de 900 puntos como resultado real.
- Ten presente: Fácil 4–6 letras, 2 pistas, sin límite y x1; Medio 7–9 letras, 1 pista, sin límite y x2; Difícil 10+ letras, 0 pistas, 90 s y x3. La captura 'Medio' con BOGOTÁ y cronómetro es solo ilustrativa y no se debe copiar como regla.
- Contraste adecuado, botones al menos 48×48 dp, distribución adaptativa y teclado sin desbordamiento. Deben verse bien teléfonos pequeños.
- No cambies arbitrariamente el estilo aprobado de Figma. Mantén verde/blanco y la estética casual premium.

AL TERMINAR:
1. Ejecuta lint y comprobaciones aplicables (incluido Expo Doctor si disponible) e indica los resultados reales, no supuestos.
2. Comprueba el empaquetado si el entorno lo permite, sin afirmar haber hecho prueba visual si no ocurrió.
3. Lista cambios por archivo y dependencias añadidas.
4. Dime cómo arrancar con `npx expo start`, qué pantallas sí se construyeron, cuáles están pendientes, y qué debo comprobar en Expo Go.
5. DETENTE. No avances al motor completo de juego, banco de 60 palabras, sonido/vibración real, persistencia de estadísticas o APK sin autorización.
