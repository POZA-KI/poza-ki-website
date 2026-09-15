/** Wie startet die Live-Seite fuer einen frischen Besucher? */
import { chromium } from 'playwright';
const b = await chromium.launch();
for (const [name, opt] of [
  ['Standard (keine Systemvorgabe)', {}],
  ['System: reduce', { reducedMotion: 'reduce' }],
  ['System: no-preference', { reducedMotion: 'no-preference' }],
]) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, ...opt });
  const p = await ctx.newPage();
  await p.goto(process.env.URL || 'https://www.poza-ki.com', { waitUntil: 'networkidle' });
  await p.waitForTimeout(3500);
  const d = await p.evaluate(() => ({
    dataset: document.documentElement.dataset.motion ?? '(nicht gesetzt)',
    ls: (() => { try { return localStorage.getItem('pozaki.motion'); } catch { return 'n/a'; } })(),
    mq: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    knopf: [...document.querySelectorAll('button')].map((x) => x.textContent.trim()).filter((t) => /Animation/i.test(t))[0] || '(kein Knopf)',
    canvases: document.querySelectorAll('canvas').length,
    heroHeadlineOpacity: getComputedStyle(document.querySelector('.ln__i')).opacity,
  }));
  console.log(name.padEnd(32), JSON.stringify(d));
  // Toggle betaetigen und pruefen, ob er persistiert
  const knopf = p.locator('button', { hasText: /Animationen/ }).first();
  if (await knopf.count()) {
    await knopf.click();
    await p.waitForTimeout(1200);
    const nach = await p.evaluate(() => ({
      dataset: document.documentElement.dataset.motion,
      ls: localStorage.getItem('pozaki.motion'),
      knopf: [...document.querySelectorAll('button')].map((x) => x.textContent.trim()).filter((t) => /Animation/i.test(t))[0],
      canvases: document.querySelectorAll('canvas').length,
    }));
    console.log('  nach Klick'.padEnd(32), JSON.stringify(nach));
    await p.reload({ waitUntil: 'networkidle' });
    await p.waitForTimeout(3000);
    const neu = await p.evaluate(() => ({
      dataset: document.documentElement.dataset.motion,
      ls: localStorage.getItem('pozaki.motion'),
      knopf: [...document.querySelectorAll('button')].map((x) => x.textContent.trim()).filter((t) => /Animation/i.test(t))[0],
      canvases: document.querySelectorAll('canvas').length,
    }));
    console.log('  nach Reload'.padEnd(32), JSON.stringify(neu));
  }
  await ctx.close();
}
await b.close();
