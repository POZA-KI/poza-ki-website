'use client';

import { motion } from 'motion/react';
import { useMotionPref } from './useMotionPref';

/**
 * Linie, die sich beim Einscrollen selbst zeichnet — über pathLength, nicht
 * über eine Breitenanimation. Breite würde Layout auslösen; pathLength läuft
 * im Compositor.
 */
export default function DrawRule({ className }: { className?: string }) {
  const reduziert = useMotionPref();
  return (
    <svg className={`drawrule ${className ?? ''}`} viewBox="0 0 100 1" preserveAspectRatio="none" aria-hidden="true">
      <motion.line
        x1="0"
        y1="0.5"
        x2="100"
        y2="0.5"
        stroke="currentColor"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
        initial={reduziert ? { pathLength: 1 } : { pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, margin: '0px 0px -15% 0px' }}
        transition={reduziert ? { duration: 0 } : { duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  );
}
