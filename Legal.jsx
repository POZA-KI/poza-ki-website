import { useEffect } from "react";
import { Link } from "react-router-dom";

const C = {
  bg: "#050507", dark: "#0a0a0f", smoke: "#111118",
  line: "rgba(255,255,255,0.06)", line2: "rgba(255,255,255,0.12)",
  dim: "rgba(255,255,255,0.25)", mid: "rgba(255,255,255,0.5)",
  light: "rgba(255,255,255,0.7)", white: "rgba(255,255,255,0.93)",
  gold: "#c8a44e",
};
const BF = "'Syne', sans-serif";
const MF = "'Space Grotesk', monospace";

function LegalLayout({ title, children }) {
  useEffect(() => {
    window.scrollTo(0, 0);
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Space+Grotesk:wght@300;400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    const style = document.createElement("style");
    style.textContent = `html, body, #root { background: #050507 !important; margin: 0; padding: 0; } * { box-sizing: border-box; }`;
    document.head.appendChild(style);
    return () => { document.head.removeChild(link); document.head.removeChild(style); };
  }, []);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: C.bg, color: C.light, fontFamily: MF }}>
      {/* Header */}
      <div style={{ padding: "24px 40px", borderBottom: `1px solid ${C.line}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link to="/" style={{ textDecoration: "none", color: C.white, fontFamily: BF, fontSize: 18, fontWeight: 700, letterSpacing: 2 }}>
          POZA-KI
        </Link>
        <Link to="/" style={{ fontFamily: MF, fontSize: 12, color: C.mid, textDecoration: "none", letterSpacing: 1 }}>
          ← Zurück zur Startseite
        </Link>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "60px 24px 100px" }}>
        <h1 style={{ fontFamily: BF, fontSize: 32, fontWeight: 700, color: C.gold, marginBottom: 8 }}>{title}</h1>
        <div style={{ width: 60, height: 2, backgroundColor: C.gold, marginBottom: 40 }} />
        <div style={{ fontSize: 14, lineHeight: 1.9, color: C.light }}>
          {children}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: "30px 40px", borderTop: `1px solid ${C.line}`, display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
        {[{l:"Impressum",p:"/impressum"},{l:"Datenschutz",p:"/datenschutz"},{l:"AGB",p:"/agb"}].map(i => (
          <Link key={i.l} to={i.p} style={{ fontFamily: MF, fontSize: 11, letterSpacing: 2, color: C.dim, textDecoration: "none", textTransform: "uppercase" }}>{i.l}</Link>
        ))}
      </div>
    </div>
  );
}

const H2 = ({children}) => <h2 style={{ fontFamily: BF, fontSize: 20, fontWeight: 600, color: C.white, marginTop: 40, marginBottom: 12 }}>{children}</h2>;
const H3 = ({children}) => <h3 style={{ fontFamily: BF, fontSize: 16, fontWeight: 600, color: C.white, marginTop: 24, marginBottom: 8 }}>{children}</h3>;
const P = ({children}) => <p style={{ marginBottom: 12 }}>{children}</p>;
const UL = ({children}) => <ul style={{ paddingLeft: 20, marginBottom: 12 }}>{children}</ul>;
const LI = ({children}) => <li style={{ marginBottom: 6 }}>{children}</li>;

// ============================================================
// IMPRESSUM
// ============================================================
export function Impressum() {
  return (
    <LegalLayout title="Impressum">
      <H2>Informationen gemäß § 5 E-Commerce-Gesetz (ECG) und § 25 Mediengesetz</H2>

      <H3>Unternehmensbezeichnung</H3>
      <P>POZA-KI<br/>Luis Zauchner<br/>Eichenweg 3<br/>9871 Seeboden am Millstättersee<br/>Österreich</P>

      <H3>Kontakt</H3>
      <P>Telefon: +43 650 380 2309<br/>E-Mail: kontakt@poza-ki.com<br/>Website: www.poza-ki.com</P>

      <H3>Unternehmensgegenstand</H3>
      <P>IT-Dienstleistungen, KI-Automatisierung und Entwicklung von KI-gestützten Telefonassistenten für Unternehmen.</P>

      <H3>Rechtsform</H3>
      <P>Einzelunternehmen</P>

      <H3>Umsatzsteuerhinweis</H3>
      <P>Kleinunternehmer gemäß § 6 Abs. 1 Z 27 UStG. Es wird keine Umsatzsteuer ausgewiesen.</P>

      <H3>Zuständige Behörde</H3>
      <P>Bezirkshauptmannschaft Spittal an der Drau</P>

      <H3>Anwendbare Rechtsvorschriften</H3>
      <P>Gewerbeordnung (GewO), E-Commerce-Gesetz (ECG), Datenschutzgesetz (DSG), Datenschutz-Grundverordnung (DSGVO). Zugang über: <a href="https://www.ris.bka.gv.at" target="_blank" rel="noopener" style={{ color: C.gold }}>ris.bka.gv.at</a></P>

      <H3>Online-Streitbeilegung</H3>
      <P>Verbraucher haben die Möglichkeit, Beschwerden an die Online-Streitbeilegungsplattform der EU zu richten: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener" style={{ color: C.gold }}>ec.europa.eu/consumers/odr</a>. Unsere E-Mail-Adresse: kontakt@poza-ki.com</P>

      <H3>Haftung für Inhalte</H3>
      <P>Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte wird jedoch keine Gewähr übernommen. Als Diensteanbieter sind wir gemäß § 7 Abs. 1 ECG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.</P>

      <H3>Haftung für Links</H3>
      <P>Diese Website enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter verantwortlich. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.</P>

      <H3>Urheberrecht</H3>
      <P>Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem österreichischen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des Autors.</P>

      <P style={{ marginTop: 40, color: C.dim, fontSize: 12 }}>Stand: Februar 2026</P>
    </LegalLayout>
  );
}

// ============================================================
// DATENSCHUTZ
// ============================================================
export function Datenschutz() {
  return (
    <LegalLayout title="Datenschutzerklärung">
      <H2>1. Verantwortlicher</H2>
      <P>POZA-KI — Luis Zauchner<br/>Eichenweg 3, 9871 Seeboden am Millstättersee, Österreich<br/>E-Mail: kontakt@poza-ki.com<br/>Telefon: +43 650 380 2309</P>

      <H2>2. Erhebung und Verarbeitung personenbezogener Daten</H2>
      <P>Wir erheben und verarbeiten personenbezogene Daten nur im Einklang mit der Datenschutz-Grundverordnung (DSGVO) und dem österreichischen Datenschutzgesetz (DSG).</P>

      <H3>2.1 Beim Besuch der Website</H3>
      <P>Beim Aufrufen unserer Website werden automatisch folgende Daten erhoben (Server-Logfiles):</P>
      <UL>
        <LI>IP-Adresse (anonymisiert)</LI>
        <LI>Datum und Uhrzeit des Zugriffs</LI>
        <LI>Aufgerufene Seite / URL</LI>
        <LI>Referrer-URL (zuvor besuchte Seite)</LI>
        <LI>Verwendeter Browser und Betriebssystem</LI>
      </UL>
      <P>Rechtsgrundlage: Berechtigtes Interesse (Art. 6 Abs. 1 lit. f DSGVO) zur Sicherstellung des technischen Betriebs der Website.</P>

      <H3>2.2 Kontaktaufnahme</H3>
      <P>Wenn Sie uns per E-Mail, Telefon oder über ein Buchungsformular kontaktieren, verarbeiten wir die von Ihnen übermittelten Daten (Name, E-Mail, Telefonnummer, Nachricht) zur Bearbeitung Ihrer Anfrage. Rechtsgrundlage: Vertragserfüllung bzw. vorvertragliche Maßnahmen (Art. 6 Abs. 1 lit. b DSGVO).</P>

      <H3>2.3 Terminbuchung (Cal.com)</H3>
      <P>Für die Terminbuchung nutzen wir den Dienst Cal.com (Cal.com Inc.). Bei einer Buchung werden Name, E-Mail-Adresse und optionale Nachricht an Cal.com übermittelt. Datenschutzerklärung von Cal.com: <a href="https://cal.com/privacy" target="_blank" rel="noopener" style={{ color: C.gold }}>cal.com/privacy</a></P>
      <P>Rechtsgrundlage: Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO).</P>

      <H3>2.4 KI-Telefonassistent</H3>
      <P>Im Rahmen unserer Dienstleistung betreiben wir KI-gestützte Telefonassistenten für unsere Kunden. Dabei werden folgende Daten verarbeitet:</P>
      <UL>
        <LI>Telefonnummer des Anrufers</LI>
        <LI>Gesprächsinhalte (Transkription)</LI>
        <LI>Gesprächsaufzeichnungen (sofern aktiviert)</LI>
        <LI>Terminbuchungsdaten</LI>
      </UL>
      <P>Anrufer werden zu Gesprächsbeginn über die KI-gestützte Verarbeitung informiert. Aufzeichnungen werden verschlüsselt gespeichert und nach der vereinbarten Aufbewahrungsfrist gelöscht (Standard: 90 Tage). Alle Datenverarbeitungen erfolgen innerhalb der EU/EWR.</P>
      <P>Rechtsgrundlage: Auftragsverarbeitung gem. Art. 28 DSGVO im Auftrag des jeweiligen Kunden.</P>

      <H2>3. Hosting</H2>
      <P>Diese Website wird bei Vercel Inc. (340 S Lemon Ave #4133, Walnut, CA 91789, USA) gehostet. Vercel kann beim Aufruf der Website Server-Logfiles erheben. Vercel ist unter dem EU-US Data Privacy Framework zertifiziert. Datenschutzerklärung: <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener" style={{ color: C.gold }}>vercel.com/legal/privacy-policy</a></P>

      <H2>4. Cookies und Tracking</H2>
      <P>Diese Website verwendet technisch notwendige Cookies, die für den Betrieb der Seite erforderlich sind. Darüber hinaus setzen wir Analyse- und Marketing-Cookies nur mit Ihrer ausdrücklichen Einwilligung ein.</P>

      <H3>4.1 Meta Pixel (Facebook/Instagram)</H3>
      <P>Mit Ihrer Einwilligung verwenden wir das Meta Pixel (Meta Platforms Ireland Ltd.) zur Messung der Wirksamkeit von Werbeanzeigen und zur Erstellung von Zielgruppen. Dabei können Daten in die USA übertragen werden (EU-US Data Privacy Framework). Sie können Ihre Einwilligung jederzeit über den Cookie-Banner widerrufen.</P>
      <P>Rechtsgrundlage: Einwilligung (Art. 6 Abs. 1 lit. a DSGVO).</P>

      <H2>5. Ihre Rechte</H2>
      <P>Sie haben jederzeit folgende Rechte bezüglich Ihrer personenbezogenen Daten:</P>
      <UL>
        <LI><strong>Auskunft</strong> (Art. 15 DSGVO) — Welche Daten wir über Sie gespeichert haben</LI>
        <LI><strong>Berichtigung</strong> (Art. 16 DSGVO) — Korrektur unrichtiger Daten</LI>
        <LI><strong>Löschung</strong> (Art. 17 DSGVO) — Löschung Ihrer Daten</LI>
        <LI><strong>Einschränkung</strong> (Art. 18 DSGVO) — Einschränkung der Verarbeitung</LI>
        <LI><strong>Datenübertragbarkeit</strong> (Art. 20 DSGVO) — Übertragung Ihrer Daten</LI>
        <LI><strong>Widerspruch</strong> (Art. 21 DSGVO) — Widerspruch gegen die Verarbeitung</LI>
        <LI><strong>Widerruf der Einwilligung</strong> (Art. 7 Abs. 3 DSGVO)</LI>
      </UL>
      <P>Zur Ausübung Ihrer Rechte kontaktieren Sie uns unter: kontakt@poza-ki.com</P>

      <H2>6. Beschwerderecht</H2>
      <P>Sie haben das Recht, eine Beschwerde bei der österreichischen Datenschutzbehörde einzureichen:</P>
      <P>Österreichische Datenschutzbehörde<br/>Barichgasse 40-42, 1030 Wien<br/><a href="https://www.dsb.gv.at" target="_blank" rel="noopener" style={{ color: C.gold }}>www.dsb.gv.at</a></P>

      <H2>7. Datensicherheit</H2>
      <P>Wir setzen technische und organisatorische Sicherheitsmaßnahmen ein, um Ihre Daten gegen Manipulation, Verlust, Zerstörung oder Zugriff unberechtigter Personen zu schützen. Unsere Sicherheitsmaßnahmen werden entsprechend der technologischen Entwicklung fortlaufend verbessert. Die Datenübertragung erfolgt verschlüsselt über TLS/SSL.</P>

      <H2>8. Aufbewahrungsfristen</H2>
      <P>Personenbezogene Daten werden gelöscht, sobald der Zweck der Verarbeitung entfällt und keine gesetzlichen Aufbewahrungspflichten entgegenstehen. Für steuerlich relevante Unterlagen gilt die gesetzliche Aufbewahrungsfrist von 7 Jahren (§ 132 BAO).</P>

      <H2>9. Änderungen</H2>
      <P>Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf anzupassen, um sie an geänderte Rechtslagen oder Änderungen des Dienstes anzupassen.</P>

      <P style={{ marginTop: 40, color: C.dim, fontSize: 12 }}>Stand: Februar 2026</P>
    </LegalLayout>
  );
}

// ============================================================
// AGB
// ============================================================
export function AGB() {
  return (
    <LegalLayout title="Allgemeine Geschäftsbedingungen">
      <H2>1. Geltungsbereich</H2>
      <P>Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Geschäftsbeziehungen zwischen POZA-KI (Luis Zauchner, Eichenweg 3, 9871 Seeboden am Millstättersee) — nachfolgend "Auftragnehmer" — und dem Kunden — nachfolgend "Auftraggeber". Abweichende AGB des Auftraggebers werden nicht anerkannt, es sei denn, der Auftragnehmer stimmt ihrer Geltung ausdrücklich schriftlich zu.</P>

      <H2>2. Leistungsgegenstand</H2>
      <P>Der Auftragnehmer erbringt KI-Automatisierungsdienstleistungen, insbesondere die Bereitstellung, Konfiguration und den Betrieb von KI-gestützten Telefonassistenten. Der genaue Leistungsumfang ergibt sich aus dem jeweiligen Angebot bzw. der Auftragsbestätigung.</P>

      <H2>3. Vertragsabschluss</H2>
      <P>Der Vertrag kommt durch schriftliche Auftragsbestätigung (E-Mail ausreichend) oder durch Beginn der Leistungserbringung zustande. Angebote des Auftragnehmers sind 30 Tage gültig, sofern nicht anders angegeben.</P>

      <H2>4. Preise und Zahlung</H2>
      <P>Alle Preise verstehen sich in Euro. Gemäß § 6 Abs. 1 Z 27 UStG wird keine Umsatzsteuer ausgewiesen (Kleinunternehmerregelung). Zahlungsziel: 14 Tage netto ab Rechnungsdatum. Bei Zahlungsverzug werden Verzugszinsen in gesetzlicher Höhe (9,2% p.a. über dem Basiszinssatz für Unternehmer gem. § 456 UGB) berechnet. Zusätzlich wird eine Mahnpauschale von € 40,00 gem. § 458 UGB erhoben.</P>

      <H2>5. Vertragslaufzeit und Kündigung</H2>
      <P>Sofern nicht anders vereinbart, wird der Vertrag auf unbestimmte Dauer abgeschlossen. Die monatliche Abrechnung erfolgt im Voraus. Der Vertrag ist monatlich kündbar, jeweils zum Monatsende, mit einer Kündigungsfrist von 30 Tagen. Die Kündigung bedarf der Schriftform (E-Mail ausreichend).</P>
      <P>Jede Partei kann den Vertrag fristlos kündigen, wenn die andere Partei gegen wesentliche Vertragspflichten verstößt und trotz schriftlicher Abmahnung mit angemessener Fristsetzung (mindestens 14 Tage) keine Abhilfe schafft.</P>

      <H2>6. Mitwirkungspflichten des Auftraggebers</H2>
      <P>Der Auftraggeber stellt alle für die Leistungserbringung erforderlichen Informationen, Zugänge und Materialien rechtzeitig bereit. Der Auftraggeber benennt einen Ansprechpartner mit Entscheidungskompetenz. Verzögerungen, die auf mangelnde Mitwirkung zurückzuführen sind, gehen nicht zu Lasten des Auftragnehmers.</P>

      <H2>7. Verfügbarkeit und Support</H2>
      <P>Der Auftragnehmer bemüht sich um eine hohe Verfügbarkeit der Dienste, kann jedoch keine 100%ige Verfügbarkeit garantieren. Geplante Wartungsarbeiten werden nach Möglichkeit vorab angekündigt. Support-Anfragen werden während der Geschäftszeiten (Mo–Fr, 09:00–17:00 CEST) bearbeitet.</P>

      <H2>8. Haftung</H2>
      <P>Der Auftragnehmer haftet für Schäden nach den gesetzlichen Bestimmungen, mit folgenden Einschränkungen:</P>
      <UL>
        <LI>Die Haftung für entgangenen Gewinn, mittelbare Schäden und Folgeschäden ist ausgeschlossen, sofern kein Vorsatz oder grobe Fahrlässigkeit vorliegt.</LI>
        <LI>Die Gesamthaftung ist auf die Höhe der vom Auftraggeber in den letzten 12 Monaten geleisteten Zahlungen beschränkt.</LI>
        <LI>Der Auftragnehmer haftet nicht für Ausfälle oder Fehler bei Drittanbietern (z.B. Telefonanbieter, Cloud-Infrastruktur).</LI>
        <LI>Der Auftragnehmer übernimmt keine Haftung für die inhaltliche Richtigkeit der vom KI-System gegebenen Antworten.</LI>
      </UL>

      <H2>9. Datenschutz</H2>
      <P>Die Verarbeitung personenbezogener Daten erfolgt gemäß unserer Datenschutzerklärung und im Einklang mit der DSGVO. Bei Auftragsverarbeitung wird ein gesonderter Auftragsverarbeitungsvertrag (AVV) abgeschlossen.</P>

      <H2>10. Geheimhaltung</H2>
      <P>Beide Parteien verpflichten sich, alle im Rahmen der Zusammenarbeit erlangten vertraulichen Informationen und Geschäftsgeheimnisse streng vertraulich zu behandeln. Diese Verpflichtung gilt auch nach Beendigung des Vertragsverhältnisses fort.</P>

      <H2>11. Geistiges Eigentum</H2>
      <P>Alle vom Auftragnehmer erstellten Konzepte, Konfigurationen und Workflows verbleiben im geistigen Eigentum des Auftragnehmers, sofern nicht anders vereinbart. Der Auftraggeber erhält ein einfaches, nicht übertragbares Nutzungsrecht für die Dauer des Vertragsverhältnisses.</P>

      <H2>12. Preisanpassung</H2>
      <P>Der Auftragnehmer ist berechtigt, Preise maximal einmal jährlich im Rahmen des österreichischen Verbraucherpreisindex (VPI) anzupassen. Preisanpassungen werden mindestens 30 Tage vor Inkrafttreten schriftlich mitgeteilt.</P>

      <H2>13. Schlussbestimmungen</H2>
      <P>Es gilt ausschließlich österreichisches Recht unter Ausschluss des UN-Kaufrechts. Gerichtsstand ist das sachlich zuständige Gericht in Spittal an der Drau, Österreich. Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt. Änderungen dieser AGB bedürfen der Schriftform.</P>

      <P style={{ marginTop: 40, color: C.dim, fontSize: 12 }}>Stand: Februar 2026</P>
    </LegalLayout>
  );
}
