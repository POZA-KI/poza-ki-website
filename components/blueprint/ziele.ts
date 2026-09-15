/**
 * Zielgeometrie der Blueprint-Phase: Modul-Quader um einen zentralen Bus.
 *
 * Erzeugt zwei Dinge aus derselben Quelle:
 *   1. Partikel-Zielpositionen (auf den Kanten verteilt) — dorthin morphen
 *      die chaotischen Partikel aus Phase 1.
 *   2. Die Kantenliste fuer das Wireframe, das in Phase 2 sichtbar wird.
 * Beides aus einer Definition, damit Partikel und Linien exakt deckungsgleich
 * liegen.
 */

export type Kante = [number, number, number, number, number, number];

/** Module: [x, y, z, breite, hoehe, tiefe, label] */
const MODULE: [number, number, number, number, number, number, string][] = [
  [-26, 9, 0, 13, 7, 9, 'module.core'],
  [-26, -9, 0, 13, 7, 9, 'module.data'],
  [0, 14, -3, 15, 8, 10, 'pipeline.sync'],
  [0, -14, -3, 15, 8, 10, 'rules.engine'],
  [26, 9, 0, 13, 7, 9, 'api.gateway'],
  [26, -9, 0, 13, 7, 9, 'erp.adapter'],
];

/** Der zentrale Bus als flacher, langer Quader. */
const BUS: [number, number, number, number, number, number] = [0, 0, 0, 74, 2.4, 4];

function quaderKanten(
  cx: number, cy: number, cz: number, b: number, h: number, t: number,
): Kante[] {
  const x0 = cx - b / 2, x1 = cx + b / 2;
  const y0 = cy - h / 2, y1 = cy + h / 2;
  const z0 = cz - t / 2, z1 = cz + t / 2;
  const e: Kante[] = [];
  const p = [
    [x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0],
    [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1],
  ];
  const paare = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7],
  ];
  for (const [a, bb] of paare) {
    e.push([p[a][0], p[a][1], p[a][2], p[bb][0], p[bb][1], p[bb][2]]);
  }
  return e;
}

export function baueBlueprint(anzahlPartikel: number) {
  const kanten: Kante[] = [];
  for (const [x, y, z, b, h, t] of MODULE) kanten.push(...quaderKanten(x, y, z, b, h, t));
  kanten.push(...quaderKanten(...BUS));

  // Anbindung jedes Moduls an den Bus
  for (const [x, y] of MODULE) {
    const richtung = y > 0 ? -1 : 1;
    kanten.push([x, y + richtung * 3.5, 0, x, 0, 0]);
  }

  // Partikel gleichmaessig auf alle Kanten verteilen
  const ziele = new Float32Array(anzahlPartikel * 3);
  for (let i = 0; i < anzahlPartikel; i++) {
    const k = kanten[i % kanten.length];
    const t = (Math.floor(i / kanten.length) + 0.5) / Math.ceil(anzahlPartikel / kanten.length);
    const jitter = 0.16;
    ziele[i * 3] = k[0] + (k[3] - k[0]) * t + (Math.random() - 0.5) * jitter;
    ziele[i * 3 + 1] = k[1] + (k[4] - k[1]) * t + (Math.random() - 0.5) * jitter;
    ziele[i * 3 + 2] = k[2] + (k[5] - k[2]) * t + (Math.random() - 0.5) * jitter;
  }

  // Flache Positionsliste fuer LineSegments
  const linien = new Float32Array(kanten.length * 6);
  kanten.forEach((k, i) => linien.set(k, i * 6));

  return { ziele, linien, kantenAnzahl: kanten.length, module: MODULE };
}

/** Annotationen, die in Phase 2 an den Kanten aufpoppen. */
export const ANNOTATIONEN = [
  { text: 'spec → build', x: -26, y: 16, ab: 0.34 },
  { text: 'module.core', x: -26, y: 9, ab: 0.4 },
  { text: 'pipeline.sync', x: 0, y: 22, ab: 0.46 },
  { text: 'rules.engine', x: 0, y: -22, ab: 0.52 },
  { text: 'erp.adapter', x: 26, y: -16, ab: 0.58 },
  { text: 'bus.main', x: 0, y: 4.5, ab: 0.62 },
];
