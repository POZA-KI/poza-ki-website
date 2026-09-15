import { Resend } from 'resend';
import { EMPFAENGER, pruefe, type AuditAnfrage } from '@/content/formular';

/** Node-Runtime: das Resend-SDK braucht sie, und der Key darf nie an den Client. */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Sehr einfaches Rate-Limit im Speicher.
 *
 * Bewusst kein Captcha (Vorgabe) und bewusst kein externer Speicher: Bei
 * diesem Aufkommen reicht ein Fenster pro Instanz. Es haelt automatisiertes
 * Dauerfeuer auf, nicht einen entschlossenen Angreifer — dafuer waere ein
 * geteilter Speicher noetig.
 */
const FENSTER_MS = 10 * 60 * 1000;
const MAX_PRO_FENSTER = 8;
const verkehr = new Map<string, number[]>();

function zuVielVerkehr(ip: string) {
  const jetzt = Date.now();
  const bisher = (verkehr.get(ip) ?? []).filter((t) => jetzt - t < FENSTER_MS);
  bisher.push(jetzt);
  verkehr.set(ip, bisher);
  // Der Map nicht unbegrenzt wachsen lassen
  if (verkehr.size > 500) {
    for (const [k, v] of verkehr) {
      if (v.every((t) => jetzt - t > FENSTER_MS)) verkehr.delete(k);
    }
  }
  return bisher.length > MAX_PRO_FENSTER;
}

function absender(req: Request) {
  const fwd = req.headers.get('x-forwarded-for');
  return (fwd ? fwd.split(',')[0] : '').trim() || req.headers.get('x-real-ip') || 'unbekannt';
}

function zeile(bezeichnung: string, wert: string) {
  return `${bezeichnung.padEnd(16)} ${wert || '—'}`;
}

export async function POST(req: Request) {
  let daten: Partial<AuditAnfrage>;
  try {
    daten = (await req.json()) as Partial<AuditAnfrage>;
  } catch {
    return Response.json({ ok: false, fehler: 'Ungültige Anfrage.' }, { status: 400 });
  }

  // Honeypot: ausgefuellt heisst Bot. Wir antworten mit Erfolg, damit der Bot
  // nichts lernt, versenden aber nichts.
  if ((daten.webseite ?? '').trim() !== '') {
    return Response.json({ ok: true });
  }

  // Rate-Limit VOR der Validierung: Sonst zaehlen nur wohlgeformte Anfragen mit,
  // und Dauerfeuer mit Muell laeuft ungebremst durch. Acht Versuche in zehn
  // Minuten sind fuer ein Formular, das man ein Mal ausfuellt, reichlich.
  if (zuVielVerkehr(absender(req))) {
    return Response.json(
      { ok: false, fehler: 'Zu viele Anfragen in kurzer Zeit. Bitte später erneut versuchen.' },
      { status: 429 },
    );
  }

  const feldFehler = pruefe(daten);
  if (Object.keys(feldFehler).length > 0) {
    return Response.json({ ok: false, felder: feldFehler }, { status: 422 });
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error('RESEND_API_KEY fehlt — Anfrage konnte nicht versendet werden.');
    return Response.json({ ok: false, fehler: 'Versand nicht konfiguriert.' }, { status: 500 });
  }

  const name = daten.name!.trim();
  const firma = daten.firma!.trim();
  const email = daten.email!.trim();
  const zeitstempel = new Intl.DateTimeFormat('de-AT', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Europe/Vienna',
  }).format(new Date());

  const text = [
    'AUDIT-ANFRAGE über poza-ki.com',
    '='.repeat(52),
    '',
    zeile('Name', name),
    zeile('Firma', firma),
    zeile('E-Mail', email),
    zeile('Telefon', (daten.telefon ?? '').trim()),
    zeile('Mitarbeiter', (daten.mitarbeiter ?? '').trim()),
    '',
    'Anliegen',
    '-'.repeat(52),
    daten.anliegen!.trim(),
    '',
    '='.repeat(52),
    zeile('Eingegangen', zeitstempel),
    '',
    `Antworten geht direkt an ${email}.`,
  ].join('\n');

  try {
    const resend = new Resend(key);
    const { data, error } = await resend.emails.send({
      from: 'POZA-KI Website <onboarding@resend.dev>',
      to: [EMPFAENGER],
      replyTo: email,
      subject: `Audit-Anfrage · ${firma} · ${name}`,
      text,
    });
    if (error) {
      console.error('Resend-Fehler:', error);
      return Response.json({ ok: false, fehler: 'Versand fehlgeschlagen.' }, { status: 502 });
    }
    return Response.json({ ok: true, id: data?.id });
  } catch (e) {
    console.error('Versand fehlgeschlagen:', e);
    return Response.json({ ok: false, fehler: 'Versand fehlgeschlagen.' }, { status: 502 });
  }
}
