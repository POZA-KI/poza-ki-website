import { chromium } from 'playwright';
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
await page.waitForTimeout(4500);
// Claim
await page.evaluate(() => {
  const el = document.querySelector('.claim');
  window.scrollTo(0, el.offsetTop - 120);
});
await page.waitForTimeout(2000);
await page.screenshot({ path: '/tmp/shots/X-claim.png' });
// Produkte, voll angedockt
await page.evaluate(() => {
  const el = document.getElementById('produkte');
  window.scrollTo(0, el.offsetTop + (el.offsetHeight - window.innerHeight) * 0.85);
});
await page.waitForTimeout(2600);
await page.screenshot({ path: '/tmp/shots/X-produkte.png' });
// Cockpit-Panel in der Galerie
await page.evaluate(() => {
  const el = document.getElementById('systeme');
  window.scrollTo(0, el.offsetTop + (el.offsetHeight - window.innerHeight) * 0.25);
});
await page.waitForTimeout(2800);
await page.screenshot({ path: '/tmp/shots/X-cockpit.png' });
await b.close();
