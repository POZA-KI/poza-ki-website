'use client';

import { motion } from 'motion/react';
import { useMotionPref } from '../useMotionPref';

/**
 * Kleines Diagramm je Leistungs-Card, dessen Linien sich beim Einscrollen
 * zeichnen. Ueber pathLength — das laeuft im Compositor, eine Breiten- oder
 * Punkteanimation wuerde Layout ausloesen.
 *
 * Drei Varianten, damit die Cards nicht identisch wirken.
 */
const FORMEN: Record<string, string> = {
  // Prozesskette
  kette: 'M2 40 L22 40 L34 20 L58 20 L70 40 L94 40 L106 12 L142 12',
  // Datenextraktion: Treppe nach oben
  treppe: 'M2 48 L26 48 L26 34 L54 34 L54 24 L86 24 L86 12 L142 12',
  // Audit: Kurve mit Abzweig
  kurve: 'M2 44 C28 44 30 14 58 14 C86 14 88 34 116 34 L142 34',
};

export default function MiniDia({ form }: { form: keyof typeof FORMEN }) {
  const reduziert = useMotionPref();
  const d = FORMEN[form];

  return (
    <svg className="minidia" viewBox="0 0 144 54" fill="none" aria-hidden="true">
      <line x1="0" y1="53" x2="144" y2="53" stroke="var(--line-hair)" strokeWidth="1" />
      <motion.path
        d={d}
        stroke="var(--accent)"
        strokeWidth="1.25"
        strokeLinecap="square"
        initial={reduziert ? { pathLength: 1, opacity: 0.8 } : { pathLength: 0, opacity: 0.8 }}
        whileInView={{ pathLength: 1, opacity: 0.8 }}
        viewport={{ once: true, margin: '0px 0px -12% 0px' }}
        transition={reduziert ? { duration: 0 } : { duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      />
      {[22, 58, 94, 130].map((x, i) => (
        <motion.circle
          key={x}
          cx={x}
          cy={form === 'treppe' ? 30 : 26}
          r="1.8"
          fill="var(--accent)"
          initial={reduziert ? { opacity: 0.7 } : { opacity: 0 }}
          whileInView={{ opacity: 0.7 }}
          viewport={{ once: true }}
          transition={reduziert ? { duration: 0 } : { duration: 0.3, delay: 0.3 + i * 0.16 }}
        />
      ))}
    </svg>
  );
}
