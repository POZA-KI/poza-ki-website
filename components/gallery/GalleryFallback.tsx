'use client';

import { useEffect, useRef, useState } from 'react';
import { PANELS } from './panelMocks';
import { budget } from '../geraet';
import { proFrame } from '../scrollStore';

/**
 * Flache Variante: dieselben Mocks als 2D-Canvas nebeneinander, per Buttons
 * umschaltbar. Kommt zum Einsatz ohne WebGL und bei reduzierter Bewegung.
 */
export default function GalleryFallback() {
  const [i, setI] = useState(0);
  const cvRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const reduziert = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    PANELS[i].maler(ctx, 800, 500, 3);
    if (reduziert) return;

    // Nur malen, wenn sichtbar, und nur mit der Budget-Rate: der Mock sieht
    // bei 12 Hz identisch aus und kostet ein Fuenftel.
    const hz = budget(true).texturHz;
    let sichtbar = false;
    const io = new IntersectionObserver(([e]) => { sichtbar = e.isIntersecting; }, { rootMargin: '20% 0px' });
    io.observe(cv);
    let letzte = 0;
    const ab = proFrame((st) => {
      if (!sichtbar || st.zeit - letzte < 1 / hz) return;
      letzte = st.zeit;
      PANELS[i].maler(ctx, 800, 500, st.zeit);
    });
    return () => { ab(); io.disconnect(); };
  }, [i]);

  return (
    <div className="galf">
      <canvas ref={cvRef} width={800} height={500} className="galf__cv" aria-label={PANELS[i].titel} />
      <div className="galf__leiste">
        {PANELS.map((p, k) => (
          <button
            key={p.titel}
            className={`galf__btn mono ${k === i ? 'is-on' : ''}`}
            onClick={() => setI(k)}
            aria-current={k === i}
          >
            {String(k + 1).padStart(2, '0')} {p.titel}
          </button>
        ))}
      </div>
    </div>
  );
}
