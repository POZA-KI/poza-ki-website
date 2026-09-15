/**
 * Findet tote Flaechen im Mobile-Viewport.
 *
 * Gemessen wird das, worueber sich beschwert wurde: zusammenhaengende
 * Bildschirmbereiche ohne sichtbaren Inhalt. Dazu wird die Seite in Schritten
 * gescrollt, jeder Viewport aufgenommen und pro Bildzeile die maximale
 * Helligkeit bestimmt. Eine Zeile gilt als leer, wenn selbst ihr hellster
 * Pixel kaum ueber dem Seitengrund liegt.
 *
 * Grenze: kein leerer Lauf laenger als 25 % der Viewporthoehe.
 */
import { chromium, devices } from 'playwright';
import { PNG } from 'pngjs';

const ZIEL = process.env.URL || 'http://localhost:3002';
const SCHRITT = Number(process.env.SCHRITT || 400);
const GRENZE = 0.25;              // Anteil der Viewporthoehe
/* Kalibriert am echten Rendering (kalib.mjs):
     Seitengrund      max  27
     Grid/Deko        max ~96
     echter Inhalt    max 289-703
   150 trennt Deko von Inhalt sauber — und das ist genau die Unterscheidung,
   um die es geht: eine Flaeche, in der nur das kaum sichtbare Raster steht,
   ist fuer den Betrachter leer. */
const HELL_SCHWELLE = 150;

const b = await chromium.launch();
const ctx = await b.newContext({
  ...devices['iPhone 13'], viewport: { width: 390, height: 844 },
  hasTouch: true, isMobile: true, deviceScaleFactor: 1,
});
const p = await ctx.newPage();
await p.goto(ZIEL, { waitUntil: 'networkidle' });
await p.waitForTimeout(4000);

const hoehe = await p.evaluate(() => document.documentElement.scrollHeight);
const vh = 844;
const grenzePx = Math.round(vh * GRENZE);

/** Welche Sektion steht an dieser Scrollposition im Bild? */
async function sektionBei() {
  return p.evaluate(() => {
    const mitte = window.innerHeight / 2;
    const el = document.elementFromPoint(195, mitte);
    const sek = el?.closest('section,[id]');
    return sek?.id || sek?.className?.toString().split(' ')[0] || '—';
  });
}

const befunde = [];
let maxLauf = 0;
let ueberlaufMax = 0;

for (let y = 0; y < hoehe - vh; y += SCHRITT) {
  await p.evaluate((v) => window.scrollTo(0, v), y);
  // Lenis animiert: warten, bis die Position steht
  let letzte = -1;
  for (let i = 0; i < 25; i++) {
    await p.waitForTimeout(120);
    const jetzt = await p.evaluate(() => Math.round(window.scrollY));
    if (jetzt === letzte) break;
    letzte = jetzt;
  }
  await p.waitForTimeout(650);

  ueberlaufMax = Math.max(ueberlaufMax, await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth));

  const png = PNG.sync.read(await p.screenshot());
  const zeileHell = new Uint8Array(png.height);
  for (let ry = 0; ry < png.height; ry++) {
    let best = 0;
    for (let rx = 0; rx < png.width; rx += 2) {
      const i = (ry * png.width + rx) * 4;
      const l = png.data[i] + png.data[i + 1] + png.data[i + 2];
      if (l > best) best = l;
    }
    zeileHell[ry] = best > HELL_SCHWELLE ? 1 : 0;
  }
  // laengster leerer Lauf in diesem Viewport
  let lauf = 0, best = 0, bestStart = 0, start = 0;
  for (let ry = 0; ry < zeileHell.length; ry++) {
    if (zeileHell[ry] === 0) { if (lauf === 0) start = ry; lauf++; if (lauf > best) { best = lauf; bestStart = start; } }
    else lauf = 0;
  }
  maxLauf = Math.max(maxLauf, best);
  if (best > grenzePx) {
    befunde.push({ scrollY: letzte, sektion: await sektionBei(), leerPx: best, leerVh: +(best / vh * 100).toFixed(0), ab: bestStart });
  }
}

await b.close();

console.log(`Seitenhoehe ${hoehe} px · Viewport ${vh} px · Grenze ${grenzePx} px (25 vh)`);
console.log(`Groesster leerer Lauf: ${maxLauf} px (${(maxLauf / vh * 100).toFixed(0)} vh)`);
console.log(`Horizontaler Ueberlauf: ${ueberlaufMax} px`);
if (befunde.length === 0) {
  console.log('LUECKEN: GRÜN — keine tote Flaeche ueber 25 vh');
} else {
  console.log(`LUECKEN: ${befunde.length} Stelle(n) ueber der Grenze:`);
  for (const f of befunde) console.log(`  bei y=${String(f.scrollY).padStart(6)}  ${String(f.sektion).padEnd(14)} ${String(f.leerPx).padStart(4)} px = ${f.leerVh} vh`);
}
process.exit(befunde.length === 0 ? 0 : 1);
