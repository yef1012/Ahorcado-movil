# Etapa 5: almacenamiento, estadísticas y funciones nativas

Implementación del 13 de octubre de 2026 sobre el proyecto existente. Se conservaron
JavaScript, Expo SDK 57, React Navigation Native Stack, las 72 palabras, las ocho
pantallas, la paleta clara aprobada, la geometría y las ilustraciones SVG.
El usuario confirmó que la etapa 4 superó ocho comprobaciones físicas en Expo Go.
Esa validación previa no se presenta como prueba en dispositivo de esta etapa.

Actualización tras la prueba del usuario: estadísticas, AsyncStorage, ranking,
vibración, temas y borrado funcionan en Expo Go. El único fallo comunicado fue
el audio en Android e iPhone. La [corrección de audio](correccion-audio.md) conserva
el resto de esta etapa y documenta sus nuevas pruebas y comprobaciones físicas pendientes.

## Almacenamiento y registro de partidas

Se utiliza `@react-native-async-storage/async-storage` mediante un único servicio
compartido. Todas las lecturas/escrituras usan JSON y funcionan localmente:

| Clave | Contenido |
|---|---|
| `@ahorcado_stats` | Contadores, rachas, identificadores de partidas ya registradas y copia canónica del top 10. |
| `@ahorcado_ranking` | Lista de hasta diez resultados, reconstruible desde la fuente canónica. |
| `@ahorcado_config` | Nombre, sonido, vibración y preferencia Claro/Oscuro/Sistema. |

El escritor serializa hidratación y mutaciones. La interfaz muestra la carga sin
bloquear el hilo de JavaScript. No se solicita un nombre ni se habilita comenzar
una partida antes de recuperar el perfil; las otras pantallas siguen accesibles.
Los valores predeterminados no se escriben encima de datos cuya lectura falló.
Los cambios se publican a la interfaz después de confirmar su escritura.

Cada partida recibe un ID estable al iniciarse. Solo una victoria o derrota
produce un registro; abandonar no lo produce. El ID acompaña al resultado y se
guarda junto con los contadores y el ranking canónico en una sola escritura.
Juego y Resultado pueden solicitar el mismo guardado: la segunda solicitud es
idempotente. Volver a renderizar, reabrir Resultado, recargar el servicio o pulsar
Jugar de nuevo no vuelve a sumar una partida anterior.

Guardar dos claves no es una transacción de AsyncStorage. Por eso, si falla la
escritura de `@ahorcado_ranking` después de guardar `@ahorcado_stats`, la copia se
reconstruye al reintentar o abrir otra vez la app, sin duplicar contadores. Solo
se conservan los diez resultados completos; los IDs consumidos permanecen como
metadatos para impedir duplicados, también después de borrar estadísticas.

Los errores se muestran con una acción para reintentar. Una escritura fallida
conserva su operación en memoria; debe reintentarse antes de cerrar la app para
que llegue al almacenamiento. No se afirma que una operación fallida ya esté
guardada. Si JSON o su esquema están dañados, la app no se cierra ni los sustituye
silenciosamente: permite reintentar o confirmar el restablecimiento de la fuente
dañada. Las fuentes sanas se conservan. Una copia del ranking dañada se puede
reconstruir automáticamente desde las estadísticas válidas.

## Estadísticas, ranking y nombre

- Estadísticas: partidas, victorias, derrotas, porcentaje de victorias, racha
  actual y mejor racha. El porcentaje se calcula como victorias/partidas × 100,
  redondeado al entero; cero partidas muestra el estado vacío. Siete victorias
  en diez partidas muestran 70 %.
- Una derrota reinicia la racha actual; la mejor racha histórica permanece.
- El ranking muestra nombre, puntos, categoría real, dificultad, fecha y
  victoria/derrota. Ordena de mayor a menor puntuación y conserva un máximo de
  diez filas. Los empates priorizan la fecha más antigua y luego el ID. Las
  derrotas y los puntajes negativos válidos también pueden entrar en el ranking.
- No se importan estadísticas ni nombres de demostración de Figma. Los nombres
  de resultados anteriores conservan el valor usado al terminar aquella partida,
  aunque el perfil se edite después.
- El nombre se guarda en configuración y se carga al abrir la app. Se solicita
  únicamente si falta; se puede editar desde el perfil de Inicio. El modal valida
  espacios vacíos, evita envíos dobles y comunica errores de guardado.
- Configuración pide confirmación antes de borrar estadísticas y ranking. Al
  confirmar, ambas pantallas se actualizan y permanecen el nombre y todas las
  preferencias. Reabrir un Resultado antiguo no deshace ese borrado.

## Sonido y vibración

`GameFeedbackProvider` vive por encima de la navegación. Crea cuatro reproductores
con `useAudioPlayer`, cuyos recursos se liberan al desmontar el proveedor. El
efecto final puede terminar de sonar al reemplazar Juego por Resultado. No se crea
un reproductor nuevo por letra. Antes de volver a reproducir se busca el comienzo
del archivo, y las operaciones pendientes se invalidan al silenciar, pasar a
segundo plano o desmontar el proveedor.

Los cuatro WAV originales se generaron mediante síntesis sinusoidal, sin muestras
de terceros: acierto (0,224 s), error (0,254 s), victoria (0,708 s) y derrota
(0,656 s). Se incluyen el generador y una autorización de uso en
[`assets/sounds/README.md`](../../assets/sounds/README.md). Todos están empaquetados
localmente, en PCM mono de 16 bits a 44.100 Hz.

La deduplicación usa ID de partida y secuencia de evento. Una letra repetida no
produce otro efecto. La última letra o el sexto error producen solo el efecto
terminal correspondiente, sin superponer dos sonidos. Los eventos ocurridos con
efectos apagados se consumen y no reaparecen al activarlos después. Las pistas
normales no producen efectos de tecla; una pista que completa la palabra sí
produce victoria.

Expo Haptics usa respuestas breves de tecla/contexto/confirmación/rechazo en Android
y Light/Soft/Success/Error en iOS. Cada preferencia se aplica de forma independiente.
Los errores nativos se capturan y no interrumpen la partida. La respuesta física
depende del soporte y ajustes del dispositivo.

Tras la corrección, audio respeta el interruptor del juego y permite reproducir
en modo silencio/vibración del sistema, con el volumen multimedia del teléfono.
Se espera la sesión y la carga antes de rebobinar y reproducir el WAV. Se
desactivaron en configuración micrófono, grabación y reproducción en segundo
plano. No se solicitan permisos para grabar ni se utilizan APIs obsoletas de AV.

## Configuración y temas

Los interruptores de sonido y vibración, el selector de tema y el borrado funcionan
con el servicio persistente. Claro es el valor inicial. Oscuro cambia fondos,
tarjetas, texto, iconos, controles y trazos del juego manteniendo los acentos verdes.
Sistema sigue `useColorScheme`; `app.json` permite apariencia automática y declara
el soporte de `expo-system-ui` para Android.

Las ocho pantallas usan los estilos centralizados adaptados al tema. También se
adaptan gradientes, casillas, encabezados, modal de nombre y barra de estado. No
se cambia la geometría ni se reemplaza el diseño claro. El proveedor de tema no
desmonta la navegación ni reinicia el estado de la partida al cambiar de aspecto.
Las pruebas comprueban resolución de Sistema, identidad del tema claro, conservación
de medidas y contraste de los pares principales de texto de la paleta oscura.
No sustituyen una comprobación visual de todas las combinaciones en Android.

## Archivos creados y modificados

| Área | Archivos |
|---|---|
| Servicio local nuevo | `src/storage/model.js`, `appStore.js`, `index.js` |
| Contexto y efectos nuevos | `src/hooks/useAppData.js`, `useGameFeedback.js`, `src/utils/gameRecord.js`, `feedback.js` |
| Integración con perfil y partida | `src/hooks/usePlayer.js`, `useJuego.js`, `src/utils/juego.js`, `App.js` |
| Pantallas | Los ocho archivos de `src/screens/`; Estadísticas y Configuración conectadas a datos y controles reales, Juego/Resultado al registro y efectos, todas al tema. |
| Componentes | Nuevo `StorageNotice.js`; adaptaciones de tema en `AppText.js`, `AppIcon.js`, `AppButton.js`, `ScreenHeader.js`, `ScreenLayout.js`, `PalabraOculta.js`, `PlayerNameModal.js`, `Illustrations.js`. |
| Tema | Nuevos `themeMapping.js`, `useThemedStyles.js`, `persistenceStyles.js`; actualizados `colors.js`, `styles.js`, `ThemeProvider.js`. |
| Audio | `assets/sounds/correct.wav`, `incorrect.wav`, `win.wav`, `loss.wav`, `README.md`; `scripts/generate-sounds.cjs`. |
| Pruebas nuevas | `tests/storage.test.js`, `feedback.test.js`, `theme.test.js`, `gameRecord.test.js`. Se mantienen las pruebas de la etapa 4. |
| Configuración/documentación | `package.json`, `package-lock.json`, `app.json`, `README.md`, este informe. |

La lógica de puntuación, selección de palabras, pistas y tiempo no cambió. El motor
solo incorpora el campo de identidad de partida para conectarse con persistencia
y efectos. No se reemplazaron ni eliminaron cambios anteriores del usuario.

## Dependencias instaladas

Todas mediante `npx.cmd expo install`, usando el resolvedor de Expo SDK 57:

| Paquete | Versión configurada | Uso |
|---|---|---|
| `@react-native-async-storage/async-storage` | `2.2.0` | JSON local persistente. |
| `expo-audio` | `~57.0.5` | Cuatro efectos locales. |
| `expo-asset` | `~57.0.19` | Dependencia nativa requerida por audio. |
| `expo-haptics` | `~57.0.3` | Respuestas hápticas. |
| `expo-system-ui` | `~57.0.4` | Configuración de apariencia en Android. |

No se añadieron librerías de estadísticas, red, estado global ni pruebas. Se usa
el ejecutor de Node.js existente. Referencias de compatibilidad y API:
[AsyncStorage SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/async-storage/),
[Audio SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/audio/),
[Haptics SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/haptics/),
[SystemUI SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/system-ui/) y
[configuración de temas](https://docs.expo.dev/develop/user-interface/color-themes/).

## Comprobaciones ejecutadas

| Comprobación | Resultado |
|---|---|
| `npm.cmd test` | **82 aprobadas, 0 fallidas**. |
| `npm.cmd run lint` | Aprobado, sin errores ni advertencias de código. |
| `npm.cmd run typecheck` | Aprobado; aplicación y lógica continúan en JavaScript. |
| `npx.cmd expo install --check` | Dependencias compatibles. |
| `npx.cmd --yes expo-doctor` | **21/21 aprobadas**, después de corregir el peer nativo faltante. |
| `npm.cmd ls --depth=0` | Dependencias directas resueltas. |
| `git diff --check` | Sin errores en los archivos seguidos por Git. |
| `npx.cmd expo export --platform android --platform ios` | Aprobada con código 0 tras declarar `expo-asset`: ambos paquetes Hermes y 53 recursos, incluidos los cuatro WAV, en `dist/`. |

Distribución: 38 pruebas anteriores del juego, banco, disposición y router; 21
de almacenamiento; 15 de efectos/recursos WAV; 5 de temas y 3 de integración de
resultados reales con el almacenamiento. Se comprueban carreras de carga/escritura,
persistencia al crear otro servicio, porcentaje, rachas, orden/límite del ranking,
duplicados concurrentes, conservación del perfil tras borrar y fallos de lectura,
escritura, confirmación perdida y caché parcial. También se verifica que una partida
activa o abandonada no genere un registro.

Las pruebas de almacenamiento usan un adaptador en memoria controlado; las de
efectos usan reproductores y haptics controlados. No equivalen a reiniciar Expo Go
ni a oír/sentir hardware. Los cuatro WAV validan cabeceras, duración, muestras y
ausencia de saturación, y `System.Media.SoundPlayer.Load()` pudo cargar los cuatro
en Windows. No se escucharon para evaluar volumen percibido.

Expo Doctor detectó inicialmente que `expo-asset` debía declararse directamente,
aunque existía transitivamente. Se corrigió con Expo y Doctor pasó 21/21. Se
retiraron los controles inactivos y textos de funciones futuras de Estadísticas
y Configuración. Los errores de tipado durante integración se corrigieron antes
de las comprobaciones finales.

Node conserva su aviso de detección de módulos ES en pruebas `.js`; Metro puede
informar `NO_COLOR`/`FORCE_COLOR`. No son fallos de las comprobaciones. La instalación
volvió a informar las 22 alertas npm ya existentes (7 moderadas, 15 altas); no se
aplicó una actualización masiva de dependencias ni se autorizó el script pendiente
de `unrs-resolver`. Las consultas de Expo y Hermes requirieron permisos del entorno.
La exportación valida resolución de imports y empaquetado de JavaScript/recursos;
no compila un APK ni sustituye la ejecución de módulos nativos en un teléfono.

## Comprobaciones pendientes en Expo Go

Desde la carpeta del `package.json`, ejecutar `npm.cmd start`. Desde la carpeta
exterior, entrar primero en `Ahorcado`. Usar Expo Go compatible con SDK 57.

1. Primera apertura: guardar nombre; cerrar y abrir. Debe conservarse sin repetir
   el modal. Editarlo desde Inicio y verificar el saludo tras reiniciar.
2. Ganar y perder; comprobar contadores, porcentaje y rachas. Reabrir Resultado
   y pulsar Jugar de nuevo: ningún registro anterior debe duplicarse. Abandonar
   una partida no debe sumar derrota.
3. Acumular más de diez resultados y revisar orden, fecha, nivel, categoría y
   nombre original. Cerrar y abrir para comprobar la persistencia del top 10.
4. Oír los cuatro efectos, evaluar volumen/latencia y comprobar que no se corten
   los finales por navegación. Repetir con sonido apagado y con modo silencioso.
5. Probar vibración encendida/apagada independientemente del sonido. Repetir
   letras usadas: no deben generar efectos nuevos. Comprobar el comportamiento
   en dispositivos que no tengan hápticos compatibles.
6. Cambiar Claro/Oscuro/Sistema, recorrer las ocho pantallas y el modal; verificar
   contraste, áreas seguras y texto ampliado. En Sistema, cambiar la apariencia
   del teléfono, incluso con una partida activa, sin reiniciar su estado.
7. Cancelar Borrar estadísticas y comprobar que nada cambie; confirmar después.
   Estadísticas y ranking deben quedar vacíos, conservando nombre y preferencias
   también tras reiniciar.

No se ejecutó la etapa 5 en un dispositivo ni emulador desde este entorno.
Posteriormente, el usuario confirmó las funciones indicadas al inicio de este
informe. Queda pendiente volver a comprobar físicamente el audio corregido.
No se avanzó a GitHub, generación de APK, video explicativo ni entrega/publicación.
