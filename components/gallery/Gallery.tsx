'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PANELS } from './panelMocks';
import { useMotionPref } from '../useMotionPref';
import { MOBIL_ABFRAGE, useMedia, useWebGL } from '../faehig';
import { anteil, proFrame, scrolleZu } from '../scrollStore';
import { useBereich } from '../useBereich';
import { useNaehe } from '../useSichtbar';
import { useMeldeDeckung } from '../deckung';
import GalleryFallback from './GalleryFallback';

const GalleryScene = dynamic(() => import('./GalleryScene'), { ssr: false });

/** Scrollweg je Station am Desktop. Grosszuegig, damit jede Station wirklich erlebt wird. */
const VH_PRO_STATION = 120;

/**
 * Treppen-Kennlinie: haelt an jeder Station und wechselt zuegig dazwischen.
 *
 * WARUM NICHT CSS scroll-snap: Lenis steuert die Scrollposition selbst.
 * Echtes Snapping arbeitet dagegen und erzeugt Ruckeln. Die Kennlinie
 * erzeugt denselben Effekt — spuerbarer Halt pro Station — ohne den Konflikt.
 *   HALT = Anteil des Segments, in dem die Kamera stillsteht.
 */
const HALT = 0.46;
function treppe(x: number) {
  const i = Math.floor(x);
  const f = x - i;
  const h = HALT / 2;
  if (f <= h) return i;
  if (f >= 1 - h) return i + 1;
  const t = (f - h) / (1 - HALT);
  return i + t * t * (3 - 2 * t); // smoothstep zwischen den Halten
}

export default function Gallery() {
  const bereich = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const buehne = useRef<HTMLDivElement>(null);
  const glut = useRef<HTMLSpanElement>(null);
  /** Kamerawert. Ref, nicht State: die Szene liest ihn im eigenen useFrame. */
  const lauf = useRef(0);
  /** Nur mobil: Zielstation des Swipes, plus laufender Zieh-Versatz. */
  const ziel = useRef(0);
  const zug = useRef(0);
  const [index, setIndex] = useState(0);
  const mobil = useMedia(MOBIL_ABFRAGE);
  const kannWebGL = useWebGL();
  const reduziert = useMotionPref();
  const mass = useBereich(bereich, 0, 1);
  const naehe = useNaehe(bereich);
  useMeldeDeckung(buehne);

  // DESKTOP: der Scroll faehrt die Kamera. EIN Abnehmer am zentralen Loop,
  // kein eigener rAF; nur der Stationswechsel geht durch React.
  useEffect(() => {
    if (reduziert || mobil) return;
    let letzterIndex = -1;
    return proFrame((s) => {
      const p = anteil(mass.current, s.y);
      const g = treppe(p * (PANELS.length - 1));
      lauf.current = g;
      if (glut.current) glut.current.style.transform = `scaleX(${p})`;
      const i = Math.min(PANELS.length - 1, Math.max(0, Math.round(g)));
      if (i !== letzterIndex) { letzterIndex = i; setIndex(i); }
    });
  }, [mass, reduziert, mobil]);

  // MOBIL: die Kamera folgt dem Wisch, nicht dem Scroll. Eine 600vh lange
  // Pinnstrecke auf einem Telefon durchzuscrollen ist kein Erlebnis, sondern
  // Arbeit — und der Daumen erwartet hier ohnehin eine Seitwaertsgeste.
  useEffect(() => {
    if (reduziert || !mobil) return;
    return proFrame((s) => {
      const z = ziel.current + zug.current;
      const k = 1 - Math.pow(0.002, s.dt);
      lauf.current += (z - lauf.current) * k;
      if (glut.current) {
        glut.current.style.transform = `scaleX(${lauf.current / (PANELS.length - 1)})`;
      }
    });
  }, [reduziert, mobil]);

  // Wischgeste auf der Buehne
  useEffect(() => {
    const el = host.current;
    if (!el || reduziert || !mobil) return;
    let id = -1;
    let startX = 0;
    let startY = 0;
    let quer = false;
    const breite = () => el.getBoundingClientRect().width || window.innerWidth;

    const down = (e: PointerEvent) => {
      id = e.pointerId; startX = e.clientX; startY = e.clientY; quer = false;
    };
    const move = (e: PointerEvent) => {
      if (e.pointerId !== id) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      // Erst ab klarer Querbewegung uebernehmen — sonst blockiert die Galerie
      // das vertikale Scrollen der Seite.
      if (!quer && Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.4) quer = true;
      if (!quer) return;
      e.preventDefault();
      zug.current = -(dx / breite()) * 1.15;
    };
    const up = (e: PointerEvent) => {
      if (e.pointerId !== id) return;
      id = -1;
      if (!quer) { zug.current = 0; return; }
      const neu = Math.min(PANELS.length - 1, Math.max(0, Math.round(ziel.current + zug.current)));
      ziel.current = neu;
      zug.current = 0;
      setIndex(neu);
    };
    el.addEventListener('pointerdown', down, { passive: true });
    el.addEventListener('pointermove', move, { passive: false });
    el.addEventListener('pointerup', up, { passive: true });
    el.addEventListener('pointercancel', up, { passive: true });
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
    };
  }, [reduziert, mobil]);

  /** Klick auf eine Nummer: mobil springt die Kamera, am Desktop faehrt der Scroll. */
  const springeZu = useCallback((z: number) => {
    if (mobil) {
      ziel.current = z;
      zug.current = 0;
      setIndex(z);
      return;
    }
    const b = mass.current;
    scrolleZu(b.start + b.weg * (z / (PANELS.length - 1)), 1.3);
  }, [mass, mobil]);

  if (reduziert || !kannWebGL) {
    return (
      <div ref={bereich}>
        <GalleryFallback />
      </div>
    );
  }

  const station = PANELS[index];

  return (
    <div
      ref={bereich}
      className={`gal ${mobil ? 'gal--mobil' : ''}`}
      style={mobil ? undefined : { height: `${PANELS.length * VH_PRO_STATION}vh` }}
    >
      <div ref={buehne} className="gal__sticky">
        {/* Eigene Buehne mit Puffer rechts: sonst laeuft das Karussell unter
            die Seiten-Navigation. Der Canvas misst diese Buehne, nicht das
            Fenster — dadurch zentriert sich die Szene im freien Bereich. */}
        <div ref={host} className="gal__buehne">
          {naehe.nah && (
            <GalleryScene lauf={lauf} mobil={mobil} host={host} aktiv={naehe.aktiv} />
          )}
        </div>

        <div className="gal__hud">
          <div className="gal__unten">
            {mobil && <p className="gal__wisch mono" aria-hidden="true">←  wischen  →</p>}
            <p className="meta gal__micro">
              {String(index + 1).padStart(2, '0')} / {String(PANELS.length).padStart(2, '0')}
              {'  ·  '}
              {station.modul}
            </p>
            <h3 className="h2 gal__titel">{station.titel}</h3>
            <ul className="gal__tags">
              {station.tags.map((t) => (
                <li key={t} className="gal__tag mono">{t}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Fortschritt als horizontale Leiste unten mittig — die Seiten-Nav
            bleibt rechts allein, damit sich keine zwei Nummernspalten
            gegenseitig stoeren. */}
        <nav className="galbar" aria-label="Stationen der Galerie">
          <span className="galbar__schiene" aria-hidden="true" />
          <span ref={glut} className="galbar__glut" aria-hidden="true" />
          <ul>
            {PANELS.map((p, i) => (
              <li key={p.titel}>
                <button
                  className={`galbar__nr mono ${i === index ? 'is-on' : ''}`}
                  onClick={() => springeZu(i)}
                  aria-current={i === index ? 'true' : undefined}
                  aria-label={`${String(i + 1).padStart(2, '0')} — Station ${i + 1}: ${p.titel}`}
                >
                  {String(i + 1).padStart(2, '0')}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
