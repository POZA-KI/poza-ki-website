'use client';

import { setzeMotion, useMotionPref } from './motion';

/**
 * Persistenter Toggle. Ueberschreibt die Systemeinstellung in beide
 * Richtungen: Wer systemweit reduzierte Bewegung eingestellt hat, darf die
 * Animationen hier trotzdem einschalten — und umgekehrt.
 */
export default function MotionToggle() {
  const reduziert = useMotionPref();

  return (
    <button
      className="footer__link mono"
      onClick={() => setzeMotion(reduziert ? 'full' : 'reduced')}
      aria-pressed={!reduziert}
    >
      {reduziert ? 'Animationen aktivieren' : 'Animationen deaktivieren'}
    </button>
  );
}
