'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import Room from './Room';
import Panels, { BREITE, RADIUS } from './Panels';
import { budget } from '../geraet';
import { brauchtResize, grobeEingabe } from '../canvasGroesse';

/** Kamerafahrt: Dolly von Panel zu Panel, beim Fokus ranzoomen. */
function Kamera({ lauf }: { lauf: React.RefObject<number> }) {
  const { camera, size } = useThree();
  useFrame((_, delta) => {
    const cam = camera as THREE.PerspectiveCamera;
    // Das Panel ist 40 Einheiten breit. Bei einem Hochformat-Viewport ist die
    // sichtbare Breite nur noch halb so gross wie die Hoehe — mit dem festen
    // Desktop-Abstand lief das Panel links und rechts aus dem Bild. Der
    // Grundabstand wird deshalb aus dem tatsaechlichen Seitenverhaeltnis
    // berechnet, nicht als Konstante gesetzt.
    const seiten = size.width / Math.max(1, size.height);
    const halb = Math.tan((cam.fov * Math.PI) / 360);
    const noetig = (BREITE * 1.24) / (2 * halb * seiten);
    const abstand = Math.max(76, noetig);
    const zBasis = abstand - RADIUS;
    const eng = Math.min(1, 76 / abstand); // im Hochformat weniger Ausschlag

    // An einer Station (ganze Zahl) ist die Kamera nah, dazwischen faehrt sie zurueck.
    const l = lauf.current;
    const frac = l - Math.floor(l);
    const zwischen = Math.sin(frac * Math.PI);
    const zZiel = zBasis + zwischen * 26 * eng;
    const yZiel = 2 + zwischen * 7 * eng;
    const rot = frac * 0.12;
    const k = Math.min(1, delta * 2.6);
    camera.position.z += (zZiel - camera.position.z) * k;
    camera.position.y += (yZiel - camera.position.y) * k;
    camera.position.x += (Math.sin(rot) * 6 * eng - camera.position.x) * k;
    camera.lookAt(0, 0, -6);
  });
  return null;
}

/** Größe selbst setzen — siehe SizeFix in der Hintergrundszene. */
function Groesse({ host }: { host: React.RefObject<HTMLDivElement | null> }) {
  const setSize = useThree((s) => s.setSize);
  const setDpr = useThree((s) => s.setDpr);
  useEffect(() => {
    const grob = grobeEingabe();
    let letzte = { w: 0, h: 0 };
    const anwenden = (erzwinge = false) => {
      const el = host.current;
      const b = el ? el.getBoundingClientRect() : null;
      const w = b && b.width ? b.width : window.innerWidth;
      const h = b && b.height ? b.height : window.innerHeight;
      if (!erzwinge && !brauchtResize(letzte, { w, h }, grob)) return;
      letzte = { w, h };
      setSize(w, h);
      setDpr(Math.min(window.devicePixelRatio || 1, budget(grob).dpr));
    };
    anwenden(true);
    const raf = requestAnimationFrame(() => anwenden(true));
    const onResize = () => anwenden();
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, [setSize, setDpr, host]);
  return null;
}

export default function GalleryScene({
  lauf, mobil, host, aktiv = true,
}: {
  lauf: React.RefObject<number>;
  mobil: boolean;
  aktiv?: boolean;
  host: React.RefObject<HTMLDivElement | null>;
}) {
  const b = budget(mobil);
  return (
    <Canvas
      frameloop={aktiv ? 'always' : 'never'}
      dpr={[1, b.dpr]}
      gl={{ antialias: b.antialias, powerPreference: 'high-performance', alpha: false }}
      camera={{ fov: 42, near: 0.1, far: 500, position: [0, 2, 30] }}
    >
      <color attach="background" args={['#07090C']} />
      <fog attach="fog" args={['#07090C', 60, 250]} />
      <Groesse host={host} />
      <Kamera lauf={lauf} />
      <Room mobil={mobil} />
      <Panels lauf={lauf} mobil={mobil} />
      {b.bloom && (
        <EffectComposer multisampling={0} resolutionScale={b.bloomSkala}>
          <Bloom intensity={0.5} luminanceThreshold={0.42} luminanceSmoothing={0.3} mipmapBlur radius={0.55} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
