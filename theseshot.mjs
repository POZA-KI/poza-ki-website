/** Screenshots der These-Sektion im iPhone-Viewport. */
import { chromium, devices } from 'playwright';
const marke = process.env.MARKE || 'vorher';
const b = await chromium.launch();
const ctx = await b.newContext({ ...devices['iPhone 13'], viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
const p = await ctx.newPage();
await p.goto(process.env.URL || 'https://www.poza-ki.com', { waitUntil: 'networkidle' });
await p.waitForTimeout(4000);
const info = await p.evaluate(() => {
  const el = document.getElementById('position');
  return { top: Math.round(el.getBoundingClientRect().top + window.scrollY), hoehe: el.offsetHeight };
});
console.log(marke, 'These-Sektion: Höhe', info.hoehe, 'px =', (info.hoehe / 844).toFixed(1), 'Viewports');
for (const [i, a] of [0, 0.25, 0.5, 0.75].entries()) {
  await p.evaluate((y) => window.scrollTo(0, y), info.top + info.hoehe * a);
  let letzte = -1;
  for (let k = 0; k < 25; k++) { await p.waitForTimeout(120); const j = await p.evaluate(() => Math.round(window.scrollY)); if (j === letzte) break; letzte = j; }
  await p.waitForTimeout(900);
  await p.screenshot({ path: `/tmp/perf/these-${marke}-${i}.png` });
}
await b.close();
