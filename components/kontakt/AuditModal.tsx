'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { EMPFAENGER, FELDER, MITARBEITER, pruefe, type AuditAnfrage } from '@/content/formular';
import { scrollStore } from '../scrollStore';
import { schliesseAudit, useAuditOffen } from './dialogStore';

type Zustand = 'formular' | 'sendet' | 'fertig' | 'fehler';

const LEER: AuditAnfrage = {
  name: '', firma: '', email: '', telefon: '',
  mitarbeiter: MITARBEITER[1], anliegen: '', webseite: '',
};

/**
 * Anfrage-Modal im HUD-Stil der Seite.
 *
 * Als natives <dialog> mit showModal(): Fokusfalle, Esc und der Top-Layer
 * kommen damit vom Browser und sind korrekt, statt mit eigenem
 * Tastatur-Handling nachgebaut zu werden. Ergaenzt werden nur die Dinge, die
 * das Element nicht mitbringt: Klick auf den Hintergrund, Scroll-Sperre
 * (inklusive Lenis) und die Ein-/Ausblendung.
 */
export default function AuditModal() {
  const offen = useAuditOffen();
  const dialog = useRef<HTMLDialogElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [daten, setDaten] = useState<AuditAnfrage>(LEER);
  const [felder, setFelder] = useState<Record<string, string>>({});
  const [zustand, setZustand] = useState<Zustand>('formular');
  const [meldung, setMeldung] = useState('');

  const schliessen = useCallback(() => schliesseAudit(), []);

  // Oeffnen und Schliessen des nativen Dialogs
  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (offen && !d.open) d.showModal();
    else if (!offen && d.open) d.close();
  }, [offen]);

  // Scroll sperren — Lenis laeuft sonst im Hintergrund weiter
  useEffect(() => {
    if (!offen) return;
    const lenis = scrollStore.lenis;
    lenis?.stop?.();
    const vorher = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = vorher;
      lenis?.start?.();
    };
  }, [offen]);

  // Esc und das native close-Event zurueck in den Store spiegeln
  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    // Zuruecksetzen beim Schliessen, nicht beim Oeffnen: So startet das Modal
    // beim naechsten Mal leer, die Erfolgsmeldung bleibt aber stehen, solange
    // der Dialog offen ist.
    const onClose = () => {
      schliessen();
      setZustand('formular');
      setFelder({});
      setDaten((alt) => (alt.anliegen || alt.name ? LEER : alt));
    };
    const onCancel = (e: Event) => { e.preventDefault(); schliessen(); };
    d.addEventListener('close', onClose);
    d.addEventListener('cancel', onCancel);
    return () => {
      d.removeEventListener('close', onClose);
      d.removeEventListener('cancel', onCancel);
    };
  }, [schliessen]);

  function setzeFeld<K extends keyof AuditAnfrage>(k: K, v: AuditAnfrage[K]) {
    setDaten((alt) => ({ ...alt, [k]: v }));
    if (felder[k]) setFelder((alt) => { const n = { ...alt }; delete n[k as string]; return n; });
  }

  async function absenden(e: React.FormEvent) {
    e.preventDefault();
    const gefunden = pruefe(daten);
    setFelder(gefunden);
    if (Object.keys(gefunden).length > 0) {
      const erstes = document.querySelector<HTMLElement>('[data-fehler="true"]');
      erstes?.focus();
      return;
    }
    setZustand('sendet');
    try {
      const antwort = await fetch('/api/audit-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(daten),
      });
      const raus = await antwort.json().catch(() => ({}));
      if (antwort.ok && raus.ok) {
        setZustand('fertig');
        return;
      }
      if (raus.felder) {
        setFelder(raus.felder);
        setZustand('formular');
        return;
      }
      setMeldung(raus.fehler || 'Die Anfrage konnte nicht zugestellt werden.');
      setZustand('fehler');
    } catch {
      setMeldung('Keine Verbindung zum Server.');
      setZustand('fehler');
    }
  }

  const sendet = zustand === 'sendet';

  return (
    <dialog
      ref={dialog}
      className="mdl"
      aria-labelledby="audit-titel"
      /* Klick auf den Hintergrund: Das <dialog> selbst fuellt den Viewport,
         das Panel darin nicht — ein Treffer ausserhalb des Panels schliesst. */
      onMouseDown={(e) => {
        if (!panel.current) return;
        if (!panel.current.contains(e.target as Node)) schliessen();
      }}
    >
      <div ref={panel} className="mdl__panel">
        <div className="mdl__raster" aria-hidden="true" />

        <header className="mdl__kopf">
          <p className="meta mdl__micro">
            <span className="mdl__punkt" aria-hidden="true" />
            audit.request
          </p>
          <button type="button" className="mdl__zu mono" onClick={schliessen} aria-label="Dialog schließen">
            schließen ✕
          </button>
        </header>

        {zustand === 'fertig' ? (
          <div className="mdl__ergebnis">
            <p className="mono mdl__status">request.received</p>
            <h2 id="audit-titel" className="h2 mdl__titel">Danke — wir melden uns innerhalb von 24&nbsp;Stunden.</h2>
            <p className="mdl__text">
              Ihre Anfrage liegt bei uns. Antworten geht direkt an {daten.email || 'Ihre Adresse'}.
            </p>
            <button type="button" className="btn btn--primary mdl__senden" onClick={schliessen}>
              Schließen
            </button>
          </div>
        ) : (
          <>
            <h2 id="audit-titel" className="h2 mdl__titel">Prozess-Audit anfragen</h2>
            <p className="mdl__text">
              Beschreiben Sie kurz, welcher Prozess bei Ihnen die meiste manuelle Arbeit bindet.
              Wir melden uns mit einer ersten Einschätzung — nicht mit einem Angebot.
            </p>

            <form className="mdl__form" onSubmit={absenden} noValidate>
              {/* Honeypot. Vor Menschen versteckt, fuer Bots attraktiv. */}
              <div className="mdl__falle" aria-hidden="true">
                <label htmlFor="webseite">Webseite nicht ausfüllen</label>
                <input
                  id="webseite" name="webseite" type="text" tabIndex={-1} autoComplete="off"
                  value={daten.webseite}
                  onChange={(e) => setzeFeld('webseite', e.target.value)}
                />
              </div>

              <div className="mdl__reihe">
                {(['name', 'firma'] as const).map((k) => (
                  <Feld key={k} name={k} wert={daten[k]} fehler={felder[k]} setze={setzeFeld} />
                ))}
              </div>
              <div className="mdl__reihe">
                {(['email', 'telefon'] as const).map((k) => (
                  <Feld key={k} name={k} wert={daten[k]} fehler={felder[k]} setze={setzeFeld} />
                ))}
              </div>

              <div className="mdl__feld">
                <label className="mdl__label mono" htmlFor="mitarbeiter">
                  Mitarbeiter <span className="mdl__mikro">optional</span>
                </label>
                <select
                  id="mitarbeiter" className="mdl__eingabe mdl__select"
                  value={daten.mitarbeiter}
                  onChange={(e) => setzeFeld('mitarbeiter', e.target.value)}
                >
                  {MITARBEITER.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div className="mdl__feld">
                <label className="mdl__label mono" htmlFor="anliegen">
                  Worum geht es? Welcher Prozess, welches System?{' '}
                  <span className="mdl__mikro">pflicht</span>
                </label>
                <textarea
                  id="anliegen" rows={5}
                  className={`mdl__eingabe mdl__textarea ${felder.anliegen ? 'is-fehler' : ''}`}
                  value={daten.anliegen}
                  data-fehler={felder.anliegen ? 'true' : undefined}
                  aria-invalid={!!felder.anliegen}
                  aria-describedby={felder.anliegen ? 'fehler-anliegen' : undefined}
                  onChange={(e) => setzeFeld('anliegen', e.target.value)}
                />
                {felder.anliegen && (
                  <p id="fehler-anliegen" className="mdl__fehler mono">{felder.anliegen}</p>
                )}
              </div>

              {zustand === 'fehler' && (
                <p className="mdl__panne mono" role="alert">
                  {meldung} Schreiben Sie uns direkt:{' '}
                  <a href={`mailto:${EMPFAENGER}`}>{EMPFAENGER}</a>
                </p>
              )}

              <button type="submit" className="btn btn--primary mdl__senden" disabled={sendet}>
                {sendet ? <><span className="mdl__spinner" aria-hidden="true" />sendet…</> : 'Audit anfragen'}
              </button>
              <p className="mdl__hinweis mono">
                Pflichtfelder · keine Weitergabe an Dritte · Antwort innerhalb von 24 Stunden
              </p>
            </form>
          </>
        )}
      </div>
    </dialog>
  );
}

function Feld({
  name, wert, fehler, setze,
}: {
  name: keyof typeof FELDER;
  wert: string;
  fehler?: string;
  setze: <K extends keyof AuditAnfrage>(k: K, v: AuditAnfrage[K]) => void;
}) {
  const f = FELDER[name];
  return (
    <div className="mdl__feld">
      <label className="mdl__label mono" htmlFor={name}>
        {f.label} <span className="mdl__mikro">{f.mikro}</span>
      </label>
      <input
        id={name}
        type={f.typ}
        autoComplete={f.autoComplete}
        className={`mdl__eingabe ${fehler ? 'is-fehler' : ''}`}
        value={wert}
        data-fehler={fehler ? 'true' : undefined}
        aria-invalid={!!fehler}
        aria-describedby={fehler ? `fehler-${name}` : undefined}
        onChange={(e) => setze(name, e.target.value)}
      />
      {fehler && <p id={`fehler-${name}`} className="mdl__fehler mono">{fehler}</p>}
    </div>
  );
}
