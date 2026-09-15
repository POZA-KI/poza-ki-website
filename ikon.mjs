/** Rendert das Icon-SVG in echte PNGs und baut daraus eine ICO-Datei. */
import { chromium } from 'playwright';
import fs from 'node:fs';

const svg = fs.readFileSync('/Users/luiv/poza-ki-web/app/icon.svg', 'utf8');
const b = await chromium.launch();
const groessen = [16, 32, 48, 64, 180];
const bilder = {};
for (const g of groessen) {
  const page = await b.newPage({ viewport: { width: g, height: g }, deviceScaleFactor: 1 });
  await page.setContent(`<body style="margin:0">${svg.replace(/width="32" height="32"/, `width="${g}" height="${g}"`)}</body>`);
  await page.waitForTimeout(150);
  // omitBackground: Next dekodiert die ICO-Eintraege und verlangt RGBA. Ein
  // Screenshot mit undurchsichtigem Hintergrund kommt als RGB heraus und liess
  // den Build mit "The PNG is not in RGBA format!" scheitern.
  bilder[g] = await page.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: g, height: g } });
  await page.close();
}
await b.close();

fs.writeFileSync('/Users/luiv/poza-ki-web/app/apple-icon.png', bilder[180]);

/** ICO mit eingebetteten PNGs — von allen aktuellen Browsern unterstuetzt. */
const eintraege = [16, 32, 48];
const kopf = Buffer.alloc(6);
kopf.writeUInt16LE(0, 0); kopf.writeUInt16LE(1, 2); kopf.writeUInt16LE(eintraege.length, 4);
let versatz = 6 + eintraege.length * 16;
const verzeichnis = [];
for (const g of eintraege) {
  const e = Buffer.alloc(16);
  e.writeUInt8(g === 256 ? 0 : g, 0);
  e.writeUInt8(g === 256 ? 0 : g, 1);
  e.writeUInt8(0, 2); e.writeUInt8(0, 3);
  e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6);
  e.writeUInt32LE(bilder[g].length, 8);
  e.writeUInt32LE(versatz, 12);
  versatz += bilder[g].length;
  verzeichnis.push(e);
}
fs.writeFileSync('/Users/luiv/poza-ki-web/app/favicon.ico',
  Buffer.concat([kopf, ...verzeichnis, ...eintraege.map((g) => bilder[g])]));
console.log('favicon.ico', fs.statSync('/Users/luiv/poza-ki-web/app/favicon.ico').size, 'B · apple-icon.png', fs.statSync('/Users/luiv/poza-ki-web/app/apple-icon.png').size, 'B');
