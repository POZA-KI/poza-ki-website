'use client';

import Image from 'next/image';
import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { useMotionPref } from './useMotionPref';
import Typewriter from './hud/Typewriter';

/**
 * Foto links mit leichter Parallaxe und Color-Grade. Das Original ist ein
 * helles Bild; ohne Grading würde es als Fremdkörper im dunklen Layout stehen.
 * Der Grade liegt in CSS (Filter + Overlay), nicht in der Bilddatei — so bleibt
 * das Original unangetastet und austauschbar.
 */
export default function Founder({
  name,
  rolle,
  absaetze,
  register,
}: {
  name: string;
  rolle: string;
  absaetze: string[];
  register: [string, string][];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduziert = useMotionPref();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  // Foto bewegt sich deutlich langsamer als der Text daneben — das ist die
  // Parallaxe. Text bekommt die Gegenrichtung, damit der Versatz spuerbar wird.
  const y = useTransform(scrollYProgress, [0, 1], reduziert ? ['0%', '0%'] : ['-9%', '9%']);
  const textY = useTransform(scrollYProgress, [0, 1], reduziert ? [0, 0] : [40, -40]);

  return (
    <div ref={ref} className="founder">
      <div className="founder__bild">
        <div className="founder__rahmen">
          <motion.div className="founder__parallax" style={{ y }}>
            <Image
              /* Web-Fassung (1400x2100, 216 kB) statt des 4672x7008-Originals:
                 next/image optimiert ohnehin auf diese Groesse herunter, das
                 2-MB-Original landete aber unnoetig im Deployment. */
              src="/luis-zauchner-web.jpg"
              alt={`${name}, Gründer von POZA-KI`}
              width={1400}
              height={2100}
              sizes="(max-width: 899px) 100vw, 42vw"
              priority={false}
              className="founder__img"
            />
          </motion.div>
          <span className="founder__grade" aria-hidden="true" />
          <span className="founder__fade" aria-hidden="true" />
        </div>
      </div>

      <motion.div className="founder__text" style={{ y: textY }}>
        <h2 id="founder-h" className="h1 founder__name">{name}</h2>
        <hr className="founder__hr" />
        <p className="meta">{rolle}</p>
        <div className="founder__absaetze">
          {absaetze.map((a, i) => (
            <p key={i} className={i === 0 ? 'lead' : 'body'}>{a}</p>
          ))}
        </div>
        {/* Personalakte im HUD-Stil statt Medien-Register: Labels links in
            Monospace, Werte rechts — wie ein Datensatz im System. */}
        <dl className="akte">
          <div className="akte__zeile">
            <dt className="akte__k">Name</dt>
            <dd className="akte__v"><Typewriter text={name} /></dd>
          </div>
          <div className="akte__zeile">
            <dt className="akte__k">Rolle</dt>
            <dd className="akte__v"><Typewriter text="Gründer · POZA-KI" delay={0.12} /></dd>
          </div>
          <div className="akte__zeile">
            <dt className="akte__k">Standort</dt>
            <dd className="akte__v"><Typewriter text="Seeboden am Millstättersee, AT" delay={0.24} /></dd>
          </div>
          <div className="akte__zeile">
            <dt className="akte__k">Projekte</dt>
            <dd className="akte__v"><Typewriter text="Weltweit" delay={0.3} /></dd>
          </div>
          <div className="akte__zeile">
            <dt className="akte__k">Medien</dt>
            <dd className="akte__v"><Typewriter text="ORF · APA · StartupValley · Kleine Zeitung" delay={0.36} /></dd>
          </div>
          {register.map(([m, k]) => (
            <div key={m} className="akte__zeile">
              <dt className="akte__k">{m}</dt>
              <dd className="akte__v">{k}</dd>
            </div>
          ))}
        </dl>
      </motion.div>
    </div>
  );
}
