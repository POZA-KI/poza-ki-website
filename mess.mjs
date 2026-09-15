import { chromium } from 'playwright';
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
await page.waitForTimeout(3500);

const m = await page.evaluate(() => {
  const these = document.getElementById('position');
  const pin = document.querySelector('.pin');
  const sticky = document.querySelector('.pin__sticky');
  const next = document.getElementById('leistungen');
  const cs = (el) => el ? getComputedStyle(el) : null;
  const t = cs(these), n = cs(next);
  const theseBottom = these.offsetTop + these.offsetHeight;
  return {
    viewport: window.innerHeight,
    these: { top: these.offsetTop, hoehe: these.offsetHeight, unten: theseBottom,
             padTop: t.paddingTop, padBottom: t.paddingBottom },
    pin: pin ? { hoehe: pin.offsetHeight, hoeheVh: +(pin.offsetHeight/window.innerHeight).toFixed(2),
                 inlineStyle: pin.getAttribute('style') } : null,
    sticky: sticky ? { hoehe: sticky.offsetHeight } : null,
    leistungen: { top: next.offsetTop, padTop: n.paddingTop },
    // Das ist die tote Luft: vom Ende des Pin-Inhalts bis zum ersten Inhalt danach
    luecke: next.offsetTop - theseBottom,
    luecke_gesamt_inkl_paddings:
      (next.offsetTop + parseFloat(n.paddingTop)) - (theseBottom - parseFloat(t.paddingBottom)),
  };
});
console.log(JSON.stringify(m, null, 1));
await b.close();
