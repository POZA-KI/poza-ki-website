'use client';

import { useSyncExternalStore } from 'react';
import { hatWebGL } from './webgl';

/**
 * Faehigkeiten des Clients, ohne Zwischenzustand.
 *
 * Auf dem Server ist weder WebGL noch die Fenstergroesse bekannt. Vorher
 * hiess "unbekannt" implizit "nicht vorhanden" — Blueprint und Constellation
 * rendern im SSR-Markup deshalb die statische Fassung und tauschten sie nach
 * der Hydration gegen die 3D-Variante. Genau das ist das Aufblitzen der
 * statischen Version, und der dabei ausgetauschte DOM-Knoten war die Ursache
 * haengender IntersectionObserver.
 *
 * useSyncExternalStore liest den Client-Wert schon beim Hydrieren synchron:
 * ein Render, kein Umschalten.
 */

let webglGemerkt: boolean | null = null;

function leerAbo() {
  return () => {};
}

function webglJetzt() {
  if (webglGemerkt === null) webglGemerkt = hatWebGL();
  return webglGemerkt;
}

/** Auf dem Server optimistisch: die grosse Mehrheit hat WebGL. */
function webglServer() {
  return true;
}

export function useWebGL() {
  return useSyncExternalStore(leerAbo, webglJetzt, webglServer);
}

/** Media Query als Store — reagiert auf Aenderungen, ohne Effekt-Umweg. */
export function useMedia(abfrage: string, serverWert = false) {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(abfrage);
      mq.addEventListener('change', cb);
      return () => mq.removeEventListener('change', cb);
    },
    () => window.matchMedia(abfrage).matches,
    () => serverWert,
  );
}

export const MOBIL_ABFRAGE = '(max-width: 900px), (hover: none) and (pointer: coarse)';
