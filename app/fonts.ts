import { Inter_Tight, IBM_Plex_Mono } from 'next/font/google';

/** next/font self-hostet die Dateien — kein Request an fonts.gstatic.com zur Laufzeit. */
export const sans = Inter_Tight({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});

export const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});
