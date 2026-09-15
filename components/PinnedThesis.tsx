'use client';

import { useMotionValueEvent, useScroll } from 'motion/react';
import { useRef, useState } from 'react';
import { useMotionPref } from './useMotionPref';
import { useMedia } from './faehig';

/**
 * Gepinnte Sektion am Desktop: der Container ist mehrere Viewports hoch, der
 * Inhalt klebt per position:sticky. Beim Scrollen wechseln die Sätze, während
 * sich das Netzwerk dahinter umformt.
 *
 * Pinning über sticky statt über transform-Tricks — so bleibt die Scrollleiste
 * ehrlich und es gibt kein Layout-Thrashing.
 *
 * AUF MOBILE OHNE PIN. Die Rechnung geht dort nicht auf: Pin braucht einen
 * Viewport Standfläche plus Scrollweg je Satz, macht bei vier Sätzen rund drei
 * Viewporthöhen — gemessen 2547 px für eine Headline und vier kurze Absätze,
 * mit 32 vh zusammenhängender Leere darin. Ein Satz, der nur beim Scrollen
 * erscheint, braucht außerdem Weg, den man auf dem Telefon nicht spendieren
 * will. Stattdessen stehen alle vier Absätze als nummerierte Liste dicht
 * untereinander und blenden gestaffelt ein: gleiche Aussage, gleiche
 * Reihenfolge, Höhe nach Inhalt statt nach Viewport.
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
  const mobil = useMedia('(max-width: 768px)');
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
  if (reduziert || mobil) {
    return (
      <div ref={ref} className="these__inner these__inner--kompakt">
        <h2 id="these-h" className="h1 these__statement">
          <span className="these__leise">{zeile1}</span>
          <span className="these__laut">{zeile2}</span>
        </h2>
        <ol className="these__liste">
          {absaetze.map((a, i) => (
            <li key={a} className={`these__punkt ${reduziert ? '' : 'these__punkt--rein'}`}
              style={reduziert ? undefined : { animationDelay: `${i * 0.09}s` }}>
              {/* Der Index ersetzt die Fortschritts-Striche: dieselbe
                  Orientierung, aber ohne eigene Zeile und ohne Scrollweg. */}
              <span className="these__nr mono" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <p className="body these__p">{a}</p>
            </li>
          ))}
        </ol>
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
