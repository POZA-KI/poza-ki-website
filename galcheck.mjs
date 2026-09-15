import { chromium } from 'playwright';
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
await page.waitForTimeout(5000);
const out = [];
for (let k = 0; k <= 4; k++) {
  const f = k / 4;
  await page.evaluate((ff) => {
    const el = document.getElementById('systeme');
    window.scrollTo(0, el.offsetTop + (el.offsetHeight - window.innerHeight) * ff);
  }, f);
  await page.waitForTimeout(2600);
  const s = await page.evaluate(() => ({
    hud: document.querySelector('.gal__titel')?.textContent ?? null,
    nr: document.querySelector('.galbar__nr.is-on')?.textContent?.trim() ?? null,
  }));
  await page.screenshot({ path: `/tmp/shots/S-${k}.png` });
  out.push({ station: k + 1, ...s });
}
console.log(JSON.stringify(out, null, 1));
await b.close();
