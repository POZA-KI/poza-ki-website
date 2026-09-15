/**
 * Volle Mobile-Abnahme: Screenshot jeder Sektion, kompletter Scroll-Durchlauf
 * als Video, plus die harten Pruefungen (Luecken, Ueberlauf, Lesbarkeit).
 */
import { chromium, devices } from 'playwright';
import { PNG } from 'pngjs';
import fs from 'node:fs';

const ZIEL = process.env.URL || 'http://localhost:3002';
const AUS = process.env.AUS || '/tmp/perf/mobil';
fs.rmSync(AUS, { recursive: true, force: true });
fs.mkdirSync(`${AUS}/video`, { recursive: true });

const SEKTIONEN = [
  ['00-hero', null],
  ['01-position', 'position'], ['02-leistungen', 'leistungen'],
  ['03-systeme', 'systeme'], ['04-case', 'case'],
  ['05-produkte', 'produkte'], ['06-vorgehen', 'vorgehen'],
  ['07-gruender', 'gruender'], ['08-kontakt', 'kontakt'],
];

const b = await chromium.launch();
const ctx = await b.newContext({
  ...devices['iPhone 13'], viewport: { width: 390, height: 844 },
  hasTouch: true, isMobile: true, deviceScaleFactor: 2,
  recordVideo: { dir: `${AUS}/video`, size: { width: 390, height: 844 } },
});
const p = await ctx.newPage();
const log = [];
p.on('pageerror', (e) => log.push('pageerror: ' + e));
p.on('console', (m) => { if (m.type() === 'error') log.push('console: ' + m.text().slice(0, 120)); });
await p.goto(ZIEL, { waitUntil: 'networkidle' });
await p.waitForTimeout(4500);

async function ruhe() {
  let letzte = -1;
  for (let i = 0; i < 30; i++) {
    await p.waitForTimeout(120);
    const j = await p.evaluate(() => Math.round(window.scrollY));
    if (j === letzte) break;
    letzte = j;
  }
  await p.waitForTimeout(900);
  return letzte;
}

// ---------- Screenshots je Sektion ----------
const hoehen = [];
for (const [name, id] of SEKTIONEN) {
  if (id === null) {
    await p.evaluate(() => window.scrollTo(0, 0));
  } else {
    await p.evaluate((i) => {
      const el = document.getElementById(i);
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 8);
    }, id);
  }
  await ruhe();
  await p.screenshot({ path: `${AUS}/${name}.png` });
  if (id) {
    hoehen.push({
      name,
      px: await p.evaluate((i) => document.getElementById(i).offsetHeight, id),
    });
  }
}

// ---------- Lesbarkeit aller Ueberschriften ----------
await p.evaluate(() => window.scrollTo(0, 0));
await ruhe();
const schrift = await p.evaluate(() => {
  const raus = [];
  for (const el of document.querySelectorAll('h1,h2,h3')) {
    const r = el.getBoundingClientRect();
    if (r.width < 40) continue;
    const cs = getComputedStyle(el);
    raus.push({
      t: (el.textContent || '').trim().slice(0, 26),
      op: +cs.opacity,
      groesse: Math.round(parseFloat(cs.fontSize)),
      breiter: Math.round(r.width) > window.innerWidth + 1,
      blur: cs.filter !== 'none',
      /* Ueberschriften mit .label sind gestalterisch Microlabels
         (versal, weites Tracking) — fuer die gilt die Mindestgroesse
         fuer Fliesstext nicht. */
      mikro: el.classList.contains('label'),
    });
  }
  return raus;
});
const schlecht = schrift.filter((h) => h.op < 0.9 || h.breiter || h.blur || (h.groesse < 14 && !h.mikro));

// ---------- Kompletter Scroll-Durchlauf fuers Video ----------
const gesamt = await p.evaluate(() => document.documentElement.scrollHeight);
const cdp = await ctx.newCDPSession(p);
await p.evaluate(() => window.scrollTo(0, 0));
await p.waitForTimeout(1200);
let y = 0;
while (y < gesamt - 844) {
  await cdp.send('Input.synthesizeScrollGesture', {
    x: 195, y: 620, xDistance: 0, yDistance: -560,
    gestureSourceType: 'touch', speed: 1600, preventFling: true,
  });
  y += 560;
  await p.waitForTimeout(130);
}
await p.waitForTimeout(1500);

const ueberlauf = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
await ctx.close();
const video = fs.readdirSync(`${AUS}/video`).map((f) => `${AUS}/video/${f}`);
await b.close();

console.log('Sektionshoehen (Viewports à 844 px):');
for (const h of hoehen) console.log(`  ${h.name.padEnd(14)} ${String(h.px).padStart(5)} px  ${(h.px / 844).toFixed(1)} vh`);
console.log('\nSeitenhoehe gesamt:', gesamt, 'px');
console.log('Horizontaler Ueberlauf:', ueberlauf, 'px');
console.log('Ueberschriften geprueft:', schrift.length, '· problematisch:', schlecht.length ? JSON.stringify(schlecht) : 'keine');
console.log('Konsole:', log.length ? log.slice(0, 4) : 'sauber');
console.log('Screenshots:', AUS);
console.log('VIDEO:', video.join(' '));
