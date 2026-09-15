/** Nimmt die Constellation im Leerlauf + beim Scrollen + beim Ziehen auf. */
import { chromium } from 'playwright';
import fs from 'node:fs';
const AUS = '/tmp/perf/constellation';
fs.mkdirSync(AUS, { recursive: true });

const b = await chromium.launch({ headless: false, args: ['--use-gl=angle'] });
const ctx = await b.newContext({
  viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2,
  recordVideo: { dir: AUS, size: { width: 1440, height: 900 } },
});
const page = await ctx.newPage();
const fehler = [];
page.on('pageerror', (e) => fehler.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') fehler.push(m.text()); });
await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);

// zur Constellation scrollen
await page.mouse.move(700, 450);
await page.evaluate(() => { const el = document.querySelector('.kon'); window.scrollTo(0, el.offsetTop + el.offsetHeight * 0.55); });
await page.waitForTimeout(1200);
await page.waitForTimeout(1500);

// Messung: Orbitwinkel ueber 6 s -> Umlaufdauer
function starteMessung() {
  window.__frames = []; window.__lastT = performance.now();
  const tick = (t) => { window.__frames.push(t - window.__lastT); window.__lastT = t; window.__raf = requestAnimationFrame(tick); };
  window.__raf = requestAnimationFrame(tick);
}
await page.evaluate(starteMessung);

// LEERLAUF 8 s
await page.waitForTimeout(8000);
await page.screenshot({ path: `${AUS}/idle.png` });

// SCROLL-SCHUB
for (let i = 0; i < 6; i++) { await page.mouse.wheel(0, 420); await page.waitForTimeout(60); }
await page.waitForTimeout(2500);

// ZIEHEN mit Schwung
const box = await page.locator('.kon__buehne').boundingBox();
await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.5);
await page.mouse.down();
await page.mouse.move(box.x + box.width * 0.75, box.y + box.height * 0.5, { steps: 8 });
await page.mouse.up();
await page.waitForTimeout(3500);
await page.screenshot({ path: `${AUS}/nach-zug.png` });

// FOKUS: Panel anklicken -> Orbit soll fast stehen
await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.45);
await page.waitForTimeout(3000);
await page.screenshot({ path: `${AUS}/fokus.png` });

const mess = await page.evaluate(() => {
  cancelAnimationFrame(window.__raf);
  const f = window.__frames.slice(5).filter((d) => d > 0 && d < 2000);
  const fps = f.map((d) => 1000 / d).sort((a, b) => a - b);
  const q = (p) => fps[Math.min(fps.length - 1, Math.floor(p * fps.length))];
  const summe = f.reduce((a, b) => a + b, 0);
  return { mittel: +(1000 / (summe / f.length)).toFixed(1), p1: +q(0.01).toFixed(1), ueber33ms: f.filter((d) => d > 33).length, frames: f.length };
});
console.log('FPS', mess, 'fehler', fehler.slice(0, 5));
await ctx.close();
console.log('VIDEO', fs.readdirSync(AUS).filter(f => f.endsWith('.webm')).map(f => `${AUS}/${f}`).join(' '));
await b.close();
