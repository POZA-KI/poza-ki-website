import { chromium } from 'playwright';
import fs from 'node:fs';
const svg = fs.readFileSync('/Users/luiv/poza-ki-web/app/icon.svg','utf8');
const b = await chromium.launch();
// 16 px rendern, dann hart hochskaliert anzeigen — so sieht man, was im Tab ankommt
const p = await b.newPage({ viewport: { width: 16, height: 16 } });
await p.setContent(`<body style="margin:0">${svg.replace('width="32" height="32"','width="16" height="16"')}</body>`);
await p.waitForTimeout(150);
const klein = await p.screenshot({ clip: { x:0,y:0,width:16,height:16 } });
fs.writeFileSync('/tmp/perf/fav16.png', klein);
const q = await b.newPage({ viewport: { width: 320, height: 160 } });
await q.setContent(`<body style="margin:0;background:#3a3a3a;display:flex;gap:24px;align-items:center;justify-content:center">
 <img src="data:image/png;base64,${klein.toString('base64')}" style="width:16px;height:16px">
 <img src="data:image/png;base64,${klein.toString('base64')}" style="width:128px;height:128px;image-rendering:pixelated"></body>`);
await q.waitForTimeout(200);
await q.screenshot({ path: '/tmp/perf/fav16-vergleich.png' });
await b.close();
