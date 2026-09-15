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
 * Setzt data-motion vor der Hydration, damit der Nutzer-Toggle aus dem Footer
 * nicht erst nach dem ersten Paint greift (sonst blitzt die Animation auf).
 */
const MOTION_INIT = `(function(){try{var m=localStorage.getItem('pozaki.motion');
if(m==='reduced'||m==='full'){document.documentElement.dataset.motion=m;}}catch(e){}})();`;

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
