'use client';

/**
 * Fünf leicht gekrümmte Panels im Karussell. Sie sind die einzigen hellen
 * Objekte im Raum — deshalb tragen sie den Wow-Moment, nicht der Hintergrund.
 *
 * Krümmung: eine PlaneGeometry, deren Vertices entlang z nach hinten gebogen
 * werden (Parabel). Verlässlicher und besser kontrollierbar als ein
 * Zylinderausschnitt, weil Normalen und UVs unangetastet bleiben.
 *
 * Texturen: die 2D-Mocks aus panelMocks, bewusst nur ~12×/s aktualisiert.
 */

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { budget } from '../geraet';
import { PANELS } from './panelMocks';

export const RADIUS = 46;
export const BREITE = 40;
export const HOEHE = 25;

function gekruemmt(breite: number, hoehe: number, bieg: number) {
  const g = new THREE.PlaneGeometry(breite, hoehe, 32, 2);
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    p.setZ(i, -(Math.pow(x / (breite / 2), 2) * bieg));
  }
  p.needsUpdate = true;
  g.computeVertexNormals();
  return g;
}

export default function Panels({ lauf, mobil }: { lauf: React.RefObject<number>; mobil: boolean }) {
  const gruppe = useRef<THREE.Group>(null);
  const texRefs = useRef<{ tex: THREE.CanvasTexture; ctx: CanvasRenderingContext2D }[]>([]);
  const letzteMalzeit = useRef(0);

  const geo = useMemo(() => gekruemmt(BREITE, HOEHE, mobil ? 1.5 : 5), [mobil]);
  useEffect(() => () => geo.dispose(), [geo]);
  const hz = useMemo(() => budget(mobil).texturHz, [mobil]);

  // Canvas-Texturen einmal anlegen
  const texturen = useMemo(() => {
    return PANELS.map(() => {
      const c = document.createElement('canvas');
      c.width = 800;
      c.height = 500;
      const ctx = c.getContext('2d')!;
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 2;
      return { tex, ctx };
    });
  }, []);

  useEffect(() => {
    texRefs.current = texturen;
    return () => texturen.forEach((t) => t.tex.dispose());
  }, [texturen]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    // Texturen nur ~12x/s neu malen statt 60x — optisch identisch, viel billiger
    if (t - letzteMalzeit.current > 1 / hz) {
      letzteMalzeit.current = t;
      texRefs.current.forEach((eintrag, i) => {
        PANELS[i].maler(eintrag.ctx, 800, 500, t);
        eintrag.tex.needsUpdate = true;
      });
    }

    // Karussell drehen: aktives Panel nach vorn
    if (gruppe.current) {
      const schritt = (Math.PI * 2) / PANELS.length;
      // Vorzeichen POSITIV: Eine Drehung der Gruppe um θ verschiebt Panel i
      // auf Azimut (w_i − θ). Damit Panel `lauf` vorn steht, muss θ = +lauf·schritt
      // sein. Mit dem negativen Vorzeichen stand Panel −lauf vorn — bei lauf=2
      // also Panel 3, und HUD und Raum zeigten Verschiedenes.
      const ziel = lauf.current * schritt;
      gruppe.current.rotation.y += (ziel - gruppe.current.rotation.y) * Math.min(1, delta * 3);
    }
  });

  return (
    <group ref={gruppe}>
      {PANELS.map((p, i) => {
        const winkel = (i / PANELS.length) * Math.PI * 2;
        const x = Math.sin(winkel) * RADIUS;
        const z = -Math.cos(winkel) * RADIUS;
        return (
          /* Eigenrotation GEGENLAEUFIG zur Gruppe: die Gruppendrehung θ dreht
             auch die Ausrichtung der Kinder mit. Mit lokal −winkel ergibt sich
             fuer das vordere Panel eine Weltrotation von θ − θ = 0, es schaut
             also exakt in die Kamera. Mit +winkel stand es schraeg und
             rutschte aus der Bildmitte. */
          <group key={p.titel} position={[x, 0, z]} rotation={[0, -winkel, 0]}>
            {/* Undurchsichtig: transparent+opacity 1 schiebt das Panel in den
                Transparenz-Pass, wo es gegen die Spiegelung sortiert wird —
                das erzeugte bei Kamerabewegung ein Aufblitzen. */}
            <mesh geometry={geo} renderOrder={1}>
              <meshBasicMaterial map={texturen[i].tex} toneMapped={false} />
            </mesh>
            {/* Angedeutete Spiegelung am Boden */}
            <mesh geometry={geo} position={[0, -HOEHE - 3, 0]} scale={[1, -1, 1]} renderOrder={2}>
              <meshBasicMaterial
                map={texturen[i].tex}
                toneMapped={false}
                transparent
                opacity={0.028}  /* gespiegelter Titel las sich sonst neben dem HUD-Titel mit */
                depthWrite={false}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
