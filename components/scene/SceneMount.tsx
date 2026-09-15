'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useMotionPref } from '../useMotionPref';
import StaticLattice from '../StaticLattice';
import { useWebGL } from '../faehig';
import { useGedeckt } from '../deckung';

const Scene = dynamic(() => import('./Scene'), { ssr: false });

/**
 * Die Szene wird erst nach dem ersten Idle geladen — sie darf das LCP nicht
 * blockieren. Bei reduzierter Bewegung kommt stattdessen das SVG-Standbild.
 *
 * Auf Mobile laeuft die Szene ebenfalls, nur mit kleinerem Budget (weniger
 * Punkte, niedrigere DPR, kein Bloom — siehe ../geraet). Die Geraeteklasse
 * senkt die Qualitaet, sie schaltet nie ganz auf statisch: Ein Telefon soll
 * dieselbe Seite sehen, nur sparsamer gerechnet. Nur eine ausdrueckliche
 * Entscheidung fuer reduzierte Bewegung fuehrt zum Standbild.
 */
export default function SceneMount() {
  const reduziert = useMotionPref();
  const gedeckt = useGedeckt();
  const [bereit, setBereit] = useState(false);
  const webgl = useWebGL();

  useEffect(() => {
    type RIC = (cb: () => void, o?: { timeout: number }) => number;
    const ric = (window as unknown as { requestIdleCallback?: RIC }).requestIdleCallback;
    if (ric) {
      ric(() => setBereit(true), { timeout: 800 });
      return;
    }
    const t = window.setTimeout(() => setBereit(true), 700);
    return () => window.clearTimeout(t);
  }, []);

  if (reduziert) return <StaticLattice />;
  // Ohne WebGL niemals den Canvas mounten — sonst nimmt der Fehlschlag
  // den restlichen Client-Render mit.
  if (!webgl) return <StaticLattice />;
  if (!bereit) return <StaticLattice />;
  return <Scene aktiv={!gedeckt} />;
}
