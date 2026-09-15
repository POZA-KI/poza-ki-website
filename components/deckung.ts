'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { useKnoten } from './knoten';

/**
 * Zaehlt, wie viele deckende Vollbild-Szenen gerade im Bild sind.
 *
 * Die Gallery-, Blueprint- und Constellation-Buehnen sind gepinnt, 100svh
 * hoch und undurchsichtig (#07090C). Solange eine davon steht, ist der
 * Hintergrund-Canvas komplett verdeckt — und darf abgeschaltet werden. Damit
 * laufen nie zwei WebGL-Kontexte gleichzeitig, statt wie vorher bis zu vier.
 */
let zaehler = 0;
const horcher = new Set<(gedeckt: boolean) => void>();

function melde() {
  const g = zaehler > 0;
  for (const h of horcher) h(g);
}

export function meldeDeckung(an: boolean) {
  zaehler += an ? 1 : -1;
  if (zaehler < 0) zaehler = 0;
  melde();
}

/** true, sobald irgendeine Vollbild-Szene den Hintergrund verdeckt. */
export function useGedeckt() {
  const [gedeckt, setGedeckt] = useState(false);
  useEffect(() => {
    horcher.add(setGedeckt);
    setGedeckt(zaehler > 0);
    return () => { horcher.delete(setGedeckt); };
  }, []);
  return gedeckt;
}

/**
 * Meldet die eigene Buehne an, sobald sie den Viewport wirklich fuellt.
 *
 * Wie useNaehe ueber useKnoten: Die Buehne existiert erst, wenn der
 * Fallback-Zweig verlassen ist. Mit [ref] lief der Effekt genau einmal, zu
 * einem Zeitpunkt, an dem ref.current noch null war — der Hintergrund-Canvas
 * lief dann hinter jeder Vollbild-Szene unbemerkt weiter.
 */
export function useMeldeDeckung(ref: RefObject<HTMLElement | null>) {
  const an = useRef(false);
  const knoten = useKnoten(ref);
  useEffect(() => {
    const el = knoten;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        const voll = e.intersectionRatio > 0.85;
        if (voll === an.current) return;
        an.current = voll;
        meldeDeckung(voll);
      },
      { threshold: [0, 0.85, 0.99] },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (an.current) { an.current = false; meldeDeckung(false); }
    };
  }, [knoten]);
}
