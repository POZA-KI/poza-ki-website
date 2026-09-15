/** Testet das Anfrage-Modal aus jedem CTA, inklusive echtem Versand. */
import { chromium, devices } from 'playwright';

const ZIEL = process.env.URL || 'http://localhost:3002';
const ECHT_SENDEN = process.env.SENDEN === '1';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
const log = [];
p.on('pageerror', (e) => log.push('pageerror: ' + e));
p.on('console', (m) => { if (m.type() === 'error') log.push('console: ' + m.text().slice(0, 120)); });
await p.goto(ZIEL, { waitUntil: 'networkidle' });
await p.waitForTimeout(3000);

const dlg = p.locator('dialog.mdl');
const offen = () => p.evaluate(() => document.querySelector('dialog.mdl')?.open === true);

async function ausCta(name, locator) {
  await locator.click();
  await p.waitForTimeout(700);
  const auf = await offen();
  const scrollGesperrt = await p.evaluate(() => getComputedStyle(document.body).overflow === 'hidden');
  const fokusDrin = await p.evaluate(() => document.querySelector('dialog.mdl')?.contains(document.activeElement));
  await p.keyboard.press('Escape');
  await p.waitForTimeout(600);
  const zu = !(await offen());
  const scrollFrei = await p.evaluate(() => getComputedStyle(document.body).overflow !== 'hidden');
  console.log(`  ${name.padEnd(22)} öffnet ${auf ? 'ok' : 'FEHLER'} | Scroll-Lock ${scrollGesperrt ? 'ok' : 'FEHLER'} | Fokus im Dialog ${fokusDrin ? 'ok' : 'FEHLER'} | Esc schließt ${zu ? 'ok' : 'FEHLER'} | Lock gelöst ${scrollFrei ? 'ok' : 'FEHLER'}`);
  return auf && scrollGesperrt && fokusDrin && zu && scrollFrei;
}

console.log('CTA-Verdrahtung:');
let alle = true;
alle = await ausCta('Navigation Kontakt', p.locator('.site-nav button', { hasText: 'Kontakt' })) && alle;
alle = await ausCta('Hero', p.locator('.hero__ctas button').first()) && alle;
await p.evaluate(() => { const el = document.querySelector('.audit__cta'); el.scrollIntoView({ block: 'center' }); });
await p.waitForTimeout(1200);
alle = await ausCta('Offer-Sektion', p.locator('.audit__cta')) && alle;
await p.evaluate(() => { const el = document.querySelector('.kontakt__cta'); el.scrollIntoView({ block: 'center' }); });
await p.waitForTimeout(1200);
alle = await ausCta('Kontakt-Sektion', p.locator('.kontakt__cta')) && alle;

// Klick auf den Hintergrund schliesst
await p.locator('.kontakt__cta').click();
await p.waitForTimeout(600);
await p.mouse.click(30, 30);
await p.waitForTimeout(600);
console.log('  Klick außerhalb schließt:', (await offen()) ? 'FEHLER' : 'ok');

// Validierung: leer absenden
await p.locator('.kontakt__cta').click();
await p.waitForTimeout(600);
await dlg.locator('button[type=submit]').click();
await p.waitForTimeout(600);
const fehlerZahl = await dlg.locator('.mdl__fehler').count();
console.log('\nValidierung: leeres Formular →', fehlerZahl, 'Feldfehler', fehlerZahl >= 3 ? 'ok' : 'FEHLER');

// Ungueltige Mail
await dlg.locator('#name').fill('Testperson');
await dlg.locator('#firma').fill('Testfirma GmbH');
await dlg.locator('#email').fill('keine-mail');
await dlg.locator('#anliegen').fill('Das ist ein Test des Formulars über die Playwright-Automatisierung.');
await dlg.locator('button[type=submit]').click();
await p.waitForTimeout(600);
console.log('Validierung: ungültige E-Mail →', (await dlg.locator('#fehler-email').count()) ? 'abgelehnt (ok)' : 'FEHLER');

if (ECHT_SENDEN) {
  await dlg.locator('#email').fill('kontakt@poza-ki.com');
  await dlg.locator('#telefon').fill('+43 660 0000000');
  await dlg.locator('#mitarbeiter').selectOption('10–50');
  await dlg.locator('#anliegen').fill(
    `TESTMAIL vom ${new Date().toLocaleString('de-AT')} — automatischer Test des neuen Anfrage-Formulars auf ${ZIEL}. Wenn diese Mail ankommt, funktioniert der Versand über Resend.`,
  );
  const antwort = p.waitForResponse((r) => r.url().includes('/api/audit-request'));
  await dlg.locator('button[type=submit]').click();
  const r = await antwort;
  const body = await r.json().catch(() => ({}));
  console.log('\nECHTER VERSAND: HTTP', r.status(), JSON.stringify(body));
  await p.waitForTimeout(1500);
  const erfolg = await dlg.locator('.mdl__status').textContent().catch(() => null);
  console.log('Erfolgszustand im Modal:', erfolg ?? 'FEHLT');
  await p.screenshot({ path: '/tmp/perf/form-erfolg.png' });
}

await dlg.locator('.mdl__panel').screenshot({ path: '/tmp/perf/form-panel.png' }).catch(() => {});
console.log('\nKonsole:', log.length ? log.slice(0, 4) : 'sauber');
console.log(alle ? 'CTAs: GRÜN' : 'CTAs: BEFUND');
await b.close();
