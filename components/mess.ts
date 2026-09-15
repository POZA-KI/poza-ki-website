'use client';

/**
 * Messsonde fuer die Abnahme.
 *
 * Nur aktiv, wenn die Seite mit ?mess=1 geladen wird. Ohne den Parameter
 * passiert hier nichts ausser einem Boolean-Vergleich pro Frame — die
 * Choreografie laesst sich sonst nur ueber Pixelvergleiche schaetzen, und
 * geschaetzte Abnahmewerte sind keine Abnahmewerte.
 */
export const MESSEN =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('mess');

export const messwerte: Record<string, number> = {};

if (MESSEN) {
  (window as unknown as { __mess: Record<string, number> }).__mess = messwerte;
}

export function melde(schluessel: string, wert: number) {
  if (MESSEN) messwerte[schluessel] = wert;
}
