/**
 * Rechtstexte, wortgleich von poza-ki.com übernommen (Stand Februar 2026).
 *
 * ACHTUNG — zwei Stellen beschreiben noch das alte Geschäftsmodell
 * (Telefonassistenten): `impressum` → Unternehmensgegenstand, und
 * `datenschutz` → Abschnitt 2.4. Sie sind bewusst NICHT umgeschrieben:
 * Rechtstexte beschreiben tatsächliche Verarbeitungstätigkeit, das darf
 * eine Neupositionierung nicht stillschweigend ändern. Vor Livegang prüfen.
 */

export const anbieter = {
  name: 'POZA-KI',
  inhaber: 'Luis Zauchner',
  strasse: 'Eichenweg 3',
  ort: '9871 Seeboden am Millstättersee',
  land: 'Österreich',
  telefon: '+43 650 380 2309',
  email: 'kontakt@poza-ki.com',
  website: 'www.poza-ki.com',
} as const;

export type Abschnitt = { titel: string; absaetze: string[]; liste?: string[] };

export const impressum: { stand: string; intro: string; abschnitte: Abschnitt[] } = {
  stand: 'Februar 2026',
  intro: 'Informationen gemäß § 5 E-Commerce-Gesetz (ECG) und § 25 Mediengesetz',
  abschnitte: [
    {
      titel: 'Unternehmensbezeichnung',
      absaetze: [
        'POZA-KI',
        'Luis Zauchner',
        'Eichenweg 3',
        '9871 Seeboden am Millstättersee',
        'Österreich',
      ],
    },
    {
      titel: 'Kontakt',
      absaetze: [
        'Telefon: +43 650 380 2309',
        'E-Mail: kontakt@poza-ki.com',
        'Website: www.poza-ki.com',
      ],
    },
    {
      titel: 'Unternehmensgegenstand',
      absaetze: [
        'IT-Dienstleistungen, KI-Automatisierung und Entwicklung von KI-gestützten Telefonassistenten für Unternehmen.',
      ],
    },
    { titel: 'Rechtsform', absaetze: ['Einzelunternehmen'] },
    {
      titel: 'Umsatzsteuerhinweis',
      absaetze: [
        'Kleinunternehmer gemäß § 6 Abs. 1 Z 27 UStG. Es wird keine Umsatzsteuer ausgewiesen.',
      ],
    },
    { titel: 'Zuständige Behörde', absaetze: ['Bezirkshauptmannschaft Spittal an der Drau'] },
    {
      titel: 'Anwendbare Rechtsvorschriften',
      absaetze: [
        'Gewerbeordnung (GewO), E-Commerce-Gesetz (ECG), Datenschutzgesetz (DSG), Datenschutz-Grundverordnung (DSGVO). Zugang über: ris.bka.gv.at',
      ],
    },
    {
      titel: 'Online-Streitbeilegung',
      absaetze: [
        'Verbraucher haben die Möglichkeit, Beschwerden an die Online-Streitbeilegungsplattform der EU zu richten: ec.europa.eu/consumers/odr. Unsere E-Mail-Adresse: kontakt@poza-ki.com',
      ],
    },
    {
      titel: 'Haftung für Inhalte',
      absaetze: [
        'Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte wird jedoch keine Gewähr übernommen. Als Diensteanbieter sind wir gemäß § 7 Abs. 1 ECG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.',
      ],
    },
    {
      titel: 'Haftung für Links',
      absaetze: [
        'Diese Website enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter verantwortlich. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.',
      ],
    },
    {
      titel: 'Urheberrecht',
      absaetze: [
        'Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem österreichischen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des Autors.',
      ],
    },
  ],
};

export const datenschutz: { stand: string; abschnitte: Abschnitt[] } = {
  stand: 'Februar 2026',
  abschnitte: [
    {
      titel: '1. Verantwortlicher',
      absaetze: [
        'POZA-KI — Luis Zauchner',
        'Eichenweg 3, 9871 Seeboden am Millstättersee, Österreich',
        'E-Mail: kontakt@poza-ki.com',
        'Telefon: +43 650 380 2309',
      ],
    },
    {
      titel: '2. Erhebung und Verarbeitung personenbezogener Daten',
      absaetze: [
        'Wir erheben und verarbeiten personenbezogene Daten nur im Einklang mit der Datenschutz-Grundverordnung (DSGVO) und dem österreichischen Datenschutzgesetz (DSG).',
      ],
    },
    {
      titel: '2.1 Beim Besuch der Website',
      absaetze: [
        'Beim Aufrufen unserer Website werden automatisch folgende Daten erhoben (Server-Logfiles):',
      ],
      liste: [
        'IP-Adresse (anonymisiert)',
        'Datum und Uhrzeit des Zugriffs',
        'Aufgerufene Seite / URL',
        'Referrer-URL (zuvor besuchte Seite)',
        'Verwendeter Browser und Betriebssystem',
      ],
    },
    {
      titel: '',
      absaetze: [
        'Rechtsgrundlage: Berechtigtes Interesse (Art. 6 Abs. 1 lit. f DSGVO) zur Sicherstellung des technischen Betriebs der Website.',
      ],
    },
    {
      titel: '2.2 Kontaktaufnahme',
      absaetze: [
        'Wenn Sie uns per E-Mail, Telefon oder über ein Buchungsformular kontaktieren, verarbeiten wir die von Ihnen übermittelten Daten (Name, E-Mail, Telefonnummer, Nachricht) zur Bearbeitung Ihrer Anfrage. Rechtsgrundlage: Vertragserfüllung bzw. vorvertragliche Maßnahmen (Art. 6 Abs. 1 lit. b DSGVO).',
      ],
    },
    {
      titel: '2.3 Terminbuchung (Cal.com)',
      absaetze: [
        'Für die Terminbuchung nutzen wir den Dienst Cal.com (Cal.com Inc.). Bei einer Buchung werden Name, E-Mail-Adresse und optionale Nachricht an Cal.com übermittelt. Datenschutzerklärung von Cal.com: cal.com/privacy',
        'Rechtsgrundlage: Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO).',
      ],
    },
    {
      titel: '2.4 KI-Telefonassistent',
      absaetze: [
        'Im Rahmen unserer Dienstleistung betreiben wir KI-gestützte Telefonassistenten für unsere Kunden. Dabei werden folgende Daten verarbeitet:',
      ],
      liste: [
        'Telefonnummer des Anrufers',
        'Gesprächsinhalte (Transkription)',
        'Gesprächsaufzeichnungen (sofern aktiviert)',
        'Terminbuchungsdaten',
      ],
    },
    {
      titel: '',
      absaetze: [
        'Anrufer werden zu Gesprächsbeginn über die KI-gestützte Verarbeitung informiert. Aufzeichnungen werden verschlüsselt gespeichert und nach der vereinbarten Aufbewahrungsfrist gelöscht (Standard: 90 Tage). Alle Datenverarbeitungen erfolgen innerhalb der EU/EWR.',
        'Rechtsgrundlage: Auftragsverarbeitung gem. Art. 28 DSGVO im Auftrag des jeweiligen Kunden.',
      ],
    },
    {
      titel: '3. Hosting',
      absaetze: [
        'Diese Website wird bei Vercel Inc. (340 S Lemon Ave #4133, Walnut, CA 91789, USA) gehostet. Vercel kann beim Aufruf der Website Server-Logfiles erheben. Vercel ist unter dem EU-US Data Privacy Framework zertifiziert. Datenschutzerklärung: vercel.com/legal/privacy-policy',
      ],
    },
    {
      titel: '4. Cookies und Tracking',
      absaetze: [
        'Diese Website verwendet technisch notwendige Cookies, die für den Betrieb der Seite erforderlich sind. Darüber hinaus setzen wir Analyse- und Marketing-Cookies nur mit Ihrer ausdrücklichen Einwilligung ein.',
      ],
    },
    {
      titel: '4.1 Meta Pixel (Facebook/Instagram)',
      absaetze: [
        'Mit Ihrer Einwilligung verwenden wir das Meta Pixel (Meta Platforms Ireland Ltd.) zur Messung der Wirksamkeit von Werbeanzeigen und zur Erstellung von Zielgruppen. Dabei können Daten in die USA übertragen werden (EU-US Data Privacy Framework). Sie können Ihre Einwilligung jederzeit über den Cookie-Banner widerrufen.',
        'Rechtsgrundlage: Einwilligung (Art. 6 Abs. 1 lit. a DSGVO).',
      ],
    },
    {
      titel: '5. Ihre Rechte',
      absaetze: ['Sie haben jederzeit folgende Rechte bezüglich Ihrer personenbezogenen Daten:'],
      liste: [
        'Auskunft (Art. 15 DSGVO) — Welche Daten wir über Sie gespeichert haben',
        'Berichtigung (Art. 16 DSGVO) — Korrektur unrichtiger Daten',
        'Löschung (Art. 17 DSGVO) — Löschung Ihrer Daten',
        'Einschränkung (Art. 18 DSGVO) — Einschränkung der Verarbeitung',
        'Datenübertragbarkeit (Art. 20 DSGVO) — Übertragung Ihrer Daten',
        'Widerspruch (Art. 21 DSGVO) — Widerspruch gegen die Verarbeitung',
        'Widerruf der Einwilligung (Art. 7 Abs. 3 DSGVO)',
      ],
    },
    {
      titel: '',
      absaetze: ['Zur Ausübung Ihrer Rechte kontaktieren Sie uns unter: kontakt@poza-ki.com'],
    },
    {
      titel: '6. Beschwerderecht',
      absaetze: [
        'Sie haben das Recht, eine Beschwerde bei der österreichischen Datenschutzbehörde einzureichen:',
        'Österreichische Datenschutzbehörde',
        'Barichgasse 40-42, 1030 Wien',
        'www.dsb.gv.at',
      ],
    },
    {
      titel: '7. Datensicherheit',
      absaetze: [
        'Wir setzen technische und organisatorische Sicherheitsmaßnahmen ein, um Ihre Daten gegen Manipulation, Verlust, Zerstörung oder Zugriff unberechtigter Personen zu schützen. Unsere Sicherheitsmaßnahmen werden entsprechend der technologischen Entwicklung fortlaufend verbessert. Die Datenübertragung erfolgt verschlüsselt über TLS/SSL.',
      ],
    },
    {
      titel: '8. Aufbewahrungsfristen',
      absaetze: [
        'Personenbezogene Daten werden gelöscht, sobald der Zweck der Verarbeitung entfällt und keine gesetzlichen Aufbewahrungspflichten entgegenstehen. Für steuerlich relevante Unterlagen gilt die gesetzliche Aufbewahrungsfrist von 7 Jahren (§ 132 BAO).',
      ],
    },
    {
      titel: '9. Änderungen',
      absaetze: [
        'Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf anzupassen, um sie an geänderte Rechtslagen oder Änderungen des Dienstes anzupassen.',
      ],
    },
  ],
};
