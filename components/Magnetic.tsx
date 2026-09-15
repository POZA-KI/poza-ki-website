'use client';

import { useRef, type ReactNode } from 'react';
import { useMotionPref } from './useMotionPref';

/**
 * Magnetischer Button: das Element folgt dem Zeiger um wenige Pixel.
 * Bewusst klein gehalten (max 8px) — alles darüber wirkt verspielt statt teuer.
 */
export default function Magnetic({
  children,
  staerke = 8,
  className,
}: {
  children: ReactNode;
  staerke?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduziert = useMotionPref();

  function bewege(e: React.PointerEvent) {
    if (reduziert || !ref.current) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const r = ref.current.getBoundingClientRect();
    const dx = ((e.clientX - (r.left + r.width / 2)) / (r.width / 2)) * staerke;
    const dy = ((e.clientY - (r.top + r.height / 2)) / (r.height / 2)) * staerke;
    ref.current.style.transform = `translate3d(${dx}px,${dy}px,0)`;
  }
  function zurueck() {
    if (ref.current) ref.current.style.transform = 'translate3d(0,0,0)';
  }

  return (
    <span
      ref={ref}
      className={`magnetic ${className ?? ''}`}
      onPointerMove={bewege}
      onPointerLeave={zurueck}
    >
      {children}
    </span>
  );
}
