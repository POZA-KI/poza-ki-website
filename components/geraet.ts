/**
 * Geraeteklasse einmalig bestimmen. Statt bei Ruckeln nachzuregeln wird die
 * Last vorab passend gewaehlt — Nachregeln sieht man, eine von Anfang an
 * passende Stufe nicht.
 */
export type Stufe = 'hoch' | 'mittel' | 'niedrig';

let gemerkt: Stufe | null = null;

export function geraeteStufe(): Stufe {
  if (gemerkt) return gemerkt;
  if (typeof window === 'undefined') return 'niedrig';

  const nav = navigator as Navigator & {
    deviceMemory?: number;
    hardwareConcurrency?: number;
    connection?: { saveData?: boolean };
  };
  const kerne = nav.hardwareConcurrency ?? 4;
  const ram = nav.deviceMemory ?? 4;
  const dpr = window.devicePixelRatio || 1;
  const schmal = window.innerWidth < 900;
  const sparsam = nav.connection?.saveData === true;

  if (sparsam || kerne <= 4 || ram <= 4) gemerkt = 'niedrig';
  else if (schmal || kerne <= 8 || dpr > 2.5) gemerkt = 'mittel';
  else gemerkt = 'hoch';
  return gemerkt;
}

/** Budget je Szene, abgeleitet aus der Stufe. */
export function budget(mobil: boolean) {
  const s = geraeteStufe();
  const niedrig = s === 'niedrig' || mobil;
  const mittel = s === 'mittel';
  return {
    stufe: s,
    dpr: niedrig ? 1 : mittel ? 1.25 : 1.5,
    partikel: niedrig ? 600 : mittel ? 1200 : 2000,
    netzPunkte: niedrig ? 70 : mittel ? 110 : 150,
    bloom: !niedrig,
    bloomSkala: mittel ? 0.4 : 0.5,
    antialias: s === 'hoch' && !mobil,
    texturHz: niedrig ? 6 : 12,
  };
}
