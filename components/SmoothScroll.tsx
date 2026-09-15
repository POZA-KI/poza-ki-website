'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { useMotionPref } from './useMotionPref';
import { scrollStore, aktualisiereRoh } from './scrollStore';

/**
 * Lenis verzahnt das Scrollen mit der Szene. Wichtig: Lenis scrollt das
 * echte window, deshalb bleiben window.scrollY und Motions useScroll gültig —
 * es braucht keine Brücke.
 *
 * Bei reduzierter Bewegung wird Lenis gar nicht erst initialisiert; natives
 * Scrollen ist dort das Richtige.
 */
export default function SmoothScroll() {
  const reduziert = useMotionPref();

  useEffect(() => {
    if (reduziert) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    });

    scrollStore.lenis = lenis;

    let raf = 0;
    const tick = (zeit: number) => {
      lenis.raf(zeit);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // Lenis speist denselben Store wie der Fallback-Listener — eine Quelle.
    lenis.on('scroll', aktualisiereRoh);
    aktualisiereRoh();

    // Anker-Links über Lenis laufen lassen, sonst springt es hart
    const onClick = (e: MouseEvent) => {
      const ziel = (e.target as HTMLElement | null)?.closest('a[href^="#"]');
      if (!ziel) return;
      const id = ziel.getAttribute('href');
      if (!id || id === '#') return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: -72 });
    };
    document.addEventListener('click', onClick);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('click', onClick);
      scrollStore.lenis = null;
      lenis.destroy();
    };
  }, [reduziert]);

  return null;
}
