'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useMotionPref } from './useMotionPref';
import StaticLattice from './StaticLattice';

// ssr:false — der Canvas hat serverseitig nichts zu suchen und darf das
// LCP nicht blockieren.
const Lattice = dynamic(() => import('./Lattice'), { ssr: false });

export default function LatticeMount() {
  const reduziert = useMotionPref();
  const [bereit, setBereit] = useState(false);

  useEffect(() => {
    // Erst wenn der Hauptthread Luft hat, spätestens 600ms nach load.
    type RIC = (cb: () => void, o?: { timeout: number }) => number;
    const ric: RIC | undefined = (window as unknown as { requestIdleCallback?: RIC })
      .requestIdleCallback;
    if (ric) {
      const id = ric(() => setBereit(true), { timeout: 600 });
      return () => {
        const cic = (window as unknown as { cancelIdleCallback?: (h: number) => void })
          .cancelIdleCallback;
        cic?.(id);
      };
    }
    const t = window.setTimeout(() => setBereit(true), 600);
    return () => window.clearTimeout(t);
  }, []);

  // Bei reduzierter Bewegung gar kein Canvas, sondern ein Standbild —
  // sonst wäre die Seite dort visuell leer.
  if (reduziert) return <StaticLattice />;
  if (!bereit) return <StaticLattice />;
  return <Lattice />;
}
