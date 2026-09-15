import { chromium } from 'playwright';
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
await page.waitForTimeout(6000);

const out = [];
// Statement bei 20/50/85%
for (const f of [0.2, 0.5, 0.85]) {
  await page.evaluate((ff) => {
    const el = document.querySelector('.bp');
    window.scrollTo(0, el.offsetTop + (el.offsetHeight - window.innerHeight) * ff);
  }, f);
  await page.waitForTimeout(2600);
  await page.screenshot({ path: `/tmp/shots/B-${Math.round(f*100)}.png` });
  const s = await page.evaluate(() => ({
    phase: document.querySelector('.bp__phase')?.textContent?.trim(),
    satz: [...document.querySelectorAll('.bp__satz .ln__i')].map(e => ({
      t: e.textContent, y: getComputedStyle(e).transform })),
    status: getComputedStyle(document.querySelector('.bp__status')).opacity,
    canvas: (() => { const c = document.querySelector('.bp__sticky canvas'); return c ? c.width+'x'+c.height : 'keiner'; })(),
  }));
  out.push({ statement: `${Math.round(f*100)}%`, ...s });
}

// Produkte: Normalzustand + Fokus per Klick auf Nummer
await page.evaluate(() => {
  const el = document.querySelector('.kon');
  window.scrollTo(0, el.offsetTop + (el.offsetHeight - window.innerHeight) * 0.75);
});
await page.waitForTimeout(3000);
await page.screenshot({ path: '/tmp/shots/C-orbit.png' });
const vorher = await page.evaluate(() => document.querySelector('.kon__titel')?.textContent);

await page.click('.kon__bar .galbar__nr:nth-child(1)', { force: true }).catch(() => {});
await page.evaluate(() => {
  const b = document.querySelectorAll('.kon__bar button')[1];
  if (b) b.click();
});
await page.waitForTimeout(2800);
await page.screenshot({ path: '/tmp/shots/C-fokus.png' });
const nachher = await page.evaluate(() => ({
  titel: document.querySelector('.kon__titel')?.textContent,
  canvas: (() => { const c = document.querySelector('.kon__sticky canvas'); return c ? c.width+'x'+c.height : 'keiner'; })(),
}));

console.log(JSON.stringify({ statement: out, produkte: { vorher, nachher } }, null, 1));
await b.close();
