'use client';

/**
 * Entscheidet, ob ein resize-Event wirklich eine neue Canvas-Groesse braucht.
 *
 * Auf Mobile feuert resize beim Scrollen staendig, weil die Adressleiste ein-
 * und ausfaehrt. Ein Renderer-Resize mitten im Scroll kostet eine komplette
 * Neuallokation der Framebuffer — genau das sieht man als Aussetzer. Reine
 * Hoehenaenderungen unterhalb der Leistenhoehe werden deshalb ignoriert.
 */
export function brauchtResize(
  alt: { w: number; h: number },
  neu: { w: number; h: number },
  grob: boolean,
) {
  if (neu.w !== alt.w) return true;
  const dh = Math.abs(neu.h - alt.h);
  return grob ? dh > 140 : dh > 1;
}

export const grobeEingabe = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: none) and (pointer: coarse)').matches;
