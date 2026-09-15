'use client';

import { useMotionValueEvent, useScroll } from 'motion/react';
import { useRef, useState } from 'react';
import { useMotionPref } from './useMotionPref';

/**
 * Gepinnte Sektion: der Container ist mehrere Viewports hoch, der Inhalt
 * klebt per position:sticky. Beim Scrollen wechseln die Sätze, während sich
 * das Netzwerk dahinter umformt.
 *
 * Pinning über sticky statt über transform-Tricks — so bleibt die Scrollleiste
 * ehrlich und es gibt kein Layout-Thrashing.
 */
export default function PinnedThesis({
  zeile1,
  zeile2,
  absaetze,
}: {
  zeile1: string;
  zeile2: string;
  absaetze: string[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [aktiv, setAktiv] = useState(0);
  const [puls, setPuls] = useState(0);
  const reduziert = useMotionPref();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    // erste 35% gehören der Headline, danach die Absätze
    const t = Math.max(0, (p - 0.3) / 0.65);
    const i = Math.min(absaetze.length - 1, Math.floor(t * absaetze.length));
    setAktiv((vorher) => {
      if (vorher !== i) setPuls((n) => n + 1); // Impuls pro Wechsel neu starten
      return i;
    });
  });

  // Bei reduzierter Bewegung: kein Pinning, alles untereinander lesbar.
  // WICHTIG: ref bleibt trotzdem am DOM. useScroll({target:ref}) wurde oben
  // bereits aufgerufen; ein nicht angehaengter Ref loest Motions Invariante
  // "Target ref is defined but not hydrated" aus und bricht die Effekt-Phase
  // dieses Commits ab.
  if (reduziert) {
    return (
      <div ref={ref} className="these__inner">
        <h2 id="these-h" className="h1 these__statement">
          <span className="these__leise">{zeile1}</span>
          <span className="these__laut">{zeile2}</span>
        </h2>
        <div className="these__text">
          {absaetze.map((a) => (
            <p key={a} className="body these__p">{a}</p>
          ))}
        </div>
      </div>
    );
  }

  return (
    /* Hoehe = Sticky-Viewport (100vh) + Scrollweg je Absatz. Mehr als das ist
       toter Weg: nach dem letzten Absatz aendert sich nichts mehr, es scrollt
       nur noch weg. */
    <div ref={ref} className="pin" style={{ height: `${100 + absaetze.length * 44}vh` }}>
      <div className="pin__sticky">
        <div className="these__inner">
          <h2 id="these-h" className="h1 these__statement">
            <span className="these__leise">{zeile1}</span>
            <span className="these__laut">{zeile2}</span>
          </h2>
          <div className="these__text these__text--pin">
            {/* Lichtimpuls auf der Rahmenlinie, laeuft bei jedem Satzwechsel */}
            <span key={puls} className="these__impuls is-laufend" aria-hidden="true" />
            <span className="these__vlabel label" aria-hidden="true">Positionierung</span>
            {/* Alle Absätze im DOM (Screenreader und SEO lesen alles),
                sichtbar ist der aktive. */}
            {/* KEINE Opazitaets-Animation zwischen den Absaetzen. Bei schnellem
                Scrollen springt der Index ueber mehrere Stufen, dann animierten
                mehrere Absaetze gleichzeitig und standen uebereinander —
                unlesbar (zweimal im Screenshot verifiziert). visibility kann
                prinzipbedingt nicht ueberlagern. Alle bleiben im DOM, damit
                Screenreader und Suchmaschinen den vollen Text sehen. */}
            {absaetze.map((a, i) => (
              <p
                key={a}
                className={`body these__p these__p--pin ${i === aktiv ? 'is-on' : ''}`}
                aria-hidden={i !== aktiv}
              >
                {a}
              </p>
            ))}
          </div>
          <div className="pin__fortschritt" aria-hidden="true">
            {absaetze.map((a, i) => (
              <span key={a} className={i === aktiv ? 'is-on' : ''} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
