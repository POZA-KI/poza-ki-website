import { chromium, devices } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ ...devices['iPhone 13'], viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
const p = await ctx.newPage();
await p.goto(process.env.URL || 'http://localhost:3002', { waitUntil: 'networkidle' });
await p.waitForTimeout(4000);
for (const y of (process.env.YS || '3600,4000').split(',')) {
  await p.evaluate((v) => window.scrollTo(0, +v), y);
  let letzte = -1;
  for (let i = 0; i < 25; i++) { await p.waitForTimeout(120); const j = await p.evaluate(() => Math.round(window.scrollY)); if (j === letzte) break; letzte = j; }
  await p.waitForTimeout(900);
  await p.screenshot({ path: `/tmp/perf/stelle-${y}.png` });
}
console.log(await p.evaluate(() => {
  const g = document.querySelector('.gal');
  const s = document.querySelector('.gal__sticky');
  return { galHoehe: g?.offsetHeight, stickyHoehe: s?.offsetHeight, sektion: document.getElementById('systeme')?.offsetHeight };
}));
await b.close();
