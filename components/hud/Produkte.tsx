'use client';

import { motion, useScroll, useTransform, type MotionValue } from 'motion/react';
import { useRef } from 'react';
import { useMotionPref } from '../useMotionPref';

type Produkt = { wortmarke: string; versalien: boolean; text: string; punkte: string[] };

/**
 * Constellation Docking.
 *
 * Der Kern pulsiert permanent und sendet Impulse aus. Beim Einscrollen fliegen
 * die drei Panels nacheinander aus der Tiefe ein, eine Linie schiesst vom Kern
 * zum Panel, beim Kontakt ein Puls-Ring, dann zuenden die Pills nacheinander.
 * Die Wortmarke baut sich Buchstabe fuer Buchstabe mit Maske auf und bekommt
 * einen einzelnen Scan-Sweep.
 *
 * BEWUSST SVG + CSS, KEIN DRITTER WEBGL-KONTEXT: Hero-Szene und Galerie
 * belegen bereits zwei, Browser begrenzen die Zahl. Alles laeuft ueber
 * transform/opacity/filter, also im Compositor.
 */

/** Andockpunkte, relativ zur 1000x420-Buehne. */
const ZIELE = [
  { x: 168, y: 300, orbit: 'M500 96 C420 150 268 196 168 300' },
  { x: 500, y: 336, orbit: 'M500 96 C500 180 500 250 500 336' },
  { x: 832, y: 300, orbit: 'M500 96 C580 150 732 196 832 300' },
];

export default function Produkte({ items, status }: { items: Produkt[]; status: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduziert = useMotionPref();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 95%', 'end 45%'],
  });

  return (
    <div ref={ref} className="konst">
      <svg
        className="konst__buehne"
        viewBox="0 0 1000 420"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        {/* angedeutete Orbit-Bahnen, dauerhaft und sehr leise */}
        <ellipse cx="500" cy="96" rx="330" ry="86" stroke="var(--line-rule)" strokeWidth="1"
          vectorEffect="non-scaling-stroke" opacity="0.5" />
        <ellipse cx="500" cy="96" rx="200" ry="52" stroke="var(--line-hair)" strokeWidth="1"
          vectorEffect="non-scaling-stroke" />

        {ZIELE.map((z, i) => (
          <Andockung key={i} i={i} ziel={z} p={scrollYProgress} reduziert={reduziert} />
        ))}

        <Kern p={scrollYProgress} reduziert={reduziert} />
      </svg>

      <ul className="konst__panels">
        {items.map((it, i) => (
          <Panel key={it.wortmarke} it={it} i={i} p={scrollYProgress} reduziert={reduziert} />
        ))}
      </ul>

      <p className="konst__status mono">
        <span className="konst__statuspunkt" aria-hidden="true" />
        {status}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ Kern */

function Kern({ p, reduziert }: { p: MotionValue<number>; reduziert: boolean }) {
  const scale = useTransform(p, [0, 0.1], [0.5, 1]);
  const opacity = useTransform(p, [0, 0.1], [0, 1]);
  return (
    <motion.g style={reduziert ? undefined : { scale, opacity, originX: '500px', originY: '96px' }}>
      <circle className="konst__ring" cx="500" cy="96" r="26" stroke="var(--accent)"
        strokeWidth="1" vectorEffect="non-scaling-stroke" />
      <circle className="konst__ring konst__ring--2" cx="500" cy="96" r="26" stroke="var(--accent)"
        strokeWidth="1" vectorEffect="non-scaling-stroke" />
      <circle className="konst__kern" cx="500" cy="96" r="7" fill="var(--accent)" />
      <text x="500" y="64" textAnchor="middle" className="konst__kernlabel">POZA-KI</text>
    </motion.g>
  );
}

/* ------------------------------------------------- Linie + Puls-Ring */

function Andockung({
  i, ziel, p, reduziert,
}: {
  i: number;
  ziel: (typeof ZIELE)[number];
  p: MotionValue<number>;
  reduziert: boolean;
}) {
  const von = 0.16 + i * 0.1;
  const pathLength = useTransform(p, [von, von + 0.1], [0, 1]);
  // Puls-Ring genau im Moment des Kontakts
  const ringScale = useTransform(p, [von + 0.09, von + 0.2], [0.2, 2.6]);
  const ringOpacity = useTransform(p, [von + 0.09, von + 0.13, von + 0.2], [0, 0.85, 0]);

  return (
    <g>
      <motion.path
        id={`dock-${i}`}
        d={ziel.orbit}
        stroke="var(--accent)"
        strokeWidth="1"
        strokeOpacity="0.5"
        vectorEffect="non-scaling-stroke"
        style={reduziert ? { pathLength: 1 } : { pathLength }}
      />
      {/* Idle: Impuls wandert alle paar Sekunden vom Kern zum Produkt */}
      {!reduziert && (
        <circle r="3.5" fill="#CFE6FF" className="konst__impuls" style={{ animationDelay: `${i * 2.4}s` }}>
          <animateMotion dur="2.4s" begin={`${4 + i * 2.4}s`} repeatCount="indefinite" fill="freeze">
            <mpath href={`#dock-${i}`} />
          </animateMotion>
        </circle>
      )}
      <motion.circle
        cx={ziel.x}
        cy={ziel.y}
        r="10"
        stroke="var(--accent)"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
        style={
          reduziert
            ? { opacity: 0 }
            : { scale: ringScale, opacity: ringOpacity, originX: `${ziel.x}px`, originY: `${ziel.y}px` }
        }
      />
    </g>
  );
}

/* ----------------------------------------------------------------- Panel */

function Panel({
  it, i, p, reduziert,
}: {
  it: Produkt; i: number; p: MotionValue<number>; reduziert: boolean;
}) {
  const von = 0.1 + i * 0.1;
  // Einflug aus der Tiefe: aus dem Fog, klein und unscharf -> scharf
  const opacity = useTransform(p, [von, von + 0.12], [0, 1]);
  const scale = useTransform(p, [von, von + 0.14], [0.78, 1]);
  const filter = useTransform(p, [von, von + 0.14], ['blur(14px)', 'blur(0px)']);
  // leichte Bogenbewegung statt gerader Anflug
  const y = useTransform(p, [von, von + 0.14], [54, 0]);
  const x = useTransform(p, [von, von + 0.14], [i === 0 ? 34 : i === 2 ? -34 : 0, 0]);

  const dockt = von + 0.13;

  return (
    <motion.li
      className="konst__panel"
      style={reduziert ? undefined : { opacity, scale, filter, y, x }}
    >
      <span className="konst__glow" aria-hidden="true" />
      <Wortmarke text={it.wortmarke} versal={it.versalien} p={p} ab={dockt} reduziert={reduziert} />
      <p className="konst__text">{it.text}</p>
      <ul className="konst__pills">
        {it.punkte.map((t, k) => (
          <Pill key={t} t={t} p={p} ab={dockt + 0.02 + k * 0.022} reduziert={reduziert} />
        ))}
      </ul>
    </motion.li>
  );
}

function Pill({
  t, p, ab, reduziert,
}: {
  t: string; ab: number; reduziert: boolean; p: MotionValue<number>;
}) {
  const opacity = useTransform(p, [ab, ab + 0.03], [0.25, 1]);
  const glow = useTransform(p, [ab, ab + 0.02, ab + 0.08], [0, 1, 0]);
  return (
    <motion.li className="gal__tag mono konst__pill" style={reduziert ? undefined : { opacity }}>
      <motion.span className="konst__pillglow" aria-hidden="true" style={reduziert ? undefined : { opacity: glow }} />
      {t}
    </motion.li>
  );
}

function Wortmarke({
  text, versal, p, ab, reduziert,
}: {
  text: string; versal: boolean; ab: number; reduziert: boolean; p: MotionValue<number>;
}) {
  const sweep = useTransform(p, [ab, ab + 0.05], ['-130%', '130%']);
  const sweepAuf = useTransform(p, [ab - 0.01, ab, ab + 0.05, ab + 0.06], [0, 1, 1, 0]);

  return (
    <span className={`konst__marke ${versal ? 'is-versal' : ''}`}>
      <span className="konst__markeinner">
        {text.split('').map((c, k) => (
          <Buchstabe key={`${c}-${k}`} c={c} p={p} ab={ab + k * 0.008} reduziert={reduziert} />
        ))}
      </span>
      {/* einzelner Scan-Sweep beim Andocken, kein Dauer-Glitch */}
      {!reduziert && (
        <motion.span className="konst__scan" aria-hidden="true" style={{ x: sweep, opacity: sweepAuf }} />
      )}
      <span className="sr-only">{text}</span>
    </span>
  );
}

function Buchstabe({
  c, p, ab, reduziert,
}: {
  c: string; ab: number; reduziert: boolean; p: MotionValue<number>;
}) {
  const y = useTransform(p, [ab, ab + 0.03], ['110%', '0%']);
  const opacity = useTransform(p, [ab, ab + 0.02], [0, 1]);
  return (
    <span className="konst__buchstabe" aria-hidden="true">
      <motion.span style={reduziert ? undefined : { y, opacity }}>{c}</motion.span>
    </span>
  );
}
