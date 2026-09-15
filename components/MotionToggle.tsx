'use client';

import { useEffect, useState } from 'react';

/**
 * Persistenter Toggle. Überschreibt die System-Einstellung in beide Richtungen
 * und feuert ein Event, damit alle Komponenten sofort umschalten (ohne Reload).
 */
export default function MotionToggle() {
  const [reduziert, setReduziert] = useState<boolean | null>(null);

  useEffect(() => {
    const gesetzt = document.documentElement.dataset.motion;
    if (gesetzt === 'reduced') setReduziert(true);
    else if (gesetzt === 'full') setReduziert(false);
    else setReduziert(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  function umschalten() {
    const neu = !reduziert;
    setReduziert(neu);
    const wert = neu ? 'reduced' : 'full';
    document.documentElement.dataset.motion = wert;
    try {
      localStorage.setItem('pozaki.motion', wert);
    } catch {
      /* private Modi werfen hier — kein Grund, den Toggle zu verlieren */
    }
    window.dispatchEvent(new Event('pozaki:motion'));
  }

  if (reduziert === null) return null; // erst nach Prüfung rendern, kein Flackern

  return (
    <button className="footer__link mono" onClick={umschalten} aria-pressed={reduziert}>
      {reduziert ? 'Animationen aktivieren' : 'Animationen reduzieren'}
    </button>
  );
}
