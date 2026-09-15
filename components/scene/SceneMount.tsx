'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useMotionPref } from '../useMotionPref';
import StaticLattice from '../StaticLattice';
import { hatWebGL } from '../webgl';
import { useGedeckt } from '../deckung';

const Scene = dynamic(() => import('./Scene'), { ssr: false });

/**
 * Die Szene wird erst nach dem ersten Idle geladen — sie darf das LCP nicht
 * blockieren. Bei reduzierter Bewegung kommt stattdessen das SVG-Standbild.
 *
 * AUF MOBILE GAR NICHT: Der Hintergrund ist ein dezentes Netz aus 70 Punkten,
 * das auf einem Telefon ohnehin kaum zur Geltung kommt — er zieht aber die
 * gesamte Three.js/R3F-Kette in den Seitenstart. Gemessen gegen die Live-
 * Domain: 1146 ms Scripting im groessten Chunk, Total Blocking Time 650 ms.
 * Ohne ihn laedt Three.js erst, wenn sich der Nutzer der Systems Gallery
 * naehert — die auf Mobile weiterhin in echtem WebGL laeuft. Das Standbild
 * ist die gestaltete Entsprechung, kein Notbehelf.
 */
export default function SceneMount() {
  const reduziert = useMotionPref();
  const gedeckt = useGedeckt();
  const [bereit, setBereit] = useState(false);
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [mobil, setMobil] = useState<boolean | null>(null);

  useEffect(() => {
    setWebgl(hatWebGL());
    setMobil(window.matchMedia('(max-width: 900px), (hover: none) and (pointer: coarse)').matches);
  }, []);

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
  if (mobil !== false) return <StaticLattice />;
  // Ohne WebGL niemals den Canvas mounten — sonst nimmt der Fehlschlag
  // den restlichen Client-Render mit.
  if (webgl === false) return <StaticLattice />;
  if (!bereit || webgl === null) return <StaticLattice />;
  return <Scene aktiv={!gedeckt} />;
}
