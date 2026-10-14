# Corrección de efectos de sonido

13 de octubre de 2026. Continuación de la etapa 5, limitada al audio. El usuario
informó fallos en Android e iPhone y confirmó que las otras funciones funcionan
en Expo Go. No se modificaron pantallas, ilustraciones, navegación, reglas,
palabras, estadísticas ni almacenamiento. No se instalaron dependencias.

## Diagnóstico comprobado

El proyecto usa Expo 57.0.28, expo-audio 57.0.5 y expo-asset 57.0.19. Coinciden
con las versiones compatibles verificadas por Expo. Se consultaron la
[API de Audio SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/audio/) y el código
de los módulos instalados, incluidos Android e iOS.

La configuración anterior fijaba `playsInSilentMode: false`. En SDK 57 esto
bloquea reproducción tanto en iPhone con silencio como en Android con el timbre
en silencio o vibración. En Android, `AudioModule.kt` comprueba ese ajuste y
retorna desde `play()` sin reproducir y sin lanzar error. En iOS selecciona la
categoría de sesión ambiental, sensible al interruptor de silencio. Es una causa
demostrable en el código; sin registros ni acceso a los teléfonos no se puede
asegurar que fuera el único factor de las pruebas del usuario.

También faltaba esperar la configuración asíncrona de sesión y la carga del WAV
antes de `seekTo(0)`/`play()`. Se corrigió esa carrera de inicialización. La API
`await seekTo(0)` es válida: no se identificó un bloqueo propio de esa API en Android.

No se encontró un error en rutas, formato, eventos o interpretación de las
preferencias. Son booleanos estrictos, `false` se conserva y App deshabilita
efectos hasta completar la hidratación. El proveedor está sobre la navegación:
pasar de Juego a Resultado no libera los reproductores.

Los cuatro WAV son RIFF/PCM mono, 16 bits, 44.100 Hz, con señal y sin saturación.
No se regeneraron ni modificaron. Todos tienen pico aproximado de −12,23 dBFS.

| Archivo | Duración | RMS aproximado |
|---|---:|---:|
| correct.wav | 0,224 s | −17,71 dBFS |
| incorrect.wav | 0,254 s | −17,35 dBFS |
| win.wav | 0,708 s | −16,69 dBFS |
| loss.wav | 0,656 s | −16,41 dBFS |

Estas mediciones no certifican volumen percibido en un teléfono.

## Corrección aplicada

- `playsInSilentMode: true`, manteniendo el interruptor Sonidos y el volumen
  multimedia del dispositivo. Sin grabación, micrófono ni reproducción en segundo plano.
- `mixWithOthers` para efectos breves y `shouldRouteThroughEarpiece: false`.
  Se conserva la ruta de salida elegida por el sistema, incluidos auriculares.
- `downloadFirst: true` para preparar el recurso local con expo-asset. En Expo Go
  el archivo puede venir inicialmente de Metro; después se utiliza la caché.
- Una promesa compartida prepara la sesión y permite reintentar tras un error.
  Cada efecto espera la sesión y `currentStatus.isLoaded` o el evento de carga.
- Se utiliza el estado completo: en Android reconoce también un clip terminado,
  aunque la propiedad aislada `player.isLoaded` sea falsa. Así se puede repetir.
- Volumen del reproductor 1, `muted: false`, `loop: false`; cada evento válido
  rebobina a cero. No se modifica el volumen del teléfono.
- Se mantiene la deduplicación por partida/secuencia y un solo efecto terminal.
  La victoria sustituye al acierto final y la derrota al sexto error/fin de tiempo.
- Silenciar, pasar a segundo plano, sustituir un efecto o desmontar cancela la
  carga pendiente. La espera de carga tiene un límite de 8 segundos; retira su
  listener y temporizador al completar, cancelar o fallar. Los fallos se capturan
  y se diagnostican en desarrollo sin detener la partida.
- `useAudioPlayer` conserva la propiedad de los cuatro recursos y los libera al
  desmontar el proveedor. No se crean reproductores por letra ni por resultado.

## Archivos de esta corrección

| Archivo | Cambio |
|---|---|
| `src/hooks/useGameFeedback.js` | Opciones de carga, sesión compartida y conexión del adaptador. |
| `src/utils/audio.js` | Preparación de sesión/recurso, volumen y limpieza de la espera. |
| `src/utils/feedback.js` | Preparación previa y cancelación de efectos obsoletos. |
| `tests/audio.test.js` | 24 pruebas nuevas con dobles controlados de la API nativa. |
| `assets/sounds/README.md` | Comportamiento actualizado del modo silencio. |
| `README.md`, `docs/diseno/etapa-5.md`, este archivo | Resultados y comprobación física pendiente. |

## Validación ejecutada

| Comprobación | Resultado |
|---|---|
| `npm.cmd test` | 106 aprobadas, 0 fallidas: 82 anteriores y 24 nuevas. |
| `npm.cmd run lint` | Aprobado. |
| `npm.cmd run typecheck` | Aprobado; se corrigió la anotación JSDoc incompleta del avance interrumpido. |
| `npx.cmd expo install --check` | Dependencias compatibles. |
| `npx.cmd --yes expo-doctor` | 21/21 aprobadas. |
| `npx.cmd expo export --platform android --platform ios` | Ambas exportaciones Hermes aprobadas; 53 recursos, incluidos los cuatro WAV. |
| Comparación de assets exportados por SHA-256 | Los cuatro WAV coinciden con sus originales en ambas plataformas. |

Los primeros intentos de consultar Expo/npm y ejecutar Hermes fueron bloqueados
por permisos del entorno; se repitieron con autorización y finalizaron correctamente.
Persisten avisos informativos de Node sobre módulos ES y de Metro sobre variables
de color, sin fallos de las comprobaciones.

Las pruebas nuevas cubren sesión pendiente y fallida, carga pendiente/completada/
fallida, cancelación, expiración, limpieza, repetición tras terminar, ausencia de
duplicados, sustitución por victoria y la preferencia `false` recuperada desde un
adaptador de almacenamiento en memoria. Las anteriores comprueban los cuatro
eventos con el motor del juego, incluyendo derrota por seis errores y por tiempo.
No ejecutan altavoces ni montan la aplicación en un teléfono o emulador.

## Comprobación física en Expo Go

Desde la carpeta con `package.json`, reiniciar Metro con `npx.cmd expo start --clear`
y abrir de nuevo la aplicación en Expo Go compatible con SDK 57. No borrar los
datos de Expo Go: se debe conservar la preferencia guardada. Para probar, activar
Configuración → Sonidos y subir el volumen multimedia del teléfono.

1. Adivinar una letra sin terminar la palabra: escuchar el acierto. Acertar otra
   letra distinta: el mismo efecto debe repetirse. Una letra ya usada no debe sonar.
2. Introducir una letra incorrecta sin llegar aún a seis errores: escuchar el
   error. Otra letra incorrecta debe repetirlo una vez.
3. Completar la palabra: escuchar solo victoria, completa al pasar a Resultado.
4. Perder por seis errores: escuchar solo derrota. Repetir en Difícil dejando
   vencer los 90 segundos para comprobar también esa condición.
5. Pulsar Jugar de nuevo y repetir efectos. Apagar Sonidos: no debe escucharse
   ninguno. Cerrar/reabrir: debe conservarse apagado. Reactivarlo y comprobar que
   solo suenen eventos nuevos, sin reproducir los anteriores.
6. Repetir con silencio/vibración del teléfono: con Sonidos encendido y volumen
   multimedia mayor que cero debe permitirse audio. Comprobar la salida actual
   si hay Bluetooth/auriculares. Ir al fondo y volver: no deben aparecer efectos
   antiguos ni reproducirse fuera de la aplicación.

Pendiente: confirmar audibilidad, latencia, duración completa de los efectos
finales y comportamiento del hardware en ambos teléfonos. Si persiste un fallo,
conservar el mensaje de Metro que empiece con “No se pudo reproducir un efecto
del juego”, junto con sistema/modelo y versión de Expo Go. No se avanzó a etapa 6.
