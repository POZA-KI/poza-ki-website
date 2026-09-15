/** Prueft die mobile Wischgeste in der Gallery: Station wechselt, Seite scrollt nicht quer. */
import { chromium, devices } from 'playwright';
const b = await chromium.launch({ headless: false });
const ctx = await b.newContext({ ...devices['iPhone 13'], viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
const page = await ctx.newPage();
await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });
await page.waitForTimeout(3500);
await page.evaluate(() => { const el = document.querySelector('.gal__sticky'); const r = el.getBoundingClientRect(); window.scrollTo(0, window.scrollY + r.top - (window.innerHeight - r.height) / 2); });
await page.waitForTimeout(2500);
const vorher = await page.evaluate(() => document.querySelector('.gal__micro')?.textContent?.trim());
const box = await page.locator('.gal__buehne').boundingBox();
for (let i = 0; i < 2; i++) {
  await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.5);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.5, { steps: 14 });
  await page.mouse.up();
  await page.waitForTimeout(1600);
}
await page.waitForTimeout(2000);
const nachher = await page.evaluate(() => document.querySelector('.gal__micro')?.textContent?.trim());
const ueberlauf = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
await page.screenshot({ path: '/tmp/perf/mobile-gallery-wisch.png' });
console.log({ vorher, nachher, ueberlauf, hoeheGal: await page.evaluate(() => document.querySelector('.gal')?.offsetHeight) });
await b.close();
