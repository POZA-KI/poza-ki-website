/**
 * Prüft EINMAL, ob WebGL verfügbar ist, und merkt sich das Ergebnis.
 *
 * Ohne diesen Guard versucht R3F einen Kontext zu erzeugen, scheitert und
 * reisst den Client-Render mit — sichtbar daran, dass Motion-Animationen
 * ringsum auf ihrem SSR-Startwert stehen bleiben (verifiziert in einem Chrome
 * mit deaktivierter Hardwarebeschleunigung). Die Seite muss ohne 3D
 * vollständig funktionieren, nicht nur ohne Szene.
 */
let zwischenspeicher: boolean | null = null;

export function hatWebGL(): boolean {
  if (zwischenspeicher !== null) return zwischenspeicher;
  if (typeof window === 'undefined') return false;
  try {
    const c = document.createElement('canvas');
    const gl =
      c.getContext('webgl2') ||
      c.getContext('webgl') ||
      c.getContext('experimental-webgl');
    zwischenspeicher = !!gl;
    // Kontext sofort wieder freigeben, sonst belegt der Test ein Slot
    if (gl && 'getExtension' in gl) {
      (gl as WebGLRenderingContext).getExtension('WEBGL_lose_context')?.loseContext();
    }
  } catch {
    zwischenspeicher = false;
  }
  return zwischenspeicher;
}
