import type { Metadata, Viewport } from 'next';
import { sans, mono } from './fonts';
import './globals.css';

const BESCHREIBUNG =
  'POZA-KI ist eine Software-Manufaktur auf Enterprise-Niveau: individuelle ERP- und CRM-Systeme, ' +
  'interne Unternehmenssoftware, digitale Plattformen und vollautomatisierte Prozesse mit KI. ' +
  'Konzipiert, entwickelt und betrieben aus Österreich.';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.poza-ki.com'),
  title: {
    default: 'POZA-KI — Software-Manufaktur für Unternehmenssoftware, Plattformen & KI',
    template: '%s — POZA-KI',
  },
  description: BESCHREIBUNG,
  applicationName: 'POZA-KI',
  authors: [{ name: 'Luis Zauchner' }],
  creator: 'Luis Zauchner',
  publisher: 'POZA-KI',
  keywords: [
    'Individualsoftware',
    'ERP-Entwicklung',
    'CRM-Entwicklung',
    'Unternehmenssoftware',
    'digitale Plattformen',
    'Prozessautomatisierung',
    'KI-Systeme',
    'Software-Manufaktur',
    'Österreich',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'de_AT',
    url: '/',
    siteName: 'POZA-KI',
    title: 'POZA-KI — Software, die Ihr Unternehmen trägt.',
    description: BESCHREIBUNG,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'POZA-KI — Software, die Ihr Unternehmen trägt.',
    description: BESCHREIBUNG,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
};

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#08090A',
  width: 'device-width',
  initialScale: 1,
};

/**
 * Loest die Bewegungseinstellung VOR dem ersten Paint auf und schreibt sie als
 * data-motion an das <html>. Reihenfolge: gespeicherte Wahl, sonst
 * Systemvorgabe, sonst der Standard "full".
 *
 * Das Attribut ist die massgebliche Quelle — fuer das CSS wie fuer React.
 * Vorher wurde es nur gesetzt, wenn eine gespeicherte Wahl existierte; ohne
 * Attribut entschied allein die Media Query, und der Toggle konnte eine
 * systemweit reduzierte Einstellung nicht ueberschreiben.
 */
const MOTION_INIT = `(function(){var m=null;try{m=localStorage.getItem('pozaki.motion');}catch(e){}
if(m!=='reduced'&&m!=='full'){m=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches?'reduced':'full';}
document.documentElement.dataset.motion=m;})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de-AT" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: MOTION_INIT }} />
      </head>
      <body>
        <a className="skip" href="#inhalt">
          Zum Inhalt springen
        </a>
        {children}
      </body>
    </html>
  );
}
