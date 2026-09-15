/** Idle-Video der Constellation: Herzschlag, Impulse, Orbit, Zug, Fokus. */
import { chromium } from 'playwright';
import fs from 'node:fs';
const AUS = '/tmp/perf/constellation-idle';
fs.rmSync(AUS, { recursive: true, force: true });
fs.mkdirSync(AUS, { recursive: true });

const b = await chromium.launch({ headless: false, args: ['--use-gl=angle'] });
const ctx = await b.newContext({
  viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1,
  recordVideo: { dir: AUS, size: { width: 1440, height: 900 } },
});
const page = await ctx.newPage();
const fehler = [];
page.on('pageerror', (e) => fehler.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') fehler.push(m.text()); });

await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
// Cursor aus dem Bild nehmen, damit er das Video nicht dominiert
await page.mouse.move(20, 880);
await page.evaluate(() => { const el = document.querySelector('.kon'); window.scrollTo(0, el.offsetTop + el.offsetHeight * 0.55); });
await page.waitForTimeout(2500);

// 1) Leerlauf: sechs Herzschlaege, drei volle Impulsrunden
await page.waitForTimeout(13000);

// 2) Zug mit Schwung, danach Ausrollen
const box = await page.locator('.kon__buehne').boundingBox();
const zy = box.y + box.height * 0.24;
await page.mouse.move(box.x + box.width * 0.30, zy);
await page.mouse.down();
for (let i = 1; i <= 8; i++) { await page.mouse.move(box.x + box.width * (0.30 + 0.05 * i), zy); await page.waitForTimeout(16); }
await page.mouse.up();
await page.mouse.move(20, 880);
await page.waitForTimeout(7000);

// 3) Fokus: Panel anklicken, Orbit steht, Kamera faehrt heran
for (const [fx, fy] of [[0.5, 0.5], [0.54, 0.5], [0.46, 0.5], [0.5, 0.46]]) {
  await page.mouse.click(box.x + box.width * fx, box.y + box.height * fy);
  await page.waitForTimeout(800);
  const f = await page.evaluate(() => document.querySelector('.kon__micro')?.textContent || '');
  if (f.includes('fokus')) break;
}
await page.mouse.move(20, 880);
await page.waitForTimeout(6000);

await ctx.close();
console.log('fehler:', fehler.slice(0, 4));
console.log('VIDEO:', fs.readdirSync(AUS).map((f) => `${AUS}/${f}`).join(' '));
await b.close();
