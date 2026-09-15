import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';
import { impressum } from '@/content/legal';

export const metadata: Metadata = {
  title: 'Impressum',
  description: 'Informationen gemäß § 5 E-Commerce-Gesetz (ECG) und § 25 Mediengesetz.',
  robots: { index: true, follow: true },
  alternates: { canonical: '/impressum' },
};

export default function Seite() {
  return (
    <LegalPage
      titel="Impressum"
      intro={impressum.intro}
      abschnitte={impressum.abschnitte}
      stand={impressum.stand}
    />
  );
}
