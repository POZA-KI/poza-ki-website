'use client';

import { motion, useMotionValueEvent, useScroll, useTransform } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useMotionPref } from '../useMotionPref';

type Schritt = { titel: string; text: string; ergebnis: string };

/**
 * Vorgehen als leuchtende Pipeline: eine Linie zeichnet sich beim Scrollen von
 * Schritt zu Schritt, jeder Node zündet nacheinander.
 *
 * Die Linie waechst ueber scaleY (Compositor), nicht ueber height — height
 * wuerde bei jedem Frame Layout ausloesen.
 */
export default function Pipeline({ schritte }: { schritte: Schritt[] }) {
  const ref = useRef<HTMLOListElement>(null);
  const reduziert = useMotionPref();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 78%', 'end 55%'],
  });
  const wachstum = useTransform(scrollYProgress, [0, 1], [0, 1]);
  /* Der Lichtimpuls sitzt exakt auf der Scrollposition und wandert mit.
     In PIXELN uebersetzt, nicht in Prozent: prozentuales translateY loest
     gegen die Hoehe des Impulses selbst auf (7px), nicht gegen die Schiene.
     Und niemals `top` — das waere Layout pro Frame. */
  const [bahn, setBahn] = useState(0);
  useEffect(() => {
    const messen = () => setBahn(ref.current?.offsetHeight ?? 0);
    messen();
    const t = window.setTimeout(messen, 800);
    window.addEventListener('resize', messen);
    return () => { window.clearTimeout(t); window.removeEventListener('resize', messen); };
  }, []);
  const impulsY = useTransform(scrollYProgress, [0, 1], [0, bahn]);
  const impulsAuf = useTransform(scrollYProgress, [0, 0.04, 0.96, 1], [0, 1, 1, 0]);

  return (
    <ol ref={ref} className="pipe">
      <span className="pipe__schiene" aria-hidden="true" />
      <motion.span
        className="pipe__glut"
        aria-hidden="true"
        style={{ scaleY: reduziert ? 1 : wachstum }}
      />
      {!reduziert && (
        <motion.span
          className="pipe__impuls"
          aria-hidden="true"
          style={{ y: impulsY, opacity: impulsAuf }}
        />
      )}
      {schritte.map((s, i) => (
        <Stufe key={s.titel} s={s} i={i} p={scrollYProgress} anzahl={schritte.length} reduziert={reduziert} />
      ))}
    </ol>
  );
}

function Stufe({
  s, i, p, anzahl, reduziert,
}: {
  s: Schritt; i: number; anzahl: number; reduziert: boolean;
  p: ReturnType<typeof useScroll>['scrollYProgress'];
}) {
  const von = i / anzahl;
  const bis = von + 0.12;
  const opacity = useTransform(p, [von, bis], [0.34, 1]);
  const nodeSkala = useTransform(p, [von, bis], [0.6, 1]);
  const nodeGlow = useTransform(p, [von, bis], [0, 1]);
  // Nummer rollt beim Aktivieren hoch
  const nrY = useTransform(p, [von, bis], ['0%', '-100%']);
  const [an, setAn] = useState(false);
  useMotionValueEvent(p, 'change', (v) => setAn(v >= von + 0.06));

  return (
    <motion.li className={`pipe__stufe ${an ? 'is-an' : ''}`} style={{ opacity: reduziert ? 1 : opacity }}>
      <motion.span
        className="pipe__node"
        aria-hidden="true"
        style={reduziert ? undefined : { scale: nodeSkala, opacity: nodeGlow }}
      />
      <span className="pipe__nr mono">
        <motion.span style={reduziert ? undefined : { y: nrY }} aria-hidden="true">
          {String(i + 1).padStart(2, '0')}
          <br />
          {String(i + 1).padStart(2, '0')}
        </motion.span>
      </span>
      <div className="pipe__inhalt">
        <h3 className="h3 pipe__titel">{s.titel}</h3>
        <p className="body pipe__text">{s.text}</p>
        <p className="label pipe__ergebnis">Ergebnis: {s.ergebnis}</p>
      </div>
    </motion.li>
  );
}
