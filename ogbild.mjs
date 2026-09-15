/**
 * Erzeugt das statische Open-Graph-Bild.
 *
 * Bewusst mit echtem Browser gerendert statt ueber ImageResponse/Satori: So
 * kommen die echten Schriften und der echte Verlauf des Kerns ins Bild, und
 * das Ergebnis liegt als Datei im Repo — kein Build-Schritt, der zur Laufzeit
 * Fonts aus dem Netz zieht.
 */
import { chromium } from 'playwright';

const HTML = `<!doctype html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500&family=IBM+Plex+Mono:wght@400&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:1200px;height:630px;background:#08090A;overflow:hidden;position:relative;
    font-family:'Inter Tight',system-ui,sans-serif;color:#F4F6F8}
  .grid{position:absolute;inset:0;
    background-image:linear-gradient(to right,rgba(244,246,248,.028) 1px,transparent 1px),
                     linear-gradient(to bottom,rgba(244,246,248,.028) 1px,transparent 1px);
    background-size:96px 96px;
    -webkit-mask-image:radial-gradient(ellipse 110% 90% at 30% 45%,#000 25%,transparent 82%)}
  .kern{position:absolute;right:88px;top:50%;transform:translateY(-50%);width:420px;height:420px}
  .glut{position:absolute;inset:0;border-radius:50%;
    background:radial-gradient(circle at 50% 50%,
      rgba(255,255,255,1) 0%, rgba(232,244,255,.92) 3%,
      rgba(142,201,255,.42) 9%, rgba(77,166,255,.16) 22%,
      rgba(58,124,196,.05) 40%, rgba(0,0,0,0) 70%)}
  .ring{position:absolute;left:50%;top:50%;border:1px solid rgba(77,166,255,.34);border-radius:50%;
    transform:translate(-50%,-50%)}
  .r1{width:230px;height:230px}
  .r2{width:300px;height:112px;border-color:rgba(77,166,255,.22);transform:translate(-50%,-50%) rotate(-18deg)}
  .r3{width:300px;height:112px;border-color:rgba(77,166,255,.18);transform:translate(-50%,-50%) rotate(64deg)}
  .marke{position:absolute;left:88px;top:74px;font-family:'IBM Plex Mono',monospace;
    font-size:19px;letter-spacing:.24em;color:#F4F6F8}
  .inhalt{position:absolute;left:88px;top:176px;max-width:640px}
  .h1{font-size:64px;line-height:1.06;letter-spacing:-.02em;font-weight:500}
  .sub{margin-top:24px;font-size:21px;line-height:1.5;color:#B4BCC6;max-width:560px}
  .fuss{position:absolute;left:88px;right:88px;bottom:66px;
    display:flex;justify-content:space-between;align-items:center;
    font-family:'IBM Plex Mono',monospace;font-size:15px;letter-spacing:.14em;color:#7E8794}
  .linie{position:absolute;left:88px;right:88px;bottom:112px;height:1px;background:rgba(244,246,248,.14)}
  .akz{color:#4DA6FF}
</style></head><body>
  <div class="grid"></div>
  <div class="kern">
    <div class="glut"></div>
    <div class="ring r1"></div><div class="ring r2"></div><div class="ring r3"></div>
  </div>
  <div class="marke">P O Z A - K I</div>
  <div class="inhalt">
    <div class="h1">Software,<br>die Ihr Unternehmen trägt.</div>
    <div class="sub">Software-Manufaktur auf Enterprise-Niveau. Individuelle ERP- und CRM-Systeme, digitale Plattformen, Prozesse mit KI.</div>
  </div>
  <div class="linie"></div>
  <div class="fuss">
    <span>INDIVIDUALSOFTWARE · ERP · CRM · PLATTFORMEN · KI</span>
    <span class="akz">poza-ki.com</span>
  </div>
</body></html>`;

const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(HTML, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(600);
await page.screenshot({ path: 'app/opengraph-image.png' });
await b.close();
console.log('geschrieben: app/opengraph-image.png');
