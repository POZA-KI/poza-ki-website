import { chromium } from 'playwright';
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
await page.waitForTimeout(5000);
const geo = await page.evaluate(() => {
  const bp = document.querySelector('.bp');
  const st = document.querySelector('.bp__sticky');
  return {
    bpDa: !!bp,
    bpTop: bp?.offsetTop, bpHoehe: bp?.offsetHeight,
    bpHoeheVh: bp ? +(bp.offsetHeight / window.innerHeight).toFixed(2) : null,
    stickyHoehe: st?.offsetHeight,
    stickyPos: st ? getComputedStyle(st).position : null,
    seite: document.documentElement.scrollHeight,
  };
});
console.log('GEO', JSON.stringify(geo));
for (const f of [0.2, 0.5, 0.85]) {
  await page.evaluate((ff) => {
    const el = document.querySelector('.bp');
    window.scrollTo(0, el.offsetTop + (el.offsetHeight - window.innerHeight) * ff);
  }, f);
  await page.waitForTimeout(2200);
  const s = await page.evaluate(() => {
    const bp = document.querySelector('.bp');
    const r = bp.getBoundingClientRect();
    return {
      scrollY: Math.round(window.scrollY),
      bpTopRel: Math.round(r.top),
      phase: document.querySelector('.bp__phase')?.textContent?.trim(),
    };
  });
  console.log(`${Math.round(f*100)}%`, JSON.stringify(s));
}
await b.close();
