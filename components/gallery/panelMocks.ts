/**
 * Panel-Inhalte als selbst gezeichnete UI-Mocks auf 2D-Canvas.
 * Keine Bilder, keine Videos, keine echten Kundendaten — alles generisch.
 *
 * Jeder Maler bekommt (ctx, w, h, t) mit t = Sekunden seit Start und zeichnet
 * einen Frame. Die Canvas werden als CanvasTexture in die 3D-Panels gehaengt
 * und bewusst nur ~12×/s aktualisiert (nicht 60) — der optische Unterschied
 * ist null, die CPU-Ersparnis erheblich.
 */

export type Maler = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => void;

const BG = '#0B0F14';
const LINIE = '#1E2933';
const TEXT = '#C9D4E0';
const SCHWACH = '#5C6B7C';
const AKZENT = '#4DA6FF';
const GLUT = '#8FCBFF';

/**
 * Setzt die Schrift so, dass `text` garantiert in `maxBreite` passt.
 * Misst erst, rendert dann — vorher lief "1240/Tag" in die Nachbarbox.
 * Gibt die tatsaechlich gesetzte Groesse zurueck.
 */
function passeEin(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxBreite: number,
  start: number,
  min: number,
  familie = '"IBM Plex Mono", monospace',
  gewicht = '400',
) {
  let g = start;
  while (g > min) {
    ctx.font = `${gewicht} ${g}px ${familie}`;
    if (ctx.measureText(text).width <= maxBreite) return g;
    g -= 1;
  }
  ctx.font = `${gewicht} ${min}px ${familie}`;
  return min;
}

/** Schneidet Text mit Ellipse ab, wenn selbst die Mindestgroesse nicht reicht. */
function kuerze(ctx: CanvasRenderingContext2D, text: string, maxBreite: number) {
  if (ctx.measureText(text).width <= maxBreite) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(t + '…').width > maxBreite) t = t.slice(0, -1);
  return t + '…';
}

function grund(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, w, h);
  // feines Raster im Panel selbst
  ctx.strokeStyle = 'rgba(30,41,51,0.55)';
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 48) {
    ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, h); ctx.stroke();
  }
  for (let y = 0; y < h; y += 48) {
    ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(w, y + 0.5); ctx.stroke();
  }
}

function kopf(ctx: CanvasRenderingContext2D, w: number, titel: string, modul: string) {
  ctx.fillStyle = SCHWACH;
  ctx.font = '500 15px "IBM Plex Mono", ui-monospace, monospace';
  ctx.fillText(modul.toUpperCase(), 40, 48);
  ctx.fillStyle = TEXT;
  ctx.font = '500 34px "Inter Tight", system-ui, sans-serif';
  ctx.fillText(titel, 40, 96);
  ctx.strokeStyle = LINIE;
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(40, 122.5); ctx.lineTo(w - 40, 122.5); ctx.stroke();
}

function kasten(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, hell = false) {
  ctx.fillStyle = hell ? 'rgba(77,166,255,0.08)' : 'rgba(255,255,255,0.025)';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = hell ? 'rgba(77,166,255,0.45)' : LINIE;
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
}

function zeile(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, farbe = SCHWACH, hoehe = 6) {
  ctx.fillStyle = farbe;
  ctx.fillRect(x, y, w, hoehe);
}

/* ------------------------------------------------- 01 Angebotssystem */
export const angebotssystem: Maler = (ctx, w, h, t) => {
  grund(ctx, w, h);
  kopf(ctx, w, 'Angebotssystem', 'Modul 01 · extraction');

  const y0 = 165;
  // PDF-Quelle
  kasten(ctx, 40, y0, 190, 230);
  ctx.fillStyle = SCHWACH;
  ctx.font = '500 13px "IBM Plex Mono", monospace';
  ctx.fillText('EINGANG · PDF', 56, y0 + 28);
  for (let i = 0; i < 7; i++) zeile(ctx, 56, y0 + 50 + i * 22, 150 - (i % 3) * 30);

  // Extrahierte Felder
  kasten(ctx, 280, y0, 210, 230);
  ctx.fillStyle = SCHWACH;
  ctx.fillText('EXTRAHIERT', 296, y0 + 28);
  const felder = ['Typ', 'Leistung', 'Medium', 'Druck', 'Temperatur', 'Material'];
  felder.forEach((f, i) => {
    const an = (t * 1.1) % 9 > i;
    ctx.fillStyle = an ? TEXT : '#26313C';
    ctx.font = '400 13px "Inter Tight", sans-serif';
    ctx.fillText(f, 296, y0 + 58 + i * 28);
    zeile(ctx, 392, y0 + 50 + i * 28, 78, an ? AKZENT : '#26313C', 5);
  });

  // Angebot
  kasten(ctx, 540, y0, 200, 230, true);
  ctx.fillStyle = AKZENT;
  ctx.font = '500 13px "IBM Plex Mono", monospace';
  ctx.fillText('ANGEBOT', 556, y0 + 28);
  for (let i = 0; i < 5; i++) zeile(ctx, 556, y0 + 54 + i * 24, 150 - (i % 2) * 40, '#3E566E');
  ctx.fillStyle = TEXT;
  ctx.font = '500 26px "IBM Plex Mono", monospace';
  ctx.fillText('— — —', 556, y0 + 198);

  // Datenimpulse zwischen den Boxen
  ctx.fillStyle = GLUT;
  for (let i = 0; i < 4; i++) {
    const ph = ((t * 0.45 + i * 0.25) % 1);
    const x = 230 + ph * 50;
    ctx.globalAlpha = Math.sin(ph * Math.PI);
    ctx.fillRect(x, y0 + 80 + i * 34, 7, 2);
    const x2 = 490 + ph * 50;
    ctx.fillRect(x2, y0 + 96 + i * 30, 7, 2);
  }
  ctx.globalAlpha = 1;
};

/* -------------------------------------------------- 02 Prozess-Cockpit */
export const cockpit: Maler = (ctx, w, h, t) => {
  grund(ctx, w, h);
  kopf(ctx, w, 'Prozess-Cockpit', 'Modul 02 · monitoring');

  // Festes Spaltenraster: Rand, gleiche Boxbreite, gleiche Luecke.
  const RAND = 40;
  const LUECKE = 22;
  const SPALTEN = 3;
  const BOX = Math.floor((w - RAND * 2 - LUECKE * (SPALTEN - 1)) / SPALTEN);
  const INNEN = 18;
  const NUTZ = BOX - INNEN * 2;

  const werte = [
    { l: 'DURCHSATZ', z: 1240, s: '/Tag' },
    { l: 'AUTOMATISIERT', z: 94, s: '%' },
    { l: 'AUSNAHMEN', z: 17, s: '' },
  ];
  werte.forEach((v, i) => {
    const x = RAND + i * (BOX + LUECKE);
    kasten(ctx, x, 165, BOX, 130);

    ctx.fillStyle = SCHWACH;
    passeEin(ctx, v.l, NUTZ, 12, 9, '"IBM Plex Mono", monospace', '500');
    ctx.fillText(kuerze(ctx, v.l, NUTZ), x + INNEN, 192);

    const lauf = Math.min(1, t / 2.2);
    // Endwert messen, nicht den laufenden — sonst springt die Groesse waehrend
    // des Hochzaehlens.
    const endtext = v.z + v.s;
    const laufend = Math.round(v.z * lauf) + v.s;
    ctx.fillStyle = TEXT;
    passeEin(ctx, endtext, NUTZ, 44, 20);
    ctx.fillText(laufend, x + INNEN, 252);
  });

  // Status-Pills
  const pills = [
    ['Extraktion', 'ok'], ['Kalkulation', 'ok'],
    ['Prüflogik', 'warn'], ['ERP-Sync', 'ok'],
  ];
  // Gleiches Raster wie die KPI-Boxen: Rand, gleiche Breite, gleiche Luecke.
  const PB = Math.floor((w - RAND * 2 - 14 * (pills.length - 1)) / pills.length);
  pills.forEach((p, i) => {
    const x = RAND + i * (PB + 14);
    const farbe = p[1] === 'ok' ? '#3FB950' : '#F0B429';
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(x, 325, PB, 34);
    ctx.strokeStyle = LINIE; ctx.strokeRect(x + 0.5, 325.5, PB - 1, 33);
    ctx.fillStyle = farbe;
    const puls = 0.55 + 0.45 * Math.sin(t * 2 + i);
    ctx.globalAlpha = p[1] === 'warn' ? puls : 1;
    ctx.beginPath(); ctx.arc(x + 18, 342, 4, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = TEXT;
    passeEin(ctx, p[0], PB - 44, 14, 10, '"Inter Tight", sans-serif', '400');
    ctx.fillText(kuerze(ctx, p[0], PB - 44), x + 34, 347);
  });

  // Verlaufskurve
  ctx.strokeStyle = AKZENT; ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i <= 60; i++) {
    const x = RAND + (i / 60) * (w - RAND * 2);
    const y = 460 - (Math.sin(i * 0.25 + t * 0.5) * 0.5 + 0.5) * 60 - Math.sin(i * 0.08) * 18;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();
};

/* -------------------------------------------------- 03 KI-Prüflogik */
export const pruefLogik: Maler = (ctx, w, h, t) => {
  grund(ctx, w, h);
  kopf(ctx, w, 'KI-Prüflogik', 'Modul 03 · audit-trail');

  const regeln = [
    'Auslegungsdaten vollständig',
    'Druckstufe im zulässigen Bereich',
    'Materialpaarung zulässig',
    'Toleranzen eingehalten',
    'Preisstaffel angewendet',
    'Freigabegrenze geprüft',
  ];
  regeln.forEach((r, i) => {
    const y = 172 + i * 48;
    const fertig = (t * 0.9) % 8 > i + 0.5;
    ctx.strokeStyle = fertig ? AKZENT : LINIE;
    ctx.lineWidth = 1;
    ctx.strokeRect(40.5, y - 14.5, 22, 22);
    if (fertig) {
      ctx.strokeStyle = AKZENT; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(45, y - 4); ctx.lineTo(50, y + 2); ctx.lineTo(58, y - 9);
      ctx.stroke();
    }
    ctx.fillStyle = fertig ? TEXT : SCHWACH;
    ctx.font = '400 16px "Inter Tight", sans-serif';
    ctx.fillText(r, 78, y + 4);
  });

  // Befund-Karte
  kasten(ctx, 470, 165, 290, 180, true);
  ctx.fillStyle = AKZENT;
  ctx.font = '500 12px "IBM Plex Mono", monospace';
  ctx.fillText('BEFUND · ZUR PRÜFUNG', 490, 194);
  ctx.fillStyle = TEXT;
  ctx.font = '400 15px "Inter Tight", sans-serif';
  ctx.fillText('Grenzfall erkannt.', 490, 228);
  ctx.fillStyle = SCHWACH;
  ctx.font = '400 13px "Inter Tight", sans-serif';
  ctx.fillText('Position 4 überschreitet die', 490, 254);
  ctx.fillText('hinterlegte Toleranz um 2,1 %.', 490, 274);
  ctx.fillText('Nicht automatisch freigegeben.', 490, 294);
  zeile(ctx, 490, 316, 120, AKZENT, 2);
};

/* -------------------------------------------------- 04 Integrationen */
export const integrationen: Maler = (ctx, w, h, t) => {
  grund(ctx, w, h);
  kopf(ctx, w, 'Integrationen', 'Modul 04 · erp-sync');

  const knoten = [
    { x: 150, y: 250, l: 'ERP' },
    { x: 400, y: 180, l: 'E-Mail' },
    { x: 400, y: 330, l: 'Datenbank' },
    { x: 650, y: 250, l: 'POZA-KI' },
  ];
  const kanten: [number, number][] = [[0, 3], [1, 3], [2, 3], [0, 2]];

  ctx.strokeStyle = LINIE; ctx.lineWidth = 1;
  kanten.forEach(([a, b]) => {
    ctx.beginPath();
    ctx.moveTo(knoten[a].x, knoten[a].y);
    ctx.lineTo(knoten[b].x, knoten[b].y);
    ctx.stroke();
  });

  // laufende Pakete
  ctx.fillStyle = GLUT;
  kanten.forEach(([a, b], i) => {
    const ph = (t * 0.4 + i * 0.28) % 1;
    const x = knoten[a].x + (knoten[b].x - knoten[a].x) * ph;
    const y = knoten[a].y + (knoten[b].y - knoten[a].y) * ph;
    ctx.globalAlpha = Math.sin(ph * Math.PI);
    ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
  });
  ctx.globalAlpha = 1;

  knoten.forEach((k, i) => {
    const haupt = i === 3;
    ctx.fillStyle = haupt ? 'rgba(77,166,255,0.1)' : 'rgba(255,255,255,0.03)';
    ctx.fillRect(k.x - 66, k.y - 26, 132, 52);
    ctx.strokeStyle = haupt ? AKZENT : LINIE;
    ctx.strokeRect(k.x - 65.5, k.y - 25.5, 131, 51);
    ctx.fillStyle = haupt ? AKZENT : TEXT;
    ctx.font = '500 15px "Inter Tight", sans-serif';
    const tw = ctx.measureText(k.l).width;
    ctx.fillText(k.l, k.x - tw / 2, k.y + 5);
  });
};

/* -------------------------------------------------- 05 Beratung & Audit */
export const audit: Maler = (ctx, w, h, t) => {
  grund(ctx, w, h);
  kopf(ctx, w, 'Beratung & Audit', 'Modul 05 · process-map');

  // Prozess-Landkarte, die sich zeichnet
  const punkte = [
    [70, 420], [180, 360], [270, 400], [370, 300], [470, 340], [560, 250], [680, 290], [760, 210],
  ];
  const fortschritt = Math.min(1, ((t * 0.35) % 4) / 2.4);
  ctx.strokeStyle = AKZENT; ctx.lineWidth = 2;
  ctx.beginPath();
  const bis = fortschritt * (punkte.length - 1);
  ctx.moveTo(punkte[0][0], punkte[0][1]);
  for (let i = 1; i < punkte.length; i++) {
    if (i <= bis) {
      ctx.lineTo(punkte[i][0], punkte[i][1]);
    } else {
      const f = bis - (i - 1);
      if (f > 0) {
        ctx.lineTo(
          punkte[i - 1][0] + (punkte[i][0] - punkte[i - 1][0]) * f,
          punkte[i - 1][1] + (punkte[i][1] - punkte[i - 1][1]) * f,
        );
      }
      break;
    }
  }
  ctx.stroke();

  punkte.forEach((p, i) => {
    const an = i <= bis;
    ctx.fillStyle = an ? AKZENT : '#26313C';
    ctx.beginPath(); ctx.arc(p[0], p[1], an ? 5 : 3, 0, Math.PI * 2); ctx.fill();
  });

  const stationen = ['Ist-Prozess', 'Datenquellen', 'Entscheidungen', 'Ausnahmen', 'Potenzial'];
  stationen.forEach((s, i) => {
    const y = 175 + i * 30;
    ctx.fillStyle = i < fortschritt * 5 ? TEXT : SCHWACH;
    ctx.font = '400 15px "Inter Tight", sans-serif';
    ctx.fillText(s, 70, y);
  });
};

export const PANELS: { titel: string; modul: string; tags: string[]; maler: Maler }[] = [
  { titel: 'Angebotssystem', modul: 'extraction', tags: ['extraction', 'pdf-parsing', 'quote-gen'], maler: angebotssystem },
  { titel: 'Prozess-Cockpit', modul: 'monitoring', tags: ['monitoring', 'kpi', 'live-status'], maler: cockpit },
  { titel: 'KI-Prüflogik', modul: 'audit-trail', tags: ['rules', 'audit-trail', 'human-review'], maler: pruefLogik },
  { titel: 'Integrationen', modul: 'erp-sync', tags: ['erp-sync', 'api', 'data-model'], maler: integrationen },
  { titel: 'Beratung & Audit', modul: 'process-map', tags: ['discovery', 'process-map', 'roadmap'], maler: audit },
];
