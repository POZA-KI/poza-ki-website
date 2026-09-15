/**
 * EINE Quelle fuer alle scroll-gekoppelten Werte.
 *
 * Lenis schreibt hinein, ein einziger rAF-Loop daempft und benachrichtigt alle
 * Abnehmer genau einmal pro Frame. Vorher liefen zwei window-scroll-Listener,
 * mehrere eigene rAF-Schleifen und setState pro Scroll-Event parallel — das
 * erzeugt konkurrierende Schreibzugriffe auf dieselben Styles und damit das
 * Flackern.
 *
 * REGELN fuer Abnehmer:
 *   - nur transform/opacity schreiben, niemals top/left (Layout pro Frame)
 *   - keine CSS-transition auf Elementen, die hier animiert werden
 *     (Transition + rAF kaempfen gegeneinander)
 *   - kein setState im Frame-Callback
 */

export type FrameFn = (s: Fortschritt) => void;

export type Fortschritt = {
  /** roher Seitenfortschritt 0..1 */
  roh: number;
  /** gedaempfter Fortschritt, fuer alles Visuelle */
  weich: number;
  /** Scrollgeschwindigkeit als Anteil der Seitenlaenge pro Sekunde */
  tempo: number;
  /**
   * Scrollgeschwindigkeit in Pixel pro Sekunde, normalisiert auf 0..1
   * (1 = 2500 px/s, also zuegiges Wischen).
   *
   * WARUM ZUSAETZLICH: `tempo` haengt an der Gesamthoehe der Seite. Auf dieser
   * ~28000 px langen Seite entspricht ein kraeftiger Scrollstoss von 1000 px
   * gerade 3,5 % Fortschritt — als Steuergroesse fuer einen spuerbaren Impuls
   * ist das unbrauchbar (gemessen: Schub blieb faktisch aus).
   */
  tempoPx: number;
  /** Mausposition -1..1 */
  mx: number;
  my: number;
  mausAktiv: boolean;
  /** aktuelle Scrollposition in px */
  y: number;
  /** gedaempfte Scrollposition in px, Basis fuer tempoPx */
  yWeich: number;
  /** Viewporthoehe in px */
  vh: number;
  /** Sekunden seit Start */
  zeit: number;
  /** Delta in Sekunden */
  dt: number;
};

type LenisArtig = {
  scrollTo: (y: number, o?: { duration?: number }) => void;
  /** Anhalten/Fortsetzen — gebraucht fuer die Scroll-Sperre im Modal. */
  stop?: () => void;
  start?: () => void;
};

const zustand: Fortschritt = {
  roh: 0, weich: 0, tempo: 0, tempoPx: 0, mx: 0, my: 0, mausAktiv: false, y: 0, yWeich: 0, vh: 0, zeit: 0, dt: 0,
};

const abnehmer = new Set<FrameFn>();
let laeuft = false;
let raf = 0;
let letzte = 0;

export const scrollStore = {
  lenis: null as LenisArtig | null,
  /** Rohwert; nur Lenis oder der Fallback-Listener schreiben hier. */
  get p() { return zustand.weich; },
  get rohP() { return zustand.roh; },
  get mx() { return zustand.mx; },
  get my() { return zustand.my; },
  get mausAktiv() { return zustand.mausAktiv; },
  zustand,
};

/** Abnehmer registrieren. Rueckgabe meldet wieder ab. */
export function proFrame(fn: FrameFn) {
  abnehmer.add(fn);
  starte();
  return () => {
    abnehmer.delete(fn);
    if (abnehmer.size === 0) stoppe();
  };
}

function messeRoh() {
  zustand.y = window.scrollY;
  zustand.vh = window.innerHeight;
  const max = document.documentElement.scrollHeight - zustand.vh;
  zustand.roh = max > 0 ? Math.min(1, Math.max(0, zustand.y / max)) : 0;
}

function schleife(t: number) {
  if (!laeuft) return;
  const dt = letzte ? Math.min((t - letzte) / 1000, 0.05) : 0.016;
  letzte = t;
  zustand.zeit = t / 1000;
  zustand.dt = dt;

  const vorher = zustand.weich;
  const vorherY = zustand.yWeich;
  // kritische Daempfung, framerate-unabhaengig
  const k = 1 - Math.pow(0.0015, dt);
  zustand.weich += (zustand.roh - zustand.weich) * k;
  zustand.yWeich += (zustand.y - zustand.yWeich) * k;
  zustand.tempo = dt > 0 ? Math.min(1, Math.abs(zustand.weich - vorher) / dt / 2) : 0;
  zustand.tempoPx = dt > 0 ? Math.min(1, Math.abs(zustand.yWeich - vorherY) / dt / 2500) : 0;

  for (const fn of abnehmer) fn(zustand);
  raf = requestAnimationFrame(schleife);
}

function starte() {
  if (laeuft) return;
  laeuft = true;
  letzte = 0;
  raf = requestAnimationFrame(schleife);
}
function stoppe() {
  laeuft = false;
  cancelAnimationFrame(raf);
}

if (typeof window !== 'undefined') {
  const onMove = (e: PointerEvent) => {
    zustand.mx = (e.clientX / window.innerWidth) * 2 - 1;
    zustand.my = -((e.clientY / window.innerHeight) * 2 - 1);
    zustand.mausAktiv = true;
  };
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerleave', () => { zustand.mausAktiv = false; }, { passive: true });

  // EINZIGER Scroll-Listener der Seite. Lenis ruft messeRoh ebenfalls auf;
  // doppelte Messung im selben Frame ist idempotent.
  window.addEventListener('scroll', messeRoh, { passive: true });
  window.addEventListener('resize', messeRoh, { passive: true });
  messeRoh();
  // Pausieren, wenn der Tab nicht sichtbar ist
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stoppe();
    else if (abnehmer.size) { letzte = 0; starte(); }
  });
}

export function aktualisiereRoh() { messeRoh(); }

export function scrolleZu(y: number, dauer = 1.1) {
  if (scrollStore.lenis) scrollStore.lenis.scrollTo(y, { duration: dauer });
  else window.scrollTo({ top: y, behavior: 'smooth' });
}

export type Bereich = { start: number; weg: number };

/**
 * Scrollstrecke eines Abschnitts EINMAL vermessen (Mount/Resize), damit im
 * Frame nur noch gerechnet und nie mehr Layout gelesen wird. Ein
 * getBoundingClientRect pro Frame erzwingt sonst Reflow — die zweite grosse
 * Flackerquelle neben top-Animationen.
 *
 *   aStart — Viewport-Anteil, an dem die Oberkante bei Fortschritt 0 steht
 *            (0 = Viewport-Oberkante, 0.85 = 85 % runter)
 *   aEnde  — Viewport-Anteil, an dem die Unterkante bei Fortschritt 1 steht
 */
export function messeBereich(el: HTMLElement | null, aStart = 0, aEnde = 1): Bereich {
  if (!el || typeof window === 'undefined') return { start: 0, weg: 1 };
  let top = 0;
  let n: HTMLElement | null = el;
  while (n) {
    top += n.offsetTop;
    n = n.offsetParent as HTMLElement | null;
  }
  const vh = window.innerHeight;
  const start = top - aStart * vh;
  const ende = top + el.offsetHeight - aEnde * vh;
  return { start, weg: Math.max(1, ende - start) };
}

/** Fortschritt 0..1 innerhalb eines vermessenen Bereichs. */
export function anteil(b: Bereich, y: number) {
  return Math.min(1, Math.max(0, (y - b.start) / b.weg));
}
