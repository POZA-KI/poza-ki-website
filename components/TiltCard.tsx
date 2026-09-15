'use client';

import { useRef, type ReactNode } from 'react';
import { useMotionPref } from './useMotionPref';

/**
 * 3D-Tilt plus Spotlight am Cursor. Beides über CSS-Custom-Properties, die in
 * pointermove gesetzt werden — kein React-State, keine Layout-Änderung, nur
 * transform und ein Gradient.
 */
export default function TiltCard({
  children,
  className,
  maxWinkel = 5,
}: {
  children: ReactNode;
  className?: string;
  maxWinkel?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const reduziert = useMotionPref();

  function bewege(e: React.PointerEvent) {
    if (reduziert || !ref.current) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const el = ref.current;
    const x = e.clientX;
    const y = e.clientY;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const px = (x - r.left) / r.width;
      const py = (y - r.top) / r.height;
      el.style.setProperty('--mx', `${(x - r.left).toFixed(1)}px`);
      el.style.setProperty('--my', `${(y - r.top).toFixed(1)}px`);
      el.style.setProperty('--rx', `${((0.5 - py) * maxWinkel).toFixed(2)}deg`);
      el.style.setProperty('--ry', `${((px - 0.5) * maxWinkel).toFixed(2)}deg`);
      el.style.setProperty('--spot', '1');
    });
  }
  function zurueck() {
    cancelAnimationFrame(rafRef.current);
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
    el.style.setProperty('--spot', '0');
  }

  return (
    <div ref={ref} className={`tilt ${className ?? ''}`} onPointerMove={bewege} onPointerLeave={zurueck}>
      <div className="tilt__inner">{children}</div>
    </div>
  );
}
