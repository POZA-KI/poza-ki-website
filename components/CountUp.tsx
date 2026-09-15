'use client';

import { animate, useInView } from 'motion/react';
import { useEffect, useRef } from 'react';
import { useMotionPref } from './useMotionPref';

/**
 * Zählt beim Einscrollen hoch. Ist der Wert kein reiner Zahlwert (z. B. ein
 * [PLATZHALTER]), wird er unverändert ausgegeben — es wird nichts erfunden.
 */
export default function CountUp({ wert, className }: { wert: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const sichtbar = useInView(ref, { once: true, amount: 0.5 });
  const reduziert = useMotionPref();

  const treffer = wert.match(/^(\D*?)(-?[\d.,]+)(.*)$/);
  const zahl = treffer ? parseFloat(treffer[2].replace(/\./g, '').replace(',', '.')) : NaN;
  const zaehlbar = !!treffer && Number.isFinite(zahl);

  useEffect(() => {
    if (!zaehlbar || !sichtbar || !ref.current) return;
    const el = ref.current;
    if (reduziert) {
      el.textContent = wert;
      return;
    }
    const nachkomma = (treffer![2].split(',')[1] || '').length;
    const steuerung = animate(0, zahl, {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        const s = nachkomma ? v.toFixed(nachkomma).replace('.', ',') : String(Math.round(v));
        el.textContent = `${treffer![1]}${s}${treffer![3]}`;
      },
    });
    return () => steuerung.stop();
  }, [sichtbar, zaehlbar, zahl, wert, treffer, reduziert]);

  return (
    <span ref={ref} className={className}>
      {zaehlbar && !reduziert ? `${treffer![1]}0${treffer![3]}` : wert}
    </span>
  );
}
