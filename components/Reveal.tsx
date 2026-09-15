'use client';

import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { useMotionPref } from './useMotionPref';

/** Einheitliches Reveal: nur Opazität und maximal 14px Y. Kein Scale, kein Blur. */
export default function Reveal({
  children,
  delay = 0,
  as = 'div',
  className,
  sofort = false,
}: {
  children: ReactNode;
  delay?: number;
  as?: 'div' | 'li' | 'section';
  className?: string;
  /**
   * Beim Mount animieren statt per whileInView. Pflicht für alles im Hero:
   * der viewport-Margin von -18% schneidet das untere Fünftel ab, und auf
   * niedrigen Fenstern landet die CTA-Zeile genau dort — sie bliebe sonst
   * unsichtbar, ohne dass jemals gescrollt wird.
   */
  sofort?: boolean;
}) {
  const reduziert = useMotionPref();
  const Comp = motion[as];
  const Statisch = as;
  const ziel = reduziert ? { opacity: 1 } : { opacity: 1, y: 0 };
  const start = reduziert ? { opacity: 0 } : { opacity: 0, y: 14 };
  const uebergang = { duration: reduziert ? 0.2 : 0.56, ease: [0.16, 1, 0.3, 1] as const, delay };

  if (sofort) {
    /* Reine CSS-Animation. Motion wuerde hier initial={{opacity:0}} schon ins
       SSR-Markup schreiben und erst nach der Hydration starten — auf einem
       gedrosselten Telefon steht der Hero-Text dann sekundenlang unsichtbar da
       und der Largest Contentful Paint rutscht auf 4,8 s (gemessen). Das CSS
       laeuft, sobald das Stylesheet da ist. */
    return (
      <Statisch className={`rvl ${className ?? ''}`} style={{ animationDelay: `${delay}s` }}>
        {children}
      </Statisch>
    );
  }
  return (
    <Comp
      className={className}
      initial={start}
      whileInView={ziel}
      viewport={{ once: true, margin: '0px 0px -18% 0px' }}
      transition={uebergang}
    >
      {children}
    </Comp>
  );
}
