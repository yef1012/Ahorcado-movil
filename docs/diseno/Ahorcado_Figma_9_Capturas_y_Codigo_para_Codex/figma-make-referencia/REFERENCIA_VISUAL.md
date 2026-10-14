# El Ahorcado Móvil — paquete de referencia visual de Figma Make

Extrae esta carpeta **figma-make-referencia** dentro de `Ahorcado/docs/diseno/`, SIN reemplazar archivos de la aplicación Expo.

## Capturas de referencia
- `01_splash.png`: presentación, barra de progreso, ilustración y Entrar.
- `02_inicio.png`: encabezado y saludo, ilustración, botón JUGAR AHORA y tres accesos.
- `03_instrucciones.png`: cinco reglas y resumen de dificultad.
- `04_categorias_y_dificultad.png`: cuatro categorías, Aleatoria, dificultad y selección actual.
- `05_juego.png`: encabezado, vidas, dibujo, casillas de palabra, teclado y pista.
- `06_resultado_victoria.png`: celebración, palabra, puntaje y opciones.
- `07_estadisticas.png`: porcentaje, cuatro métricas y clasificación.
- `08_configuracion.png`: sonido, vibración, tema y borrar estadísticas.
- `09_modal_nombre.png`: entrada del nombre del jugador.

## Fuentes originales de Figma Make
`src/App.tsx` y `src/index.css` son referencias del prototipo web, **no código ejecutable de React Native**. `package.json` corresponde al prototipo web (Vite). No reemplazar el `package.json` de Expo.

## Correcciones necesarias respecto a las capturas / prototipo
1. En el ejemplo de Figma se muestra una palabra de **6 letras** (BOGOTÁ) mientras está seleccionado **Medio** (7–9 letras). Aplicar las reglas del docente: fácil 4–6; medio 7–9; difícil 10 o más.
2. El ejemplo muestra un **cronómetro** en medio, aunque el nivel Medio no tiene límite. Solo imponer 90 s en Difícil. Se puede mostrar duración de partida en otros niveles si está claramente diferenciada de un temporizador límite.
3. El resultado muestra valores (900 puntos, 01:32, 6 vidas) de demostración; no tomarlos como cálculo real.
4. Estadísticas incluyen datos y nombres ficticios (78%, 48 partidas y ranking con Laura, Andrés, etc.); no incluirlos como datos reales. Mostrar ceros y estados vacíos hasta disponer de almacenamiento local.
5. El teclado debe incluir Ñ. La normalización de tildes y espacios ha de seguir las reglas del profesor.
6. Resultados de derrota y confirmación de salida no están representados como captura independiente: adaptar estilo desde referencia de victoria y modal.
7. El juego original en Figma Make usa `BOGOTA` fija, navegación web y `window.localStorage`; reconstruir los componentes como React Native, preservando la arquitectura Expo existente.
8. La captura del cuadro de nombre lleva un nombre de ejemplo. El nombre debe introducirlo y guardarlo cada jugador, no estar escrito a mano en el código.
9. El profesor solicita **mínimo 60 palabras, 15 por categoría**, puntuación exacta, estadísticas locales, sonidos/vibración, tema claro/oscuro y APK. Se desarrollarán en fases posteriores; no afirmar que estén terminados solo porque haya mockups.
10. Debe verificarse por separado que el Figma entregable tenga wireframes, mockups editables, guía de estilos, icono, splash y prototipo navegable. Las capturas no prueban por sí solas todo eso.

## Diseño
Verde oscuro principal `#2E7D32`, secundario `#4CAF50`, claro `#A5D6A7`, fondo `#F6FFF6`; las capturas son la referencia visual preferente cuando haya diferencias con documentación previa. Fuentes utilizadas por el prototipo web: Manrope y DM Sans. Priorizar proporcionalidad y controles táctiles de al menos 48×48 dp.
