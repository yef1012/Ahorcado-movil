# Recursos de instalación y arranque

Exportaciones del logotipo `GameLogo` que ya usa la aplicación en
`src/components/Illustrations.js`. Se conservan las formas y colores del diseño;
no se modificaron el componente ni las ocho pantallas.

| Archivo | Uso |
|---|---|
| `icon.png` | Icono general opaco, 1024 × 1024, fondo `#F7FCF8`. |
| `adaptive-foreground.png` | Capa frontal transparente del icono Android, con margen para las máscaras del sistema. |
| `adaptive-monochrome.png` | Silueta transparente que Android puede teñir para sus iconos temáticos. |
| `splash.png` | Logotipo transparente del arranque nativo, sobre fondo claro u oscuro configurado en `app.json`. |

Todos los PNG miden 1024 × 1024. Los SVG correspondientes conservan las fuentes
vectoriales. Los píxeles visibles de ambas capas adaptativas están dentro del
círculo central de diámetro 66/108 del lienzo, comprobado durante la preparación.

Para volver a exportar, con Chrome instalado:

```powershell
node scripts/export-branding.cjs
```

El script usa Chrome sin ventana para rasterizar SVG, con un perfil aislado en
`.tmp/branding-chrome/`. Si Chrome está en otra ubicación, definir `CHROME_PATH`
con la ruta de su ejecutable. No utiliza el perfil personal del navegador.
Ni Chrome ni el script son necesarios para EAS Build: los PNG ya están incluidos.

Los recursos azules originales de la plantilla se conservaron en `assets/` como
archivos anteriores; `app.json` utiliza estas nuevas exportaciones para Android.
El splash nativo es el arranque del sistema, previo a `SplashScreen.js`; no sustituye
la pantalla diseñada en Figma. Su resultado final debe revisarse en el APK real.
