'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { messeBereich, type Bereich } from './scrollStore';
import { useKnoten } from './knoten';

/**
 * Vermisst die Scrollstrecke eines Abschnitts bei Mount und Resize und haelt
 * das Ergebnis in einem Ref. Der Frame-Loop rechnet damit nur noch — kein
 * Layout-Lesen pro Frame, kein React-Rerender.
 */
export function useBereich(
  ref: RefObject<HTMLElement | null>,
  aStart = 0,
  aEnde = 1,
): RefObject<Bereich> {
  const mass = useRef<Bereich>({ start: 0, weg: 1 });
  // Ueber useKnoten, aus demselben Grund wie in useNaehe: der erste Render ist
  // der Fallback-Zweig, der endgueltige Knoten kommt spaeter.
  const knoten = useKnoten(ref);
  useEffect(() => {
    if (!knoten) return;
    const messen = () => {
      mass.current = messeBereich(knoten, aStart, aEnde);
    };
    messen();
    // Nach Fonts/Bildern noch einmal — davor stimmt die Hoehe oft nicht.
    const t = window.setTimeout(messen, 400);
    window.addEventListener('resize', messen);
    const ro = 'ResizeObserver' in window ? new ResizeObserver(messen) : null;
    if (ro) ro.observe(document.documentElement);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('resize', messen);
      ro?.disconnect();
    };
  }, [knoten, aStart, aEnde]);
  return mass;
}
