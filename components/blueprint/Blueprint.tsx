'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useMotionPref } from '../useMotionPref';
import { hatWebGL } from '../webgl';
import { anteil, proFrame } from '../scrollStore';
import { useBereich } from '../useBereich';
import { useNaehe } from '../useSichtbar';
import { useMeldeDeckung } from '../deckung';
import { ANNOTATIONEN } from './ziele';

const BlueprintScene = dynamic(() => import('./BlueprintScene'), { ssr: false });

/**
 * Gepinnter Statement-Moment. Die Szene bekommt den Scrollfortschritt ueber
 * ein Ref, nicht ueber State — sonst gaebe es 60 React-Rerender pro Sekunde.
 * Das HUD kennt nur grobe Stufen und rendert entsprechend selten neu; die
 * Annotationen werden per Klasse geschaltet, nicht per Frame-Style.
 */
export default function Blueprint({ satz, unter }: { satz: string; unter: string }) {
  const bereich = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const annos = useRef<(HTMLSpanElement | null)[]>([]);
  const fortschritt = useRef(0);
  const [phase, setPhase] = useState(0);
  const [gestartet, setGestartet] = useState(false);
  const [online, setOnline] = useState(false);
  const reduziert = useMotionPref();
  const mass = useBereich(bereich, 0, 1);
  const naehe = useNaehe(bereich);
  useMeldeDeckung(host);

  useEffect(() => {
    if (reduziert) return;
    let letztePhase = -1;
    let letztAn = false;
    let letztOnline = false;
    const anAus: boolean[] = ANNOTATIONEN.map(() => false);
    return proFrame((s) => {
      const v = anteil(mass.current, s.y);
      fortschritt.current = v;

      const ph = v < 0.3 ? 0 : v < 0.68 ? 1 : 2;
      if (ph !== letztePhase) { letztePhase = ph; setPhase(ph); }
      const an = v > 0.04;
      if (an !== letztAn) { letztAn = an; setGestartet(an); }
      const on = v > 0.78;
      if (on !== letztOnline) { letztOnline = on; setOnline(on); }

      for (let i = 0; i < ANNOTATIONEN.length; i++) {
        const soll = v > ANNOTATIONEN[i].ab && v < 0.94;
        if (soll === anAus[i]) continue;
        anAus[i] = soll;
        annos.current[i]?.classList.toggle('is-an', soll);
      }
    });
  }, [mass, reduziert]);

  const mobil =
    typeof window !== 'undefined' &&
    window.matchMedia('(max-width: 900px), (hover: none) and (pointer: coarse)').matches;

  const kannWebGL = typeof window !== 'undefined' && hatWebGL();

  // Ohne WebGL oder bei reduzierter Bewegung: der Claim als ruhiges Statement.
  if (reduziert || !kannWebGL) {
    // ref MUSS auch hier haengen: useMotionPref startet auf "reduziert", der
    // erste Render ist also dieser Zweig. Ohne Ref misst der Bereich gegen ein
    // leeres Ziel und der Fortschritt bleibt auf 0 stehen (verifiziert).
    return (
      <section ref={bereich} className="claim" aria-label="Markenclaim">
        <div className="wrap schutz">
          <p className="claim__satz">{satz}</p>
          <p className="body claim__unter">{unter}</p>
        </div>
      </section>
    );
  }

  const teil1 = satz.split(' ').slice(0, 2).join(' '); // "Aus Vision"
  const teil2 = satz.split(' ').slice(2).join(' ');    // "wird System."

  return (
    <section
      ref={bereich}
      className="bp"
      style={{ height: 'var(--bp-h, 320vh)' }}
      aria-label="Markenclaim: Aus Vision wird System"
    >
      <div ref={host} className="bp__sticky">
        {naehe.nah && (
          <BlueprintScene fortschritt={fortschritt} mobil={mobil} host={host} aktiv={naehe.aktiv} />
        )}

        <div className="bp__hud">
          <div className="wrap">
            <p className="label bp__phase">
              <span className="bp__phasenr">{String(phase + 1).padStart(2, '0')}</span>
              {' · '}
              {['Vision', 'Blueprint', 'System'][phase]}
            </p>

            <h2 className="bp__satz">
              <span className="ln">
                <motion.span
                  className="ln__i"
                  initial={{ y: '110%' }}
                  animate={{ y: gestartet ? '0%' : '110%' }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                  {teil1}
                </motion.span>
              </span>
              <span className="ln">
                <motion.span
                  className="ln__i"
                  initial={{ y: '110%' }}
                  animate={{ y: phase === 2 ? '0%' : '110%' }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                  {teil2}
                </motion.span>
              </span>
            </h2>

            <motion.p
              className="body claim__unter"
              animate={{ opacity: phase === 2 ? 1 : 0, y: phase === 2 ? 0 : 10 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              {unter}
            </motion.p>

            <motion.p
              className="bp__status mono"
              animate={{ opacity: online ? 1 : 0 }}
              transition={{ duration: 0.4 }}
            >
              system.online
            </motion.p>
          </div>

          {/* Monospace-Annotationen, poppen an den Kanten auf. Geschaltet per
              Klasse: ein Style-Write pro Zustandswechsel statt pro Frame. */}
          <div className="bp__annos" aria-hidden="true">
            {ANNOTATIONEN.map((a, i) => (
              <span
                key={a.text}
                ref={(el) => { annos.current[i] = el; }}
                className="bp__anno mono"
                style={{ left: `${50 + a.x * 0.78}%`, top: `${50 - a.y * 1.5}%` }}
              >
                <span className="bp__annolinie" />
                {a.text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
