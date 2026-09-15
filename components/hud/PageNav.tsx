'use client';

import { useEffect, useState } from 'react';
import { SEKTIONEN } from '@/content/sektionen';

/**
 * Nummern-Navigation rechts — gilt für die GANZE Seite, nicht nur die Galerie.
 * IntersectionObserver statt Scroll-Rechnerei: läuft außerhalb des
 * Hauptthreads und bleibt korrekt, auch wenn Pinning die Höhen verändert.
 */
export default function PageNav() {
  const [aktiv, setAktiv] = useState<string>(SEKTIONEN[0].id);

  useEffect(() => {
    const ziele = SEKTIONEN.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    if (!ziele.length) return;
    const io = new IntersectionObserver(
      (eintraege) => {
        const sichtbar = eintraege
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (sichtbar[0]) setAktiv(sichtbar[0].target.id);
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    );
    ziele.forEach((z) => io.observe(z));
    return () => io.disconnect();
  }, []);

  return (
    <nav className="pnav" aria-label="Abschnitte">
      <ul>
        {SEKTIONEN.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className={`pnav__item mono ${aktiv === s.id ? 'is-on' : ''}`}
              aria-current={aktiv === s.id ? 'true' : undefined}
            >
              <span className="pnav__nr" aria-hidden="true">
                <span>
                  {s.nr}
                  <br />
                  {s.nr}
                </span>
              </span>
              <span className="pnav__label">{s.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
