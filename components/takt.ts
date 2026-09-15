/**
 * DER HERZSCHLAG DER SEITE.
 *
 * Eine einzige Taktquelle fuer alles, was im Leerlauf pulsiert: Kern, Ringe,
 * Lichtimpulse, Panel-Schweben, Pills, Statuszeile, Hintergrundnetz.
 *
 * WARUM ZENTRAL: Vorher hatte jedes Element seinen eigenen Sinus mit eigener
 * Frequenz und teils zufaelliger Phase. Das Ergebnis liest sich als Rauschen —
 * es bewegt sich viel, aber nichts gehoert zusammen. Mit einem gemeinsamen
 * Takt wird aus Bewegung Choreografie: Der Impuls verlaesst den Kern auf dem
 * Schlag und kommt exakt auf dem naechsten an, genau dann glimmt das Panel.
 *
 * Die Zeitbasis ist performance.now(), nicht die Clock einer einzelnen
 * Three-Szene. Nur so laufen WebGL-Szenen, 2D-Canvas und DOM auf demselben
 * Zaehler — auch dann noch, wenn eine Szene zwischendurch pausiert war und
 * ihre eigene Uhr stehen geblieben ist.
 */

/** Sekunden je Schlag. */
export const TAKT = 2;

const T0 = typeof performance !== 'undefined' ? performance.now() / 1000 : 0;

/** Sekunden seit Seitenstart, quellenunabhaengig. */
export function taktZeit() {
  return typeof performance !== 'undefined' ? performance.now() / 1000 - T0 : 0;
}

export type Schlag = {
  /** laufende Schlagnummer, ganzzahlig */
  schlag: number;
  /** Position im aktuellen Schlag, 0..1 */
  phase: number;
  /** Huellkurve des Schlags: schneller Anstieg, weiches Abklingen */
  puls: number;
};

/** Huellkurve eines Schlags. 0..1, Spitze kurz nach dem Schlag. */
export function huelle(phase: number) {
  const anstieg = 0.09;
  if (phase < anstieg) return phase / anstieg;
  return Math.exp(-(phase - anstieg) * 4.4);
}

export function schlagJetzt(zeit = taktZeit()): Schlag {
  const x = zeit / TAKT;
  const schlag = Math.floor(x);
  const phase = x - schlag;
  return { schlag, phase, puls: huelle(phase) };
}

/**
 * Derselbe Takt, aber um einen festen Bruchteil versetzt — fuer Elemente, die
 * im Kanon laufen sollen statt unisono (Panel 1/2/3 auf 0°/120°/240°).
 */
export function versetzt(anteil: number, zeit = taktZeit()): Schlag {
  return schlagJetzt(zeit + anteil * TAKT);
}

/**
 * Langsame Schwebe-Phase 0..1, an den Takt gekoppelt: eine volle Schwingung
 * dauert `schlaege` Schlaege. `versatz` ist der Phasenversatz in Umdrehungen
 * (1/3 = 120°).
 */
export function schwebe(versatz = 0, schlaege = 2, zeit = taktZeit()) {
  return ((zeit / (TAKT * schlaege)) + versatz) % 1;
}

/** Volle Orbit-Umdrehung in genau `schlaege` Schlaegen. */
export function orbitTempo(schlaege = 16) {
  return (Math.PI * 2) / (TAKT * schlaege);
}
