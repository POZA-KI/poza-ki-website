/**
 * Animierte Texturen der drei Produkt-Panels. Gleiche Bauart wie die
 * Gallery-Mocks: 2D-Canvas, generisch, keine echten Nutzerdaten.
 * Werden als CanvasTexture in die gekruemmten 3D-Panels gehaengt.
 */

export type Maler = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => void;

const BG = '#0B0F14';
const LINIE = '#1E2933';
const TEXT = '#C9D4E0';
const SCHWACH = '#5C6B7C';
const AKZENT = '#4DA6FF';
const GLUT = '#8FCBFF';
const WARM = '#F0A63C';

function grund(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(30,41,51,0.5)';
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 44) { ctx.beginPath(); ctx.moveTo(x + .5, 0); ctx.lineTo(x + .5, h); ctx.stroke(); }
  for (let y = 0; y < h; y += 44) { ctx.beginPath(); ctx.moveTo(0, y + .5); ctx.lineTo(w, y + .5); ctx.stroke(); }
}

function kopf(ctx: CanvasRenderingContext2D, w: number, marke: string, versal: boolean, unter: string) {
  ctx.fillStyle = TEXT;
  ctx.font = `600 ${versal ? 30 : 32}px "Inter Tight", sans-serif`;
  if (versal) {
    // Versalien mit weitem Tracking von Hand setzen
    let x = 36;
    for (const c of marke) { ctx.fillText(c, x, 62); x += ctx.measureText(c).width + 7; }
  } else {
    ctx.fillText(marke, 36, 62);
  }
  ctx.fillStyle = SCHWACH;
  ctx.font = '500 12px "IBM Plex Mono", monospace';
  ctx.fillText(unter.toUpperCase(), 36, 86);
  ctx.strokeStyle = LINIE;
  ctx.beginPath(); ctx.moveTo(36, 104.5); ctx.lineTo(w - 36, 104.5); ctx.stroke();
}

/* ------------------------------------------------------------- FREI */
export const frei: Maler = (ctx, w, h, t) => {
  grund(ctx, w, h);
  kopf(ctx, w, 'FREI', true, 'gründer-app · dach');

  // XP-Balken fuellt sich, springt bei Voll auf Level-Up
  const zyklus = (t * 0.32) % 1;
  const xp = Math.min(1, zyklus / 0.82);
  ctx.fillStyle = SCHWACH;
  ctx.font = '500 12px "IBM Plex Mono", monospace';
  ctx.fillText('XP', 36, 150);
  ctx.fillText(`${Math.round(xp * 100)} / 100`, w - 110, 150);

  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  ctx.fillRect(36, 164, w - 72, 14);
  ctx.fillStyle = AKZENT;
  ctx.fillRect(36, 164, (w - 72) * xp, 14);
  if (xp > 0.99) {
    const puls = Math.sin((zyklus - 0.82) / 0.18 * Math.PI);
    ctx.fillStyle = `rgba(143,203,255,${puls * 0.9})`;
    ctx.fillRect(36, 158, w - 72, 26);
    ctx.fillStyle = `rgba(207,230,255,${puls})`;
    ctx.font = '600 18px "Inter Tight", sans-serif';
    ctx.fillText('LEVEL UP', 36, 212);
  }

  // Streak-Flamme
  const flamme = 0.6 + 0.4 * Math.sin(t * 5);
  ctx.fillStyle = `rgba(240,166,60,${flamme})`;
  ctx.beginPath();
  ctx.moveTo(52, 300); ctx.quadraticCurveTo(38, 268, 52, 244);
  ctx.quadraticCurveTo(66, 268, 52, 300);
  ctx.fill();
  ctx.fillStyle = TEXT;
  ctx.font = '600 22px "Inter Tight", sans-serif';
  ctx.fillText('14', 74, 288);
  ctx.fillStyle = SCHWACH;
  ctx.font = '400 13px "Inter Tight", sans-serif';
  ctx.fillText('Tage Streak', 74, 306);

  // Quests
  const quests = ['Idee validiert', 'Erste 10 Nutzer', 'Pitch aufgenommen'];
  quests.forEach((q, i) => {
    const fertig = (t * 0.5) % 5 > i + 1;
    ctx.strokeStyle = fertig ? AKZENT : LINIE;
    ctx.strokeRect(w - 300.5, 243.5 + i * 34, 18, 18);
    if (fertig) {
      ctx.strokeStyle = AKZENT; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(w - 296, 252 + i * 34); ctx.lineTo(w - 291, 257 + i * 34); ctx.lineTo(w - 284, 248 + i * 34);
      ctx.stroke(); ctx.lineWidth = 1;
    }
    ctx.fillStyle = fertig ? TEXT : SCHWACH;
    ctx.font = '400 14px "Inter Tight", sans-serif';
    ctx.fillText(q, w - 272, 257 + i * 34);
  });
};

/* ----------------------------------------------------------- CABION */
export const cabion: Maler = (ctx, w, h, t) => {
  grund(ctx, w, h);
  kopf(ctx, w, 'CABION', true, 'ki-erp · industrie');

  const boxY = 145;
  const boxH = 190;
  const bw = Math.floor((w - 72 - 2 * 44) / 3);
  const titel = ['PDF', 'DATENFELDER', 'ANGEBOT'];
  for (let i = 0; i < 3; i++) {
    const x = 36 + i * (bw + 44);
    ctx.fillStyle = i === 2 ? 'rgba(77,166,255,0.08)' : 'rgba(255,255,255,0.025)';
    ctx.fillRect(x, boxY, bw, boxH);
    ctx.strokeStyle = i === 2 ? 'rgba(77,166,255,0.45)' : LINIE;
    ctx.strokeRect(x + .5, boxY + .5, bw - 1, boxH - 1);
    ctx.fillStyle = i === 2 ? AKZENT : SCHWACH;
    ctx.font = '500 11px "IBM Plex Mono", monospace';
    ctx.fillText(titel[i], x + 14, boxY + 24);

    for (let k = 0; k < 5; k++) {
      const an = i === 0 || (t * 1.2) % 7 > k + i * 0.6;
      ctx.fillStyle = an ? (i === 2 ? '#3E566E' : SCHWACH) : '#232E39';
      ctx.fillRect(x + 14, boxY + 46 + k * 22, (bw - 28) * (0.55 + (k % 3) * 0.15), 5);
    }
  }

  // Impulse zwischen den Boxen
  ctx.fillStyle = GLUT;
  for (let i = 0; i < 2; i++) {
    for (let k = 0; k < 3; k++) {
      const ph = ((t * 0.55 + k * 0.3 + i * 0.15) % 1);
      const x0 = 36 + i * (bw + 44) + bw;
      ctx.globalAlpha = Math.sin(ph * Math.PI) * 0.9;
      ctx.fillRect(x0 + ph * 44, boxY + 70 + k * 34, 8, 2);
    }
  }
  ctx.globalAlpha = 1;
};

/* -------------------------------------------------------- BELEGFREI */
export const belegfrei: Maler = (ctx, w, h, t) => {
  grund(ctx, w, h);
  kopf(ctx, w, 'BelegFrei', false, 'beleg- und rechnungsverarbeitung');

  // Belege fliegen ein und rasten in Zeilen ein
  const zeilen = 5;
  for (let i = 0; i < zeilen; i++) {
    const ab = i * 0.6;
    const ph = Math.min(1, Math.max(0, ((t * 0.8) % 6 - ab) / 1.1));
    const zielY = 152 + i * 38;
    const y = zielY - (1 - ph) * 120;
    const x = 36 + (1 - ph) * 70;
    const alpha = ph;

    ctx.globalAlpha = alpha;
    // Beleg
    ctx.fillStyle = 'rgba(255,255,255,0.045)';
    ctx.fillRect(x, y, 54, 26);
    ctx.strokeStyle = LINIE;
    ctx.strokeRect(x + .5, y + .5, 53, 25);
    // strukturierte Zeile
    if (ph > 0.85) {
      const a2 = (ph - 0.85) / 0.15;
      ctx.globalAlpha = a2;
      ctx.fillStyle = SCHWACH;
      ctx.fillRect(x + 68, y + 6, 150, 5);
      ctx.fillRect(x + 232, y + 6, 74, 5);
      ctx.fillStyle = '#3E566E';
      ctx.fillRect(x + 320, y + 6, 60, 5);
      // Haekchen
      ctx.strokeStyle = AKZENT; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(w - 78, y + 12); ctx.lineTo(w - 72, y + 18); ctx.lineTo(w - 60, y + 4);
      ctx.stroke(); ctx.lineWidth = 1;
    }
    ctx.globalAlpha = 1;
  }

  ctx.fillStyle = SCHWACH;
  ctx.font = '500 11px "IBM Plex Mono", monospace';
  ctx.fillText('EINGANG', 36, 136);
  ctx.fillText('STRUKTURIERT', 200, 136);
  ctx.fillText('GEPRÜFT', w - 110, 136);
};

export const PRODUKT_MALER: Record<string, Maler> = {
  FREI: frei,
  CABION: cabion,
  BelegFrei: belegfrei,
};
