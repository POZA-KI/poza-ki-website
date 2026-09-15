'use client';

import { useEffect, useRef } from 'react';
import { proFrame, scrollStore } from '../scrollStore';
import { huelle, schlagJetzt, taktZeit } from '../takt';
import { malGlut } from '../glut';
import { useMotionPref } from '../useMotionPref';

/**
 * Der Energy Core im Finale — dieselbe Kern-Aesthetik wie in der
 * Constellation, nur in 2D gezeichnet.
 *
 * Bewusst 2D-Canvas, kein weiterer WebGL-Kontext: Browser begrenzen die Zahl
 * gleichzeitiger Kontexte, und die vier Schichten des Kerns (Glut, Gitter,
 * Gyroskop, Staub) lassen sich mit Pfaden genauso bauen wie mit Meshes.
 *
 * Der Puls haengt am Seiten-Herzschlag (../takt) — derselbe Takt, auf den die
 * Constellation ihre Impulse schickt. Der Kern der Seite schlaegt ueberall
 * gleich, egal ob er in WebGL, im 2D-Canvas oder im DOM gezeichnet wird.
 */

/** Ecken der Gitterkugel, als Kugelkoordinaten auf dem goldenen Winkel. */
const GITTER = 42;
const STAUB = 34;

export default function FinaleCore() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduziert = useMotionPref();

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    let w = 0, h = 0;

    // Gitterpunkte einmal berechnen: Fibonacci-Kugel, kein Zufall
    const knoten: [number, number, number][] = [];
    for (let i = 0; i < GITTER; i++) {
      const y = 1 - (i / (GITTER - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const th = i * 2.399963;
      knoten.push([Math.cos(th) * r, y, Math.sin(th) * r]);
    }

    const groesse = () => {
      const r = cv.getBoundingClientRect();
      // Der Kern ist ein weicher Verlauf: bei DPR 2 waeren das Millionen
      // Pixel pro Frame fuer ein Bild ohne harte Kanten. DPR 1 genuegt.
      w = r.width; h = r.height;
      cv.width = Math.round(w);
      cv.height = Math.round(h);
    };
    groesse();

    const male = (t: number) => {
      const { phase } = schlagJetzt(t);
      const puls = reduziert ? 0.35 : huelle(phase);
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2;
      const R = Math.min(w, h) * 0.2;

      // Je tiefer auf der Seite, desto praesenter der Kern.
      const tiefe = Math.min(1, Math.max(0, (scrollStore.p - 0.75) / 0.25));
      const kraft = 0.45 + tiefe * 0.4;

      ctx.globalCompositeOperation = 'lighter';

      // 1. Glut — heiss innen, kuehl aussen
      // Aussenschein weit und schwach, Glutpunkt klein und heiss — nur so
      // entsteht der Eindruck von Energie statt eines Farbflecks.
      // Ohne Bloom (anders als in WebGL) muss der Kern hier von sich aus
      // hell genug sein, sonst bleibt er ein grauer Fleck.
      malGlut(ctx, cx, cy, R * 3.2, (0.2 + puls * 0.2) * kraft);
      malGlut(ctx, cx, cy, R * 0.9, (0.34 + puls * 0.2) * kraft);
      malGlut(ctx, cx, cy, R * 0.3, 0.9 + puls * 0.1);
      ctx.fillStyle = `rgba(255,255,255,${0.75 + puls * 0.25})`;
      ctx.beginPath();
      ctx.arc(cx, cy, 1.8 + puls * 0.7, 0, Math.PI * 2);
      ctx.fill();

      const dreh = reduziert ? 0.6 : t * 0.16;
      const neig = reduziert ? 0.3 : Math.sin(t * 0.07) * 0.5;
      const cd = Math.cos(dreh), sd = Math.sin(dreh);
      const cn = Math.cos(neig), sn = Math.sin(neig);
      const projiziert = knoten.map(([x, y, z]) => {
        // Y-Rotation, danach X-Neigung
        const x1 = x * cd + z * sd;
        const z1 = -x * sd + z * cd;
        const y2 = y * cn - z1 * sn;
        const z2 = y * sn + z1 * cn;
        return [cx + x1 * R, cy + y2 * R, z2] as [number, number, number];
      });

      // 2. Gitter: jeder Knoten zu seinen naechsten Nachbarn
      ctx.lineWidth = 1;
      for (let i = 0; i < projiziert.length; i++) {
        for (let j = i + 1; j < projiziert.length; j++) {
          const dx = projiziert[i][0] - projiziert[j][0];
          const dy = projiziert[i][1] - projiziert[j][1];
          if (dx * dx + dy * dy > R * R * 0.24) continue;
          const tiefeAlpha = 0.5 + (projiziert[i][2] + projiziert[j][2]) * 0.25;
          ctx.strokeStyle = `rgba(143,201,255,${(0.17 + puls * 0.11) * tiefeAlpha * kraft})`;
          ctx.beginPath();
          ctx.moveTo(projiziert[i][0], projiziert[i][1]);
          ctx.lineTo(projiziert[j][0], projiziert[j][1]);
          ctx.stroke();
        }
      }

      // 3. Gyroskop: drei Ellipsen mit eigenen Achsen, gegenlaeufig
      const achsen: [number, number][] = [[0.05, 0], [1.15, 0.5], [-0.95, -0.62]];
      achsen.forEach(([kipp, roll], i) => {
        const richtung = i % 2 === 0 ? 1 : -1;
        const rr = R * (1.4 + i * 0.42) * (1 + puls * 0.035);
        const drehI = reduziert ? 0.4 : t * (0.2 + i * 0.1) * richtung;
        // Sichtbare Halbachse einer geneigten Kreisbahn
        const b2 = Math.abs(Math.cos(kipp + Math.sin(drehI) * 0.35));
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(roll + drehI * 0.25);
        ctx.strokeStyle = `rgba(${i === 0 ? '207,230,255' : '77,166,255'},${(0.22 + puls * 0.16 - i * 0.04) * kraft})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, rr, Math.max(1.5, rr * b2), 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });

      // 4. Staub auf engen Bahnen
      for (let i = 0; i < STAUB; i++) {
        const rad = R * (1.25 + ((i * 7) % 11) * 0.1);
        const kipp = Math.asin(((i % 13) / 6) - 1) * 0.55;
        const wnk = (i * 2.399963) + (reduziert ? 0 : t * (0.34 + (i % 5) * 0.11));
        const x = cx + Math.cos(wnk) * rad * Math.cos(kipp);
        const y = cy + Math.sin(kipp) * rad * 0.8 + Math.sin(wnk * 0.5) * 2;
        ctx.fillStyle = `rgba(207,230,255,${(0.45 + puls * 0.3) * kraft})`;
        ctx.beginPath();
        ctx.arc(x, y, 1.1, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = 'source-over';
    };

    male(taktZeit());
    const ro = new ResizeObserver(() => { groesse(); male(taktZeit()); });
    ro.observe(cv);
    if (reduziert) return () => ro.disconnect();

    // Nur malen, wenn der Kern wirklich im Bild ist — er sitzt ganz unten auf
    // der Seite und lief vorher die gesamte Scrollzeit ueber mit.
    let sichtbar = false;
    const io = new IntersectionObserver(([e]) => { sichtbar = e.isIntersecting; }, { rootMargin: '20% 0px' });
    io.observe(cv);
    const ab = proFrame(() => { if (sichtbar) male(taktZeit()); });
    return () => { ab(); io.disconnect(); ro.disconnect(); };
  }, [reduziert]);

  return <canvas ref={ref} className="kern" aria-hidden="true" />;
}
