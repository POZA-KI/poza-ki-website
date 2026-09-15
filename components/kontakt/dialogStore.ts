'use client';

import { useSyncExternalStore } from 'react';

/**
 * Winziger Store, damit jeder CTA der Seite dasselbe Modal oeffnen kann,
 * ohne dass ein Context durch den ganzen Baum gereicht werden muss.
 */
let offen = false;
const horcher = new Set<() => void>();

function melde() {
  for (const h of horcher) h();
}

export function oeffneAudit() {
  if (offen) return;
  offen = true;
  melde();
}

export function schliesseAudit() {
  if (!offen) return;
  offen = false;
  melde();
}

export function useAuditOffen() {
  return useSyncExternalStore(
    (cb) => { horcher.add(cb); return () => { horcher.delete(cb); }; },
    () => offen,
    () => false,
  );
}
