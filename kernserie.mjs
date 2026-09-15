/** Vier Aufnahmen ueber einen Schlag hinweg — zeigt Impuls und Puls. */
import { chromium } from 'playwright';
const b = await chromium.launch({ headless: false, args: ['--use-gl=angle'] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
await page.mouse.move(700, 450);
await page.evaluate(() => { const el = document.querySelector('.kon'); window.scrollTo(0, el.offsetTop + el.offsetHeight * 0.55); });
await page.waitForTimeout(3500);
const box = await page.locator('.kon__buehne').boundingBox();
const clip = { x: Math.round(box.x + box.width/2 - 300), y: Math.round(box.y + box.height/2 - 190), width: 600, height: 380 };
for (let i = 0; i < 4; i++) {
  await page.screenshot({ path: `/tmp/perf/kern-t${i}.png`, clip });
  await page.waitForTimeout(500);
}
await b.close();
