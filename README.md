# El Ahorcado Móvil

Aplicación universitaria de Programación Móvil desarrollada con React Native,
Expo SDK 57 y JavaScript. Propone partidas del ahorcado sobre cultura colombiana,
con una interfaz nativa basada en el diseño aprobado de Figma Make.

Su objetivo es practicar vocabulario y conocimientos de Colombia mediante un
juego con dificultades progresivas, pistas y seguimiento local del progreso.

## Características

- 72 palabras repartidas en cuatro categorías y tres dificultades.
- Teclado en español con Ñ, reconocimiento de tildes y seis etapas del ahorcado.
- Pistas, puntuación, victoria, derrota y opción de jugar de nuevo.
- Cuenta regresiva de 90 segundos en el nivel Difícil.
- Nombre del jugador, estadísticas reales y clasificación local de los diez
  mejores puntajes, conservados mediante AsyncStorage.
- Cuatro sonidos locales: acierto, error, victoria y derrota; respuestas hápticas.
- Interruptores independientes de sonido y vibración, con preferencias guardadas.
- Temas Claro, Oscuro y Sistema en las ocho pantallas.
- Diseño verde y blanco, ilustraciones SVG nativas y tipografías DM Sans y Manrope.

## Categorías, dificultades y reglas

| Categoría | Contenido | Palabras |
| --- | --- | ---: |
| Capitales | Capitales de departamentos de Colombia | 18 |
| Animales | Fauna presente en Colombia | 18 |
| Frutas | Frutas cultivadas o consumidas en Colombia | 18 |
| Comidas típicas | Preparaciones de la cocina colombiana | 18 |

La opción **Aleatoria** selecciona entre esas cuatro categorías; no añade un
banco separado. Capitales, Animales y Comidas típicas tienen seis palabras por
dificultad. Frutas tiene seis en Fácil, ocho en Medio y cuatro en Difícil. Las
[fuentes del banco](docs/diseno/fuentes-palabras.md) documentan su revisión.

| Nivel | Longitud | Pistas | Límite de tiempo | Multiplicador |
| --- | --- | ---: | --- | ---: |
| Fácil | 4 a 6 letras | 2 | Sin límite | ×1 |
| Medio | 7 a 9 letras | 1 | Sin límite | ×2 |
| Difícil | 10 o más letras | 0 | 90 segundos | ×3 |

Los espacios no cuentan como letras y aparecen visibles. Las vocales con tilde
o diéresis se seleccionan con su tecla base; Ñ conserva su diferencia frente a N.
Una letra ya usada no vuelve a descontar intentos ni a sumar puntos.

Se gana al revelar la palabra y se pierde al cometer seis errores o agotar el
tiempo de Difícil. La primera pista muestra una descripción; la segunda, disponible
en Fácil, revela una letra pendiente en todas sus apariciones. El tiempo de Difícil
continúa transcurriendo mientras la app está en segundo plano.

### Puntuación

| Acción | Cambio antes del multiplicador |
| --- | ---: |
| Acierto del teclado | +10 por cada aparición de la letra |
| Letra incorrecta | −5 |
| Pista utilizada | −15 |
| Completar la palabra | +50 |
| Intentos restantes al ganar | +10 por cada uno |

Al terminar, todo el subtotal se multiplica por el nivel. Los puntos pueden ser
negativos. La letra revelada por una pista no concede puntos de acierto; una
derrota conserva el subtotal acumulado sin bonos de victoria.

## Estadísticas y almacenamiento

Se registran únicamente partidas terminadas, una vez por identificador. Las
estadísticas muestran partidas, victorias, derrotas, porcentaje de victorias,
racha actual y mejor racha. El ranking local conserva hasta diez resultados
ordenados por puntuación; los empates priorizan la fecha más antigua. Incluye
nombre, categoría, dificultad, resultado y fecha, también para derrotas.

AsyncStorage conserva el nombre, las preferencias y los resultados en el
dispositivo. La carga inicial precede a las escrituras para proteger los datos
guardados. Los fallos de lectura o escritura se muestran con opción de reintentar;
los datos dañados solo se restablecen tras confirmación. Borrar estadísticas
requiere confirmación y conserva el nombre y las preferencias.

No hay cuentas remotas, sincronización entre dispositivos ni ranking en línea.
Las partidas en curso no se restauran después de cerrar la aplicación. Una
instalación independiente tiene datos propios: no importa automáticamente los
resultados guardados dentro de Expo Go.

## Sonido y vibración

`expo-audio` reproduce cuatro WAV originales empaquetados con la aplicación.
Espera la sesión y la carga del recurso antes de reproducir, permite repetir un
efecto en eventos distintos y evita duplicados. La victoria sustituye al acierto
final; la derrota sustituye al sexto error o al vencimiento del tiempo.

El interruptor Sonidos y el volumen multimedia controlan la audibilidad. La sesión
permite efectos con el teléfono en modo silencio/vibración, respeta la salida de
audio del sistema y no reproduce en segundo plano. Los reproductores se liberan
al desmontar el proveedor. `expo-haptics` gestiona las respuestas táctiles según
el sistema operativo y el hardware. Ambas preferencias se guardan por separado.

El [informe de corrección de audio](docs/diseno/correccion-audio.md) describe la
implementación y sus pruebas. El usuario confirmó posteriormente el funcionamiento
de los sonidos en celulares mediante Expo Go.

## Tecnologías y arquitectura

| Área | Tecnología |
| --- | --- |
| Aplicación | Expo SDK 57, React 19.2.3, React Native 0.86.3 y JavaScript ES6+ |
| Navegación | React Navigation 7, Native Stack |
| Interfaz | Componentes nativos, react-native-svg, áreas seguras y expo-linear-gradient |
| Tipografías | expo-font y fuentes locales de los paquetes DM Sans y Manrope |
| Datos locales | @react-native-async-storage/async-storage 2.2.0 |
| Efectos | expo-audio, expo-asset y expo-haptics |
| Apariencia e identidad | expo-system-ui, expo-status-bar y expo-splash-screen |
| Verificación | Node Test Runner, ESLint y comprobación de JavaScript con TypeScript |
| Compilación Android | EAS Build, perfil `preview` para APK |

[package.json](package.json) declara las dependencias y
[package-lock.json](package-lock.json) fija las versiones instaladas. La aplicación
continúa en JavaScript: TypeScript se utiliza solamente para comprobar `.js` con
`allowJs`, `checkJs` y `noEmit` desde [jsconfig.json](jsconfig.json).

```text
App.js                 Proveedores globales, fuentes y entrada a la navegación
src/
  components/          Botones, textos, modal, palabra oculta e ilustraciones
  screens/             Las ocho pantallas de la aplicación
  navigation/          Rutas y Native Stack
  hooks/               Partida, preferencias, tema y efectos
  data/                Banco de palabras, categorías y dificultades
  storage/             Modelo persistente y adaptador AsyncStorage
  theme/               Colores, tipografías y estilos compartidos
  utils/               Motor del juego, puntuación, audio y funciones puras
assets/                Recursos de identidad, imágenes y sonidos
tests/                 Pruebas automatizadas
docs/diseno/           Referencias de Figma e informes por etapa
app.json               Configuración de Expo e identidad nativa
eas.json               Perfil de compilación del APK
```

Las pantallas son Splash, Inicio, Instrucciones, Categoría y nivel, Juego,
Resultado, Estadísticas y Configuración. Inicio conecta las secciones; Categoría
inicia Juego y una partida terminada conduce a Resultado. Desde Resultado se
puede volver a jugar con la misma selección o regresar a Inicio.

El motor de partidas y el modelo de almacenamiento se comprueban por separado
de React Native. Los proveedores de datos, tema y efectos viven por encima del
navegador, para conservar su estado al cambiar de pantalla.

## Instalación y ejecución

Se necesita Node.js 22.13.x o posterior; el entorno de desarrollo utiliza Node.js
24. Este mínimo corresponde a [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/).
Se requiere Expo Go compatible con ese SDK para el flujo de desarrollo móvil.

Abre una terminal **en la carpeta que contiene `package.json`**. Si partes de la
carpeta exterior de este espacio de trabajo, entra primero con `cd Ahorcado`.

```powershell
npm.cmd ci
npm.cmd start
```

Escanea el QR de Metro con Expo Go; teléfono y equipo deben poder comunicarse por
la red. Para abrir un emulador Android previamente configurado:

```powershell
npm.cmd run android
```

Si necesitas renovar la caché de Metro:

```powershell
npx.cmd expo start --clear
```

Los comandos usan `.cmd` para PowerShell en Windows. En macOS/Linux se utilizan
`npm` y `npx` sin ese sufijo. El simulador iOS requiere macOS; un iPhone físico
puede conectarse a Metro desde Windows. El script `web` original se conserva,
pero no se incluyen las dependencias ni la validación de una versión web.

## Pruebas y comprobaciones

```powershell
npm.cmd test
npm.cmd run lint
npm.cmd run typecheck
npx.cmd expo install --check
npx.cmd --yes expo-doctor
npx.cmd expo export --platform android --platform ios
```

La suite contiene 106 pruebas de palabras, reglas, puntuación, tiempo,
navegación, disposición de palabras, registro de resultados, almacenamiento,
efectos y temas. Los adaptadores de almacenamiento y audio son dobles controlados:
estas pruebas no montan pantallas, ejecutan altavoces ni sustituyen el recorrido
en un teléfono. La exportación comprueba JavaScript y recursos; no produce un APK.

## Generar e instalar el APK

La identidad Android preparada es `com.yefry.ahorcadomovil`, versión `1.0.0`,
`versionCode: 1`, con orientación vertical. El perfil `preview` de
[eas.json](eas.json) utiliza `distribution: internal`, `android.buildType: apk`
y `developmentClient: false`. Está destinado a una aplicación independiente,
que incluya su código y recursos y se abra sin Metro ni Expo Go.

Comprueba primero la configuración local y la sesión de Expo:

```powershell
npx.cmd expo config --type public
npx.cmd eas-cli@latest whoami
```

En la revisión de etapa 6 se confirmó una sesión de Expo, pero EAS informó
`EAS project not configured`: falta crear o vincular el proyecto. Ejecuta ese paso
de forma interactiva y elige la cuenta y el proyecto correspondientes:

```powershell
npx.cmd eas-cli@latest init
```

Si trabajas desde otro equipo sin sesión, utiliza antes
`npx.cmd eas-cli@latest login`. No guardes contraseñas, tokens ni claves de firma
en el repositorio. Tras vincular el proyecto, ejecuta:

```powershell
npx.cmd eas-cli@latest build --platform android --profile preview
```

La primera compilación puede pedir que se configure una clave de firma Android.
La elección o generación de esa clave corresponde al titular de la cuenta; no se
han inventado identificadores de proyecto ni credenciales.
La [guía oficial de APK con EAS](https://docs.expo.dev/build-reference/apk/)
describe el perfil y la instalación.

Solo cuando EAS informe una compilación exitosa y entregue un artefacto `.apk`,
abre su enlace en Android, descarga el archivo y permite la instalación desde
esa fuente si el sistema lo solicita. Instálalo y prueba el arranque con Metro
detenido, una partida completa y los recursos con el teléfono sin conexión.
El [informe de etapa 6](docs/diseno/etapa-6.md) detalla el recorrido de validación,
la preparación de GitHub y la propuesta de video demostrativo.

## Estado del proyecto

- Etapas funcionales 1 a 5 completadas. El usuario confirmó las funciones
  principales, incluidos los cuatro sonidos, físicamente en Expo Go.
- Etapa 6: identidad nativa y perfil APK preparados. Se añadió
  `expo-splash-screen ~57.0.10` y se generaron recursos de identidad a partir del
  logotipo existente, conservando el código de la aplicación y las pruebas.
- Comprobaciones finales de etapa 6: **106/106 pruebas**, lint y comprobación de
  JavaScript aprobados; dependencias compatibles y **Expo Doctor 21/21** tras
  reintentar una consulta fallida por DNS. Exportaciones Android/iOS completas
  con 53 recursos, incluidos los cuatro WAV y las fuentes.
- La generación nativa Android con `prebuild --no-install` pasó en una copia
  temporal, sin crear carpetas nativas en el proyecto original. El esquema local
  de EAS CLI 24.13.0 validó el perfil `preview`; esto no ejecuta Gradle ni compila
  un APK.
- La consulta `eas config` en modo no interactivo se detuvo con
  `EAS project not configured`. Hay sesión de Expo, pero falta vincular el proyecto
  mediante `eas-cli@latest init` y configurar la firma durante la compilación.
- **No se lanzó una compilación remota ni se generó un APK.** Siguen pendientes
  la compilación real y las pruebas sobre el instalable.
- Git existe en la rama `master`, sin commits, remoto ni identidad de autor
  configurados. La publicación en GitHub requiere autorización. No hay un enlace
  de repositorio o descarga de APK verificado para presentar en este README.

El [informe de etapa 6](docs/diseno/etapa-6.md) registra las comprobaciones,
los pasos manuales pendientes y el recorrido de pruebas del APK.

## Diseño y documentación

El diseño se conserva en las nueve capturas y el código de referencia local de
[Figma Make](docs/diseno/Ahorcado_Figma_9_Capturas_y_Codigo_para_Codex/figma-make-referencia/REFERENCIA_VISUAL.md).
Ese código web sirve únicamente como referencia; la aplicación utiliza
componentes nativos. No se presenta un enlace remoto de Figma como verificado.

- [Etapa 1: configuración y estructura](docs/diseno/etapa-1.md).
- [Etapa 3: integración visual](docs/diseno/etapa-3.md).
- [Etapa 4: motor y reglas](docs/diseno/etapa-4.md).
- [Etapa 5: persistencia y funciones nativas](docs/diseno/etapa-5.md).
- [Corrección del audio](docs/diseno/correccion-audio.md).
- [Etapa 6: preparación de entrega y APK](docs/diseno/etapa-6.md).
- [Fuentes del banco de palabras](docs/diseno/fuentes-palabras.md).

Los informes anteriores conservan el contexto y los resultados de cada etapa;
el estado vigente de la preparación del APK se encuentra en el informe de etapa 6.
