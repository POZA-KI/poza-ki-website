'use client';

/**
 * Blueprint Assembly — drei Phasen, strikt scroll-gekoppelt.
 *
 *   Phase 1 (0.00–0.30) VISION     chaotische Partikelwolke, Drift + Turbulenz
 *   Phase 2 (0.30–0.68) BLUEPRINT  Partikel morphen auf die Kanten, Wireframe erscheint
 *   Phase 3 (0.68–1.00) SYSTEM     Kanten zünden, Impulse laufen, Bloom steigt
 *
 * Rueckwaerts laeuft alles rueckwaerts, weil ausschliesslich aus dem
 * Scrollfortschritt gerechnet wird — kein Zustand, der einrastet.
 *
 * Partikel als EIN Points-Objekt, Wireframe als EIN LineSegments,
 * Impulse als EIN Points. Drei Draw-Calls, keine Allokation im Frame.
 */

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { baueBlueprint } from './ziele';
import { budget } from '../geraet';

const P_VISION = 0.3;
const P_BLUEPRINT = 0.68;

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smooth = (x: number) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};

function Groesse({ host }: { host: React.RefObject<HTMLDivElement | null> }) {
  const setSize = useThree((s) => s.setSize);
  const setDpr = useThree((s) => s.setDpr);
  useEffect(() => {
    const anwenden = () => {
      const b = host.current?.getBoundingClientRect();
      setSize(b?.width || window.innerWidth, b?.height || window.innerHeight);
      setDpr(Math.min(window.devicePixelRatio || 1, 1.5));
    };
    anwenden();
    const raf = requestAnimationFrame(anwenden);
    window.addEventListener('resize', anwenden);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', anwenden);
    };
  }, [setSize, setDpr, host]);
  return null;
}

function Assembly({ fortschritt, mobil }: { fortschritt: React.RefObject<number>; mobil: boolean }) {
  const { camera } = useThree();
  const N = budget(mobil).partikel;
  const MAX_IMPULSE = mobil ? 10 : 26;

  const punkte = useRef<THREE.Points>(null);
  const linien = useRef<THREE.LineSegments>(null);
  const impulse = useRef<THREE.Points>(null);

  const daten = useMemo(() => {
    const bp = baueBlueprint(N);
    const chaos = new Float32Array(N * 3);
    const phase = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const r = 34 + Math.random() * 30;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      chaos[i * 3] = Math.sin(ph) * Math.cos(th) * r * 1.35;
      chaos[i * 3 + 1] = Math.sin(ph) * Math.sin(th) * r * 0.8;
      chaos[i * 3 + 2] = Math.cos(ph) * r * 0.7;
      phase[i] = Math.random() * Math.PI * 2;
    }
    return {
      ...bp,
      chaos,
      phase,
      pos: new Float32Array(chaos),
      impulsPos: new Float32Array(MAX_IMPULSE * 3),
      impulsKante: new Int32Array(MAX_IMPULSE),
      impulsT: new Float32Array(MAX_IMPULSE),
      impulsV: new Float32Array(MAX_IMPULSE),
    };
  }, [N, MAX_IMPULSE]);

  useMemo(() => {
    for (let i = 0; i < MAX_IMPULSE; i++) {
      daten.impulsKante[i] = Math.floor(Math.random() * daten.kantenAnzahl);
      daten.impulsT[i] = Math.random();
      daten.impulsV[i] = 0.25 + Math.random() * 0.45;
    }
  }, [daten, MAX_IMPULSE]);

  const punkteGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(daten.pos, 3));
    return g;
  }, [daten]);
  const linienGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(daten.linien, 3));
    return g;
  }, [daten]);
  const impulsGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(daten.impulsPos, 3));
    return g;
  }, [daten]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const zeit = state.clock.elapsedTime;
    const p = clamp01(fortschritt.current ?? 0);

    // Morph-Anteil: 0 in Phase 1, 1 ab Ende Phase 2
    const morph = smooth(clamp01((p - P_VISION) / (P_BLUEPRINT - P_VISION)));
    const system = smooth(clamp01((p - P_BLUEPRINT) / (1 - P_BLUEPRINT)));

    for (let i = 0; i < N; i++) {
      const i3 = i * 3;
      // Turbulenz nur solange die Wolke formlos ist
      const turb = (1 - morph) * 2.6;
      const cx = daten.chaos[i3] + Math.cos(zeit * 0.28 + daten.phase[i]) * turb;
      const cy = daten.chaos[i3 + 1] + Math.sin(zeit * 0.24 + daten.phase[i] * 1.3) * turb;
      const cz = daten.chaos[i3 + 2] + Math.cos(zeit * 0.2 + daten.phase[i] * 0.7) * turb;
      // gestaffelt einrasten, damit sich das Netz "zeichnet"
      const eigen = smooth(clamp01((morph - (i / N) * 0.35) / 0.65));
      daten.pos[i3] = cx + (daten.ziele[i3] - cx) * eigen;
      daten.pos[i3 + 1] = cy + (daten.ziele[i3 + 1] - cy) * eigen;
      daten.pos[i3 + 2] = cz + (daten.ziele[i3 + 2] - cz) * eigen;
    }
    if (punkte.current) {
      (punkte.current.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      const m = punkte.current.material as THREE.PointsMaterial;
      m.opacity = 0.42 + morph * 0.34;
      m.size = (mobil ? 1.9 : 1.6) * (1 + system * 0.5);
      m.color.setHex(system > 0.5 ? 0x9fd0ff : 0x8a99ab);
    }

    if (linien.current) {
      const m = linien.current.material as THREE.LineBasicMaterial;
      // Wireframe erscheint erst gegen Ende von Phase 2, zuendet in Phase 3
      m.opacity = smooth(clamp01((morph - 0.55) / 0.45)) * (0.2 + system * 0.75);
      m.color.setHex(system > 0.35 ? 0x4da6ff : 0x39506a);
    }

    // Impulse laufen erst im System-Zustand
    if (impulse.current) {
      const m = impulse.current.material as THREE.PointsMaterial;
      m.opacity = system * 0.95;
      m.size = (mobil ? 3.4 : 2.8) * (0.6 + system * 0.6);
      if (system > 0.02) {
        for (let s = 0; s < MAX_IMPULSE; s++) {
          daten.impulsT[s] += daten.impulsV[s] * dt;
          if (daten.impulsT[s] >= 1) {
            daten.impulsT[s] = 0;
            daten.impulsKante[s] = Math.floor(Math.random() * daten.kantenAnzahl);
          }
          const e = daten.impulsKante[s] * 6;
          const t = daten.impulsT[s];
          const o = s * 3;
          daten.impulsPos[o] = daten.linien[e] + (daten.linien[e + 3] - daten.linien[e]) * t;
          daten.impulsPos[o + 1] = daten.linien[e + 1] + (daten.linien[e + 4] - daten.linien[e + 1]) * t;
          daten.impulsPos[o + 2] = daten.linien[e + 2] + (daten.linien[e + 5] - daten.linien[e + 2]) * t;
        }
        (impulse.current.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      }
    }

    // Kamera: faehrt im Verlauf naeher und richtet sich aus
    const zZiel = 108 - morph * 22 - system * 14;
    const yZiel = 12 - morph * 12;
    camera.position.z += (zZiel - camera.position.z) * Math.min(1, dt * 2.4);
    camera.position.y += (yZiel - camera.position.y) * Math.min(1, dt * 2.4);
    camera.position.x += (Math.sin(zeit * 0.08) * 3 * (1 - system) - camera.position.x) * Math.min(1, dt * 2);
    camera.lookAt(0, 0, 0);
  });

  return (
    <group>
      <points ref={punkte} geometry={punkteGeo} frustumCulled={false}>
        <pointsMaterial color="#8A99AB" size={1.6} sizeAttenuation={false}
          transparent opacity={0.45} depthWrite={false} toneMapped={false} />
      </points>
      <lineSegments ref={linien} geometry={linienGeo} frustumCulled={false}>
        <lineBasicMaterial color="#39506A" transparent opacity={0} depthWrite={false} toneMapped={false} />
      </lineSegments>
      <points ref={impulse} geometry={impulsGeo} frustumCulled={false}>
        <pointsMaterial color="#CFE6FF" size={2.8} sizeAttenuation={false}
          transparent opacity={0} blending={THREE.AdditiveBlending}
          depthWrite={false} toneMapped={false} />
      </points>
    </group>
  );
}

/** Bloom steigt zum Hoehepunkt in Phase 3. */
function BloomRampe({ fortschritt, skala }: { fortschritt: React.RefObject<number>; skala: number }) {
  const ref = useRef<{ intensity: number } | null>(null);
  useFrame(() => {
    const p = clamp01(fortschritt.current ?? 0);
    const system = smooth(clamp01((p - P_BLUEPRINT) / (1 - P_BLUEPRINT)));
    if (ref.current) ref.current.intensity = 0.15 + system * 1.15;
  });
  return (
    <EffectComposer multisampling={0} resolutionScale={skala}>
      {/* @ts-expect-error ref-Typ des Effekts ist nicht oeffentlich */}
      <Bloom ref={ref} intensity={0.15} luminanceThreshold={0.3}
        luminanceSmoothing={0.35} mipmapBlur radius={0.7} />
    </EffectComposer>
  );
}

export default function BlueprintScene({
  fortschritt, mobil, host, aktiv = true,
}: {
  fortschritt: React.RefObject<number>;
  mobil: boolean;
  aktiv?: boolean;
  host: React.RefObject<HTMLDivElement | null>;
}) {
  const b = budget(mobil);
  return (
    <Canvas
      frameloop={aktiv ? 'always' : 'never'}
      dpr={[1, b.dpr]}
      gl={{ antialias: false, powerPreference: 'high-performance', alpha: false }}
      camera={{ fov: 46, near: 0.1, far: 500, position: [0, 12, 108] }}
    >
      <color attach="background" args={['#07090C']} />
      <fog attach="fog" args={['#07090C', 80, 240]} />
      <Groesse host={host} />
      <Assembly fortschritt={fortschritt} mobil={mobil} />
      {b.bloom && <BloomRampe fortschritt={fortschritt} skala={b.bloomSkala} />}
    </Canvas>
  );
}
