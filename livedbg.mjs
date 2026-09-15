import { chromium } from 'playwright';
const b = await chromium.launch({ headless: false, args: ['--use-gl=angle'] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const log = [];
p.on('pageerror', (e) => log.push('pageerror: ' + e));
p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') log.push(m.type() + ': ' + m.text().slice(0, 160)); });
p.on('requestfailed', (r) => log.push('failed: ' + r.url().slice(-80) + ' ' + (r.failure()?.errorText || '')));
await p.goto('https://www.poza-ki.com', { waitUntil: 'networkidle' });
await p.waitForTimeout(4000);
const gal = await p.evaluate(() => {
  const el = document.querySelector('.gal');
  return el ? { top: el.offsetTop, h: el.offsetHeight } : null;
});
await p.evaluate((g) => window.scrollTo(0, g.top + g.h * 0.2), gal);
await p.waitForTimeout(5000);
console.log('canvases:', await p.evaluate(() => [...document.querySelectorAll('canvas')].map((c) => ({
  cls: c.parentElement?.className?.toString().slice(0, 24), w: c.width, h: c.height,
  css: Math.round(c.getBoundingClientRect().width) + 'x' + Math.round(c.getBoundingClientRect().height),
}))));
await p.screenshot({ path: '/tmp/perf/live-gal.png' });
console.log('log:', log.slice(0, 10));
await b.close();
