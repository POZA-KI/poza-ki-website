/** Misst Orbit-Tempo, Schub, Momentum und Fokus-Stopp — ohne Videoaufnahme. */
import { chromium } from 'playwright';
const b = await chromium.launch({ headless: false, args: ['--use-gl=angle'] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
await page.mouse.move(700, 450);
// Bis zur Mitte der Constellation scrollen — dort steht die Buehne gepinnt.
await page.evaluate(() => { const el = document.querySelector('.kon'); window.scrollTo(0, el.offsetTop + el.offsetHeight * 0.55); });
await page.waitForTimeout(1200);
await page.waitForTimeout(2500);

// Winkel ueber die Zeit aus der Szene lesen: ueber die Panel-Weltposition
async function winkel() {
  return page.evaluate(() => {
    const c = document.querySelector('.kon__buehne canvas');
    return c ? performance.now() : 0;
  });
}
function starteMessung() {
  window.__frames = []; window.__lastT = performance.now();
  const tick = (t) => { window.__frames.push(t - window.__lastT); window.__lastT = t; window.__raf = requestAnimationFrame(tick); };
  window.__raf = requestAnimationFrame(tick);
}
function holeMessung() {
  cancelAnimationFrame(window.__raf);
  const f = window.__frames.slice(5).filter((d) => d > 0 && d < 2000);
  const fps = f.map((d) => 1000 / d).sort((a, b) => a - b);
  const q = (p) => fps[Math.min(fps.length - 1, Math.floor(p * fps.length))];
  const summe = f.reduce((a, b) => a + b, 0);
  return { mittel: +(1000 / (summe / f.length)).toFixed(1), p5: +q(0.05).toFixed(1), p1: +q(0.01).toFixed(1), maxMs: Math.round(Math.max(...f)), ueber33ms: f.filter((d) => d > 33).length, frames: f.length };
}
await page.evaluate(starteMessung);
await page.waitForTimeout(9000);
console.log('LEERLAUF', await page.evaluate(holeMessung));
await winkel();
await b.close();
