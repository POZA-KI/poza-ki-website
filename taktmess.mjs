/**
 * Beweist den Herzschlag am Bild, nicht am Code: Es werden ~40 Ausschnitte des
 * Kerns mit Zeitstempel aufgenommen, die mittlere Helligkeit berechnet und die
 * Abstaende der Helligkeitsspitzen bestimmt. Erwartet: ~2,0 s.
 */
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import fs from 'node:fs';

const b = await chromium.launch({ headless: false, args: ['--use-gl=angle'] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
await page.mouse.move(700, 450);
// Bis zur Mitte der Constellation scrollen — dort steht die Buehne gepinnt.
await page.evaluate(() => { const el = document.querySelector('.kon'); window.scrollTo(0, el.offsetTop + el.offsetHeight * 0.55); });
await page.waitForTimeout(1200);
await page.waitForTimeout(2500);

const box = await page.locator('.kon__buehne').boundingBox();
const kern = { x: Math.round(box.x + box.width / 2 - 40), y: Math.round(box.y + box.height / 2 - 40), width: 80, height: 80 };

const proben = [];
for (let i = 0; i < 46; i++) {
  const t = await page.evaluate(() => performance.now());
  const buf = await page.screenshot({ clip: kern });
  const png = PNG.sync.read(buf);
  let summe = 0;
  for (let k = 0; k < png.data.length; k += 4) summe += png.data[k] + png.data[k + 1] + png.data[k + 2];
  proben.push({ t: t / 1000, h: summe / (png.data.length / 4) / 3 });
  await page.waitForTimeout(40);
}
await b.close();

const h = proben.map((p) => p.h);
const min = Math.min(...h), max = Math.max(...h);
const spitzen = [];
for (let i = 1; i < proben.length - 1; i++) {
  if (h[i] > h[i - 1] && h[i] >= h[i + 1] && h[i] > min + (max - min) * 0.45) spitzen.push(proben[i].t);
}
const abstaende = spitzen.slice(1).map((t, i) => +(t - spitzen[i]).toFixed(2));
console.log('Dauer der Aufnahme:', (proben.at(-1).t - proben[0].t).toFixed(1), 's über', proben.length, 'Proben');
console.log('Helligkeit min/max:', min.toFixed(1), '/', max.toFixed(1), '— Hub', (max - min).toFixed(1));
console.log('Spitzen bei (s):', spitzen.map((t) => (t - proben[0].t).toFixed(2)).join(', '));
console.log('Abstaende (s):', abstaende.join(', '));
fs.writeFileSync('/tmp/perf/takt-proben.json', JSON.stringify(proben, null, 1));
