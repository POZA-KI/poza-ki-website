'use client';

/**
 * Das Netz — tragendes visuelles Element der gesamten Seite.
 *
 * CANVAS STATT SVG
 * Bei bis zu 320 Knoten, 900 Kanten und 14 Impulsen sind das ~1.250 bewegte
 * Primitive pro Frame. Als SVG wären das ebenso viele DOM-Knoten, deren
 * Attribute 60×/s geschrieben würden — Style-Recalc und Layout-Invalidierung
 * fressen dann das Frame-Budget. Canvas zeichnet denselben Frame in einem
 * Paint. WebGL wäre Overkill: keine Shader nötig, dafür Bundle und Fallback.
 *
 * PERFORMANCE-TRICKS
 * - Positionen in Float32Array, nicht in Objekt-Arrays.
 * - Im Loop keine Allokation: keine Closures, kein map, kein new.
 * - Kanten-Alpha auf 6 Buckets quantisiert -> 6 stroke()-Calls statt 900.
 * - Adjazenzlisten werden pro Formation EINMAL gebaut, nie pro Frame.
 * - Nachbarsuche über uniformes Raster (Zellgröße = d_max) -> O(n) statt O(n²).
 * - kein shadowBlur (3-6× Kosten je Draw); Hub-Glühen ist ein Offscreen-Sprite.
 *
 * ANTRIEB
 * Motions useScroll liefert den Fortschritt, useSpring entkoppelt ihn, damit
 * ein Trackpad-Fling das Netz nicht zerreißt. Der Wert wird im rAF gelesen —
 * so entsteht kein React-Rerender pro Frame.
 */

import { useEffect, useRef } from 'react';
import { useScroll, useSpring } from 'motion/react';

const TIER_HUB = 0;
const D_MAX = 0.17;
const ALPHA_BUCKETS = [0.08, 0.16, 0.26, 0.4, 0.6, 0.85];

/** Formationen in Scroll-Reihenfolge. */
const F_STREUUNG = 0;
const F_NETZ = 1;
const F_CLUSTER = 2;
const F_PIPELINE = 3;
const F_LEITER = 4;
const N_FORM = 5;

/**
 * Scroll-Stops, kalibriert an den TATSÄCHLICHEN Sektionspositionen der Seite
 * (im Browser gemessen, nicht geschätzt):
 *   Hero 0 · Medien .093 · These .12 · Leistungen .223 · Case .346
 *   Vorgehen .498 · Offer .637 · Gründer .772 · FAQ .868 · Kontakt .995
 * Die Werte verschieben sich leicht mit der Viewport-Höhe; für die Dramaturgie
 * ist das unkritisch, weil zwischen den Stops interpoliert wird.
 */
const STOPS: { p: number; f: number }[] = [
  { p: 0.0, f: F_STREUUNG },
  { p: 0.075, f: F_NETZ },   // Chaos wird Struktur, während die Headline steht
  { p: 0.223, f: F_CLUSTER }, // Leistungen: drei Gruppen unter den drei Cards
  { p: 0.346, f: F_PIPELINE },// Case: gerichtete Kette
  { p: 0.498, f: F_LEITER },  // Vorgehen: vier Bänder
  { p: 1.0, f: F_LEITER },
];

/**
 * Sichtbarkeit je Scrollbereich, als interpolierte Kurve statt Stufen.
 * Textlastige Sektionen (These, Offer, Gründer, FAQ) fahren das Netz weit
 * herunter — dort trägt die Typografie, und --text-primary muss seine 16.53:1
 * halten können. Gemessen: ohne diese Dämpfung stand die These-Copy direkt
 * auf den Kanten und war schlecht lesbar.
 */
const OPAZITAET: [number, number][] = [
  [0.0, 1.0],    // Hero
  [0.085, 0.85],
  [0.1, 0.1],    // Medienleiste
  [0.13, 0.07],  // These — fast aus
  [0.21, 0.07],
  [0.25, 0.42],  // Leistungen
  [0.33, 0.45],
  [0.37, 0.58],  // Case — dichteste Sektion, Netz darf tragen
  [0.47, 0.55],
  [0.52, 0.32],  // Vorgehen
  [0.61, 0.3],
  [0.66, 0.1],   // Offer
  [0.79, 0.1],   // Gründer
  [0.88, 0.05],  // FAQ
  [1.0, 0.05],
];

function sektionsOpazitaet(p: number) {
  if (p <= OPAZITAET[0][0]) return OPAZITAET[0][1];
  const letzte = OPAZITAET[OPAZITAET.length - 1];
  if (p >= letzte[0]) return letzte[1];
  for (let i = 0; i < OPAZITAET.length - 1; i++) {
    const [pa, va] = OPAZITAET[i];
    const [pb, vb] = OPAZITAET[i + 1];
    if (p >= pa && p <= pb) {
      const t = pb > pa ? (p - pa) / (pb - pa) : 0;
      return va + (vb - va) * smoothstep(t);
    }
  }
  return letzte[1];
}

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smoothstep = (x: number) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.trim().replace('#', '');
  const v =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h;
  return [
    parseInt(v.slice(0, 2), 16) || 0,
    parseInt(v.slice(2, 4), 16) || 0,
    parseInt(v.slice(4, 6), 16) || 0,
  ];
}

function budget() {
  const w = window.innerWidth;
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean };
    hardwareConcurrency?: number;
  };
  const sparsam = nav.connection?.saveData === true || (nav.hardwareConcurrency ?? 8) <= 4;
  if (sparsam) return { n: 90, maxE: 200, maxP: 3 };
  if (w >= 1440) return { n: 320, maxE: 900, maxP: 14 };
  if (w >= 1024) return { n: 240, maxE: 680, maxP: 11 };
  if (w >= 768) return { n: 180, maxE: 480, maxP: 8 };
  return { n: 110, maxE: 280, maxP: 5 };
}

export default function Lattice() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const { scrollYProgress } = useScroll();
  const gefedert = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 22,
    restDelta: 0.0005,
  });

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let W = 0;
    let H = 0;
    let dpr = 1;
    let N = 0;
    let MAX_E = 0;
    let MAX_P = 0;
    let raf = 0;
    let lebt = true;
    let degradiert = false;
    let langsameFrames = 0;

    /* ---- Knotendaten (SoA, keine Objekte) ---- */
    let px!: Float32Array; // aktuelle Position, normalisiert
    let py!: Float32Array;
    let vx!: Float32Array;
    let vy!: Float32Array;
    let seed!: Float32Array;
    let tier!: Uint8Array;
    let ziele: Float32Array[] = []; // pro Formation: [x0,y0,x1,y1,...]
    let adj: Int32Array[] = []; // pro Formation: flache Kantenliste [a,b,a,b,...]

    /* ---- Farben ---- */
    let cNode: [number, number, number] = [74, 84, 95];
    let cEdge: [number, number, number] = [35, 42, 49];
    let cPulse: [number, number, number] = [143, 203, 255];
    let cAccent: [number, number, number] = [77, 166, 255];
    let hubSprite: HTMLCanvasElement | null = null;

    function leseFarben() {
      const cs = getComputedStyle(document.documentElement);
      const g = (n: string, f: string) => cs.getPropertyValue(n).trim() || f;
      cNode = hexToRgb(g('--net-node', '#4A545F'));
      cEdge = hexToRgb(g('--net-edge', '#232A31'));
      cPulse = hexToRgb(g('--net-pulse', '#8FCBFF'));
      cAccent = hexToRgb(g('--net-node-active', '#4DA6FF'));
    }

    /** Hub-Glühen einmalig rendern statt pro Frame shadowBlur zu zahlen. */
    function baueHubSprite() {
      const s = document.createElement('canvas');
      s.width = 16;
      s.height = 16;
      const c = s.getContext('2d');
      if (!c) return;
      const g = c.createRadialGradient(8, 8, 0, 8, 8, 8);
      g.addColorStop(0, `rgba(${cAccent[0]},${cAccent[1]},${cAccent[2]},0.30)`);
      g.addColorStop(1, `rgba(${cAccent[0]},${cAccent[1]},${cAccent[2]},0)`);
      c.fillStyle = g;
      c.fillRect(0, 0, 16, 16);
      hubSprite = s;
    }

    /* ---- Formationen ------------------------------------------------ */

    function formStreuung(out: Float32Array, rnd: () => number) {
      // Poisson-artig: Kandidaten verwerfen, die zu nah liegen (begrenzte Versuche)
      const r = 0.045;
      let i = 0;
      let schutz = 0;
      while (i < N && schutz < N * 40) {
        const x = 0.06 + rnd() * 0.88;
        const y = 0.08 + rnd() * 0.84;
        let ok = true;
        for (let j = 0; j < i; j++) {
          const dx = out[j * 2] - x;
          const dy = out[j * 2 + 1] - y;
          if (dx * dx + dy * dy < r * r) {
            ok = false;
            break;
          }
        }
        schutz++;
        if (!ok) continue;
        out[i * 2] = x;
        out[i * 2 + 1] = y;
        i++;
      }
      for (; i < N; i++) {
        out[i * 2] = 0.06 + rnd() * 0.88;
        out[i * 2 + 1] = 0.08 + rnd() * 0.84;
      }
    }

    function formNetz(out: Float32Array, rnd: () => number) {
      const seitenverhaeltnis = W / Math.max(1, H);
      const spalten = Math.max(2, Math.round(Math.sqrt(N * seitenverhaeltnis)));
      const zeilen = Math.ceil(N / spalten);
      const zw = 0.9 / spalten;
      const zh = 0.82 / zeilen;
      for (let i = 0; i < N; i++) {
        const c = i % spalten;
        const r = Math.floor(i / spalten);
        const versatz = r % 2 === 1 ? zw * 0.5 : 0; // hexagonal
        out[i * 2] = 0.05 + (c + 0.5) * zw + versatz + (rnd() - 0.5) * zw * 0.4;
        out[i * 2 + 1] = 0.09 + (r + 0.5) * zh + (rnd() - 0.5) * zh * 0.4;
      }
    }

    function formCluster(out: Float32Array) {
      const zx = [0.22, 0.5, 0.78];
      const GOLD = Math.PI * (3 - Math.sqrt(5));
      const proCluster = Math.ceil(N / 3);
      for (let i = 0; i < N; i++) {
        const g = i % 3;
        const rang = Math.floor(i / 3);
        const rad = 0.07 + 0.055 * Math.sqrt(rang / Math.max(1, proCluster));
        const w = rang * GOLD;
        out[i * 2] = zx[g] + Math.cos(w) * rad;
        out[i * 2 + 1] = 0.5 + Math.sin(w) * rad * 1.25;
      }
    }

    function formPipeline(out: Float32Array, rnd: () => number) {
      const stageX = [0.14, 0.38, 0.62, 0.86];
      const laneY = [0.34, 0.5, 0.66];
      const kapazitaet = stageX.length * laneY.length * 9;
      for (let i = 0; i < N; i++) {
        if (i >= kapazitaet) {
          // Überzählige fahren unter den Rand und verblassen dort
          out[i * 2] = 0.5 + (rnd() - 0.5) * 0.8;
          out[i * 2 + 1] = 1.15 + rnd() * 0.15;
          continue;
        }
        const s = i % stageX.length;
        const l = Math.floor(i / stageX.length) % laneY.length;
        const tief = Math.floor(i / (stageX.length * laneY.length));
        out[i * 2] = stageX[s] + (rnd() - 0.5) * 0.05 + tief * 0.004;
        out[i * 2 + 1] = laneY[l] + (rnd() - 0.5) * 0.08;
      }
    }

    function formLeiter(out: Float32Array, rnd: () => number) {
      const bandY = [0.2, 0.4, 0.6, 0.8];
      const proBand = Math.ceil(N / bandY.length);
      for (let i = 0; i < N; i++) {
        const b = Math.floor(i / proBand) % bandY.length;
        const k = i % proBand;
        // logarithmisch abnehmende Dichte nach rechts
        const t = Math.log1p((k / Math.max(1, proBand - 1)) * 9) / Math.log(10);
        out[i * 2] = 0.08 + t * 0.84;
        out[i * 2 + 1] = bandY[b] + (rnd() - 0.5) * 0.035;
      }
    }

    /* ---- Kantenaufbau: kNN über uniformes Raster --------------------- */

    function baueKanten(ziel: Float32Array, nurNachbarstufen: boolean): Int32Array {
      const zellen = new Map<number, number[]>();
      const zg = D_MAX;
      const key = (cx: number, cy: number) => cx * 100000 + cy;
      for (let i = 0; i < N; i++) {
        const cx = Math.floor(ziel[i * 2] / zg);
        const cy = Math.floor(ziel[i * 2 + 1] / zg);
        const k = key(cx, cy);
        const arr = zellen.get(k);
        if (arr) arr.push(i);
        else zellen.set(k, [i]);
      }

      const gesehen = new Set<number>();
      const paare: { a: number; b: number; d: number }[] = [];
      const kandidaten: { j: number; d: number }[] = [];

      for (let i = 0; i < N; i++) {
        const k = tier[i] === TIER_HUB ? 7 : tier[i] === 1 ? 5 : 3;
        const cx = Math.floor(ziel[i * 2] / zg);
        const cy = Math.floor(ziel[i * 2 + 1] / zg);
        kandidaten.length = 0;
        for (let ox = -1; ox <= 1; ox++) {
          for (let oy = -1; oy <= 1; oy++) {
            const arr = zellen.get(key(cx + ox, cy + oy));
            if (!arr) continue;
            for (let q = 0; q < arr.length; q++) {
              const j = arr[q];
              if (j === i) continue;
              const dx = ziel[i * 2] - ziel[j * 2];
              const dy = ziel[i * 2 + 1] - ziel[j * 2 + 1];
              const d = Math.sqrt(dx * dx + dy * dy);
              if (d > D_MAX) continue;
              if (nurNachbarstufen && Math.abs(ziel[i * 2] - ziel[j * 2]) > 0.3) continue;
              kandidaten.push({ j, d });
            }
          }
        }
        kandidaten.sort((p, q) => p.d - q.d);
        for (let q = 0; q < Math.min(k, kandidaten.length); q++) {
          const j = kandidaten[q].j;
          const a = Math.min(i, j);
          const b = Math.max(i, j);
          const id = a * 100000 + b;
          if (gesehen.has(id)) continue;
          gesehen.add(id);
          paare.push({ a, b, d: kandidaten[q].d });
        }
      }

      paare.sort((p, q) => p.d - q.d);
      const anzahl = Math.min(paare.length, MAX_E);
      const out = new Int32Array(anzahl * 2);
      for (let i = 0; i < anzahl; i++) {
        out[i * 2] = paare[i].a;
        out[i * 2 + 1] = paare[i].b;
      }
      return out;
    }

    function baueAlles() {
      const rnd = mulberry32(20260914);
      ziele = [];
      for (let f = 0; f < N_FORM; f++) ziele.push(new Float32Array(N * 2));
      formStreuung(ziele[F_STREUUNG], rnd);
      formNetz(ziele[F_NETZ], rnd);
      formCluster(ziele[F_CLUSTER]);
      formPipeline(ziele[F_PIPELINE], rnd);
      formLeiter(ziele[F_LEITER], rnd);

      adj = [];
      for (let f = 0; f < N_FORM; f++) {
        adj.push(baueKanten(ziele[f], f === F_PIPELINE));
      }
    }

    function initKnoten() {
      px = new Float32Array(N);
      py = new Float32Array(N);
      vx = new Float32Array(N);
      vy = new Float32Array(N);
      seed = new Float32Array(N);
      tier = new Uint8Array(N);
      const rnd = mulberry32(99);
      for (let i = 0; i < N; i++) {
        seed[i] = rnd();
        const t = rnd();
        tier[i] = t < 0.12 ? 0 : t < 0.5 ? 1 : 2;
      }
    }

    /* ---- Impulse ---------------------------------------------------- */
    // Object-Pool: einmal allokiert, nie neu
    let pKante!: Int32Array;
    let pT!: Float32Array;
    let pSpeed!: Float32Array;
    let pHops!: Int32Array;
    let pAktiv!: Uint8Array;
    let naechsterSpawn = 0;

    function initImpulse() {
      pKante = new Int32Array(MAX_P);
      pT = new Float32Array(MAX_P);
      pSpeed = new Float32Array(MAX_P);
      pHops = new Int32Array(MAX_P);
      pAktiv = new Uint8Array(MAX_P);
    }

    function resize() {
      const b = budget();
      const neuN = degradiert ? Math.round(b.n * 0.7) : b.n;
      const rect = canvas!.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = rect.width;
      H = rect.height;
      canvas!.width = Math.round(W * dpr);
      canvas!.height = Math.round(H * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const neuAufbau = neuN !== N;
      N = neuN;
      MAX_E = b.maxE;
      MAX_P = b.maxP;

      if (neuAufbau || !px) {
        initKnoten();
        initImpulse();
        baueAlles();
        for (let i = 0; i < N; i++) {
          px[i] = ziele[F_STREUUNG][i * 2];
          py[i] = ziele[F_STREUUNG][i * 2 + 1];
        }
      } else {
        baueAlles();
      }
    }

    /* ---- Zeichnen ---------------------------------------------------- */

    function zeichne(p: number) {
      // Formationsmix aus Scrollfortschritt
      let si = 0;
      while (si < STOPS.length - 2 && p > STOPS[si + 1].p) si++;
      const a = STOPS[si];
      const b = STOPS[si + 1];
      const lokal = b.p > a.p ? clamp01((p - a.p) / (b.p - a.p)) : 1;
      const zA = ziele[a.f];
      const zB = ziele[b.f];
      const kA = adj[a.f];
      const kB = adj[b.f];

      const opa = sektionsOpazitaet(p);

      // Ziel je Knoten mit Stagger, dann kritisch gedämpft nachführen
      for (let i = 0; i < N; i++) {
        const st = seed[i] * 0.35;
        const t = smoothstep(clamp01((lokal - st) / (1 - 0.35)));
        const tx = zA[i * 2] + (zB[i * 2] - zA[i * 2]) * t;
        const ty = zA[i * 2 + 1] + (zB[i * 2 + 1] - zA[i * 2 + 1]) * t;
        const ax = (tx - px[i]) * 0.055 - vx[i] * 0.18;
        const ay = (ty - py[i]) * 0.055 - vy[i] * 0.18;
        vx[i] += ax;
        vy[i] += ay;
        px[i] += vx[i];
        py[i] += vy[i];
      }

      ctx!.clearRect(0, 0, W, H);
      if (opa <= 0.01) return;

      // --- Kanten in 6 Alpha-Buckets: 6 stroke()-Calls statt hunderter ---
      const mix = smoothstep(clamp01((lokal - 0.35) / 0.4));
      ctx!.lineWidth = 1;
      for (let pass = 0; pass < 2; pass++) {
        const kanten = pass === 0 ? kA : kB;
        const passAlpha = pass === 0 ? 1 - mix : mix;
        if (passAlpha <= 0.01) continue;
        for (let bi = 0; bi < ALPHA_BUCKETS.length; bi++) {
          const lo = bi === 0 ? 0 : ALPHA_BUCKETS[bi - 1];
          const hi = ALPHA_BUCKETS[bi];
          ctx!.beginPath();
          let gezeichnet = false;
          for (let e = 0; e < kanten.length; e += 2) {
            const i = kanten[e];
            const j = kanten[e + 1];
            const dx = px[i] - px[j];
            const dy = py[i] - py[j];
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d > D_MAX) continue;
            const av = Math.pow(1 - d / D_MAX, 1.6);
            if (av <= lo || av > hi) continue;
            ctx!.moveTo(px[i] * W, py[i] * H);
            ctx!.lineTo(px[j] * W, py[j] * H);
            gezeichnet = true;
          }
          if (!gezeichnet) continue;
          ctx!.strokeStyle = `rgba(${cEdge[0]},${cEdge[1]},${cEdge[2]},${hi * passAlpha * opa})`;
          ctx!.stroke();
        }
      }

      // --- Knoten ---
      for (let i = 0; i < N; i++) {
        if (py[i] > 1.05) continue;
        const r = tier[i] === 0 ? 2.2 : tier[i] === 1 ? 1.6 : 1.0;
        const X = px[i] * W;
        const Y = py[i] * H;
        if (tier[i] === 0) {
          if (hubSprite) ctx!.drawImage(hubSprite, X - 8, Y - 8, 16, 16);
          ctx!.strokeStyle = `rgba(${cNode[0]},${cNode[1]},${cNode[2]},${0.9 * opa})`;
          ctx!.beginPath();
          ctx!.arc(X, Y, r, 0, Math.PI * 2);
          ctx!.stroke();
        } else {
          ctx!.fillStyle = `rgba(${cNode[0]},${cNode[1]},${cNode[2]},${0.85 * opa})`;
          ctx!.beginPath();
          ctx!.arc(X, Y, r, 0, Math.PI * 2);
          ctx!.fill();
        }
      }

      // --- Impulse ---
      const kAktiv = mix < 0.5 ? kA : kB;
      const kantenAnzahl = kAktiv.length / 2;
      if (kantenAnzahl > 0) {
        const jetzt = performance.now();
        if (jetzt > naechsterSpawn) {
          for (let s = 0; s < MAX_P; s++) {
            if (pAktiv[s]) continue;
            pAktiv[s] = 1;
            pKante[s] = Math.floor(Math.random() * kantenAnzahl);
            pT[s] = 0;
            pSpeed[s] = 0.0075 + Math.random() * 0.0085;
            pHops[s] = 0;
            break;
          }
          naechsterSpawn = jetzt + 240 + Math.random() * 460;
        }

        ctx!.globalCompositeOperation = 'lighter';
        ctx!.lineWidth = 1.25;
        for (let s = 0; s < MAX_P; s++) {
          if (!pAktiv[s]) continue;
          const e = (pKante[s] % kantenAnzahl) * 2;
          const i = kAktiv[e];
          const j = kAktiv[e + 1];
          pT[s] += pSpeed[s];
          if (pT[s] >= 1) {
            // Weiterleitung erzeugt sichtbare Pfade statt zufälliger Blitzer
            const weiter = Math.random() < (a.f === F_PIPELINE ? 0.95 : 0.62);
            pHops[s]++;
            if (weiter && pHops[s] < 6) {
              pKante[s] = Math.floor(Math.random() * kantenAnzahl);
              pT[s] = 0;
            } else {
              pAktiv[s] = 0;
            }
            continue;
          }
          const x1 = px[i] * W;
          const y1 = py[i] * H;
          const x2 = px[j] * W;
          const y2 = py[j] * H;
          const t = pT[s];
          const laenge = 0.18;
          const t0 = Math.max(0, t - laenge);
          const ax2 = x1 + (x2 - x1) * t0;
          const ay2 = y1 + (y2 - y1) * t0;
          const bx2 = x1 + (x2 - x1) * t;
          const by2 = y1 + (y2 - y1) * t;
          const fade = Math.sin(t * Math.PI) * 0.85 * opa;
          const grad = ctx!.createLinearGradient(ax2, ay2, bx2, by2);
          grad.addColorStop(0, `rgba(${cPulse[0]},${cPulse[1]},${cPulse[2]},0)`);
          grad.addColorStop(1, `rgba(${cPulse[0]},${cPulse[1]},${cPulse[2]},${fade})`);
          ctx!.strokeStyle = grad;
          ctx!.beginPath();
          ctx!.moveTo(ax2, ay2);
          ctx!.lineTo(bx2, by2);
          ctx!.stroke();
        }
        ctx!.globalCompositeOperation = 'source-over';
      }
    }

    let letzte = performance.now();
    function frame() {
      if (!lebt) return;
      const jetzt = performance.now();
      const dt = jetzt - letzte;
      letzte = jetzt;
      // Einmalige Degradierung, wenn die Maschine nicht mitkommt
      if (dt > 34) {
        langsameFrames++;
        if (langsameFrames > 10 && !degradiert) {
          degradiert = true;
          langsameFrames = 0;
          resize();
        }
      } else if (langsameFrames > 0) {
        langsameFrames--;
      }
      zeichne(clamp01(gefedert.get()));
      raf = requestAnimationFrame(frame);
    }

    leseFarben();
    baueHubSprite();
    resize();
    raf = requestAnimationFrame(frame);

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 150);
    };
    window.addEventListener('resize', onResize);

    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && lebt) {
        letzte = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      lebt = false;
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [gefedert]);

  return <canvas ref={ref} className="lattice" aria-hidden="true" />;
}
