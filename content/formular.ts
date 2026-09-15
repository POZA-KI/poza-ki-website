/** Eine Quelle fuer Feldnamen und Beschriftungen — Client und Server teilen sie. */

export const MITARBEITER = ['<10', '10–50', '50–250', '250+'] as const;
export type Mitarbeiter = (typeof MITARBEITER)[number];

export type AuditAnfrage = {
  name: string;
  firma: string;
  email: string;
  telefon: string;
  mitarbeiter: string;
  anliegen: string;
  /** Honeypot: von Menschen nie ausgefuellt. */
  webseite: string;
};

export const FELDER = {
  name: { label: 'Name', mikro: 'pflicht', typ: 'text', autoComplete: 'name' },
  firma: { label: 'Firma', mikro: 'pflicht', typ: 'text', autoComplete: 'organization' },
  email: { label: 'Geschäftliche E-Mail', mikro: 'pflicht', typ: 'email', autoComplete: 'email' },
  telefon: { label: 'Telefon', mikro: 'optional', typ: 'tel', autoComplete: 'tel' },
} as const;

export const EMPFAENGER = 'kontakt@poza-ki.com';

/** Serverseitig und im Formular dieselbe Pruefung. */
export function pruefe(d: Partial<AuditAnfrage>) {
  const fehler: Record<string, string> = {};
  const text = (v?: string) => (v ?? '').trim();

  if (text(d.name).length < 2) fehler.name = 'Bitte Ihren Namen angeben.';
  if (text(d.firma).length < 2) fehler.firma = 'Bitte den Firmennamen angeben.';

  const mail = text(d.email);
  // Absichtlich nachsichtig: strengere Muster lehnen gueltige Adressen ab.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail)) {
    fehler.email = 'Bitte eine gültige E-Mail-Adresse angeben.';
  }

  if (text(d.anliegen).length < 10) {
    fehler.anliegen = 'Bitte kurz beschreiben, worum es geht (mindestens 10 Zeichen).';
  }

  if (d.mitarbeiter && !MITARBEITER.includes(d.mitarbeiter as Mitarbeiter)) {
    fehler.mitarbeiter = 'Ungültige Auswahl.';
  }

  return fehler;
}
