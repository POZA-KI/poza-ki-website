'use client';

import { Canvas } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import Network from './Network';
import { budget } from '../geraet';
import SizeFix from './SizeFix';

/**
 * Hintergrundszene. KEIN Postprocessing: Bloom gehört der Systems Gallery,
 * hier würde er nur den Text überstrahlen. Die Impulse leuchten über
 * additives Blending, das genügt.
 */
export default function Scene({ aktiv = true }: { aktiv?: boolean }) {
  const [mobil, setMobil] = useState(false);
  const [bereit, setBereit] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px), (hover: none) and (pointer: coarse)');
    const lesen = () => setMobil(mq.matches);
    lesen();
    mq.addEventListener('change', lesen);
    setBereit(true);
    return () => mq.removeEventListener('change', lesen);
  }, []);

  if (!bereit) return null;

  return (
    <div className="scene" aria-hidden="true">
      <Canvas
        dpr={[1, budget(mobil).dpr]}
        gl={{ antialias: false, powerPreference: 'high-performance', alpha: false }}
        camera={{ fov: 50, near: 0.1, far: 400, position: [0, 4, 70] }}
        frameloop={aktiv ? "always" : "never"}
      >
        <color attach="background" args={['#08090A']} />
        {/* Dichter Fog: das Feld wird nach hinten schnell dunkel und
            verschwindet, statt als Fläche zu konkurrieren. */}
        <fog attach="fog" args={['#08090A', 60, 230]} />
        <SizeFix />
        <Network mobil={mobil} />
      </Canvas>
    </div>
  );
}
