import { chromium, devices } from 'playwright';
const b = await chromium.launch({ headless: false });
const ctx = await b.newContext({ ...devices['iPhone 13'], viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
const page = await ctx.newPage();
await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });
await page.waitForTimeout(3500);
await page.evaluate(() => { const el = document.getElementById('systeme'); window.scrollTo(0, el.offsetTop + el.offsetHeight * 0.55); });
await page.waitForTimeout(3000);
console.log(await page.evaluate(() => {
  const c = document.querySelector('.gal__buehne canvas');
  const r = c.getBoundingClientRect();
  const h = document.querySelector('.gal__buehne').getBoundingClientRect();
  const s = document.querySelector('.gal__sticky').getBoundingClientRect();
  return { canvasCss: [Math.round(r.width), Math.round(r.height)], puffer: [c.width, c.height], host: [Math.round(h.width), Math.round(h.height)], sticky: [Math.round(s.width), Math.round(s.height)], wisch: !!document.querySelector('.gal__wisch') };
}));
await b.close();
