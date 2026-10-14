# Etapa 4: partidas funcionales

Entrega sobre el proyecto existente, 13 de octubre de 2026. Se conserva el diseño
verde y blanco, las ocho pantallas, las ilustraciones SVG, JavaScript, Expo y
React Navigation Native Stack. No se instalaron dependencias nuevas en esta etapa.

## Funcionamiento implementado

- Las 27 teclas, incluida Ñ, despachan jugadas al motor. Un acierto revela todas
  sus posiciones; cada error resta una vida y añade una de las seis partes del
  dibujo existente. Las teclas usadas se deshabilitan y se colorean verde/rojo.
- Los estados son atómicos: una letra repetida o un evento posterior al final no
  vuelve a modificar el puntaje, las pistas ni los errores.
- Las palabras se muestran en mayúsculas conservando tildes y diéresis. A/E/I/O/U
  descubren sus versiones acentuadas y U descubre Ü. N y Ñ son teclas distintas.
  Espacios y signos están visibles desde el inicio y no cuentan para la dificultad.
- La selección filtra categoría y longitud real. Aleatoria usa las cuatro
  categorías. Se excluye la palabra anterior si hay otra opción válida, tanto al
  reintentar como al iniciar otra partida durante la sesión.
- Fácil: 4–6 letras, dos pistas, sin límite, x1. Medio: 7–9 letras, una pista,
  sin límite, x2. Difícil: 10+ letras, sin pistas, 90 segundos, x3.
- La primera pista muestra la descripción; la segunda descubre todas las
  apariciones de una letra todavía oculta. Cada uso descuenta 15 del subtotal.
  Una letra revelada por pista no genera premios por acierto ni puede cobrarse
  posteriormente con el teclado. Si completa la palabra, concede la victoria.
- La puntuación añade 10 por aparición acertada, resta 5 por error y 15 por pista.
  Ganar añade 50 más 10 por cada vida restante. El subtotal final se multiplica
  por el nivel. La cifra visible durante la partida ya incluye ese multiplicador.
  Se permiten resultados negativos: las reglas no establecen un mínimo de cero.
- Solo Difícil crea un intervalo de cuenta regresiva. El plazo se basa en una
  hora final, por lo que un retraso del intervalo o pasar a segundo plano no regala
  segundos. Al volver a primer plano se comprueba el plazo. Una jugada que llega
  exactamente a los 90 segundos ya no puede ganar. Al terminar o desmontar la
  pantalla se limpia el intervalo y la suscripción al estado de la app.
- Descubrir toda la palabra gana; seis errores o tiempo agotado pierden. El teclado
  se bloquea y Juego se reemplaza por Resultado una sola vez. Se envían palabra,
  categoría real, selección original, nivel, puntuación, duración, vidas y motivo.
- Resultado muestra datos reales. Jugar de nuevo/Reintentar abre otra partida
  del mismo nivel y selección original, incluida Aleatoria, con estado limpio.
  Volver al inicio no deja partidas ocultas en la pila. Salir durante una partida
  requiere confirmación; el reloj de Difícil sigue corriendo durante el diálogo.

## Banco de palabras

| Categoría | Fácil | Medio | Difícil | Total |
|---|---:|---:|---:|---:|
| Capitales de Colombia | 6 | 6 | 6 | 18 |
| Animales de Colombia | 6 | 6 | 6 | 18 |
| Frutas | 6 | 8 | 4 | 18 |
| Comidas típicas | 6 | 6 | 6 | 18 |
| **Total** | **24** | **26** | **22** | **72** |

Cada registro contiene ID estable, palabra, categoría, descripción y dificultad.
Las [fuentes y auditoría del banco](fuentes-palabras.md) documentan la comprobación
de capitales, fauna, frutas y comidas con referencias oficiales/institucionales.

## Archivos de esta etapa

| Archivo | Responsabilidad |
|---|---|
| `src/data/palabras.js` | 72 entradas del banco. |
| `src/hooks/useJuego.js` | Estado de la partida, selección, acciones y ciclo del reloj. |
| `src/utils/juego.js` | Motor puro: normalización, validación, selección, transiciones y puntuación. |
| `src/components/PalabraOculta.js` | Letras ocultas/reveladas y accesibilidad sin exponer la solución. |
| `src/utils/wordLayout.js` | Agrupa palabras largas según ancho disponible y tamaño de texto. |
| `src/utils/formatTime.js` | Duración y cuenta regresiva en formato minutos:segundos. |
| `src/screens/JuegoScreen.js` | Conexión del teclado, pistas, dibujo, marcador, reloj y finalización. |
| `src/screens/ResultadoScreen.js` | Datos reales de victoria/derrota, revancha e Inicio. |
| `src/screens/InstruccionesScreen.js` | Reglas efectivas de pistas y puntuación. |
| `src/screens/EstadisticasScreen.js` | Aclara que todavía no se registran estadísticas. |
| `src/theme/gameStyles.js` | Estados verde/rojo, casillas adaptables y respuestas largas. |
| `src/data/gameOptions.js` | Configuración existente compartida con el motor. |
| `src/components/Illustrations.js` | Conserva SVG y actualiza la fuente de su texto al terminar de cargar. |
| `tests/juego.test.js` | Pruebas del motor y banco. |
| `tests/wordLayout.test.js` | Pruebas de los cálculos de tamaño y agrupación. |
| `tests/navigation.test.js` | Acciones del StackRouter instalado para revancha y regreso. |
| `package.json` | Script `test` con Node.js, sin paquete de pruebas adicional. |
| `README.md`, `docs/diseno/etapa-3.md`, `etapa-4.md`, `fuentes-palabras.md` | Ejecución, alcance, comprobaciones y referencias. |

El repositorio ya contenía cambios sin confirmar y archivos sin seguimiento.
Esta lista describe el trabajo por etapa, no un conteo de archivos de un commit.
No se revirtió ni se preparó para commit el trabajo anterior.

## Validación ejecutada

- `npm.cmd test`: **38 pruebas aprobadas, 0 fallidas**. Cubren letras repetidas,
  apariciones múltiples, Ñ/tildes/diéresis, espacios, seis errores, victoria,
  pistas, multiplicadores, descuentos, límite exacto de 90 segundos, reinicio,
  todos los registros y las 15 combinaciones categoría/nivel (incluida Aleatoria).
- Los cálculos de disposición se prueban con las 72 palabras en anchos útiles
  de 280/320/372 dp y escalas de texto 1/1,3/2. Estos corresponden a pantallas
  de 320/360/412 dp con el margen habitual de 20 dp a cada lado.
- La prueba del StackRouter verifica claves nuevas al reintentar, conservación
  de Aleatoria, ausencia de acumulación de pantallas y regreso a Inicio.
- `npm.cmd run lint`: aprobado, sin errores ni advertencias de código.
- `npm.cmd run typecheck`: aprobado. Comprueba JavaScript con `checkJs`; no se
  convirtió la app a TypeScript.
- `npx.cmd expo install --check`: dependencias actualizadas y compatibles.
- `npx.cmd --yes expo-doctor`: **21/21 comprobaciones aprobadas**.
- `npx.cmd expo export --platform android --platform ios`: aprobado; Metro
  resolvió 1008 módulos Android y 1015 iOS y Hermes produjo ambos paquetes en
  `dist/` (ignorado por Git). Esto es una exportación de JavaScript/assets, no
  una generación de APK ni una prueba en dispositivo.
- `git diff --check`: aprobado para los archivos seguidos por Git.

Node informa que detectó módulos ES en los archivos de pruebas `.js`; es un aviso
de reinterpretación de módulos, no un fallo. Se conservó la configuración CommonJS
de ESLint y la configuración del proyecto Expo. Metro también informó del conflicto
de variables de color de la terminal (`NO_COLOR`/`FORCE_COLOR`); la exportación
finalizó con código 0. La consulta de Expo y la ejecución de Hermes requirieron
permisos del entorno; las comprobaciones autorizadas finalizaron correctamente.

Estas pruebas ejecutan el motor, el reloj con tiempos inyectados, el cálculo de
disposición y el router; no montan componentes nativos, no simulan toques en Expo
Go y no miden los glifos reales de las fuentes. No se ejecutó la aplicación en
dispositivo/emulador desde este entorno. La compatibilidad está respaldada por
dependencias, comprobaciones de Expo y empaquetado, con interacción nativa pendiente.

## Correcciones y ajustes

Se retiraron el teclado deshabilitado y los botones de resultados de demostración.
Las casillas vacías de referencia ahora muestran la palabra seleccionada. El texto
del resultado admite respuestas largas; las casillas mantienen tamaño legible y
pueden pasar a varias filas. Se corrigió la inferencia de arreglos en JavaScript
mediante JSDoc. Se preservó la distinción Ñ/N y se impidieron cobros repetidos y
jugadas posteriores al vencimiento del reloj.

Los cambios visuales se limitan a estados solicitados, datos reales y adaptación
de palabras largas. Siguen pendientes las comparaciones en dispositivo de sombras,
tipografías, áreas seguras, teclado/modal y espaciado frente a las capturas de Figma;
el [informe visual](etapa-3.md) enumera las adaptaciones conocidas.

## Recorrido manual pendiente en Expo Go

1. Ejecutar `npm.cmd start` desde la carpeta que contiene `package.json` y escanear
   el QR con Expo Go compatible. Desde la carpeta exterior, entrar antes en `Ahorcado`.
2. Entrar, registrar un nombre y elegir categoría/nivel. Pulsar repetidamente una
   letra y comprobar que solo la primera selección se contabiliza.
3. Jugar en Fácil hasta victoria y hasta seis errores. Comprobar ambas pistas,
   los colores del teclado, las seis partes del SVG y los datos de Resultado.
4. Probar Medio con una sola pista. Probar palabras con Ñ, tildes y espacios.
5. En Difícil dejar vencer 90 segundos y comprobar derrota por tiempo. Repetir
   saliendo a segundo plano y regresando después del plazo.
6. Reintentar varias veces, incluida Aleatoria: estado limpio, palabra diferente
   y mismo nivel. Volver a Inicio y usar Atrás sin regresar a una partida terminada.
7. Revisar scroll, botones, áreas seguras y nombres/palabras largas en Android
   pequeño, texto ampliado y modal con teclado abierto.

## Fuera del alcance autorizado

Quedan para otra etapa estadísticas persistentes y ranking, AsyncStorage, sonidos,
vibración, configuración definitiva de temas y generación del APK. El nombre y
el control de repetición solo viven en memoria; las partidas no se guardan ni
se reanudan tras cerrar la app. No se avanzó a la etapa 5.
