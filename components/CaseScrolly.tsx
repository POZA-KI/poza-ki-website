'use client';

import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { useMotionPref } from './useMotionPref';

type Stufe = { titel: string; text: string };

/**
 * Scrollytelling der Pipeline: PDF → Extraktion → Kalkulation → Angebot.
 * Die Verbindungslinie wächst mit dem Scroll, die Stufen rasten nacheinander
 * ein. Gepinnt, damit der Aufbau als ein Vorgang gelesen wird.
 */
export default function CaseScrolly({ stufen }: { stufen: Stufe[] }) {
  const ref = useRef<HTMLElement>(null);
  const reduziert = useMotionPref();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const linie = useTransform(scrollYProgress, [0.1, 0.9], [0, 1]);

  if (reduziert) {
    // ref auch hier anhaengen — siehe PinnedThesis: useScroll({target:ref})
    // verlangt ein hydriertes Element, sonst wirft Motion eine Invariante.
    return (
      <ol ref={ref as React.RefObject<HTMLOListElement>} className="pipeline">
        {stufen.map((s, i) => (
          <li key={s.titel} className="pipeline__stufe">
            <span className="meta pipeline__idx">{String(i + 1).padStart(2, '0')}</span>
            <h3 className="h3 pipeline__titel">{s.titel}</h3>
            <p className="small pipeline__text">{s.text}</p>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="scrolly" style={{ height: `${100 + stufen.length * 50}vh` }}>
      <div className="scrolly__sticky">
        <ol className="pipeline pipeline--scrolly">
          <motion.span className="pipeline__linie" style={{ scaleX: linie }} aria-hidden="true" />
          {stufen.map((s, i) => {
            const von = 0.08 + i * 0.2;
            return <Stufe key={s.titel} s={s} i={i} p={scrollYProgress} von={von} />;
          })}
        </ol>
      </div>
    </div>
  );
}

function Stufe({
  s,
  i,
  p,
  von,
}: {
  s: Stufe;
  i: number;
  p: ReturnType<typeof useScroll>['scrollYProgress'];
  von: number;
}) {
  const opacity = useTransform(p, [von, von + 0.12], [0.38, 1]);
  const y = useTransform(p, [von, von + 0.12], [18, 0]);
  return (
    <motion.li className="pipeline__stufe" style={{ opacity, y }}>
      <span className="meta pipeline__idx">{String(i + 1).padStart(2, '0')}</span>
      <h3 className="h3 pipeline__titel">{s.titel}</h3>
      <p className="small pipeline__text">{s.text}</p>
    </motion.li>
  );
}
