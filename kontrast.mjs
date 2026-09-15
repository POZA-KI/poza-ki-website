import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
await p.goto('http://localhost:3002', { waitUntil: 'networkidle' });
await p.waitForTimeout(2500);
console.log(await p.evaluate(() => [...document.querySelectorAll('span')]
  .filter((el) => getComputedStyle(el).color === 'rgb(92, 100, 110)')
  .map((el) => ({ cls: el.className || '(ohne)', txt: (el.textContent || '').trim().slice(0, 30), eltern: el.parentElement?.className?.toString().slice(0, 40), fs: getComputedStyle(el).fontSize }))));
await b.close();
