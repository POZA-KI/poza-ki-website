/**
 * Prueft, dass jede 3D-Sektion ihre Szene wirklich mountet und Pixel liefert.
 *
 * Wichtig: Lenis faengt window.scrollTo ab und animiert. Ein fester Timeout
 * trifft die Zielposition deshalb nicht — es wird gewartet, bis die Position
 * steht.
 */
import { chromium } from 'playwright';
import { PNG } from 'pngjs';

const ZIEL = process.env.URL || 'http://localhost:3002';

async function scrolleUndWarte(page, sel, anteil) {
  await page.evaluate(([s, a]) => {
    const el = document.querySelector(s);
    // offsetTop waere relativ zum positionierten Vorfahren — hier braucht es
    // die absolute Seitenposition.
    const oben = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, oben + el.offsetHeight * a);
  }, [sel, anteil]);
  let letzte = -1;
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(160);
    const y = await page.evaluate(() => Math.round(window.scrollY));
    if (y === letzte) break;
    letzte = y;
  }
  await page.waitForTimeout(2200);
}

const b = await chromium.launch({ headless: false, args: ['--use-gl=angle'] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const log = [];
p.on('pageerror', (e) => log.push('pageerror: ' + e));
p.on('console', (m) => { if (m.type() === 'error') log.push('console: ' + m.text().slice(0, 140)); });
await p.goto(ZIEL, { waitUntil: 'networkidle' });
await p.waitForTimeout(4000);

let fehler = 0;
for (const [name, sel, anteil] of [['gallery', '.gal', 0.1], ['blueprint', '.bp', 0.5], ['constellation', '.kon', 0.5]]) {
  if (!(await p.evaluate((s) => !!document.querySelector(s), sel))) {
    console.log(name.padEnd(14), 'Element fehlt (Fallback aktiv)'); fehler++; continue;
  }
  await scrolleUndWarte(p, sel, anteil);
  const d = await p.evaluate((s) => {
    const el = document.querySelector(s);
    const cv = el.querySelector('canvas');
    const r = el.getBoundingClientRect();
    return { canvas: !!cv, puffer: cv ? cv.width + 'x' + cv.height : '-', imBild: r.top < window.innerHeight && r.bottom > 0 };
  }, sel);
  // Anteil nicht-schwarzer Pixel in der Buehnenmitte
  const png = PNG.sync.read(await p.screenshot({ clip: { x: 300, y: 180, width: 840, height: 540 } }));
  let hell = 0, ges = 0;
  for (let i = 0; i < png.data.length; i += 16) { ges++; if (png.data[i] + png.data[i + 1] + png.data[i + 2] > 42) hell++; }
  const anteilHell = ((hell / ges) * 100).toFixed(1);
  const ok = d.canvas && +anteilHell > 1.5;
  console.log(name.padEnd(14), ok ? 'OK ' : 'FEHLER', '| Canvas', d.canvas ? d.puffer : 'FEHLT', '| im Bild', d.imBild, '| Pixel mit Inhalt', anteilHell + ' %');
  if (!ok) fehler++;
  await p.screenshot({ path: `/tmp/perf/szene-${name}.png` });
}
console.log('log:', log.slice(0, 5));
console.log(fehler === 0 ? 'SZENEN: GRÜN' : `SZENEN: ${fehler} Befund(e)`);
await b.close();
process.exit(fehler === 0 ? 0 : 1);
