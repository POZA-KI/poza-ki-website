'use client';

import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { useMotionPref } from './useMotionPref';

/**
 * Zeilen-Reveal mit Maske: jede Zeile sitzt in einem overflow-hidden Block und
 * schiebt sich von unten hoch. Die Zeilen werden als Array übergeben statt
 * automatisch umgebrochen — so bleibt der Umbruch kontrolliert und die Maske
 * schneidet nie mitten in ein Wort.
 *
 * Danach leichte Parallaxe beim Weiterscrollen.
 */
export default function MaskHeadline({
  zeilen,
  className = 'display',
  id,
}: {
  zeilen: string[];
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const reduziert = useMotionPref();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, reduziert ? 0 : -70]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, reduziert ? 1 : 0.25]);

  return (
    <motion.h1 ref={ref} id={id} className={className} style={{ y, opacity }}>
      {/* Der Reveal laeuft als CSS-Animation, nicht ueber Motion.
          GRUND: Mit initial={{opacity:0}} steht die Headline bis zur Hydration
          unsichtbar da — auf einem gedrosselten Telefon schiebt das den Largest
          Contentful Paint auf 3,5 s. Die CSS-Animation startet dagegen, sobald
          das Stylesheet da ist, voellig ohne JavaScript. */}
      {zeilen.map((z, i) => (
        <span className="ln" key={z}>
          <span className="ln__i ln__rein" style={{ animationDelay: `${0.12 + i * 0.09}s` }}>
            {z}
          </span>
        </span>
      ))}
    </motion.h1>
  );
}
