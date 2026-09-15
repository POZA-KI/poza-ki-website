import { chromium } from 'playwright';
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
await page.waitForTimeout(4000);

// Die Maler direkt im Browser gegen ein Testcanvas laufen lassen und
// Textbreiten gegen die Boxbreiten pruefen.
const r = await page.evaluate(async () => {
  const c = document.createElement('canvas');
  c.width = 800; c.height = 500;
  const ctx = c.getContext('2d');
  const RAND = 40, LUECKE = 22, SPALTEN = 3, INNEN = 18;
  const BOX = Math.floor((800 - RAND * 2 - LUECKE * (SPALTEN - 1)) / SPALTEN);
  const NUTZ = BOX - INNEN * 2;
  const werte = ['1240/Tag', '94%', '17'];
  const labels = ['DURCHSATZ', 'AUTOMATISIERT', 'AUSNAHMEN'];
  const out = [];
  // exakt die Logik aus passeEin nachbilden
  const fit = (text, max, start, min, fam, gew) => {
    let g = start;
    while (g > min) { ctx.font = `${gew} ${g}px ${fam}`; if (ctx.measureText(text).width <= max) return g; g--; }
    ctx.font = `${gew} ${min}px ${fam}`; return min;
  };
  werte.forEach((v, i) => {
    const g = fit(v, NUTZ, 44, 20, '"IBM Plex Mono", monospace', '400');
    out.push({ box: 'wert', text: v, groesse: g, breite: Math.round(ctx.measureText(v).width), nutz: NUTZ, passt: ctx.measureText(v).width <= NUTZ });
  });
  labels.forEach((l) => {
    const g = fit(l, NUTZ, 12, 9, '"IBM Plex Mono", monospace', '500');
    out.push({ box: 'label', text: l, groesse: g, breite: Math.round(ctx.measureText(l).width), nutz: NUTZ, passt: ctx.measureText(l).width <= NUTZ });
  });
  return { BOX, NUTZ, out };
});
console.log(JSON.stringify(r, null, 1));

// Safe-Zone: ragt die Buehne unter die Seiten-Nav?
await page.evaluate(() => {
  const el = document.getElementById('systeme');
  window.scrollTo(0, el.offsetTop + (el.offsetHeight - window.innerHeight) * 0.4);
});
await page.waitForTimeout(2500);
const zone = await page.evaluate(() => {
  const bu = document.querySelector('.gal__buehne')?.getBoundingClientRect();
  const nav = document.querySelector('.pnav')?.getBoundingClientRect();
  return {
    buehneRechts: bu ? Math.round(bu.right) : null,
    navLinks: nav ? Math.round(nav.left) : null,
    ueberlappung: bu && nav ? Math.round(bu.right - nav.left) : null,
  };
});
console.log(JSON.stringify(zone));
await b.close();
