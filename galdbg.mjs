import { chromium } from 'playwright';
const b = await chromium.launch({ headless: false, args: ['--use-gl=angle'] });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto('http://localhost:3002', { waitUntil: 'networkidle' });
await p.waitForTimeout(4000);
console.log(await p.evaluate(() => {
  const g = document.querySelector('.gal');
  const r = g.getBoundingClientRect();
  return {
    klassen: g.className, hoehe: g.offsetHeight, top: g.offsetTop,
    rectTop: Math.round(r.top), rectHoehe: Math.round(r.height),
    buehneDa: !!g.querySelector('.gal__buehne'),
    canvasDa: !!g.querySelector('canvas'),
    seiteHoehe: document.documentElement.scrollHeight,
  };
}));
// schrittweise hineinscrollen und beobachten, wann der Canvas kommt
for (const a of [0.02, 0.1, 0.3, 0.5]) {
  await p.evaluate((x) => { const el = document.querySelector('.gal'); window.scrollTo(0, el.offsetTop + el.offsetHeight * x); }, a);
  await p.waitForTimeout(2500);
  console.log('bei', a, '→ canvas:', await p.evaluate(() => !!document.querySelector('.gal canvas')),
    '| rectTop', await p.evaluate(() => Math.round(document.querySelector('.gal').getBoundingClientRect().top)));
}
await b.close();
