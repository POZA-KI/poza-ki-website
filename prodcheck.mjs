import { chromium } from 'playwright';
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
await page.waitForTimeout(4000);
for (const f of [0.5, 0.75, 1.0]) {
  await page.evaluate((ff) => {
    const el = document.getElementById('produkte');
    window.scrollTo(0, el.offsetTop + (el.offsetHeight - window.innerHeight) * ff);
  }, f);
  await page.waitForTimeout(2000);
  const r = await page.evaluate(() => {
    return [...document.querySelectorAll('.prod__panel')].map((el) => {
      const b = el.getBoundingClientRect();
      return {
        marke: el.querySelector('.prod__wortmarke')?.textContent,
        opacity: +getComputedStyle(el).opacity.slice(0, 4),
        x: Math.round(b.left), breite: Math.round(b.width),
        y: Math.round(b.top), imBild: b.top < window.innerHeight && b.bottom > 0,
      };
    });
  });
  console.log(`--- ${Math.round(f*100)}% ---`);
  console.log(JSON.stringify(r));
}
await b.close();
