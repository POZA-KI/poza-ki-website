/** Pre-Flight-Smoke gegen den lokalen Production-Build. */
import { chromium, devices } from 'playwright';

const ZIEL = process.env.URL || 'http://localhost:3002';
const SEKTIONEN = ['position','leistungen','systeme','case','produkte','vorgehen','gruender','kontakt'];
const b = await chromium.launch();
let fehlerGesamt = 0;

async function pruefe(name, optionen) {
  const ctx = await b.newContext(optionen);
  const page = await ctx.newPage();
  const konsole = [];
  page.on('pageerror', (e) => konsole.push('pageerror: ' + e));
  page.on('console', (m) => { if (m.type() === 'error') konsole.push('console: ' + m.text()); });
  page.on('requestfailed', (r) => konsole.push('request: ' + r.url() + ' ' + (r.failure()?.errorText || '')));

  const antwort = await page.goto(ZIEL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3500);

  const d = await page.evaluate((ids) => ({
    status: document.readyState,
    titel: document.title,
    beschreibung: document.querySelector('meta[name="description"]')?.content || '',
    ogTitel: document.querySelector('meta[property="og:title"]')?.content || '',
    ogBild: document.querySelector('meta[property="og:image"]')?.content || '',
    ogUrl: document.querySelector('meta[property="og:url"]')?.content || '',
    twBild: document.querySelector('meta[name="twitter:image"]')?.content || '',
    canonical: document.querySelector('link[rel="canonical"]')?.href || '',
    robots: document.querySelector('meta[name="robots"]')?.content || '(kein Tag)',
    icon: [...document.querySelectorAll('link[rel~="icon"],link[rel="apple-touch-icon"]')].map((l) => l.getAttribute('href')),
    h1: document.querySelector('h1')?.textContent?.trim().slice(0, 48) || '',
    fehlend: ids.filter((i) => !document.getElementById(i)),
    impressum: !!document.querySelector('a[href="/impressum"]'),
    datenschutz: !!document.querySelector('a[href="/datenschutz"]'),
    ueberlauf: document.documentElement.scrollWidth - window.innerWidth,
    lang: document.documentElement.lang,
  }), SEKTIONEN);

  console.log(`\n── ${name} ── HTTP ${antwort.status()}`);
  console.log('   Titel      :', d.titel);
  console.log('   Description:', d.beschreibung.slice(0, 90) + '…');
  console.log('   H1         :', d.h1);
  console.log('   OG         :', d.ogTitel ? 'Titel ok' : 'FEHLT', '| Bild', d.ogBild || 'FEHLT', '| URL', d.ogUrl);
  console.log('   Twitter    :', d.twBild || 'FEHLT');
  console.log('   canonical  :', d.canonical, '| robots:', d.robots, '| lang:', d.lang);
  console.log('   Icons      :', d.icon.join(' '));
  console.log('   Sektionen  :', d.fehlend.length === 0 ? 'alle 8 vorhanden' : 'FEHLEN: ' + d.fehlend.join(','));
  console.log('   Footer     : Impressum', d.impressum ? 'ok' : 'FEHLT', '| Datenschutz', d.datenschutz ? 'ok' : 'FEHLT');
  console.log('   H-Überlauf :', d.ueberlauf, 'px');
  console.log('   Konsole    :', konsole.length ? konsole.slice(0, 5) : 'sauber');
  if (konsole.length || d.fehlend.length || d.ueberlauf > 0 || !d.ogBild || !d.impressum || !d.datenschutz) fehlerGesamt++;

  await page.screenshot({ path: `/tmp/perf/smoke-${name}.png` });
  await ctx.close();
}

await pruefe('desktop', { viewport: { width: 1440, height: 900 } });
await pruefe('iphone', { ...devices['iPhone 13'], viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

// Rechtsseiten einzeln
for (const pfad of ['/impressum', '/datenschutz', '/robots.txt', '/sitemap.xml', '/opengraph-image.png', '/favicon.ico']) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const r = await page.goto(ZIEL + pfad, { waitUntil: 'domcontentloaded' });
  const laenge = (await page.content()).length;
  const ueber = pfad.endsWith('.png') || pfad.endsWith('.ico') ? '' : ' | ' + (await page.title() || '(kein Titel)');
  console.log(`   ${pfad.padEnd(24)} HTTP ${r.status()} | ${laenge} B${ueber}`);
  if (r.status() !== 200) fehlerGesamt++;
  await ctx.close();
}

await b.close();
console.log('\nSMOKE:', fehlerGesamt === 0 ? 'GRÜN' : `${fehlerGesamt} Befund(e)`);
process.exit(fehlerGesamt === 0 ? 0 : 1);
