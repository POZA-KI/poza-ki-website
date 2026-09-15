import { chromium, devices } from 'playwright';
import { PNG } from 'pngjs';
const b = await chromium.launch();
const ctx = await b.newContext({ ...devices['iPhone 13'], viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto(process.env.URL || 'https://www.poza-ki.com', { waitUntil: 'networkidle' });
await p.waitForTimeout(4000);
// zur These-Sektion
await p.evaluate(() => { const el = document.getElementById('position'); window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY); });
await p.waitForTimeout(3500);
const png = PNG.sync.read(await p.screenshot({ path: '/tmp/perf/vorher-these-1.png' }));
const zeilen = [];
for (let y = 0; y < png.height; y += 8) {
  let best = 0, summe = 0;
  for (let x = 0; x < png.width; x += 2) {
    const i = (y * png.width + x) * 4;
    const l = png.data[i] + png.data[i+1] + png.data[i+2];
    summe += l; if (l > best) best = l;
  }
  zeilen.push({ y, max: best, mittel: Math.round(summe / (png.width / 2)) });
}
console.log('y : max / mittel');
console.log(zeilen.map(z => `${String(z.y).padStart(3)}: ${String(z.max).padStart(4)} / ${String(z.mittel).padStart(3)}`).join('\n'));
await b.close();
