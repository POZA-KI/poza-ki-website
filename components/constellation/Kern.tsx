'use client';

/**
 * ENERGY CORE — der Kern der Constellation.
 *
 * Kein gefuelltes Kugelobjekt mehr. Der Kern ist aus Schichten gebaut, die
 * jede fuer sich fast nichts sind und erst zusammen wie Energie wirken:
 *
 *   1. Glut      — zwei additive Sprites mit weichem Falloff, weiss im Kern
 *   2. Gitter    — halbtransparente Wireframe-Icosphere, langsam rotierend
 *   3. Gyroskop  — drei duenne Ringe auf verschiedenen Achsen, gegenlaeufig
 *   4. Staub     — einige Dutzend Mikropartikel auf engen Bahnen
 *
 * Der Herzschlag laeuft ueber Glut-Intensitaet und einen minimalen Ringversatz,
 * nicht ueber die Groesse des ganzen Objekts: Ein Ding, das im Takt
 * groesser und kleiner wird, wirkt wie ein Ballon. Eines, das im Takt heller
 * glueht, wirkt wie eine Maschine unter Last.
 */

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { glutTextur } from '../glut';
import { huelle, schlagJetzt, taktZeit } from '../takt';

const R_GITTER = 2.5;
const STAUB = 54;
/** Feste Neigungen der drei Gyroskop-Ringe: [x, z] in Radiant. */
const ACHSEN: [number, number][] = [[0.05, 0], [1.15, 0.5], [-0.95, -0.62]];

export default function Kern({ mobil = false }: { mobil?: boolean }) {
  const glutInnen = useRef<THREE.Sprite>(null);
  const glutAussen = useRef<THREE.Sprite>(null);
  const gitter = useRef<THREE.LineSegments>(null);
  const gyro = useRef<(THREE.Group | null)[]>([]);
  const staub = useRef<THREE.Points>(null);

  const tex = useMemo(() => glutTextur(), []);

  const gitterGeo = useMemo(() => {
    // Detail 1 statt 2: 240 statt 960 Kanten. Dichter gezeichnet wirkte das
    // Gitter wie ein Drahtknaeuel statt wie eine feine Huelle — und kostete
    // das Vierfache.
    const ico = new THREE.IcosahedronGeometry(R_GITTER, 1);
    const w = new THREE.WireframeGeometry(ico);
    ico.dispose();
    return w;
  }, []);

  const ringGeo = useMemo(() => new THREE.RingGeometry(1, 1.012, 128), []);

  // Mikropartikel: feste Bahnen, feste Phasen — choreografiert, nicht zufaellig
  const bahnen = useMemo(() => {
    const n = mobil ? 28 : STAUB;
    const radius = new Float32Array(n);
    const neigung = new Float32Array(n);
    const phase = new Float32Array(n);
    const tempo = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      // goldener Winkel verteilt die Bahnen gleichmaessig ohne Zufall
      const g = i * 2.399963;
      radius[i] = 3.1 + ((i * 7) % 11) * 0.28;
      neigung[i] = Math.asin(((i % 13) / 6) - 1) * 0.55;
      phase[i] = g % (Math.PI * 2);
      tempo[i] = 0.34 + ((i % 5) * 0.11);
    }
    return { n, radius, neigung, phase, tempo, pos: new Float32Array(n * 3) };
  }, [mobil]);

  const staubGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(bahnen.pos, 3));
    return g;
  }, [bahnen]);

  useFrame(() => {
    const tz = taktZeit();
    const { phase } = schlagJetzt(tz);
    const puls = huelle(phase);

    // 1. Glut: der Herzschlag sitzt hier, nicht in der Geometrie
    if (glutInnen.current) {
      const m = glutInnen.current.material as THREE.SpriteMaterial;
      m.opacity = 0.72 + puls * 0.28;
      glutInnen.current.scale.setScalar(3.4 + puls * 0.5);
    }
    if (glutAussen.current) {
      const m = glutAussen.current.material as THREE.SpriteMaterial;
      m.opacity = 0.16 + puls * 0.26;
      glutAussen.current.scale.setScalar(9.5 + puls * 1.4);
    }

    // 2. Gitter: langsame Eigenrotation auf zwei Achsen
    if (gitter.current) {
      gitter.current.rotation.y = tz * 0.16;
      gitter.current.rotation.x = Math.sin(tz * 0.07) * 0.5;
      const m = gitter.current.material as THREE.LineBasicMaterial;
      m.opacity = 0.16 + puls * 0.12;
    }

    // 3. Gyroskop: drei deutlich verschiedene Achsen, gegenlaeufig.
    // Faecherten sie nicht auf, laegen die Ringe fast in einer Ebene und das
    // Ganze saehe aus wie ein Planet mit Ring statt wie ein Kreiselinstrument.
    gyro.current.forEach((g, i) => {
      if (!g) return;
      const richtung = i % 2 === 0 ? 1 : -1;
      g.rotation.set(
        ACHSEN[i][0] + Math.sin(tz * 0.06 + i) * 0.1,
        tz * (0.2 + i * 0.1) * richtung,
        ACHSEN[i][1],
      );
      g.scale.setScalar((3.5 + i * 1.05) * (1 + puls * 0.035));
      const m = (g.children[0] as THREE.Mesh)?.material as THREE.MeshBasicMaterial;
      if (m) m.opacity = 0.13 + puls * 0.11 - i * 0.03;
    });

    // 4. Staub
    const p = bahnen.pos;
    for (let i = 0; i < bahnen.n; i++) {
      const w = bahnen.phase[i] + tz * bahnen.tempo[i];
      const r = bahnen.radius[i];
      const y = Math.sin(bahnen.neigung[i]) * r;
      const rr = Math.cos(bahnen.neigung[i]) * r;
      const i3 = i * 3;
      p[i3] = Math.cos(w) * rr;
      p[i3 + 1] = y + Math.sin(w * 0.5) * 0.3;
      p[i3 + 2] = Math.sin(w) * rr;
    }
    staubGeo.attributes.position.needsUpdate = true;
    if (staub.current) {
      (staub.current.material as THREE.PointsMaterial).opacity = 0.42 + puls * 0.3;
    }
  });

  return (
    <group>
      {/* 1. Glut — heiss innen, kuehl aussen */}
      <sprite ref={glutInnen} scale={3.4}>
        <spriteMaterial
          map={tex}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </sprite>
      <sprite ref={glutAussen} scale={11}>
        <spriteMaterial
          map={tex}
          transparent
          opacity={0.25}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </sprite>

      {/* 2. Wireframe-Icosphere */}
      <lineSegments ref={gitter} geometry={gitterGeo}>
        <lineBasicMaterial
          color="#8FC9FF"
          transparent
          opacity={0.18}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </lineSegments>

      {/* 3. Gyroskop-Ringe */}
      {[0, 1, 2].map((i) => (
        <group key={i} ref={(el) => { gyro.current[i] = el; }} scale={3.5 + i * 1.05}>
          <mesh geometry={ringGeo} rotation={[Math.PI / 2, 0, 0]}>
            <meshBasicMaterial
              color={i === 0 ? '#CFE6FF' : '#4DA6FF'}
              transparent
              opacity={0.12}
              side={THREE.DoubleSide}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}

      {/* 4. Mikropartikel */}
      <points ref={staub} geometry={staubGeo} frustumCulled={false}>
        <pointsMaterial
          map={tex}
          color="#CFE6FF"
          size={2.6}
          sizeAttenuation={false}
          transparent
          opacity={0.5}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </points>
    </group>
  );
}
