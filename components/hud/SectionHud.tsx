'use client';

import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { useMotionPref } from '../useMotionPref';

/**
 * Einheitlicher Sektionskopf im Gallery-Stil: Monospace-Microlabel über dem
 * Titel, darüber eine 1px-Rahmenlinie mit ✦-Markern an den Schnittpunkten.
 * Jede Sektion benutzt exakt diesen Kopf — das ist der Kern der durchgängigen
 * Sprache.
 */
export default function SectionHud({
  nr, label, titel, id, kind,
}: {
  nr: string; label: string; titel?: string; id?: string; kind?: ReactNode;
}) {
  const reduziert = useMotionPref();
  return (
    <header className="shud">
      <div className="shud__rahmen" aria-hidden="true">
        <motion.span
          className="shud__linie"
          initial={reduziert ? { scaleX: 1 } : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: '0px 0px -12% 0px' }}
          transition={reduziert ? { duration: 0 } : { duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        />
        <i className="shud__marker shud__marker--l">✦</i>
        <i className="shud__marker shud__marker--r">✦</i>
      </div>
      <p className="shud__label label">
        <span className="shud__nr">{nr}</span>
        <span className="shud__punkt">·</span>
        {label}
      </p>
      {titel && <h2 id={id} className="h2 shud__titel">{titel}</h2>}
      {kind}
    </header>
  );
}
