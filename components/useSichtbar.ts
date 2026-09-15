'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { useKnoten } from './knoten';

export type Naehe = {
  /** Szene mounten: Kontext anlegen, Shader kompilieren — mit Vorlauf. */
  nah: boolean;
  /** Szene rendern lassen. */
  aktiv: boolean;
};

/**
 * Zwei Stufen statt einer.
 *
 * MOUNTEN (nah, 220 % Vorlauf): Ein WebGL-Kontext plus Shader-Kompilierung
 * kostet Hauptthread-Zeit. Wenn alle vier Szenen das beim Seitenladen tun,
 * steht der Thread sekundenlang (gemessen: 3,1 s Total Blocking Time). Jede
 * Szene wird deshalb erst angelegt, wenn sie gut zwei Viewports
 * entfernt ist — frueh genug, dass die Arbeit laengst erledigt ist, wenn sie
 * ins Bild kommt, und spaet genug, dass sie den Seitenstart nicht belastet.
 *
 * RENDERN (aktiv, 35 %): Danach laeuft der Frameloop nur, solange die Szene
 * wirklich zu sehen ist. Direkt nach dem Mount bekommt sie einen kurzen
 * Warmlauf, sonst faellt die Shader-Kompilierung doch erst in den Moment des
 * Sichtbarwerdens.
 *
 * Beobachtet wird ueber useKnoten, nicht ueber das Ref direkt — sonst haengen
 * die Observer nach dem Wechsel vom Fallback- in den 3D-Zweig am falschen,
 * abgehaengten Knoten. Siehe ./knoten.
 */
export function useNaehe(ref: RefObject<HTMLElement | null>): Naehe {
  const [nah, setNah] = useState(false);
  const [aktiv, setAktiv] = useState(false);
  const [warm, setWarm] = useState(false);
  const warmLief = useRef(false);
  const knoten = useKnoten(ref);

  useEffect(() => {
    const el = knoten;
    if (!el) return;
    const weit = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setNah(true); },
      { rootMargin: '220% 0px 220% 0px' },
    );
    const eng = new IntersectionObserver(
      ([e]) => setAktiv(e.isIntersecting),
      { rootMargin: '35% 0px 35% 0px' },
    );
    weit.observe(el);
    eng.observe(el);
    return () => { weit.disconnect(); eng.disconnect(); };
  }, [knoten]);

  useEffect(() => {
    if (!nah || warmLief.current) return;
    warmLief.current = true;
    setWarm(true);
    const t = window.setTimeout(() => setWarm(false), 360);
    return () => window.clearTimeout(t);
  }, [nah]);

  return { nah, aktiv: aktiv || warm };
}
