'use client';

/**
 * Sektionsregel mit Register-Label. Das Label hat den Seitenhintergrund und
 * schneidet die Linie physisch auf — das ist das Detail, das die Seite nach
 * Konstruktionszeichnung aussehen lässt statt nach Framework-Default.
 */

import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import { useMotionPref } from './useMotionPref';

export default function SectionRule({
  nummer,
  gesamt = 9,
  titel,
}: {
  nummer: number;
  gesamt?: number;
  titel: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const sichtbar = useInView(ref, { once: false, amount: 0.5 });
  const reduziert = useMotionPref();
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div ref={ref} className={`rule ${sichtbar ? 'is-active' : ''}`}>
      <motion.span
        className="rule__wipe"
        initial={reduziert ? { clipPath: 'inset(0 0 0 0)' } : { clipPath: 'inset(0 100% 0 0)' }}
        whileInView={{ clipPath: 'inset(0 0 0 0)' }}
        viewport={{ once: true, margin: '0px 0px -10% 0px' }}
        transition={reduziert ? { duration: 0 } : { duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      />
      {/* Register ist dekorativ — die echte Überschrift steht im h2 darunter */}
      <span className="rule__label label" aria-hidden="true">
        <span className="rule__num">
          {pad(nummer)} / {pad(gesamt)}
        </span>
        {'  ·  '}
        {titel}
      </span>
    </div>
  );
}
