'use client';

import { useEffect, useRef } from 'react';
import { proFrame } from './scrollStore';
import { useMotionPref } from './useMotionPref';

/**
 * Punkt folgt exakt, Ring läuft gefedert hinterher. Beides über transform,
 * getaktet vom zentralen Frame-Loop — kein eigener rAF, kein React-State.
 * Nur für feine Zeiger; auf Touch gibt es keinen Cursor zu ersetzen.
 */
export default function CustomCursor() {
  const punkt = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const reduziert = useMotionPref();

  useEffect(() => {
    if (reduziert) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    let zx = window.innerWidth / 2;
    let zy = window.innerHeight / 2;
    let rx = zx;
    let ry = zy;
    let aktiv = false;

    const onMove = (e: PointerEvent) => {
      zx = e.clientX;
      zy = e.clientY;
      if (!aktiv) {
        aktiv = true;
        document.documentElement.classList.add('hat-cursor');
      }
    };
    const onOver = (e: PointerEvent) => {
      const ziel = (e.target as HTMLElement | null)?.closest('a,button,[role="button"]');
      ring.current?.classList.toggle('is-hot', !!ziel);
    };
    const onLeave = () => {
      document.documentElement.classList.remove('hat-cursor');
      aktiv = false;
    };

    // framerate-unabhaengige Federung, sonst laeuft der Ring auf 120-Hz-
    // Displays doppelt so schnell nach wie auf 60 Hz
    const ab = proFrame((st) => {
      const k = 1 - Math.pow(0.0002, st.dt);
      rx += (zx - rx) * k;
      ry += (zy - ry) * k;
      if (punkt.current) punkt.current.style.transform = `translate3d(${zx}px,${zy}px,0)`;
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px,${ry}px,0)`;
    });

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerover', onOver, { passive: true });
    window.addEventListener('pointerleave', onLeave, { passive: true });
    return () => {
      ab();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerover', onOver);
      window.removeEventListener('pointerleave', onLeave);
      document.documentElement.classList.remove('hat-cursor');
    };
  }, [reduziert]);

  if (reduziert) return null;
  return (
    <>
      <div ref={punkt} className="cursor-punkt" aria-hidden="true" />
      <div ref={ring} className="cursor-ring" aria-hidden="true" />
    </>
  );
}
