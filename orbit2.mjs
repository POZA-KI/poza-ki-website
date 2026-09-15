/** Misst den Orbit direkt am Winkel (Seite mit ?mess=1). */
import { chromium } from 'playwright';
const b = await chromium.launch({ headless: false, args: ['--use-gl=angle'] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.goto('http://localhost:3002/?mess=1', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
await page.mouse.move(700, 450);
const anker = async () => {
  await page.evaluate(() => { const el = document.querySelector('.kon'); window.scrollTo(0, el.offsetTop + el.offsetHeight * 0.55); });
  await page.waitForTimeout(2500);
};
await anker();
const box = await page.locator('.kon__buehne').boundingBox();

const lese = () => page.evaluate(() => ({ ...window.__mess, t: performance.now() / 1000 }));

async function rate(name, sek = 3) {
  const a = await lese();
  await page.waitForTimeout(sek * 1000);
  const z = await lese();
  const dt = z.t - a.t;
  const dw = Math.abs(z.winkel - a.winkel);
  const w = dw / dt;                       // rad/s
  console.log(
    name.padEnd(14),
    'ω =', w.toFixed(3).padStart(6), 'rad/s',
    '| Umlauf', (w > 0.0005 ? (2 * Math.PI / w).toFixed(1) : '∞').padStart(7), 's',
    '| Schub', (z.schub ?? 0).toFixed(3),
    '| Schwung', (z.schwung ?? 0).toFixed(3),
    '| Fokus', z.fokus,
  );
  return w;
}

const idle = await rate('LEERLAUF', 4);

await anker();
// Klein genug, dass die Sektion im Bild bleibt — sonst pausiert die Szene und
// der Winkel steht still, waehrend der Schub noch im Puffer haengt.
for (let i = 0; i < 3; i++) { await page.mouse.wheel(0, 170); await page.waitForTimeout(45); }
const schub = await rate('SCROLL-SCHUB', 1.0);

await anker();
const zy = box.y + box.height * 0.24;
await page.mouse.move(box.x + box.width * 0.28, zy);
await page.mouse.down();
for (let i = 1; i <= 8; i++) { await page.mouse.move(box.x + box.width * (0.28 + 0.055 * i), zy); await page.waitForTimeout(16); }
await page.mouse.up();
console.log('direkt nach Loslassen:', JSON.stringify(await lese()));
const zug = await rate('ZUG-SCHWUNG', 1.2);
await page.waitForTimeout(4000);
await rate('NACH AUSROLLEN', 3);

await anker();
// Panel finden: mehrere Punkte probieren, bis das HUD den Fokus meldet
let getroffen = false;
for (const [fx, fy] of [[0.5, 0.5], [0.5, 0.46], [0.5, 0.55], [0.46, 0.5], [0.54, 0.5], [0.5, 0.42]]) {
  await page.mouse.click(box.x + box.width * fx, box.y + box.height * fy);
  await page.waitForTimeout(900);
  if ((await lese()).fokus >= 0) { getroffen = true; console.log('Panel getroffen bei', fx, fy); break; }
}
if (!getroffen) console.log('!! kein Panel getroffen');
await page.waitForTimeout(2000);
const fokus = await rate('IM FOKUS', 4);

console.log('\nSchub gegen Leerlauf:', (schub / idle).toFixed(1) + 'x  |  Zug gegen Leerlauf:', (zug / idle).toFixed(1) + 'x  |  Fokus gegen Leerlauf:', (fokus / idle * 100).toFixed(0) + ' %');
await b.close();
