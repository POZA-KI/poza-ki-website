/**
 * Messharness fuer die Performance-Abnahme.
 *
 *   node perf.mjs            # Desktop + Mobile, Videos + FPS-Log
 *   node perf.mjs desktop    # nur Desktop
 *   node perf.mjs mobile     # nur Mobile
 *
 * Gemessen wird NICHT per Augenmass: ein In-Page-rAF-Zaehler protokolliert
 * jeden Frame-Abstand waehrend eines echten Wheel-/Touch-Scrolls ueber die
 * ganze Seite. Daraus: mittlere FPS, 1-%-Perzentil (die spuerbaren Aussetzer)
 * und die Zahl der Frames ueber 33 ms. Zusaetzlich zaehlt ein
 * PerformanceObserver die Long Tasks.
 */
import { chromium, devices } from 'playwright';
import fs from 'node:fs';

const ZIEL = process.env.URL || 'http://localhost:3002';
const AUS = '/tmp/perf';
const was = process.argv[2] || 'beide';

fs.mkdirSync(AUS, { recursive: true });
fs.mkdirSync(`${AUS}/mobile`, { recursive: true });

const SEKTIONEN = [
  ['01-position', 'position'], ['02-leistungen', 'leistungen'],
  ['03-systeme', 'systeme'], ['04-case', 'case'],
  ['05-produkte', 'produkte'], ['06-vorgehen', 'vorgehen'],
  ['07-gruender', 'gruender'], ['08-kontakt', 'kontakt'],
];

/* Die drei Messfunktionen laufen IN der Seite. Als echte Funktionen
   uebergeben, nicht als String — ein String-Ausdruck wird von Playwright nicht
   aufgerufen und liefert stillschweigend undefined. */

function starteMessung() {
  window.__frames = [];
  window.__long = 0;
  window.__lastT = performance.now();
  try {
    window.__po = new PerformanceObserver((l) => {
      for (const e of l.getEntries()) if (e.duration > 50) window.__long++;
    });
    window.__po.observe({ entryTypes: ['longtask'] });
  } catch { /* ohne longtask-Support einfach ohne */ }
  const tick = (t) => {
    window.__frames.push(t - window.__lastT);
    window.__lastT = t;
    window.__raf = requestAnimationFrame(tick);
  };
  window.__raf = requestAnimationFrame(tick);
}

function holeMessung() {
  cancelAnimationFrame(window.__raf);
  try { window.__po.disconnect(); } catch { /* s.o. */ }
  const f = window.__frames.slice(5).filter((d) => d > 0 && d < 2000);
  const fps = f.map((d) => 1000 / d).sort((a, b) => a - b);
  const q = (p) => (fps.length ? fps[Math.min(fps.length - 1, Math.floor(p * fps.length))] : 0);
  const summe = f.reduce((a, b) => a + b, 0);
  return {
    frames: f.length,
    sekunden: +(summe / 1000).toFixed(1),
    mittel: +(f.length ? 1000 / (summe / f.length) : 0).toFixed(1),
    p50: +q(0.5).toFixed(1),
    p5: +q(0.05).toFixed(1),
    p1: +q(0.01).toFixed(1),
    ueber33ms: f.filter((d) => d > 33).length,
    ueber50ms: f.filter((d) => d > 50).length,
    longTasks: window.__long,
  };
}

function layoutPruefung() {
  const klein = [...document.querySelectorAll('a,button,[role="button"]')]
    .filter((el) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return false;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none') return false;
      return r.height < 44 || r.width < 44;
    })
    .map((el) => ({
      t: (el.textContent || el.getAttribute('aria-label') || '?').trim().slice(0, 28),
      w: Math.round(el.getBoundingClientRect().width),
      h: Math.round(el.getBoundingClientRect().height),
      cls: el.className.toString().slice(0, 40),
    }));
  return {
    breiteDoc: document.documentElement.scrollWidth,
    breiteFenster: window.innerWidth,
    ueberlauf: document.documentElement.scrollWidth - window.innerWidth,
    zuKleineZiele: klein.length,
    zuKlein: klein.slice(0, 12),
  };
}

/** Scrollt die ganze Seite mit echten Wheel-Events (durch Lenis hindurch). */
async function scrolleDurch(page, schritte, delta, pause) {
  for (let i = 0; i < schritte; i++) {
    await page.mouse.wheel(0, delta);
    await page.waitForTimeout(pause);
  }
}

async function desktop() {
  // Headless nutzt SwiftShader (Software-GL) und rechnet obendrein mit DPR 1.
  // Mit ECHT=1 laeuft der Lauf sichtbar auf der GPU und mit Retina-DPR — das
  // ist der Wert, der fuer die Abnahme zaehlt.
  const echt = process.env.ECHT === '1';
  const b = await chromium.launch({
    headless: !echt,
    args: ['--use-gl=angle', '--enable-gpu-rasterization', '--ignore-gpu-blocklist'],
  });
  // Die Videoaufnahme kostet selbst Frames (gemessen: ~14 fps Differenz).
  // Fuer reine Messlaeufe mit OHNEVIDEO=1 abschalten, fuer den Beleg anlassen.
  const ohneVideo = process.env.OHNEVIDEO === '1';
  const ctx = await b.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: echt ? 2 : 1,
    ...(ohneVideo ? {} : { recordVideo: { dir: `${AUS}/video-desktop`, size: { width: 1440, height: 900 } } }),
  });
  const page = await ctx.newPage();
  const fehler = [];
  page.on('pageerror', (e) => fehler.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') fehler.push(m.text()); });

  await page.goto(ZIEL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);

  const layout = await page.evaluate(layoutPruefung);
  const gl = await page.evaluate(() => {
    const c = document.createElement('canvas');
    const g = c.getContext('webgl2') || c.getContext('webgl');
    const d = g && g.getExtension('WEBGL_debug_renderer_info');
    return {
      renderer: d ? g.getParameter(d.UNMASKED_RENDERER_WEBGL) : '?',
      dpr: window.devicePixelRatio,
      canvasPuffer: [...document.querySelectorAll('canvas')].map((c2) => `${c2.width}x${c2.height}`),
    };
  });

  await page.evaluate(starteMessung);
  await page.mouse.move(720, 450);
  await scrolleDurch(page, 170, 620, 60);   // ganze Seite runter
  await page.waitForTimeout(600);
  const runter = await page.evaluate(holeMessung);

  await page.evaluate(starteMessung);
  await scrolleDurch(page, 90, -900, 55);   // und wieder hoch
  const hoch = await page.evaluate(holeMessung);

  await page.waitForTimeout(500);
  await ctx.close();
  const video = ohneVideo ? [] : fs.readdirSync(`${AUS}/video-desktop`).map((f) => `${AUS}/video-desktop/${f}`);
  await b.close();
  return { gl, runter, hoch, layout, fehler: [...new Set(fehler)].slice(0, 8), video };
}

async function mobil() {
  const b = await chromium.launch();
  const ctx = await b.newContext({
    ...devices['iPhone 13'],
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    deviceScaleFactor: 3,
    recordVideo: { dir: `${AUS}/video-mobile`, size: { width: 390, height: 844 } },
  });
  const page = await ctx.newPage();
  const fehler = [];
  page.on('pageerror', (e) => fehler.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') fehler.push(m.text()); });

  await page.goto(ZIEL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);

  const layout = await page.evaluate(layoutPruefung);
  await page.screenshot({ path: `${AUS}/mobile/00-hero.png` });

  // Screenshots aller Sektionen
  const ueberlaeufe = [];
  for (const [name, id] of SEKTIONEN) {
    await page.evaluate((i) => {
      const el = document.getElementById(i);
      if (el) window.scrollTo(0, el.offsetTop + (el.offsetHeight - window.innerHeight) * 0.35);
    }, id);
    await page.waitForTimeout(1800);
    await page.screenshot({ path: `${AUS}/mobile/${name}.png` });
    ueberlaeufe.push({
      sektion: name,
      ueberlauf: await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth),
    });
  }

  // Touch-Scroll mit echten Touch-Gesten (ueber CDP, damit Lenis sie sieht)
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1200);
  const cdp = await ctx.newCDPSession(page);
  await page.evaluate(starteMessung);
  for (let i = 0; i < 22; i++) {
    await cdp.send('Input.synthesizeScrollGesture', {
      x: 195, y: 620, xDistance: 0, yDistance: -520,
      gestureSourceType: 'touch', speed: 1400, preventFling: true,
    });
    await page.waitForTimeout(150);
  }
  const swipe = await page.evaluate(holeMessung);

  await page.waitForTimeout(500);
  await ctx.close();
  const video = fs.readdirSync(`${AUS}/video-mobile`).map((f) => `${AUS}/video-mobile/${f}`);
  await b.close();
  return { swipe, layout, ueberlaeufe, fehler: [...new Set(fehler)].slice(0, 8), video };
}

const ergebnis = {};
if (was !== 'mobile') ergebnis.desktop = await desktop();
if (was !== 'desktop') ergebnis.mobil = await mobil();

fs.writeFileSync(`${AUS}/messwerte.json`, JSON.stringify(ergebnis, null, 2));
console.log(JSON.stringify(ergebnis, null, 2));
