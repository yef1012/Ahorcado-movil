# Etapa 6: preparación del APK y de la entrega

Fecha: 13 de octubre de 2026. Se preparó el proyecto existente para un APK
Android independiente, sin cambiar JavaScript, React Navigation, las ocho
pantallas, las 72 palabras, reglas, estadísticas, almacenamiento, sonidos,
vibración ni temas. El usuario confirmó que las funciones principales, incluidos
los sonidos corregidos, funcionan físicamente en Expo Go.

**Estado: preparación local comprobada; APK todavía no generado.** La sesión
de Expo está iniciada, pero este proyecto necesita vincularse a EAS. No se creó
un proyecto remoto, no se generaron credenciales, no se inició una compilación
remota y no se publicó en GitHub ni en tiendas.

## Revisión y preparación realizadas

Se revisaron `app.json`, `package.json`, recursos de icono y arranque, Git,
exclusiones, README, dependencias, estructura y carga de recursos. No existía
`eas.json`. Los iconos originales eran los azules de la plantilla y no había
configuración de splash nativo ni identificador Android.

La aplicación usa `registerRootComponent`, módulos nativos compatibles con Expo,
fuentes locales y cuatro WAV cargados por `require()`. No se detectaron URLs de
Metro, llamadas de red para jugar ni APIs exclusivas de Expo Go en el código.
El perfil de lanzamiento incorpora JavaScript y recursos; su independencia real
se verificará instalando y ejecutando el APK sin Metro ni Expo Go.

La comparación SHA-256 de 71 archivos previos de `src/`, `tests/`, `assets/` y
`App.js` confirmó que se conservaron íntegros. No se regeneraron los sonidos.

## Identidad y recursos nativos

| Propiedad | Configuración |
|---|---|
| Nombre | El Ahorcado Móvil |
| Identificador Android | `com.yefry.ahorcadomovil` |
| Versión / versionCode | `1.0.0` / `1` |
| Orientación | Vertical (`portrait`) |
| Icono | `assets/branding/icon.png`, opaco, 1024 × 1024 |
| Adaptativo | Capa frontal y capa monocromática; fondo `#F7FCF8` |
| Splash nativo | Logotipo existente, ancho 160; fondo claro `#F7FCF8`, oscuro `#0E1B15` |

El identificador tiene sintaxis Android válida y es específico de este proyecto;
no se ha reservado ni comprobado su disponibilidad en Google Play, porque no se
está preparando una publicación en tiendas. Conservarlo en futuras versiones
permitirá actualizar la misma aplicación junto con su misma clave de firma.

Se reutilizaron las formas y colores de `GameLogo` en `Illustrations.js`,
exportándolos a nuevos PNG y SVG. Los originales de plantilla permanecen sin
cambios. La zona visible de las capas adaptativas se comprobó dentro del círculo
central de diámetro 66/108 del lienzo para reducir recortes del lanzador.
La variante monocromática utiliza la silueta para que Android aplique su tinte.

Se añadió **únicamente `expo-splash-screen ~57.0.10`**, mediante
`npx.cmd expo install expo-splash-screen`, y su plugin. El arranque nativo precede
a `SplashScreen.js`; no reemplaza esa pantalla ni modifica sus ilustraciones.
No se añadió `expo-dev-client`, ni bibliotecas de interfaz o de reglas.

`scripts/export-branding.cjs` permite volver a exportar los recursos con Chrome
sin ventana y un perfil temporal exclusivo. Chrome es una herramienta local de
exportación, no una dependencia de la aplicación ni requisito de EAS Build.
Los PNG ya están incluidos; detalles en [assets/branding](../../assets/branding/README.md).

## Permisos

Se mantienen audio sin grabación y haptics. La configuración bloquea explícitamente
micrófono, lectura/escritura de almacenamiento externo y superposición de ventanas.
AsyncStorage utiliza almacenamiento interno y no necesita esos permisos.

La introspección y el manifiesto generado por Expo incluyen `INTERNET`,
`VIBRATE` y `MODIFY_AUDIO_SETTINGS`, y reglas de eliminación para los permisos
bloqueados. No se añadieron solicitudes de permisos al código. La configuración
también mantiene deshabilitados grabación y audio en segundo plano. La lista
definitiva tras fusionar las bibliotecas debe inspeccionarse en el APK compilado.

## EAS Build

Se creó `eas.json`:

```json
{
  "cli": { "appVersionSource": "local" },
  "build": {
    "preview": {
      "distribution": "internal",
      "developmentClient": false,
      "android": { "buildType": "apk" }
    }
  }
}
```

El perfil solicita un APK de lanzamiento instalable directamente. EAS usará
las versiones locales de `app.json` y sus credenciales remotas cuando el titular
las configure. No se añadieron `owner`, UUID de proyecto ni enlaces inventados.

La validación local con el lector/esquema `@expo/eas-json` de EAS CLI 24.13.0
resolvió correctamente `preview`: `internal`, `apk`, `developmentClient: false`
y origen de credenciales `remote` por defecto.

`npx.cmd --yes eas-cli@latest whoami` confirmó una sesión iniciada. La comprobación
remota en modo no interactivo:

```powershell
npx.cmd --yes eas-cli@latest config --platform android --profile preview --non-interactive
```

se detuvo con **`EAS project not configured`**: la CLI necesita inicializar o
vincular el proyecto. Se respetó la instrucción de detener ese paso ante decisiones
interactivas. No se intentó omitir la confirmación usando `--force`, ni se lanzó
`eas build`. La firma Android tampoco ha sido comprobada o creada.

## Git y preparación para GitHub

El repositorio local ya existía en la carpeta interna `Ahorcado`. Está en la
rama `master`, sin commits, sin remoto y sin nombre/correo de autor configurados.
El índice conserva archivos de plantilla y existen cambios y archivos nuevos
pendientes de registrar. No se reinició Git, cambió la rama, creó un commit,
modificó la identidad del autor ni configuró un remoto.

`.gitignore` ahora excluye dependencias, Expo, cachés, carpetas nativas generadas,
temporales, `.env`, claves, `credentials.json`, cuentas de servicio, APK/AAB/IPA,
logs y configuración privada de herramientas. Se permite `.env.example` solo como
plantilla sin secretos. El ZIP de referencia redundante queda ignorado sin borrarlo;
su carpeta expandida, capturas y documentación se conservan para Git.

`.easignore` repite las exclusiones y añade documentación, pruebas y scripts de
herramientas, que no necesita la compilación remota. Se comprobó que conserva
código, configuración, `package-lock.json` y recursos necesarios. Este archivo
tiene precedencia sobre `.gitignore`; mantener sus exclusiones sincronizadas.

La revisión de nombres y firmas habituales no detectó credenciales en los archivos
candidatos. Esto no sustituye revisar el contenido antes del primer commit.

### Registro local y publicación posterior

Los siguientes pasos son manuales; **la publicación en GitHub requiere autorización**.

1. Desde la carpeta de `package.json`, revisar `git status`, `git diff` y los
   archivos nuevos. La aplicación está dentro de la carpeta interna, no en el
   directorio exterior que la contiene.
2. Si la identidad sigue ausente, configurarla solo para este repositorio con
   los datos reales del autor. Puede usarse el correo de privacidad de GitHub:

   ```powershell
   git config user.name "TU_NOMBRE_REAL"
   git config user.email "TU_CORREO_DE_AUTORIA"
   git add .
   git diff --cached --stat
   git diff --cached
   git commit -m "Prepara El Ahorcado Móvil para APK"
   ```

3. Cuando se autorice publicar, crear en GitHub un repositorio vacío con la
   visibilidad elegida. Evitar inicializar otro README/licencia allí para no
   crear historias divergentes.
4. Revisar `git remote -v` antes de añadir un remoto. Solo si sigue sin existir,
   usar la URL real que GitHub proporcione:

   ```powershell
   git remote add origin "URL_REAL_DEL_REPOSITORIO"
   git branch --show-current
   git push -u origin master
   ```

   La última orden corresponde al nombre actual `master`; si el titular decidió
   cambiarlo, usar el nombre que devuelva el comando. No sobrescribir otro remoto.
5. Verificar en GitHub que código, documentación, recursos, pruebas y lockfile
   estén presentes, y que secretos, dependencias y APK no aparezcan. Añadir enlaces
   reales al README únicamente después de comprobarlos.

## Procedimiento manual para generar el APK

No hace falta publicar el repositorio en GitHub para usar EAS Build.

1. Completar la revisión y el registro local de Git indicados arriba. Si la CLI
   solicita autor o primer commit, resolverlos con los datos propios.
2. Verificar la cuenta de Expo con `npx.cmd eas-cli@latest whoami`. La sesión estaba
   iniciada durante esta revisión; si ha caducado, ejecutar personalmente
   `npx.cmd eas-cli@latest login`.
3. Ejecutar **`npx.cmd eas-cli@latest init`**. Confirmar la cuenta y vincular un
   proyecto EAS existente si corresponde, o aceptar crear uno para esta aplicación.
   La CLI escribirá el `extra.eas.projectId` real en `app.json`. Revisar el cambio
   y guardarlo en Git. No copiar el ID de otra aplicación.
4. Comprobar la configuración y lanzar el perfil preparado:

   ```powershell
   npx.cmd eas-cli@latest config --platform android --profile preview
   npx.cmd eas-cli@latest build --platform android --profile preview
   ```

   Equivale a `eas build --platform android --profile preview` si EAS CLI ya está
   instalado. Ante la pregunta de firma, si es la primera versión y no existe una
   clave propia anterior, el titular puede permitir a EAS generar el keystore.
   Si ya hay una versión firmada, reutilizar su clave. No guardar claves o
   contraseñas en Git; conservar una copia segura para futuras actualizaciones.
5. Esperar a que la compilación termine con éxito. Si falla, revisar el paso
   concreto del registro de EAS antes de declarar lista la entrega.
6. Registrar ID, fecha, versión y enlace o archivo `.apk` real. Un enlace al trabajo
   en cola o una exportación de Metro no demuestran que el APK se haya generado.

La compilación remota requiere conexión y disponibilidad de EAS. No se solicitó
publicar en tiendas ni generar un AAB.

## Instalación en Android

Abrir desde el teléfono el enlace de descarga del APK exitoso, descargarlo y
permitir a ese navegador/gestor instalar aplicaciones si Android lo solicita.
Instalar y abrir **El Ahorcado Móvil** desde su icono. Alternativamente, con ADB
configurado, usar `adb install -r "RUTA_REAL_AL_APK"`.

Detener Metro y comprobar el arranque en modo avión. Expo Go puede permanecer
instalado, pero no debe intervenir. Los datos del juego dentro de Expo Go no se
transfieren automáticamente al APK, porque son aplicaciones con almacenamientos
distintos; un primer inicio vacío en el APK es esperado. Las actualizaciones
del mismo paquete y firma deben conservar los datos al instalarse sin desinstalar.

## Validaciones ejecutadas

| Comprobación | Resultado |
|---|---|
| `npm.cmd test` | **106 aprobadas, 0 fallidas**. |
| `npm.cmd run lint` | Aprobado. Incluye el script de exportación. |
| `npm.cmd run typecheck` | Aprobado; código de aplicación continúa en JavaScript. |
| `npx.cmd expo install --check` | Dependencias compatibles con SDK 57. |
| `npx.cmd --yes expo-doctor` | **21/21 aprobadas**, después de reintentar un fallo DNS. |
| `npx.cmd expo config --type introspect --json` | Plugins y configuración nativa resueltos. |
| Esquema local de EAS CLI 24.13.0 | Perfil `preview` válido y destinado a APK independiente. |
| `eas config … --non-interactive` | Detenido: falta vincular proyecto EAS. No es una compilación. |
| `npx.cmd expo export --platform android --platform ios` | Ambos paquetes Hermes aprobados; 53 recursos, incluidos cuatro WAV y 25 fuentes. |
| SHA-256 de WAV exportados | Coinciden con los cuatro originales en ambas plataformas. |
| PNG de identidad | 1024 × 1024, icono opaco y capas transparentes con margen seguro. Inspección visual de los archivos exportados. |
| Prebuild Android en copia temporal | Completado; genera iconos, splash, identificador, versión y manifiesto. |
| Exclusiones Git/EAS | Verificadas con reglas y `git check-ignore`; archivos necesarios conservados. |
| `git diff --check` | Sin errores de espacios en archivos seguidos. |
| Comparación SHA-256 del código/recursos previos | 71 archivos conservados íntegros. |

El prebuild se ejecutó con `--platform android --no-install --skip-dependency-update
react,react-native` sobre `.tmp/native-check-stage6`, una copia temporal con acceso
a las dependencias instaladas. No añadió `android/` o `ios/` al proyecto principal.
Se inspeccionaron los recursos nativos generados y `bundleCommand = "export:embed"`.
No se ejecutó Gradle ni se creó un APK con la firma de entrega.

Las consultas remotas presentaron errores DNS transitorios que se resolvieron al
reintentar. La descarga de paquetes y el renderizador requirieron permisos del
entorno. Node/Metro conservan avisos informativos sobre módulos y color.

La instalación informó 23 alertas npm (8 moderadas y 15 altas). No se aplicó
`npm audit fix --force` ni cambios masivos de versiones: requerirían una revisión
separada y podrían afectar SDK 57. Estas comprobaciones no son una auditoría de
seguridad completa.

## Pruebas obligatorias sobre el APK real

- Instalación y primer arranque: nombre, icono normal/temático, splash en apariencia
  clara/oscura y ocho pantallas; revisar máscaras, áreas seguras y texto ampliado.
- Arranque en frío con Metro cerrado y modo avión: fuentes, SVG, sonidos y partida.
- Registro del nombre, cierre forzado y reapertura: persistencia sin repetir el modal.
- Aciertos, errores, letras repetidas, seis etapas, pistas y puntuación en los tres
  niveles; victoria, derrota por errores, derrota a los 90 segundos y Jugar de nuevo.
- Cuatro sonidos, volumen, silencio/vibración del sistema, ambos interruptores y
  paso Juego → Resultado sin duplicaciones ni cortes indebidos.
- Estadísticas/ranking reales: una partida una vez, top 10, cierre/reapertura,
  cancelar/confirmar borrado y conservación del nombre/preferencias.
- Temas Claro/Oscuro/Sistema y cambio de apariencia del teléfono.
- Navegación atrás, abandono, fondo/reanudación y temporizador de Difícil.
- Reinstalación de actualización con mismo identificador/firma sin pérdida de datos.
- Revisar los permisos efectivos del APK y cualquier error de arranque nativo.

La prueba física previa de Expo Go fue confirmada por el usuario. No se presenta
como prueba de este APK; desde este entorno no se ejecutó un APK en un teléfono.

## Propuesta de video: máximo cinco minutos

| Tiempo | Demostración |
|---|---|
| 0:00–0:20 | Nombre del proyecto, objetivo académico y tecnologías. |
| 0:20–0:50 | Abrir el APK desde su icono, con Metro detenido; mostrar nombre y menú. |
| 0:50–1:25 | Elegir categoría/nivel; explicar longitudes, teclado y pistas. |
| 1:25–2:10 | Partida: acierto, error, pista, victoria y puntuación real. |
| 2:10–2:40 | Jugar de nuevo y mostrar derrota/seis etapas. |
| 2:40–3:10 | Difícil y cronómetro; si se acelera la espera, indicarlo en el video. |
| 3:10–3:40 | Estadísticas y ranking reales; cerrar/reabrir para mostrar persistencia. |
| 3:40–4:15 | Sonidos, vibración, temas e interruptores; confirmación del borrado. |
| 4:15–4:40 | Arquitectura, pruebas aprobadas y perfil EAS para APK. |
| 4:40–5:00 | Resultado, limitaciones y enlaces reales disponibles al entregar. |

Grabar datos y pantallas reales. Preparar las partidas antes de grabar facilita
cumplir cinco minutos; los cortes de edición no deben presentarse como continuidad
del cronómetro ni como estadísticas inventadas. No mostrar credenciales.

## Archivos modificados y nuevos

- `app.json`: identidad Android, rutas de iconos, splash y permisos.
- `package.json`, `package-lock.json`: dependencia compatible `expo-splash-screen`.
- `eas.json`: nuevo perfil `preview` para APK.
- `.gitignore`, `.easignore`: exclusiones locales y de compilación remota.
- `assets/branding/`: cuatro PNG, sus cuatro SVG y documentación del origen.
- `scripts/export-branding.cjs`: exportación reproducible del logotipo existente.
- `README.md`: documentación profesional, reglas verificadas, instalación y build.
- `docs/diseno/etapa-6.md`: este informe, pasos manuales y propuesta de video.

## Pendiente antes de entregar

Vincular EAS con la cuenta elegida, configurar firma, terminar una compilación
real, conservar su APK/enlace, instalarlo y completar el recorrido físico. Revisar
y registrar Git localmente; publicar solo con autorización. Grabar el video de
máximo cinco minutos y añadir enlaces verificables del repositorio/APK cuando existan.

No pudo verificarse el contenido del enlace remoto original de Figma desde este
entorno; el README referencia las nueve capturas y el documento local auténtico.
No se inventaron enlaces ni capturas de la aplicación instalada.

## Referencias consultadas

- [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/).
- [Splash Screen SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/splash-screen/).
- [APK con EAS Build](https://docs.expo.dev/build-reference/apk/).
- [Primer build con EAS](https://docs.expo.dev/build/setup/).
- [Exclusiones de EAS](https://docs.expo.dev/build-reference/easignore/).
- [Iconos adaptativos Android](https://developer.android.com/develop/ui/compose/system/icon_design_adaptive).
