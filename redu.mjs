import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
const page = await ctx.newPage();
const fehler = [];
page.on('pageerror', (e) => fehler.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') fehler.push(m.text()); });
await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });
await page.waitForTimeout(3500);
await page.screenshot({ path: '/tmp/perf/reduziert-hero.png' });
const s = await page.evaluate(() => {
  const unsichtbar = [...document.querySelectorAll('h1,h2,h3,p.lead')]
    .filter((el) => { const r = el.getBoundingClientRect(); return r.width > 40 && +getComputedStyle(el).opacity < 0.95; })
    .map((el) => (el.textContent || '').trim().slice(0, 30));
  return { canvases: document.querySelectorAll('canvas').length, unsichtbar, ueberlauf: document.documentElement.scrollWidth - window.innerWidth };
});
console.log('reduced-motion:', JSON.stringify(s), 'fehler', fehler.slice(0, 3));
await b.close();
