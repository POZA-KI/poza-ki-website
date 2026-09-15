'use client';

/**
 * Constellation — drei gekruemmte Panels auf einem Orbit um den Energy Core.
 * Gleiche Pipeline wie die Systems Gallery: gekruemmte PlaneGeometry,
 * CanvasTexture, Bodenspiegelung, Bloom.
 *
 * LEITUNGEN: Es gibt keine dauerhaft gezogenen Linien mehr zwischen Kern und
 * Panels — eine durchgehende Vollinie behauptet eine Verbindung, die gerade
 * gar nichts tut. Stattdessen liegt die Bahn nur als kaum sichtbare Andeutung
 * da und leuchtet ausschliesslich dort auf, wo ein Impuls gerade entlanglaeuft;
 * hinter ihm verblasst sie wieder. Der Impuls selbst ist ein Tracer mit kurzem
 * Schweif, kein wandernder Punkt.
 *
 * Interaktion: Ziehen dreht den Orbit mit echtem Momentum, Hover dreht ein
 * Panel zur Kamera und hebt es, Klick faehrt die Kamera heran. Zustand liegt
 * in Refs, nicht in State — der Frame-Loop darf keine Rerender ausloesen.
 *
 * TAKT: Alle Leerlauf-Bewegungen haengen am Seiten-Herzschlag (../takt).
 * Der Orbit dreht in genau 16 Schlaegen einmal herum, die Lichtimpulse starten
 * reihum je einen pro Schlag und brauchen exakt einen Schlag bis zum Panel —
 * ihre Ankunft faellt damit auf denselben Schlag wie das Aufglimmen des
 * Panels. Kein Timer und kein Math.random mehr in der Choreografie.
 */

import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { PRODUKT_MALER } from './produktMocks';
import Kern from './Kern';
import { glutTextur } from '../glut';
import { budget } from '../geraet';
import { scrollStore } from '../scrollStore';
import { melde } from '../mess';
import { huelle, orbitTempo, schlagJetzt, schwebe, taktZeit, TAKT } from '../takt';

const RADIUS = 30;
/** Segmente je Leitung — feiner heisst weicheres Abklingen hinter dem Impuls. */
const SEGMENTE = 30;
/** Kopf + Schweifpunkte je Tracer. */
const SCHWEIF = 6;
const BREITE = 26;
const HOEHE = 16;

function gekruemmt(b: number, h: number, bieg: number) {
  const g = new THREE.PlaneGeometry(b, h, 28, 2);
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    p.setZ(i, -(Math.pow(x / (b / 2), 2) * bieg));
  }
  p.needsUpdate = true;
  g.computeVertexNormals();
  return g;
}

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
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', anwenden); };
  }, [setSize, setDpr, host]);
  return null;
}

/** Zieh-Zustand: Winkelzuwachs seit dem letzten Frame plus Restgeschwindigkeit. */
export type Zieh = { aktiv: boolean; delta: number; v: number };

type Props = {
  marken: { wortmarke: string; text: string }[];
  fortschritt: React.RefObject<number>;
  fokus: React.RefObject<number>;       // -1 = kein Fokus
  hover: React.RefObject<number>;
  drag: React.RefObject<Zieh>;          // Zieh-Zustand inkl. Momentum
  onHover: (i: number) => void;
  onClick: (i: number) => void;
  mobil: boolean;
  aktiv?: boolean;
  host: React.RefObject<HTMLDivElement | null>;
};

function Szene({ marken, fortschritt, fokus, hover, drag, onHover, onClick, mobil }: Omit<Props, 'host'>) {
  const { camera } = useThree();
  const gruppe = useRef<THREE.Group>(null);
  const linien = useRef<THREE.LineSegments>(null);
  const impulse = useRef<THREE.Points>(null);
  const bahn = useRef<THREE.LineLoop | null>(null);
  const letzteMalzeit = useRef(0);

  const geo = useMemo(() => gekruemmt(BREITE, HOEHE, mobil ? 1 : 3.4), [mobil]);

  const texturen = useMemo(
    () =>
      marken.map(() => {
        const c = document.createElement('canvas');
        c.width = 720; c.height = 440;
        const ctx = c.getContext('2d')!;
        const tex = new THREE.CanvasTexture(c);
        tex.colorSpace = THREE.SRGBColorSpace;
        return { tex, ctx };
      }),
    [marken],
  );
  useEffect(() => () => texturen.forEach((t) => t.tex.dispose()), [texturen]);

  /* Leitung Kern -> Panel, in Segmente zerlegt. Jedes Segment traegt eine
     eigene Farbe; bei additivem Blending ist Schwarz gleich unsichtbar. So
     laesst sich das Aufglimmen entlang der Strecke ohne Shader steuern. */
  const linienGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const v = marken.length * SEGMENTE * 2;
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(v * 3), 3));
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(v * 3), 3));
    return g;
  }, [marken.length]);

  /** Tracer: Kopf plus kurzer Schweif, je Panel. */
  const impulsGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const v = marken.length * SCHWEIF;
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(v * 3), 3));
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(v * 3), 3));
    return g;
  }, [marken.length]);

  /** Orbitbahn als feinste gestrichelte Andeutung. */
  const bahnGeo = useMemo(() => {
    const punkte: THREE.Vector3[] = [];
    for (let i = 0; i <= 240; i++) {
      const w = (i / 240) * Math.PI * 2;
      punkte.push(new THREE.Vector3(Math.sin(w) * RADIUS, 0, -Math.cos(w) * RADIUS));
    }
    const g = new THREE.BufferGeometry().setFromPoints(punkte);
    g.computeBoundingSphere();
    return g;
  }, []);

  const panelRefs = useRef<(THREE.Group | null)[]>([]);

  /** Orbitwinkel wird integriert, nicht gesetzt — sonst gibt es kein Momentum. */
  const winkel = useRef(0);
  /** Extra-Winkelgeschwindigkeit aus Scroll-Tempo, klingt weich ab. */
  const schub = useRef(0);
  /** Restgeschwindigkeit nach dem Loslassen. */
  const schwung = useRef(0);
  const hilf = useMemo(() => new THREE.Vector3(), []);
  const hellRef = useRef<boolean[]>(marken.map(() => false));
  const hz = useMemo(() => budget(mobil).texturHz, [mobil]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const tz = taktZeit();
    const { schlag, phase } = schlagJetzt(tz);
    const p = Math.min(1, Math.max(0, fortschritt.current ?? 0));
    const f = fokus.current ?? -1;
    const hv = hover.current ?? -1;
    const n = marken.length;

    // Texturen mit Budget-Rate statt jeden Frame
    if (tz - letzteMalzeit.current > 1 / hz) {
      letzteMalzeit.current = tz;
      texturen.forEach((e, i) => {
        const maler = PRODUKT_MALER[marken[i].wortmarke];
        if (maler) { maler(e.ctx, 720, 440, tz); e.tex.needsUpdate = true; }
      });
    }

    // ---------- Orbit ----------
    const z = drag.current;
    if (z) {
      if (z.delta) { winkel.current += z.delta; z.delta = 0; }
      if (z.v) { schwung.current = z.v; z.v = 0; }
    }
    // Scroll-Tempo gibt Schub, der danach von selbst wieder auf Grundtempo
    // faellt. Basis ist die Pixelgeschwindigkeit, nicht der Seitenfortschritt —
    // siehe tempoPx im Store.
    const schubZiel = scrollStore.zustand.tempoPx * orbitTempo(16) * 6;
    // schnell aufbauen, langsam abklingen: der Stoss soll folgen, das
    // Zurueckfallen aufs Grundtempo soll man nicht bemerken
    schub.current += (schubZiel - schub.current) * Math.min(1, dt * (schubZiel > schub.current ? 9 : 0.9));
    // Momentum rollt aus
    schwung.current *= Math.exp(-dt / 1.15);
    if (Math.abs(schwung.current) < 0.0006) schwung.current = 0;

    if (!z?.aktiv) {
      // Im Fokus steht der Orbit praktisch still — Lesbarkeit vor Bewegung.
      const grund = f >= 0 ? orbitTempo(16) * 0.05 : orbitTempo(16);
      const daempfung = f >= 0 ? 0.12 : 1;
      winkel.current += (grund + (schub.current + schwung.current) * daempfung) * dt;
    }
    if (gruppe.current) gruppe.current.rotation.y = winkel.current;
    melde('winkel', winkel.current);
    melde('schub', schub.current);
    melde('schwung', schwung.current);
    melde('fokus', f);
    melde('schlag', schlag + phase);

    const puls = huelle(phase);

    // ---------- Panels ----------
    const linPos = linienGeo.attributes.position.array as Float32Array;
    const linCol = linienGeo.attributes.color.array as Float32Array;
    const impPos = impulsGeo.attributes.position.array as Float32Array;
    const impCol = impulsGeo.attributes.color.array as Float32Array;

    // Auf diesem Schlag unterwegs: Impuls zu Panel (schlag % n).
    const fliegt = ((schlag % n) + n) % n;
    // Angekommen ist der Impuls des vorigen Schlags — dieses Panel glimmt.
    const glimmt = (((schlag - 1) % n) + n) % n;

    marken.forEach((_, i) => {
      const g = panelRefs.current[i];
      if (!g) return;
      const ab = 0.12 + i * 0.13;
      const an = Math.min(1, Math.max(0, (p - ab) / 0.16));
      const eased = an * an * (3 - 2 * an);

      const w = (i / n) * Math.PI * 2;
      const zielX = Math.sin(w) * RADIUS;
      const zielZ = -Math.cos(w) * RADIUS;

      // aus der Tiefe einfliegen
      const tiefe = (1 - eased) * 54;
      g.position.x = zielX * eased;
      g.position.z = zielZ * eased - tiefe;
      // Schweben: gleiche Frequenz fuer alle, Versatz exakt 0/120/240 Grad.
      const sw = Math.sin(schwebe(i / n, 2, tz) * Math.PI * 2);
      g.position.y = sw * 0.9 * eased + (1 - eased) * -8;
      g.rotation.y = -w;

      const istHover = hv === i;
      const istFokus = f === i;
      const ziel = eased * (istFokus ? 1.5 : istHover ? 1.1 : 1);
      g.scale.setScalar(Math.max(0.001, ziel));

      // Hover dreht das Panel zur Kamera
      if (istHover || istFokus) {
        g.getWorldPosition(hilf);
        const zuKamera = Math.atan2(camera.position.x - hilf.x, camera.position.z - hilf.z);
        const lokal = zuKamera - winkel.current;
        g.rotation.y += (lokal - g.rotation.y) * Math.min(1, dt * 4);
      }

      const mat = (g.children[0] as THREE.Mesh)?.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = eased;
        // Aufglimmen auf dem Schlag, an dem der Impuls ankommt. Werte ueber 1
        // multiplizieren die Textur hoch und laufen damit in den Bloom.
        const glut = i === glimmt && f < 0 ? puls : 0;
        const v = 1 + glut * 0.85;
        mat.color.setRGB(v, v, v);
      }

      // ---------- Leitung und Tracer ----------
      // Die Leitung liegt immer da, ist aber schwarz (= unsichtbar bei
      // additivem Blending), solange kein Impuls auf ihr laeuft.
      const kopf = i === fliegt && eased > 0.5 ? phase * phase * (3 - 2 * phase) : -1;
      const zx = g.position.x;
      const zy = g.position.y;
      const zz = g.position.z;

      // Unbeleuchtete Leitungen muessen nur einmal auf Schwarz — danach
      // aendert sich nichts mehr, bis wieder ein Impuls kommt.
      const warHell = hellRef.current[i];
      const istHell = kopf >= 0;
      hellRef.current[i] = istHell;
      const farbeNoetig = istHell || warHell;

      for (let j = 0; j < SEGMENTE; j++) {
        const s0 = j / SEGMENTE;
        const s1 = (j + 1) / SEGMENTE;
        const o = (i * SEGMENTE + j) * 6;
        linPos[o] = zx * s0; linPos[o + 1] = zy * s0; linPos[o + 2] = zz * s0;
        linPos[o + 3] = zx * s1; linPos[o + 4] = zy * s1; linPos[o + 5] = zz * s1;

        // Glut nur hinter dem Kopf, mit kurzer Abklinglaenge
        let gl = 0;
        if (kopf >= 0) {
          const d = kopf - (s0 + s1) / 2;
          if (d >= 0) gl = Math.exp(-d / 0.085);
        }
        if (!farbeNoetig) continue;
        gl *= eased;
        const rr = gl * 0.58, gg = gl * 0.78, bb = gl * 1.0;
        linCol[o] = rr; linCol[o + 1] = gg; linCol[o + 2] = bb;
        linCol[o + 3] = rr; linCol[o + 4] = gg; linCol[o + 5] = bb;
      }

      // Tracer: Kopf weiss-heiss, Schweif kuehler und schwaecher
      for (let j = 0; j < SCHWEIF; j++) {
        const o = (i * SCHWEIF + j) * 3;
        if (kopf < 0) {
          // hinter die Far-Plane: der Punkt wird geclippt statt gezeichnet
          impPos[o] = 0; impPos[o + 1] = 0; impPos[o + 2] = -1e6;
          impCol[o] = 0; impCol[o + 1] = 0; impCol[o + 2] = 0;
          continue;
        }
        // Abstand gross genug, dass der Schweif als Strecke lesbar ist.
        const st = kopf - j * 0.042;
        if (st < 0) {
          // NICHT auf 0 klemmen: dann lagen alle noch nicht gestarteten
          // Schweifpunkte am Kern uebereinander und addierten sich zu einem
          // satten blauen Klecks neben dem weissen Zentrum.
          impPos[o] = 0; impPos[o + 1] = 0; impPos[o + 2] = -1e6;
          impCol[o] = 0; impCol[o + 1] = 0; impCol[o + 2] = 0;
          continue;
        }
        impPos[o] = zx * st; impPos[o + 1] = zy * st; impPos[o + 2] = zz * st;
        // Kopf weiss-heiss, Schweif schnell abfallend und ins Blau
        const a = Math.pow(1 - j / SCHWEIF, 2.6) * (j === 0 ? 1 : 0.42);
        impCol[o] = a * (j === 0 ? 1 : 0.5);
        impCol[o + 1] = a * (j === 0 ? 1 : 0.72);
        impCol[o + 2] = a;
      }
    });

    linienGeo.attributes.position.needsUpdate = true;
    if (hellRef.current.some(Boolean)) linienGeo.attributes.color.needsUpdate = true;
    impulsGeo.attributes.position.needsUpdate = true;
    impulsGeo.attributes.color.needsUpdate = true;
    if (linien.current) {
      (linien.current.material as THREE.LineBasicMaterial).opacity = Math.min(1, p * 3);
    }
    if (impulse.current) {
      (impulse.current.material as THREE.PointsMaterial).opacity = p > 0.55 ? 1 : 0;
    }
    if (bahn.current) {
      // kaum sichtbare Andeutung — sie soll den Weg markieren, nicht ihn ziehen
      (bahn.current.material as THREE.LineDashedMaterial).opacity = 0.06 * Math.min(1, p * 3);
    }

    // Kamera: bei Fokus heranfahren
    const zZiel = f >= 0 ? 34 : 68;
    const yZiel = f >= 0 ? 2 : 10;
    camera.position.z += (zZiel - camera.position.z) * Math.min(1, dt * 2.2);
    camera.position.y += (yZiel - camera.position.y) * Math.min(1, dt * 2.2);
    camera.lookAt(0, 0, 0);
  });

  return (
    <group>
      <Kern mobil={mobil} />

      {/* Orbitbahn: feinste gestrichelte Andeutung */}
      <lineLoop
        ref={(el) => {
          bahn.current = el;
          if (el) el.computeLineDistances();
        }}
        geometry={bahnGeo}
        frustumCulled={false}
      >
        <lineDashedMaterial
          color="#4DA6FF"
          dashSize={0.5}
          gapSize={1.9}
          transparent
          opacity={0.06}
          depthWrite={false}
          toneMapped={false}
        />
      </lineLoop>

      {/* Leitungen: nur dort sichtbar, wo gerade ein Impuls laeuft */}
      <lineSegments ref={linien} geometry={linienGeo} frustumCulled={false}>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </lineSegments>

      {/* Tracer mit Schweif */}
      <points ref={impulse} geometry={impulsGeo} frustumCulled={false}>
        <pointsMaterial
          map={glutTextur()}
          vertexColors
          size={9}
          sizeAttenuation={false}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </points>

      {/* Panels auf dem Orbit */}
      <group ref={gruppe}>
        {marken.map((m, i) => (
          <group
            key={m.wortmarke}
            ref={(el) => { panelRefs.current[i] = el; }}
            onPointerOver={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); onHover(i); }}
            onPointerOut={() => onHover(-1)}
            onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onClick(i); }}
          >
            <mesh geometry={geo}>
              <meshBasicMaterial map={texturen[i].tex} transparent opacity={0} toneMapped={false} />
            </mesh>
            <mesh geometry={geo} position={[0, -HOEHE - 2, 0]} scale={[1, -1, 1]}>
              <meshBasicMaterial map={texturen[i].tex} transparent opacity={0.035}
                depthWrite={false} toneMapped={false} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

export default function ConstellationScene(props: Props) {
  const { host, mobil, aktiv = true, ...rest } = props;
  const b = budget(mobil);
  return (
    <Canvas
      frameloop={aktiv ? 'always' : 'never'}
      dpr={[1, b.dpr]}
      gl={{ antialias: b.antialias, powerPreference: 'high-performance', alpha: false }}
      camera={{ fov: 44, near: 0.1, far: 400, position: [0, 10, 68] }}
    >
      <color attach="background" args={['#07090C']} />
      <fog attach="fog" args={['#07090C', 55, 190]} />
      <Groesse host={host} />
      <Szene {...rest} mobil={mobil} />
      {b.bloom && (
        <EffectComposer multisampling={0} resolutionScale={b.bloomSkala}>
          <Bloom intensity={0.55} luminanceThreshold={0.4} luminanceSmoothing={0.3} mipmapBlur radius={0.6} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
