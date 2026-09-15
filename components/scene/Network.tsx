'use client';

/**
 * Hintergrundfeld — BEWUSST LEISE.
 *
 * Es ist nicht der Held der Seite, sondern Atmosphäre. Der Wow-Moment gehört
 * der Systems Gallery. Deshalb:
 *   - 150 Punkte (mobil 80) als 1-2px Points, KEINE Meshes
 *   - Kanten nur zu 2-3 Nachbarn, Opazität 0.06
 *   - genau 6 wandernde Impulse, die einzigen wirklich leuchtenden Objekte
 *   - dichter Fog, nach hinten dunkler
 *   - im Hero nur das untere Drittel als fernes Feld am Horizont
 *
 * Alles in drei Draw-Calls: Points, LineSegments, Points (Impulse).
 */

import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { budget } from '../geraet';
import { schlagJetzt, schwebe, taktZeit } from '../takt';
import * as THREE from 'three';
import { scrollStore } from '../scrollStore';

const FARBE_PUNKT = new THREE.Color('#7C8A9B');
const FARBE_KANTE = new THREE.Color('#4A5A6C');
const FARBE_IMPULS = new THREE.Color('#9FD0FF');

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function Network({ mobil }: { mobil: boolean }) {
  const { camera } = useThree();
  const N = budget(mobil).netzPunkte;
  const IMPULSE = mobil ? 4 : 6;

  const punkteRef = useRef<THREE.Points>(null);
  const kantenRef = useRef<THREE.LineSegments>(null);
  const impulsRef = useRef<THREE.Points>(null);

  const daten = useMemo(() => {
    const rnd = mulberry32(20260914);
    const basis = new Float32Array(N * 3);
    const pos = new Float32Array(N * 3);
    const phase = new Float32Array(N);

    // Horizontband: breit, flach, tief hinten. Y bleibt deutlich unter der
    // Blickachse, damit oben — wo die Headlines stehen — NICHTS liegt.
    for (let i = 0; i < N; i++) {
      const i3 = i * 3;
      basis[i3] = (rnd() - 0.5) * 300;
      basis[i3 + 1] = -34 - rnd() * 34;
      basis[i3 + 2] = -50 - rnd() * 210;
      pos[i3] = basis[i3];
      pos[i3 + 1] = basis[i3 + 1];
      pos[i3 + 2] = basis[i3 + 2];
      phase[i] = rnd() * Math.PI * 2;
    }

    // Kanten: je Punkt maximal 3 nächste Nachbarn, harte Distanzgrenze
    const paare: number[] = [];
    for (let i = 0; i < N; i++) {
      const kand: { j: number; d: number }[] = [];
      for (let j = 0; j < N; j++) {
        if (j === i) continue;
        const dx = basis[i * 3] - basis[j * 3];
        const dy = basis[i * 3 + 1] - basis[j * 3 + 1];
        const dz = basis[i * 3 + 2] - basis[j * 3 + 2];
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (d < 52) kand.push({ j, d });
      }
      kand.sort((a, b) => a.d - b.d);
      for (let k = 0; k < Math.min(3, kand.length); k++) {
        const j = kand[k].j;
        if (i < j) paare.push(i, j);
      }
    }
    const kanten = new Uint32Array(paare);

    return {
      basis,
      pos,
      phase,
      kanten,
      kantenPos: new Float32Array((kanten.length / 2) * 6),
      // Kante, Startzeit und Tempo der Impulse ergeben sich jetzt aus der
      // Schlagnummer — kein eigener Zustand und kein Math.random mehr noetig.
      impulsPos: new Float32Array(IMPULSE * 3),
    };
  }, [N, IMPULSE]);

  const punkteGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(daten.pos, 3));
    return g;
  }, [daten]);
  const kantenGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(daten.kantenPos, 3));
    return g;
  }, [daten]);
  const impulsGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(daten.impulsPos, 3));
    return g;
  }, [daten]);

  useFrame((_state, delta) => {
    const dt = Math.min(delta, 0.05);
    // Seiten-Herzschlag statt eigener Szenenuhr: so driftet der Hintergrund im
    // selben Rhythmus wie Constellation und Offer-Kern, auch nachdem die Szene
    // zwischendurch pausiert war und ihre Clock stehen geblieben ist.
    const zeit = taktZeit();
    const { schlag, phase } = schlagJetzt(zeit);
    const p = clamp01(scrollStore.p);

    // Kamera: sehr zurückhaltend. Leichtes Vorwärtsgleiten über die Seite,
    // Blick minimal nach unten aufs Feld. Keine Loopings.
    const zZiel = 70 - p * 55;
    const yZiel = 4 - p * 6;
    camera.position.x += ((scrollStore.mausAktiv ? scrollStore.mx * 2.4 : 0) - camera.position.x) * Math.min(1, dt * 2);
    camera.position.y += (yZiel - camera.position.y) * Math.min(1, dt * 2);
    camera.position.z += (zZiel - camera.position.z) * Math.min(1, dt * 2);
    // Leichte Drift, damit die Fahrt nie ganz still steht — an den Takt
    // gekoppelt: eine Schwingung pro 16 Schlaegen, exakt die Dauer, die der
    // Constellation-Orbit fuer eine Umdrehung braucht.
    const drift = Math.sin(schwebe(0, 16, zeit) * Math.PI * 2) * 2.2;
    const senke = Math.sin(schwebe(0.25, 24, zeit) * Math.PI * 2) * 1.4;
    camera.lookAt(drift, -14 + senke, -110);

    // Tiefenstaffelung: naehere Punkte wandern beim Scrollen spuerbar
    // schneller als ferne. Das erzeugt die Parallaxe, die eine reine
    // Kamerafahrt allein nicht liefert.
    for (let i = 0; i < N; i++) {
      const i3 = i * 3;
      const tiefe = daten.basis[i3 + 2];               // -50 (nah) .. -260 (fern)
      const naehe = 1 - Math.min(1, (-tiefe - 50) / 210); // 1 = nah, 0 = fern
      const parallax = p * (12 + naehe * 46);          // nah bewegt sich ~4x weiter
      // Eigenbewegung der Punkte: gleiche Frequenz fuer alle (8 Schlaege),
      // nur der Phasenversatz unterscheidet sie. Vorher hatte jeder Punkt eine
      // eigene Frequenz — das las sich als Rauschen statt als Atmen.
      const ph = daten.phase[i] / (Math.PI * 2);
      daten.pos[i3] = daten.basis[i3] + Math.cos(schwebe(ph, 8, zeit) * Math.PI * 2) * 1.4;
      daten.pos[i3 + 1] =
        daten.basis[i3 + 1] + Math.sin(schwebe(ph, 10, zeit) * Math.PI * 2) * 1.1 + parallax;
      daten.pos[i3 + 2] = daten.basis[i3 + 2];
    }
    if (punkteRef.current) {
      (punkteRef.current.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    }

    // Kanten
    const anz = daten.kanten.length / 2;
    for (let e = 0; e < anz; e++) {
      const ia = daten.kanten[e * 2] * 3;
      const ib = daten.kanten[e * 2 + 1] * 3;
      const o = e * 6;
      daten.kantenPos[o] = daten.pos[ia];
      daten.kantenPos[o + 1] = daten.pos[ia + 1];
      daten.kantenPos[o + 2] = daten.pos[ia + 2];
      daten.kantenPos[o + 3] = daten.pos[ib];
      daten.kantenPos[o + 4] = daten.pos[ib + 1];
      daten.kantenPos[o + 5] = daten.pos[ib + 2];
    }
    if (kantenRef.current) {
      (kantenRef.current.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    }

    // Impulse — die einzigen leuchtenden Objekte im Hintergrund.
    // Sie starten ausschliesslich auf Taktschlaegen, reihum in Gruppen, und
    // brauchen exakt einen Schlag bis zum Ziel. Vorher waren Startzeitpunkt,
    // Kante und Tempo zufaellig; das ergab Flimmern ohne Zusammenhang.
    const GRUPPEN = 4;
    for (let s = 0; s < IMPULSE; s++) {
      const dran = (((schlag - s) % GRUPPEN) + GRUPPEN) % GRUPPEN === 0;
      const o = s * 3;
      if (!dran) {
        // hinter die Far-Plane: der Punkt wird geclippt statt gezeichnet
        daten.impulsPos[o] = 0; daten.impulsPos[o + 1] = 0; daten.impulsPos[o + 2] = -1e6;
        continue;
      }
      // Kante deterministisch aus der Schlagnummer — wechselt, ist aber
      // reproduzierbar und damit Teil der Choreografie, nicht Zufall.
      const e = ((schlag * 7 + s * 13) % anz + anz) % anz;
      const ia = daten.kanten[e * 2] * 3;
      const ib = daten.kanten[e * 2 + 1] * 3;
      const t = phase * phase * (3 - 2 * phase);
      daten.impulsPos[o] = daten.pos[ia] + (daten.pos[ib] - daten.pos[ia]) * t;
      daten.impulsPos[o + 1] = daten.pos[ia + 1] + (daten.pos[ib + 1] - daten.pos[ia + 1]) * t;
      daten.impulsPos[o + 2] = daten.pos[ia + 2] + (daten.pos[ib + 2] - daten.pos[ia + 2]) * t;
    }
    if (impulsRef.current) {
      (impulsRef.current.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    }
  });

  return (
    <group>
      <points ref={punkteRef} geometry={punkteGeo} frustumCulled={false}>
        <pointsMaterial
          color={FARBE_PUNKT}
          /* Auf Mobile deutlich praesenter. Mit 70 duennen Punkten und
             Kanten bei 7 % Deckkraft war der Hintergrund auf dem Telefon
             faktisch schwarz — das liest sich nicht als Zurueckhaltung,
             sondern als Fehler. */
          size={mobil ? 2.4 : 1.4}
          sizeAttenuation={false}
          transparent
          opacity={mobil ? 0.8 : 0.5}
          depthWrite={false}
          toneMapped={false}
        />
      </points>

      <lineSegments ref={kantenRef} geometry={kantenGeo} frustumCulled={false}>
        <lineBasicMaterial
          color={FARBE_KANTE}
          transparent
          opacity={mobil ? 0.26 : 0.07}
          depthWrite={false}
          toneMapped={false}
        />
      </lineSegments>

      <points ref={impulsRef} geometry={impulsGeo} frustumCulled={false}>
        <pointsMaterial
          color={FARBE_IMPULS}
          size={4}
          sizeAttenuation={false}
          transparent
          opacity={0.95}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </points>
    </group>
  );
}
