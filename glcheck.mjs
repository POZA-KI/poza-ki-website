import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://localhost:3002', { waitUntil: 'networkidle' });
await p.waitForTimeout(4000);
console.log(await p.evaluate(() => {
  const c = document.createElement('canvas');
  const gl = c.getContext('webgl2') || c.getContext('webgl');
  const d = gl.getExtension('WEBGL_debug_renderer_info');
  return { renderer: d ? gl.getParameter(d.UNMASKED_RENDERER_WEBGL) : '?', canvases: document.querySelectorAll('canvas').length };
}));
// bis zur Gallery scrollen und pruefen, dass wirklich Pixel im Canvas stehen
await p.evaluate(() => { const el = document.getElementById('systeme'); window.scrollTo(0, el.offsetTop + el.offsetHeight * 0.45); });
await p.waitForTimeout(3000);
await p.screenshot({ path: '/tmp/perf/gl-gallery.png' });
console.log('canvases sichtbar:', await p.evaluate(() => [...document.querySelectorAll('canvas')].map(c => ({ w: c.width, h: c.height, r: Math.round(c.getBoundingClientRect().width) }))));
await b.close();
