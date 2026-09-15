'use client';

import { useEffect, useRef, useState } from 'react';
import { PRODUKT_MALER } from './produktMocks';
import { budget } from '../geraet';
import { proFrame } from '../scrollStore';

type Produkt = { wortmarke: string; versalien: boolean; text: string; punkte: string[] };

/**
 * Flache Variante: dieselben Mocks als 2D-Canvas, per Swipe/Buttons.
 * Greift auf Mobile, ohne WebGL und bei reduzierter Bewegung.
 */
export default function ConstellationFallback({
  items, status,
}: { items: Produkt[]; status: string }) {
  const [i, setI] = useState(0);
  const cv = useRef<HTMLCanvasElement>(null);
  const start = useRef(0);

  useEffect(() => {
    const c = cv.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const reduziert = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    PRODUKT_MALER[items[i].wortmarke]?.(ctx, 720, 440, 3);
    if (reduziert) return;

    const hz = budget(true).texturHz;
    let sichtbar = false;
    const io = new IntersectionObserver(([e]) => { sichtbar = e.isIntersecting; }, { rootMargin: '20% 0px' });
    io.observe(c);
    let letzte = 0;
    const ab = proFrame((st) => {
      if (!sichtbar || st.zeit - letzte < 1 / hz) return;
      letzte = st.zeit;
      PRODUKT_MALER[items[i].wortmarke]?.(ctx, 720, 440, st.zeit);
    });
    return () => { ab(); io.disconnect(); };
  }, [i, items]);

  return (
    <div
      className="konf"
      onTouchStart={(e) => { start.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        const d = e.changedTouches[0].clientX - start.current;
        if (Math.abs(d) > 50) setI((k) => (k + (d < 0 ? 1 : -1) + items.length) % items.length);
      }}
    >
      <canvas ref={cv} width={720} height={440} className="konf__cv" aria-label={items[i].wortmarke} />
      <p className={`konf__marke ${items[i].versalien ? 'is-versal' : ''}`}>{items[i].wortmarke}</p>
      <p className="konf__text">{items[i].text}</p>
      <ul className="konst__pills">
        {items[i].punkte.map((t) => <li key={t} className="gal__tag mono">{t}</li>)}
      </ul>
      <div className="konf__leiste">
        {items.map((it, k) => (
          <button key={it.wortmarke} className={`galbar__nr mono ${k === i ? 'is-on' : ''}`}
            onClick={() => setI(k)} aria-current={k === i}
            aria-label={`${String(k + 1).padStart(2, '0')} — Produkt ${it.wortmarke}`}>
            {String(k + 1).padStart(2, '0')}
          </button>
        ))}
      </div>
      <p className="konst__status mono">
        <span className="konst__statuspunkt" aria-hidden="true" />{status}
      </p>
    </div>
  );
}
