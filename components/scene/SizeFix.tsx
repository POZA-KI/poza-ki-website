'use client';

import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { budget } from '../geraet';
import { brauchtResize, grobeEingabe } from '../canvasGroesse';

/**
 * Setzt die Renderergröße selbst.
 *
 * R3F misst den Container über react-use-measure (ResizeObserver). In diesem
 * Setup — fixed Container, pointer-events:none, Mount nach requestIdleCallback —
 * feuert die Messung unzuverlässig: CSS-Größe stimmt (1455×699), der
 * Drawing-Buffer bleibt aber auf den Canvas-Defaults 300×150 stehen, und die
 * Szene ist damit praktisch unsichtbar. Verifiziert im Browser.
 *
 * Da der Canvas hier IMMER exakt das Viewport füllt, ist die Fenstergröße die
 * korrekte und deterministische Quelle.
 */
export default function SizeFix() {
  const setSize = useThree((s) => s.setSize);
  const setDpr = useThree((s) => s.setDpr);

  useEffect(() => {
    const grob = grobeEingabe();
    let letzte = { w: 0, h: 0 };
    const anwenden = (erzwinge = false) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      // Auf Mobile aendert die ein- und ausfahrende Adressleiste die Hoehe
      // beim Scrollen. Ein Renderer-Resize mittendrin kostet eine komplette
      // Framebuffer-Neuallokation — sichtbar als Aussetzer.
      if (!erzwinge && !brauchtResize(letzte, { w, h }, grob)) return;
      letzte = { w, h };
      setSize(w, h);
      setDpr(Math.min(window.devicePixelRatio || 1, budget(grob).dpr));
    };
    anwenden(true);
    // Doppelt im nächsten Frame: beim ersten Lauf steht das Layout
    // gelegentlich noch nicht final.
    const raf = requestAnimationFrame(() => anwenden(true));

    let t = 0;
    const onResize = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => anwenden(), 120);
    };
    window.addEventListener('resize', onResize);
    const onOrient = () => anwenden(true);
    window.addEventListener('orientationchange', onOrient);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onOrient);
    };
  }, [setSize, setDpr]);

  return null;
}
