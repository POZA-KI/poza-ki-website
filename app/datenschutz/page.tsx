import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';
import { datenschutz } from '@/content/legal';

export const metadata: Metadata = {
  title: 'Datenschutzerklärung',
  description: 'Informationen zur Verarbeitung personenbezogener Daten nach DSGVO und DSG.',
  robots: { index: true, follow: true },
  alternates: { canonical: '/datenschutz' },
};

export default function Seite() {
  return (
    <LegalPage
      titel="Datenschutzerklärung"
      abschnitte={datenschutz.abschnitte}
      stand={datenschutz.stand}
    />
  );
}
