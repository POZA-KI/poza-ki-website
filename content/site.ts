/**
 * Gesamte Seiten-Copy. Sie-Form, knapp, keine Marketing-Floskeln.
 *
 * REGEL: Hier steht keine erfundene Zahl. Wo eine Kennzahl Wirkung hätte,
 * steht `[PLATZHALTER: …]`. Das ist Absicht und darf nicht "plausibel"
 * ausgefüllt werden — der Kunde setzt echte Werte ein.
 *
 * Standort kommt aus dem Impressum (Seeboden am Millstättersee, Kärnten),
 * nicht aus einer Annahme.
 */

/**
 * Claim-Varianten. Aktiv ist A als eigener Statement-Moment zwischen Case und
 * Produkten — der Hero traegt bereits „Software, die Ihr Unternehmen trägt.",
 * ein zweiter Claim dort wuerde beide schwaechen.
 *   A „Aus Vision wird System."        — aktiv
 *   B „Wenn Sie es denken können, bauen wir es."  — zu nah an einer Werbezeile
 *   C „Es gibt nichts, was nicht gebaut werden kann …" — als These-Punch aktiv
 */
export const CLAIM_VARIANTEN = {
  A: 'Aus Vision wird System.',
  B: 'Wenn Sie es denken können, bauen wir es.',
  C: 'Es gibt nichts, was nicht gebaut werden kann — nur Teams, die es nicht bauen können.',
} as const;

export const claim = {
  satz: CLAIM_VARIANTEN.A,
  unter:
    'Wir kennen keine Anfrage, die an der Machbarkeit scheitert — nur an der Frage, ob sie sich rechnet. Genau die beantworten wir zuerst.',
};

export const STANDORT = 'Seeboden am Millstättersee, AT';
export const STANDORT_LANG = 'Seeboden am Millstättersee, Österreich';
export const EMAIL = 'kontakt@poza-ki.com';
export const GRUENDER = 'Luis Zauchner';

/* ------------------------------------------------------------------ 01 Hero */

/**
 * Drei Alternativen zur Ausgangszeile „Wir automatisieren, was Ihr Unternehmen
 * ausbremst" (zu weich, Nutzen unspezifisch, „ausbremst" ist Agentursprache).
 * Aktiv ist A; zum Wechseln einfach HERO_HEADLINE umhängen.
 */
export const HEADLINE_VARIANTEN = {
  A: 'Software, die Ihr Unternehmen trägt.',
  B: 'Wir bauen die Systeme, auf denen Ihr Unternehmen läuft.',
  C: 'Standardsoftware endet dort, wo Ihr Unternehmen anfängt.',
} as const;

/** Umbruch bewusst fest: die Zeilenmaske darf nie mitten in ein Wort schneiden. */
export const HEADLINE_ZEILEN = ['Software, die Ihr', 'Unternehmen trägt.'];

export const hero = {
  headline: HEADLINE_VARIANTEN.A,
  zeilen: HEADLINE_ZEILEN,
  sub:
    'POZA-KI ist eine Software-Manufaktur auf Enterprise-Niveau. Wir konzipieren, entwickeln und ' +
    'betreiben individuelle Software: eigene ERP- und CRM-Systeme, interne Unternehmenssoftware, ' +
    'digitale Plattformen und vollautomatisierte Prozesse mit KI. ' +
    'Projekte weltweit — entwickelt in Österreich.',
  ctaPrimaer: 'Prozess-Audit anfragen',
  ctaSekundaer: 'Vorgehen ansehen',
  meta: [
    ['STANDORT', STANDORT],
    ['PROJEKTE', 'WELTWEIT'],
    ['FOKUS', 'INDIVIDUALSOFTWARE · ERP · CRM · PLATTFORMEN · KI'],
    ['MODELL', 'KONZEPTION · ENTWICKLUNG · BETRIEB'],
    ['PRODUKTE', 'FREI · CABION · BELEGFREI'],
  ] as [string, string][],
};

export const navigation = [
  { href: '#leistungen', label: 'Leistungen' },
  { href: '#case', label: 'Case' },
  { href: '#vorgehen', label: 'Vorgehen' },
  { href: '#kontakt', label: 'Kontakt' },
];

/* ------------------------------------------------------- 02 Medienleiste */

export const medien = {
  label: 'Berichterstattung',
  marken: ['ORF', 'APA', 'StartupValley', 'Kleine Zeitung'],
  fussnote: 'Auswahl. Nennung der Medien ohne Auftragsverhältnis.',
};

/* -------------------------------------------------------------- 03 These */

export const these = {
  zeile1: 'Andere liefern Tools.',
  zeile2: 'Wir bauen Systeme.',
  absaetze: [
    'Standardsoftware zwingt Ihre Prozesse ins Korsett. Sie bringt ihr eigenes Modell mit, und Ihr Unternehmen biegt sich so lange, bis es hineinpasst. Was übrig bleibt, wird per Tabelle, Mail und Zuruf überbrückt.',
    'Wir drehen das um: Die Software wird um den Prozess gebaut, nicht umgekehrt. Datenmodell, Fachlogik, Oberflächen und Schnittstellen folgen dem, was in Ihrem Unternehmen tatsächlich passiert.',
    'Standardsoftware endet dort, wo Ihr Unternehmen anfängt. Genau dort fangen wir an — und bleiben bis in den Betrieb.',
    'Es gibt nichts, was nicht gebaut werden kann — nur Teams, die es nicht bauen können. Die Frage ist nie, ob ein System möglich ist. Die Frage ist, ob es sich lohnt.',
  ],
};

/* --------------------------------------------------------- 04 Leistungen */

export const leistungen = {
  h2: 'Vier Ebenen. Ein Anbieter.',
  intro: 'Wir arbeiten auf allen vier Ebenen — oder auf der, die Sie gerade brauchen.',
  cards: [
    {
      titel: 'Unternehmenssoftware',
      text: 'Eigene ERP-, CRM- und Fachsysteme, exakt auf Ihre Prozesse gebaut. Kein Modul, das Sie nicht brauchen, kein Workaround für das, was fehlt — und die Datenhoheit bleibt bei Ihnen.',
      punkte: ['erp', 'crm', 'custom'],
    },
    {
      titel: 'Digitale Plattformen',
      text: 'Kurs-, Coaching- und Kundenportale mit Zahlungs- und Nutzerverwaltung. Von der Registrierung über Rollen und Rechte bis zur Abrechnung als ein zusammenhängendes Produkt.',
      punkte: ['plattform', 'saas', 'portale'],
    },
    {
      titel: 'Prozessautomatisierung & KI',
      text: 'Von der Datenextraktion bis zum autonomen Workflow. Unstrukturierte Eingänge werden zu strukturierten Daten, Regeln und Modelle entscheiden, der Mensch bleibt am Kontrollpunkt.',
      punkte: ['ki', 'automation', 'workflows'],
    },
    {
      titel: 'Strategie & Audit',
      text: 'Wir finden die Prozesse mit dem größten Hebel, dann bauen wir. Bewertet wird technisch und wirtschaftlich — auch dann, wenn das Ergebnis lautet: hier lohnt es sich nicht.',
      punkte: ['beratung', 'audit', 'roadmap'],
    },
  ],
};

/* ------------------------------------------------------- Eigene Produkte */

export const produkte = {
  h2: 'Wir bauen nicht nur für Kunden.',
  intro:
    'Wir betreiben eigene Software-Produkte. Sie sind der Beleg dafür, dass wir Systeme nicht nur ausliefern, sondern über Jahre am Laufen halten.',
  status: '3 Produkte im Betrieb · Projekte weltweit · entwickelt in Österreich',
  items: [
    {
      wortmarke: 'FREI',
      versalien: true,
      text: 'Gamifizierte Gründer-App für den DACH-Raum',
      punkte: ['consumer', 'app', 'gamification'],
    },
    {
      wortmarke: 'CABION',
      versalien: true,
      text: 'KI-ERP für Industrieprozesse — von der Auslegung bis zum Angebot',
      punkte: ['enterprise', 'erp', 'industrie'],
    },
    {
      wortmarke: 'BelegFrei',
      versalien: false,
      text: 'Automatisierte Beleg- und Rechnungsverarbeitung',
      punkte: ['finance', 'ocr', 'automation'],
    },
  ],
};

/* --------------------------------------------------------------- 05 Case */

export const fallstudie = {
  h2: 'Enterprise-KI-System für einen der weltweit führenden Wärmetauscherhersteller.',
  daten: [
    ['Branche', 'Industrielle Wärmeübertragung'],
    ['Rolle', 'Konzeption · Entwicklung · Betrieb'],
    ['Systemklasse', 'Dokumentenverarbeitung · Angebotslogik · ERP-Integration'],
    ['Eingang', '7-seitige Auslegungs-PDFs, je Absender unterschiedlich'],
    ['Kette', 'Extraktion · Kalkulation · Prüflogik · Freigabe · ERP'],
    ['Status', 'Produktivbetrieb'],
  ] as [string, string][],
  ausgangslage:
    'Technische Auslegungsdaten erreichen den Vertrieb als PDF — in Formaten, die sich je nach Absender, Anlage und Jahrzehnt unterscheiden. Jede Angebotserstellung begann damit, dass Fachpersonal diese Daten manuell auslas, in die Kalkulation übertrug und gegen interne Regeln prüfte. Heute läuft die gesamte Kette in einem Fluss: Auslegungsdaten werden extrahiert, die Kalkulation daraus abgeleitet, die Prüflogik greift, Freigabe-Gates blockieren die Bestellung bei Sonderkonstruktionen, und das Ergebnis geht über die Schnittstelle ins ERP.',
  stufen: [
    {
      titel: 'Extraktion',
      text: 'Auslegungsdaten werden aus PDFs unterschiedlicher Herkunft und Struktur ausgelesen und in ein einheitliches technisches Datenmodell überführt.',
    },
    {
      titel: 'Kalkulation',
      text: 'Auf Basis der extrahierten Parameter berechnet das System die Angebotspositionen nach der hinterlegten Kalkulationslogik des Unternehmens.',
    },
    {
      titel: 'Prüflogik',
      text: 'Jede Position durchläuft fachliche Plausibilitäts- und Freigaberegeln. Grenzfälle werden nicht geraten, sondern markiert und zur Prüfung vorgelegt.',
    },
    {
      titel: 'Freigabe & ERP',
      text: 'Sonderkonstruktionen laufen in ein bestell-blockierendes Freigabe-Gate. Erst danach wird das Angebot erzeugt und über die Schnittstelle ins ERP übertragen — der Prozess endet im System, nicht in einer Datei.',
    },
  ],
  metriken: [
    ['118', 'Parameter automatisch extrahiert'],
    ['5', 'automatische Stimmigkeitsprüfungen'],
    ['7', 'Seiten Auslegungs-PDF → fertiges Angebot in einem Fluss'],
  ] as [string, string][],
  /** Zahlenfreie Aussage neben den Kennzahlen. */
  zusatz: 'Vier-Augen-Gate für Sonderkonstruktionen inklusive.',
  anonymitaet:
    'Der Kunde wird auf eigenen Wunsch nicht genannt. Systemarchitektur, Prozessumfang und Referenzgespräch besprechen wir im direkten Austausch.',
};

/* ----------------------------------------------------------- 06 Vorgehen */

export const vorgehen = {
  h2: 'Vier Schritte. Keine Überraschungen.',
  schritte: [
    {
      titel: 'Audit',
      text: 'Wir analysieren den Prozess dort, wo er stattfindet: Datenquellen, Entscheidungspunkte, Ausnahmen, beteiligte Systeme, Verantwortlichkeiten. Ohne Annahmen, ohne Werkzeugvorauswahl.',
      ergebnis: 'Dokumentierter Ist-Prozess und bewertetes Potenzial',
    },
    {
      titel: 'Blueprint',
      text: 'Zielarchitektur, Datenmodell, Schnittstellen, Fehler- und Ausnahmepfade, Aufwand und Reihenfolge. Der Blueprint ist so detailliert, dass er auch von einem anderen Team umgesetzt werden könnte.',
      ergebnis: 'Technische Spezifikation und Umsetzungsplan',
    },
    {
      titel: 'Build',
      text: 'Entwicklung in überprüfbaren Abschnitten. Nach jedem Abschnitt steht etwas Lauffähiges — kein Big Bang, keine Blackbox. Integration in Ihre Systemlandschaft erfolgt begleitend, nicht am Ende.',
      ergebnis: 'Produktives System im Echtbetrieb',
    },
    {
      titel: 'Betrieb',
      text: 'Monitoring, Fehlerbehandlung, fachliche Anpassungen, Weiterentwicklung. Ein automatisierter Prozess ist kein Projekt mit Enddatum, sondern Infrastruktur.',
      ergebnis: 'Laufender Betrieb mit definierten Reaktionszeiten',
    },
  ],
};

/* -------------------------------------------------------------- 07 Offer */

export const offer = {
  h2: 'Wir arbeiten an wenigen Projekten gleichzeitig.',
  kapazitaetSatz: 'Wir starten nur wenige Projekte parallel — Qualität vor Volumen.',
  begruendung:
    'Prozessautomatisierung auf diesem Niveau lässt sich nicht parallelisieren. Jedes Projekt bindet Fachverständnis, das erst aufgebaut werden muss. Wir nehmen deshalb nur so viele Mandate an, wie wir vollständig begleiten können — vom Audit bis in den Betrieb.',

  qualifizierungTitel: 'Wir passen zusammen, wenn:',
  qualifizierung: [
    'Ihre Prozesse geschäftskritisch sind und nicht in Standardsoftware passen',
    'Ihre Kernprozesse dokumentiert sind oder dokumentierbar sind',
    'ein interner Ansprechpartner mit Prozesskenntnis verfügbar ist',
    'Sie ein System suchen, das in Produktion geht, kein Pilotprojekt',
  ],
  ausschluss:
    'Wir übernehmen keine Einzelmaßnahmen ohne Systemkontext und keine reinen Chatbot- oder Telefonassistenz-Projekte.',
  auditTitel: 'Das Prozess-Audit',
  auditText:
    'Jede Zusammenarbeit beginnt mit einem Audit. Wir sehen uns einen Ihrer Kernprozesse vollständig an und liefern eine belastbare Einschätzung — technisch, wirtschaftlich, priorisiert. Auch dann, wenn wir davon abraten.',
  auditDaten: [
    ['Umfang', 'Ein Kernprozess, vollständig durchleuchtet'],
    ['Beteiligte', 'Ihre Fachseite und ein Ansprechpartner mit Prozesskenntnis'],
    ['Ergebnis', 'Auditbericht mit Roadmap und Aufwandsschätzung'],
    ['Investition', 'Kostenfrei'],
  ] as [string, string][],
};

/* ------------------------------------------------------------ 08 Founder */

export const founder = {
  name: GRUENDER,
  rolle: `GRÜNDER · POZA-KI · ${STANDORT}`,
  register: [] as [string, string][],
  absaetze: [
    'Gründer von POZA-KI. Baut Unternehmenssoftware, digitale Plattformen und KI-gestützte Prozesse — dort, wo Prozesse zu spezifisch für Standardsoftware und zu wertvoll für Provisorien sind.',
    'Autodidakt, kein Informatikstudium, keine Konzernlaufbahn. Stattdessen Systeme, die in Produktion laufen.',
    'Porträtiert von ORF, APA, StartupValley und Kleine Zeitung.',
  ],
  linkedin: '#',
};

/* ---------------------------------------------------------------- 09 FAQ */

export const faq = {
  h2: 'Fragen, die vor jedem Projekt kommen.',
  eintraege: [
    {
      frage: 'Sind Sie eine Agentur?',
      antwort:
        'Nein. Wir sind eine Software-Manufaktur: Wir konzipieren, entwickeln und betreiben Systeme selbst — ERP, CRM, Plattformen, Automatisierung. KI ist eines von mehreren Mitteln, eingesetzt dort, wo sie nachweisbar nützt, und nicht dort, wo eine Regel genügt.',
    },
    {
      frage: 'Bauen Sie auch eigene Produkte?',
      antwort:
        'Ja. FREI, CABION und BelegFrei sind Produkte aus unserem Haus, die wir selbst betreiben. Sie sind der Grund, warum wir wissen, was ein System über Jahre kostet — nicht nur, was es in der Entwicklung kostet.',
    },
    {
      frage: 'Für welche Branchen arbeiten Sie?',
      antwort:
        'Branchenunabhängig. Entscheidend ist nicht die Branche, sondern ob ein Prozess klar abgrenzbar, regelbasiert beschreibbar und wiederkehrend ist. Bisherige Projekte liegen schwerpunktmäßig in Industrie und Fertigung.',
    },
    {
      frage: 'Was passiert mit unseren Daten?',
      antwort:
        'Verarbeitung erfolgt nach Vereinbarung — auf Wunsch vollständig in Ihrer Infrastruktur oder in EU-Rechenzentren. Auftragsverarbeitungsvertrag, Datenflussdokumentation und Löschkonzept sind Teil jedes Projekts.',
    },
    {
      frage: 'Wie lange dauert ein Projekt?',
      antwort:
        'Der Zeitraum bis zum produktiven System hängt vom Umfang ab und wird im Blueprint verbindlich festgelegt. Wir arbeiten in überprüfbaren Abschnitten — nach jedem steht etwas Lauffähiges, kein Big Bang am Ende.',
    },
    {
      frage: 'Was kostet das?',
      antwort:
        'Der Einstieg über das Prozess-Audit ist kostenfrei. Umsetzungsprojekte werden nach dem im Blueprint festgelegten Umfang kalkuliert, nicht nach einer Stundensatzschätzung vorab.',
    },
    {
      frage: 'Arbeiten Sie mit bestehenden Systemen oder ersetzen Sie sie?',
      antwort:
        'Wir integrieren. ERP, PLM, CRM und Fachanwendungen bleiben, wo sie sind. Automatisierung setzt an den Prozessen an, die zwischen diesen Systemen stattfinden — dort liegt in der Regel der manuelle Aufwand.',
    },
    {
      frage: 'Was, wenn sich Automatisierung bei uns nicht lohnt?',
      antwort:
        'Dann steht das im Auditbericht. Ein Audit, dessen Ergebnis von vornherein feststeht, wäre wertlos.',
    },
  ],
};

/* ------------------------------------------------------------- Kontakt */

export const kontakt = {
  h2: 'Sprechen wir über einen konkreten Prozess.',
  text:
    'Schreiben Sie uns, welcher Prozess in Ihrem Unternehmen aktuell die meiste manuelle Arbeit bindet. Wir melden uns mit einer ersten Einschätzung — nicht mit einem Angebot.',
  block: [
    ['E-Mail', EMAIL],
    ['Standort', STANDORT_LANG],
    ['Reichweite', 'Projekte im gesamten DACH-Raum'],
  ] as [string, string][],
};

export const SEKTIONEN = [
  'Hero',
  'Berichterstattung',
  'Position',
  'Leistungen',
  'Flagship Case',
  'Vorgehen',
  'Zusammenarbeit',
  'Gründer',
  'Häufige Fragen',
] as const;
