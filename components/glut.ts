'use client';

import * as THREE from 'three';

/**
 * Weiches Glut-Sprite als Textur.
 *
 * WARUM NICHT EINE KUGEL: Eine gefuellte Sphere mit MeshBasicMaterial hat eine
 * harte Silhouette und eine flache Farbflaeche — das liest sich als Plastik.
 * Energie entsteht aus dem Falloff: weiss und heiss im Zentrum, nach aussen in
 * das Blau und dann in nichts. Additive Blending addiert das auf den
 * Hintergrund, statt ihn zu verdecken.
 */
let gemerkt: THREE.CanvasTexture | null = null;

export function glutTextur(): THREE.CanvasTexture {
  if (gemerkt) return gemerkt;
  const S = 128;
  const c = document.createElement('canvas');
  c.width = S; c.height = S;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  // heiss innen, kuehl aussen
  g.addColorStop(0.00, 'rgba(255,255,255,1)');
  g.addColorStop(0.08, 'rgba(232,244,255,0.95)');
  g.addColorStop(0.22, 'rgba(142,201,255,0.55)');
  g.addColorStop(0.45, 'rgba(77,166,255,0.18)');
  g.addColorStop(0.72, 'rgba(58,124,196,0.05)');
  g.addColorStop(1.00, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  gemerkt = tex;
  return tex;
}

/** Derselbe Verlauf fuer 2D-Canvas — eine Kern-Aesthetik fuer die ganze Seite. */
export function malGlut(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, r: number, staerke: number,
) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0.00, `rgba(255,255,255,${0.95 * staerke})`);
  g.addColorStop(0.08, `rgba(232,244,255,${0.85 * staerke})`);
  g.addColorStop(0.22, `rgba(142,201,255,${0.42 * staerke})`);
  g.addColorStop(0.45, `rgba(77,166,255,${0.14 * staerke})`);
  g.addColorStop(0.72, `rgba(58,124,196,${0.04 * staerke})`);
  g.addColorStop(1.00, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}
