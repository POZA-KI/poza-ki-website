import { chromium } from 'playwright';
const b = await chromium.launch({ headless: false, args: ['--use-gl=angle'] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
await page.mouse.move(60, 60);
await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
await page.waitForTimeout(4000);
console.log(await page.evaluate(() => {
  const cv = document.querySelector('canvas.kern');
  const r = cv.getBoundingClientRect();
  const c = cv.getContext('2d');
  const d = c.getImageData(Math.round(cv.width / 2), Math.round(cv.height / 2), 1, 1).data;
  const cs = getComputedStyle(cv);
  // Was liegt darueber?
  const oben = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  return {
    canvasMitte: [...d],
    canvasOpacity: cs.opacity, filter: cs.filter, mixBlend: cs.mixBlendMode,
    elternOpacity: getComputedStyle(cv.parentElement).opacity,
    daruecker: oben ? oben.className.toString().slice(0, 60) + ' | ' + getComputedStyle(oben).background.slice(0, 80) : '-',
  };
}));
await b.close();
