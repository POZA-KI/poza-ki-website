'use client';

import { useEffect, useRef } from 'react';
import { SEKTIONEN } from '@/content/sektionen';
import { proFrame } from '../scrollStore';
import { useMotionPref } from '../useMotionPref';

/**
 * Durchlaufende Linie links mit Nummern-Markern und wanderndem Lichtimpuls.
 *
 * Der Impuls wird ueber translate3d positioniert, NICHT ueber top — `top` pro
 * Frame loest Layout aus und war die Hauptursache des Flackerns. Es gibt kein
 * setState im Frame: der Impuls wird direkt am DOM-Knoten geschrieben.
 */
export default function PageRail() {
  const wurzel = useRef<HTMLDivElement>(null);
  const impuls = useRef<HTMLSpanElement>(null);
  const sweep = useRef<HTMLSpanElement>(null);
  const reduziert = useMotionPref();

  useEffect(() => {
    if (reduziert) return;
    const el = wurzel.current;
    const imp = impuls.current;
    if (!el || !imp) return;

    // Markerpositionen einmalig setzen (kein Frame-Werk)
    const setzeMarken = () => {
      const hoehe = document.documentElement.scrollHeight;
      el.querySelectorAll<HTMLElement>('[data-marke]').forEach((m) => {
        const id = m.dataset.marke!;
        const ziel = document.getElementById(id);
        if (!ziel) return;
        // Absolute Seitenposition statt offsetTop: offsetTop zaehlt ab dem
        // naechsten positionierten Vorfahren, nicht ab dem Dokument — die
        // Marken sassen dadurch systematisch zu weit oben.
        const oben = ziel.getBoundingClientRect().top + window.scrollY;
        m.style.transform = `translate3d(-50%, ${(oben / hoehe) * el.offsetHeight}px, 0)`;
        m.style.opacity = '1';
      });
    };
    setzeMarken();
    const t = window.setTimeout(setzeMarken, 1200);
    window.addEventListener('resize', setzeMarken);

    let letzterAbschnitt = -1;
    let bahn = el.offsetHeight;

    const ab = proFrame((s) => {
      // Bahnhoehe nur bei Bedarf neu lesen, nicht pro Frame
      imp.style.transform = `translate3d(-1px, ${s.weich * bahn}px, 0)`;

      // Sektionswechsel -> kurzer Sweep
      const idx = Math.floor(s.weich * SEKTIONEN.length);
      if (idx !== letzterAbschnitt) {
        letzterAbschnitt = idx;
        const sw = sweep.current;
        if (sw) {
          sw.style.transform = `translate3d(-2px, ${s.weich * bahn}px, 0)`;
          sw.classList.remove('is-an');
          // reflow erzwingen, damit die Animation neu startet
          void sw.offsetWidth;
          sw.classList.add('is-an');
        }
      }
    });

    const onResize = () => { bahn = el.offsetHeight; };
    window.addEventListener('resize', onResize);

    return () => {
      ab();
      window.clearTimeout(t);
      window.removeEventListener('resize', setzeMarken);
      window.removeEventListener('resize', onResize);
    };
  }, [reduziert]);

  return (
    <div ref={wurzel} className="prail" aria-hidden="true">
      <span className="prail__linie" />
      {SEKTIONEN.map((s) => (
        <span key={s.nr} data-marke={s.id} className="prail__marke mono" style={{ opacity: 0 }}>
          {s.nr}
        </span>
      ))}
      {!reduziert && <span ref={impuls} className="prail__impuls" />}
      {!reduziert && <span ref={sweep} className="prail__sweep" />}
    </div>
  );
}
