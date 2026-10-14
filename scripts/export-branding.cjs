// Exportación determinista del GameLogo existente. No modifica ilustraciones ni pantallas.
// Usa Chrome instalado como renderizador de SVG; no es una dependencia de la aplicación.
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { pathToFileURL } = require('node:url');

const project = path.resolve(__dirname, '..');
const output = path.join(project, 'assets', 'branding');
const profile = path.join(project, '.tmp', 'branding-chrome');
const chrome = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
fs.mkdirSync(output, { recursive: true });
fs.mkdirSync(profile, { recursive: true });
if (!fs.existsSync(chrome)) throw new Error('Configura CHROME_PATH para exportar los recursos. Los PNG ya exportados permiten compilar sin Chrome.');

// Mismas formas y colores de src/components/Illustrations.js, función GameLogo.
const logo = `<defs><linearGradient id="logo" x1="8" y1="5" x2="44" y2="47">
  <stop stop-color="#43B85A"/><stop offset="1" stop-color="#176B36"/>
</linearGradient></defs>
<rect x="2" y="2" width="48" height="48" rx="16" fill="url(#logo)"/>
<path d="M14 38h24M18 38V13h15M33 13v7" fill="none" stroke="white" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="33" cy="25" r="5" fill="none" stroke="#DDF5DF" stroke-width="2.8"/>
<path d="M33 30v7m0-4-4 3m4-3 4 3" fill="none" stroke="#DDF5DF" stroke-width="2.8" stroke-linecap="round"/>
<circle cx="14" cy="13" r="2.2" fill="#F7D34A"/>`;
const monochrome = `<path d="M14 38h24M18 38V13h15M33 13v7" fill="none" stroke="white" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="33" cy="25" r="5" fill="none" stroke="white" stroke-width="2.8"/>
<path d="M33 30v7m0-4-4 3m4-3 4 3" fill="none" stroke="white" stroke-width="2.8" stroke-linecap="round"/>
<circle cx="14" cy="13" r="2.2" fill="white"/>`;

// Las capas adaptativas centran la marca dentro de la zona segura de Android.
const variants = [
  { name: 'icon', scale: 0.86, background: '#F7FCF8', art: logo },
  { name: 'adaptive-foreground', scale: 0.56, art: logo },
  { name: 'adaptive-monochrome', scale: 0.78, art: monochrome },
  { name: 'splash', scale: 1, art: logo },
];
for (const { name, scale, background, art } of variants) {
  const offset = 26 * (1 - scale);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 52 52">
${background ? `<rect width="52" height="52" fill="${background}"/>` : ''}
<g transform="translate(${offset} ${offset}) scale(${scale})">${art}</g></svg>\n`;
  const source = path.join(output, `${name}.svg`);
  const target = path.join(output, `${name}.png`);
  fs.writeFileSync(source, svg);
  const result = spawnSync(chrome, [
    '--headless', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    '--disable-background-networking', '--disable-extensions', '--hide-scrollbars',
    '--force-device-scale-factor=1', '--window-size=1024,1024',
    '--default-background-color=00000000', `--user-data-dir=${profile}`,
    `--screenshot=${target}`, pathToFileURL(source).href,
  ], { windowsHide: true, encoding: 'utf8', timeout: 30000 });
  if (result.error || result.status !== 0 || !fs.existsSync(target)) {
    throw new Error(`No se pudo exportar ${name}: ${result.error?.message || result.stderr}`);
  }
  console.log(`Exportado assets/branding/${name}.png`);
}
