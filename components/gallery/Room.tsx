'use client';

/**
 * Der Raum: fast leer. Ein feines Wireframe-Grid als Boden und Rückwand,
 * kleine Marker an den Kreuzungen, dichter Fog. Mehr nicht — die Panels
 * sind die einzigen hellen Objekte.
 */

import { useMemo } from 'react';
import * as THREE from 'three';

const GRID = '#1A242E';
const MARKER = '#2E3E4C';

function gitter(breite: number, tiefe: number, schritt: number) {
  const pos: number[] = [];
  const hw = breite / 2;
  for (let x = -hw; x <= hw; x += schritt) {
    pos.push(x, 0, 0, x, 0, -tiefe);
  }
  for (let z = 0; z >= -tiefe; z -= schritt) {
    pos.push(-hw, 0, z, hw, 0, z);
  }
  return new Float32Array(pos);
}

function wand(breite: number, hoehe: number, schritt: number, z: number) {
  const pos: number[] = [];
  const hw = breite / 2;
  for (let x = -hw; x <= hw; x += schritt) pos.push(x, 0, z, x, hoehe, z);
  for (let y = 0; y <= hoehe; y += schritt) pos.push(-hw, y, z, hw, y, z);
  return new Float32Array(pos);
}

export default function Room({ mobil }: { mobil: boolean }) {
  const schritt = mobil ? 12 : 8;

  const bodenGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(gitter(260, 300, schritt), 3));
    return g;
  }, [schritt]);

  const wandGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(wand(260, 110, schritt, -180), 3));
    return g;
  }, [schritt]);

  // ✦-Marker an den Kreuzungen, als EIN instanziertes Mesh
  const { markerGeo, markerAnzahl, markerMatrizen } = useMemo(() => {
    const pos: THREE.Matrix4[] = [];
    const d = new THREE.Object3D();
    const schrittM = schritt * 3;
    for (let x = -120; x <= 120; x += schrittM) {
      for (let z = -180; z <= -20; z += schrittM) {
        d.position.set(x, 0.05, z);
        d.rotation.set(-Math.PI / 2, 0, Math.PI / 4);
        d.updateMatrix();
        pos.push(d.matrix.clone());
      }
    }
    // Kreuz aus zwei duennen Quads
    const g = new THREE.BufferGeometry();
    const s = 0.55, t = 0.055;
    const v = new Float32Array([
      -s, -t, 0, s, -t, 0, s, t, 0, -s, -t, 0, s, t, 0, -s, t, 0,
      -t, -s, 0, t, -s, 0, t, s, 0, -t, -s, 0, t, s, 0, -t, s, 0,
    ]);
    g.setAttribute('position', new THREE.BufferAttribute(v, 3));
    return { markerGeo: g, markerAnzahl: pos.length, markerMatrizen: pos };
  }, [schritt]);

  return (
    <group>
      <lineSegments geometry={bodenGeo} position={[0, -22, 0]} frustumCulled={false}>
        <lineBasicMaterial color={GRID} transparent opacity={0.5} depthWrite={false} />
      </lineSegments>

      <lineSegments geometry={wandGeo} position={[0, -22, 0]} frustumCulled={false}>
        <lineBasicMaterial color={GRID} transparent opacity={0.32} depthWrite={false} />
      </lineSegments>

      <instancedMesh
        args={[markerGeo, undefined, markerAnzahl]}
        position={[0, -22, 0]}
        frustumCulled={false}
        ref={(m) => {
          if (!m) return;
          markerMatrizen.forEach((mat, i) => m.setMatrixAt(i, mat));
          m.instanceMatrix.needsUpdate = true;
        }}
      >
        <meshBasicMaterial color={MARKER} transparent opacity={0.55} side={THREE.DoubleSide} depthWrite={false} />
      </instancedMesh>
    </group>
  );
}
