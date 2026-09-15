import { chromium } from 'playwright';

const SEKTIONEN = [
  ['01-position', 'position'],
  ['02-leistungen', 'leistungen'],
  ['03-systeme', 'systeme'],
  ['04-case', 'case'],
  ['05-produkte', 'produkte'],
  ['06-vorgehen', 'vorgehen'],
  ['07-gruender', 'gruender'],
  ['08-kontakt', 'kontakt'],
];
const MARKEN = [0.3, 0.7];

const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(process.env.URL || 'http://localhost:3002', { waitUntil: 'networkidle' });
await page.waitForTimeout(5000);

const bericht = [];

// Hero separat
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(2000);
await page.screenshot({ path: '/tmp/shots/00-hero.png' });

for (const [name, id] of SEKTIONEN) {
  for (const m of MARKEN) {
    await page.evaluate(([i, f]) => {
      const el = document.getElementById(i);
      if (!el) return;
      window.scrollTo(0, el.offsetTop + (el.offsetHeight - window.innerHeight) * f);
    }, [id, m]);
    await page.waitForTimeout(2300);
    const datei = `/tmp/shots/${name}-${Math.round(m * 100)}.png`;
    await page.screenshot({ path: datei });

    const pruef = await page.evaluate(() => {
      const sichtbar = (el) => {
        const r = el.getBoundingClientRect();
        return r.top < window.innerHeight && r.bottom > 0 && r.width > 40;
      };
      const ueber = [];
      for (const el of document.querySelectorAll('h1,h2,h3')) {
        if (!sichtbar(el)) continue;
        const cs = getComputedStyle(el);
        ueber.push({
          t: (el.textContent || '').trim().slice(0, 30),
          op: +cs.opacity,
          farbe: cs.color,
          blur: cs.filter !== 'none' ? cs.filter : '-',
        });
      }
      return ueber;
    });

    const schwach = pruef.filter((u) => u.op < 0.95 || u.blur !== '-');
    bericht.push({
      ansicht: `${name} @${Math.round(m * 100)}%`,
      ueberschriften: pruef.length,
      problematisch: schwach.length ? schwach : 'keine',
    });
  }
}

// --- Statement: drei Phasen ---
for (const f of [0.2, 0.5, 0.85]) {
  await page.evaluate((ff) => {
    const el = document.querySelector('.bp');
    if (!el) return;
    window.scrollTo(0, el.offsetTop + (el.offsetHeight - window.innerHeight) * ff);
  }, f);
  await page.waitForTimeout(2400);
  await page.screenshot({ path: `/tmp/shots/B-${Math.round(f * 100)}.png` });
  const s = await page.evaluate(() => ({
    phase: document.querySelector('.bp__phase')?.textContent?.trim() ?? '-',
    zeilen: [...document.querySelectorAll('.bp__satz .ln__i')]
      .filter((e) => ['none', 'matrix(1, 0, 0, 1, 0, 0)'].includes(getComputedStyle(e).transform))
      .map((e) => e.textContent),
  }));
  bericht.push({ ansicht: `statement @${Math.round(f * 100)}%`, ueberschriften: s.zeilen.length,
    problematisch: 'keine', extra: s });
}

// --- Produkte: Orbit und Fokuszustand ---
await page.evaluate(() => {
  const el = document.querySelector('.kon');
  if (el) window.scrollTo(0, el.offsetTop + (el.offsetHeight - window.innerHeight) * 0.75);
});
await page.waitForTimeout(2800);
await page.screenshot({ path: '/tmp/shots/C-orbit.png' });
await page.evaluate(() => {
  const b = document.querySelectorAll('.kon__bar button')[1];
  if (b) b.click();
});
await page.waitForTimeout(2600);
await page.screenshot({ path: '/tmp/shots/C-fokus.png' });
const fok = await page.evaluate(() => document.querySelector('.kon__titel')?.textContent ?? '-');
bericht.push({ ansicht: 'produkte fokus', ueberschriften: 1, problematisch: 'keine', extra: { titel: fok } });

await b.close();
console.log(JSON.stringify(bericht, null, 1));
