'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useMotionPref } from '../useMotionPref';
import { MOBIL_ABFRAGE, useMedia, useWebGL } from '../faehig';
import { anteil, proFrame } from '../scrollStore';
import { useBereich } from '../useBereich';
import { useNaehe } from '../useSichtbar';
import { useMeldeDeckung } from '../deckung';
import ConstellationFallback from './ConstellationFallback';
import type { Zieh } from './ConstellationScene';
import { huelle, schlagJetzt } from '../takt';
import { melde } from '../mess';

const ConstellationScene = dynamic(() => import('./ConstellationScene'), { ssr: false });

type Produkt = { wortmarke: string; versalien: boolean; text: string; punkte: string[] };

export default function Constellation({ items, status }: { items: Produkt[]; status: string }) {
  const bereich = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const fortschritt = useRef(0);
  const fokusRef = useRef(-1);
  const hoverRef = useRef(-1);
  const dragRef = useRef<Zieh>({ aktiv: false, delta: 0, v: 0 });

  const glut = useRef<HTMLSpanElement>(null);
  const buehne = useRef<HTMLDivElement>(null);
  const hud = useRef<HTMLDivElement>(null);
  const [aktiv, setAktiv] = useState(-1);   // Hover ODER Fokus, fuer das HUD
  const [fokus, setFokus] = useState(-1);
  const reduziert = useMotionPref();
  const mass = useBereich(bereich, 0.85, 0.55);
  const naehe = useNaehe(bereich);
  useMeldeDeckung(buehne);

  // Ein Abnehmer am zentralen Loop: Szene bekommt ein Ref, die Leiste einen
  // direkten transform-Write. Kein React im Frame.
  useEffect(() => {
    if (reduziert) return;
    let letzterTakt = -1;
    return proFrame((s) => {
      const v = anteil(mass.current, s.y);
      fortschritt.current = v;
      if (glut.current) glut.current.style.transform = `scaleX(${v})`;
      // Derselbe Herzschlag wie in der 3D-Szene, als CSS-Variable ans HUD:
      // Pills und Statuszeile glimmen damit exakt auf den Takt der Impulse.
      const t = Math.round(huelle(schlagJetzt().phase) * 50) / 50;
      if (t !== letzterTakt && hud.current) {
        letzterTakt = t;
        hud.current.style.setProperty('--takt', String(t));
      }
    });
  }, [mass, reduziert]);

  const setzeHover = useCallback((i: number) => {
    hoverRef.current = i;
    setAktiv((alt) => (fokusRef.current >= 0 ? fokusRef.current : i >= 0 ? i : -1) ?? alt);
  }, []);

  const setzeFokus = useCallback((i: number) => {
    const neu = fokusRef.current === i ? -1 : i;
    fokusRef.current = neu;
    setFokus(neu);
    setAktiv(neu >= 0 ? neu : hoverRef.current);
  }, []);

  // Ziehen dreht den Orbit — mit echtem Momentum. Der Handler sammelt nur
  // Winkelzuwachs und Geschwindigkeit ein; integriert wird in der Szene, sonst
  // gaebe es zwei Stellen, die denselben Winkel schreiben.
  useEffect(() => {
    const el = host.current;
    if (!el || reduziert) return;
    let unten = false;
    let letzteX = 0;
    let letzteZeit = 0;
    let v = 0;
    const PRO_PIXEL = 0.005;

    const down = (e: PointerEvent) => {
      unten = true;
      letzteX = e.clientX;
      letzteZeit = e.timeStamp;
      v = 0;
      dragRef.current.aktiv = true;
      dragRef.current.v = 0;
      melde('ziehStart', (window.performance.now() / 1000));
    };
    const move = (e: PointerEvent) => {
      if (!unten) return;
      const dx = e.clientX - letzteX;
      const dtms = Math.max(8, e.timeStamp - letzteZeit);
      letzteX = e.clientX;
      letzteZeit = e.timeStamp;
      const dw = dx * PRO_PIXEL;
      dragRef.current.delta += dw;
      // gleitender Mittelwert, sonst bestimmt ein einzelner Ruckler das Momentum
      v = v * 0.7 + (dw / (dtms / 1000)) * 0.3;
    };
    const up = () => {
      if (!unten) return;
      unten = false;
      dragRef.current.aktiv = false;
      // Nur weitergeben, wenn wirklich geschwungen wurde
      dragRef.current.v = Math.abs(v) > 0.12 ? Math.max(-3.2, Math.min(3.2, v)) : 0;
      melde('ziehEndeV', v);
    };
    el.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      el.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [reduziert]);

  // Esc verlaesst den Fokus
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && fokusRef.current >= 0) setzeFokus(fokusRef.current);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setzeFokus]);

  const kannWebGL = useWebGL();
  const mobil = useMedia(MOBIL_ABFRAGE);

  if (reduziert || !kannWebGL || mobil) {
    // ref auch im Fallback — siehe Blueprint: sonst misst useScroll gegen
    // ein leeres Ziel, weil der erste Render immer dieser Zweig ist.
    return (
      <div ref={bereich}>
        <ConstellationFallback items={items} status={status} />
      </div>
    );
  }

  const zeige = aktiv >= 0 ? items[aktiv] : null;

  return (
    <div ref={bereich} className="kon" style={{ height: '260vh' }}>
      <div ref={buehne} className="kon__sticky">
        <div ref={host} className="kon__buehne">
          {naehe.nah && (
            <ConstellationScene
              marken={items.map((i) => ({ wortmarke: i.wortmarke, text: i.text }))}
              fortschritt={fortschritt}
              fokus={fokusRef}
              hover={hoverRef}
              drag={dragRef}
              onHover={setzeHover}
              onClick={setzeFokus}
              mobil={mobil}
              host={host}
              aktiv={naehe.aktiv}
            />
          )}
        </div>

        {/* Kern-Label. Die Kamera schaut immer auf (0,0,0), der Kern sitzt also
            exakt in der Mitte der Buehne — dafuer braucht es keine Projektion,
            nur eine Fuehrungslinie zur Mitte. */}
        <p className="kon__kernlabel mono" aria-hidden="true">
          <span className="kon__kernlinie" />
          POZA-KI · core
        </p>

        <div ref={hud} className="kon__hud">
          <div className="kon__unten">
            {/* Kein Abdimmen im Leerlauf: auf 0.35 kompositiert der Titel zu
                2.79:1 und der Microtext auf 1.61:1 — unlesbar. Der Zustand
                steht ohnehin im Text, dafuer braucht es keine Opazitaet. */}
            <div>
              <p className="meta kon__micro">
                {zeige
                  ? `${String(items.indexOf(zeige) + 1).padStart(2, '0')} / 0${items.length} · ${fokus >= 0 ? 'fokus' : 'produkt'}`
                  : `0${items.length} Produkte · im Betrieb`}
              </p>
              <h3 className={`h2 kon__titel ${zeige?.versalien ? 'is-versal' : ''}`}>
                {zeige ? zeige.wortmarke : 'Constellation'}
              </h3>
              <p className="kon__text">{zeige ? zeige.text : 'Panel anklicken für Details · ziehen dreht den Orbit'}</p>
              <ul className="kon__pills">
                {(zeige?.punkte ?? []).map((t) => (
                  <li key={t} className="gal__tag mono">{t}</li>
                ))}
              </ul>
            </div>
          </div>

          <nav className="galbar kon__bar" aria-label="Produkte">
            <span className="galbar__schiene" aria-hidden="true" />
            <span ref={glut} className="galbar__glut" aria-hidden="true" />
            <ul>
              {items.map((it, i) => (
                <li key={it.wortmarke}>
                  <button
                    className={`galbar__nr mono ${aktiv === i ? 'is-on' : ''}`}
                    onClick={() => setzeFokus(i)}
                    aria-label={`${String(i + 1).padStart(2, '0')} — Produkt ${it.wortmarke}`}
                    aria-pressed={fokus === i}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <p className="kon__status mono">
            <span className="konst__statuspunkt" aria-hidden="true" />
            {status}
          </p>
        </div>
      </div>
    </div>
  );
}
