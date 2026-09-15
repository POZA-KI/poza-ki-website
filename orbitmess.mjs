/**
 * Misst das Orbit-Tempo am Bild.
 *
 *  A) Sichtbarkeit: Bildunterschied zwischen zwei Aufnahmen im Abstand von
 *     1,5 s — beantwortet direkt "Bewegung innerhalb von 1-2 s erkennbar?"
 *  B) Winkelrate: horizontale Lage der hellsten Spalte folgt dem vorderen
 *     Panel; daraus die Umlaufdauer.
 *  C) Zustaende: Leerlauf, nach Scroll-Schub, nach Zug mit Schwung, im Fokus.
 */
import { chromium } from 'playwright';
import { PNG } from 'pngjs';

const b = await chromium.launch({ headless: false, args: ['--use-gl=angle'] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
await page.mouse.move(700, 450);
await page.evaluate(() => { const el = document.querySelector('.kon'); window.scrollTo(0, el.offsetTop + el.offsetHeight * 0.55); });
await page.waitForTimeout(2500);

const box = await page.locator('.kon__buehne').boundingBox();
const clip = { x: Math.round(box.x), y: Math.round(box.y + box.height * 0.18), width: Math.round(box.width), height: Math.round(box.height * 0.5) };

async function bild() {
  const t = await page.evaluate(() => performance.now());
  return { t: t / 1000, png: PNG.sync.read(await page.screenshot({ clip })) };
}
/** Spalten-Helligkeitsprofil, daraus die hellste Spalte. */
function hellsteSpalte(png) {
  const sp = new Float64Array(png.width);
  for (let y = 0; y < png.height; y += 2)
    for (let x = 0; x < png.width; x++) {
      const i = (y * png.width + x) * 4;
      sp[x] += png.data[i] + png.data[i + 1] + png.data[i + 2];
    }
  let best = 0, bx = 0;
  for (let x = 0; x < png.width; x++) if (sp[x] > best) { best = sp[x]; bx = x; }
  return bx;
}
function unterschied(a, b2) {
  let anders = 0, gesamt = 0;
  for (let i = 0; i < a.data.length; i += 8) {
    const d = Math.abs(a.data[i] - b2.data[i]) + Math.abs(a.data[i + 1] - b2.data[i + 1]) + Math.abs(a.data[i + 2] - b2.data[i + 2]);
    gesamt++;
    if (d > 24) anders++;
  }
  return +((anders / gesamt) * 100).toFixed(1);
}

async function pruefe(name, sekunden = 3) {
  const a = await bild();
  await page.waitForTimeout(1500);
  const m = await bild();
  await page.waitForTimeout((sekunden - 1.5) * 1000);
  const z = await bild();
  const dt = z.t - a.t;
  const dx = hellsteSpalte(z.png) - hellsteSpalte(a.png);
  console.log(
    name.padEnd(12),
    'Bildunterschied nach', (m.t - a.t).toFixed(2) + 's:', String(unterschied(a.png, m.png)).padStart(5) + ' % der Pixel',
    '| hellste Spalte wandert', String(Math.abs(dx)).padStart(4), 'px in', dt.toFixed(2) + 's',
  );
}

/** Immer zur selben Stelle zurueck: sonst misst man den Seitenscroll statt den Orbit. */
async function anker() {
  await page.evaluate(() => {
    const el = document.querySelector('.kon');
    window.scrollTo(0, el.offsetTop + el.offsetHeight * 0.55);
  });
  await page.waitForTimeout(2200);
}

await pruefe('LEERLAUF');
await anker();
// Kurzer Scroll INNERHALB der Sektion, dann sofort messen
for (let i = 0; i < 4; i++) { await page.mouse.wheel(0, 260); await page.waitForTimeout(50); }
await pruefe('SCROLL-SCHUB');
await anker();

// Zug UNTERHALB der Panels ansetzen, damit kein Klick auf ein Panel entsteht
const zy = box.y + box.height * 0.85;
await page.mouse.move(box.x + box.width * 0.28, zy);
await page.mouse.down();
await page.mouse.move(box.x + box.width * 0.72, zy, { steps: 6 });
await page.mouse.up();
await pruefe('ZUG-SCHWUNG');
await anker();

await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.4);
await page.waitForTimeout(3500);
await pruefe('FOKUS');
await b.close();
