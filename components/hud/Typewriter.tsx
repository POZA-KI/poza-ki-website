'use client';

import { useInView } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useMotionPref } from '../useMotionPref';

/**
 * Tippt den Text beim Einscrollen ein. Schnell gehalten (ca. 18ms/Zeichen),
 * damit es technisch wirkt und nicht wie eine Spielerei.
 *
 * Der vollstaendige Text steht immer im DOM (visuell versteckte Kopie),
 * damit Screenreader und Suchmaschinen ihn sehen — das Tippen ist reine
 * Dekoration.
 */
export default function Typewriter({ text, delay = 0 }: { text: string; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const sichtbar = useInView(ref, { once: true, amount: 0.6 });
  const reduziert = useMotionPref();
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!sichtbar || reduziert) return;
    let i = 0;
    let id = 0;
    const start = window.setTimeout(() => {
      id = window.setInterval(() => {
        i += 1;
        setN(i);
        if (i >= text.length) window.clearInterval(id);
      }, 18);
    }, delay * 1000);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(id);
    };
  }, [sichtbar, text, delay, reduziert]);

  if (reduziert) return <span ref={ref}>{text}</span>;

  const fertig = n >= text.length;
  return (
    <span ref={ref}>
      <span aria-hidden="true">{text.slice(0, n)}</span>
      {!fertig && sichtbar && <i className="akte__cursor" aria-hidden="true" />}
      {/* vollstaendiger Text fuer Screenreader */}
      <span className="sr-only">{text}</span>
    </span>
  );
}
