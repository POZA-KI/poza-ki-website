'use client';

import { useEffect, useState } from 'react';

/**
 * Kombiniert System-Einstellung und den persistenten Nutzer-Toggle aus dem
 * Footer. Der Toggle überschreibt das System in BEIDE Richtungen — jemand mit
 * systemweit reduzierter Bewegung darf die Animation hier trotzdem einschalten.
 */
export function useMotionPref() {
  const [reduziert, setReduziert] = useState(true); // sicherer Start: erst nach Prüfung animieren

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const lesen = () => {
      const gesetzt = document.documentElement.dataset.motion;
      if (gesetzt === 'reduced') return setReduziert(true);
      if (gesetzt === 'full') return setReduziert(false);
      setReduziert(mq.matches);
    };
    lesen();
    mq.addEventListener('change', lesen);
    window.addEventListener('pozaki:motion', lesen);
    return () => {
      mq.removeEventListener('change', lesen);
      window.removeEventListener('pozaki:motion', lesen);
    };
  }, []);

  return reduziert;
}
