'use client';

/**
 * Die fünf Struktur-Linien. Sie liegen exakt auf den Containerkanten und den
 * Viertelpunkten — also dort, wo Inhalt tatsächlich bricht. Keine Linie ohne
 * Funktion; das ist der Unterschied zu einem dekorativen Raster-Overlay.
 */

import { motion } from 'motion/react';
import { useMotionPref } from './useMotionPref';

const RAILS = [0, 25, 50, 75, 100];

export default function GridRails() {
  const reduziert = useMotionPref();

  return (
    <div className="rails" aria-hidden="true">
      <div className="rails__inner">
        {RAILS.map((pos, i) => (
          <motion.span
            key={pos}
            className="rails__line"
            data-rail={i}
            style={{ left: pos === 100 ? 'calc(100% - 1px)' : `${pos}%` }}
            initial={reduziert ? { scaleY: 1, opacity: 0 } : { scaleY: 0 }}
            animate={reduziert ? { scaleY: 1, opacity: 1 } : { scaleY: 1 }}
            transition={
              reduziert
                ? { duration: 0.2 }
                : {
                    duration: 1.4,
                    ease: 'linear',
                    // von außen nach innen
                    delay: Math.abs(i - 2) * 0.08,
                  }
            }
          />
        ))}
      </div>
    </div>
  );
}
