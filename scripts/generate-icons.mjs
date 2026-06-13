/**
 * Generates the Quran Academy app icons from the brand SVG.
 * Run from the project root:
 *
 *   node scripts/generate-icons.mjs
 *
 * Outputs:
 *   src/assets/images/icon.png                       (1024x1024 — iOS + base)
 *   src/assets/images/android-icon-foreground.png    (1024x1024 — adaptive fg)
 *   src/assets/images/android-icon-monochrome.png    (1024x1024 — themed icon)
 *   src/assets/images/splash-icon.png                (1024x1024 — splash logo)
 *   src/assets/images/favicon.png                    (48x48     — web favicon)
 */
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS = join(__dirname, '..', 'src', 'assets', 'images');

const EMERALD = '#0FA678';
const WHITE = '#FFFFFF';

// Material Design "menu_book" filled-style path (24×24 viewBox).
const BOOK_PATH =
  'M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z';

// Full app icon: emerald rounded square + white book centered (~600px on 1024 canvas)
const fullIcon = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" rx="220" fill="${EMERALD}"/>
  <g transform="translate(212, 212) scale(25)">
    <path fill="${WHITE}" d="${BOOK_PATH}"/>
  </g>
</svg>`;

// Android adaptive foreground: white book on transparent bg, sized for the safe zone (~500px book in 1024 canvas).
const foreground = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(262, 262) scale(20.83)">
    <path fill="${WHITE}" d="${BOOK_PATH}"/>
  </g>
</svg>`;

// Monochrome layer for Android themed icons. Pure white silhouette; the OS recolours it.
const monochrome = foreground;

// Splash logo: emerald book on transparent. Background colour comes from the splash plugin config.
const splash = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(212, 212) scale(25)">
    <path fill="${EMERALD}" d="${BOOK_PATH}"/>
  </g>
</svg>`;

const writeSvgPng = async (svg, file, size) => {
  const out = join(ASSETS, file);
  let pipeline = sharp(Buffer.from(svg)).png();
  if (size) pipeline = pipeline.resize(size, size);
  await pipeline.toFile(out);
  console.log(`  wrote ${file}`);
};

console.log('Generating icons →', ASSETS);
await writeSvgPng(fullIcon, 'icon.png');
await writeSvgPng(foreground, 'android-icon-foreground.png');
await writeSvgPng(monochrome, 'android-icon-monochrome.png');
await writeSvgPng(splash, 'splash-icon.png');
await writeSvgPng(fullIcon, 'favicon.png', 48);
console.log('Done.');
