/** Misst FPS abschnittsweise auf der echten GPU, ohne Videoaufnahme. */
import { chromium } from 'playwright';
import fs from 'node:fs';

const ZIEL = process.env.URL || 'http://localhost:3002';
const SEKTIONEN = ['position', 'leistungen', 'systeme', 'case', 'produkte', 'vorgehen', 'gruender', 'kontakt'];

function starteMessung() {
  window.__frames = []; window.__lastT = performance.now();
  const tick = (t) => { window.__frames.push(t - window.__lastT); window.__lastT = t; window.__raf = requestAnimationFrame(tick); };
  window.__raf = requestAnimationFrame(tick);
}
function holeMessung() {
  cancelAnimationFrame(window.__raf);
  const f = window.__frames.slice(3).filter((d) => d > 0 && d < 2000);
  const fps = f.map((d) => 1000 / d).sort((a, b) => a - b);
  const q = (p) => (fps.length ? fps[Math.min(fps.length - 1, Math.floor(p * fps.length))] : 0);
  const summe = f.reduce((a, b) => a + b, 0);
  return {
    mittel: +(f.length ? 1000 / (summe / f.length) : 0).toFixed(1),
    p5: +q(0.05).toFixed(1), p1: +q(0.01).toFixed(1),
    schlimmsteMs: +Math.max(0, ...f).toFixed(0),
    ueber33ms: f.filter((d) => d > 33).length,
    frames: f.length,
  };
}

const b = await chromium.launch({ headless: false, args: ['--use-gl=angle'] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto(ZIEL, { waitUntil: 'networkidle' });
await page.waitForTimeout(4000);
await page.mouse.move(720, 450);

const raus = {};
for (const id of SEKTIONEN) {
  await page.evaluate((i) => {
    const el = document.getElementById(i);
    if (el) window.scrollTo(0, Math.max(0, el.offsetTop - window.innerHeight * 0.6));
  }, id);
  await page.waitForTimeout(1800);
  const hoehe = await page.evaluate((i) => document.getElementById(i)?.offsetHeight ?? 0, id);
  const schritte = Math.max(8, Math.min(40, Math.round((hoehe + 900) / 620)));
  await page.evaluate(starteMessung);
  for (let s = 0; s < schritte; s++) { await page.mouse.wheel(0, 620); await page.waitForTimeout(60); }
  await page.waitForTimeout(300);
  raus[id] = { ...(await page.evaluate(holeMessung)), hoehe, schritte };
}
await b.close();
fs.writeFileSync('/tmp/perf/sektionen.json', JSON.stringify(raus, null, 2));
for (const [k, v] of Object.entries(raus)) {
  console.log(k.padEnd(12), 'mittel', String(v.mittel).padStart(5), ' p5', String(v.p5).padStart(5), ' p1', String(v.p1).padStart(5), ' max', String(v.schlimmsteMs).padStart(5) + 'ms', ' >33ms', v.ueber33ms, '/', v.frames);
}
