'use client';

import { motion, useScroll, useTransform } from 'motion/react';
import { useRef, type ReactNode } from 'react';
import { useMotionPref } from '../useMotionPref';

/**
 * Card kommt scroll-gekoppelt aus der Tiefe: scale 0.9 + Blur -> scharf.
 * Nicht als einmaliges Reveal, sondern an die Scrollposition gebunden, damit
 * es sich beim Zurueckscrollen auch zurueckbewegt.
 */
export default function TiefenCard({
  children,
  versatz = 0,
}: {
  children: ReactNode;
  versatz?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduziert = useMotionPref();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 92%', 'start 48%'],
  });

  const von = Math.min(0.55, versatz);
  const scale = useTransform(scrollYProgress, [von, von + 0.45], [0.9, 1]);
  const opacity = useTransform(scrollYProgress, [von, von + 0.35], [0, 1]);
  const filter = useTransform(scrollYProgress, [von, von + 0.45], ['blur(9px)', 'blur(0px)']);
  const y = useTransform(scrollYProgress, [von, von + 0.45], [26, 0]);

  if (reduziert) return <div ref={ref}>{children}</div>;

  return (
    <motion.div ref={ref} className="card-tiefe" style={{ scale, opacity, filter, y }}>
      {children}
    </motion.div>
  );
}
