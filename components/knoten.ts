'use client';

import { useEffect, useState, type RefObject } from 'react';

/**
 * Macht aus einem Ref eine echte Effekt-Abhaengigkeit.
 *
 * WARUM: useMotionPref startet auf "reduziert", der erste Render ist also
 * immer der Fallback-Zweig — mit einem anderen DOM-Knoten am selben Ref.
 * Effekte mit [ref] laufen danach nie wieder, weil die Ref-Identitaet stabil
 * ist; ihre Observer haengen dauerhaft am abgehaengten Fallback-Knoten. Genau
 * daran blieb die Systems Gallery auf der Produktionsdomain schwarz: Die
 * Szene wurde nie gemountet.
 *
 * Ein Effekt ganz ohne Dependency-Array waere die falsche Loesung — React
 * ruft dann vor jedem Re-Render die Cleanup-Funktion auf, und ein
 * Early-Return legt danach nichts Neues an. Der Knoten wandert deshalb in
 * State: Der Sync-Effekt laeuft nach jedem Render, setzt State aber nur beim
 * tatsaechlichen Wechsel, und der eigentliche Effekt bekommt eine korrekte
 * Abhaengigkeit samt Cleanup.
 */
export function useKnoten(ref: RefObject<HTMLElement | null>) {
  const [knoten, setKnoten] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (ref.current !== knoten) setKnoten(ref.current);
  });
  return knoten;
}
