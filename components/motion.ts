'use client';

import { useSyncExternalStore } from 'react';

/**
 * EINE Quelle fuer "Animationen an oder aus".
 *
 * Massgeblich ist `data-motion` am <html>. Das Inline-Skript im Layout loest
 * die Einstellung VOR dem ersten Paint auf:
 *
 *     gespeicherte Wahl  >  Systemvorgabe (prefers-reduced-motion)  >  "full"
 *
 * WARUM NICHT useState + useEffect (so war es vorher): Der Start-State war
 * `true` (reduziert), korrigiert wurde erst im Effekt. Damit war der erste
 * Render IMMER der statische Zweig — auch fuer die grosse Mehrheit, die
 * Animationen bekommen soll. Das Umschalten danach war genau das Aufblitzen
 * der statischen Fassung. Zusaetzlich haengten Observer dadurch am
 * Fallback-Knoten, der Sekundenbruchteile spaeter ausgetauscht wurde.
 *
 * useSyncExternalStore loest beides: Der Server-Snapshot ist "nicht
 * reduziert", das SSR-Markup ist also die animierte Fassung, und der
 * Client-Snapshot liest synchron das Attribut — ohne Zwischenzustand und ohne
 * Hydration-Fehler.
 */

const SCHLUESSEL = 'pozaki.motion';
const EVENT = 'pozaki:motion';

export type MotionWahl = 'full' | 'reduced';

const horcher = new Set<() => void>();

function benachrichtige() {
  for (const h of horcher) h();
}

function abonniere(cb: () => void) {
  horcher.add(cb);
  const mq = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;
  // Systemwechsel wirkt nur, solange der Nutzer nichts eigenes gewaehlt hat.
  const beiSystem = () => { if (!gespeicherteWahl()) { schreibeAttribut(systemWahl()); benachrichtige(); } };
  mq?.addEventListener('change', beiSystem);
  window.addEventListener(EVENT, cb);
  return () => {
    horcher.delete(cb);
    mq?.removeEventListener('change', beiSystem);
    window.removeEventListener(EVENT, cb);
  };
}

function gespeicherteWahl(): MotionWahl | null {
  try {
    const w = localStorage.getItem(SCHLUESSEL);
    return w === 'full' || w === 'reduced' ? w : null;
  } catch {
    return null; // private Modi werfen hier
  }
}

function systemWahl(): MotionWahl {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'reduced'
    : 'full';
}

function schreibeAttribut(w: MotionWahl) {
  document.documentElement.dataset.motion = w;
}

/** Aktuelle Wahl, synchron aus dem Attribut. */
export function aktuelleWahl(): MotionWahl {
  if (typeof document === 'undefined') return 'full';
  const w = document.documentElement.dataset.motion;
  if (w === 'full' || w === 'reduced') return w;
  // Sollte das Inline-Skript ausgefallen sein: jetzt aufloesen.
  const aufgeloest = gespeicherteWahl() ?? systemWahl();
  schreibeAttribut(aufgeloest);
  return aufgeloest;
}

function schnappschuss() {
  return aktuelleWahl() === 'reduced';
}

/** Auf dem Server gilt der Standard: Animationen an. */
function serverSchnappschuss() {
  return false;
}

/** true = Animationen reduziert. */
export function useMotionPref() {
  return useSyncExternalStore(abonniere, schnappschuss, serverSchnappschuss);
}

/** Setzt die Wahl, speichert sie und benachrichtigt alle Abnehmer. */
export function setzeMotion(w: MotionWahl) {
  schreibeAttribut(w);
  try {
    localStorage.setItem(SCHLUESSEL, w);
  } catch {
    /* ohne Persistenz gilt die Wahl wenigstens fuer diese Sitzung */
  }
  window.dispatchEvent(new Event(EVENT));
  benachrichtige();
}
