import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const basis = 'https://www.poza-ki.com';
  const jetzt = new Date();
  return [
    { url: basis, lastModified: jetzt, changeFrequency: 'monthly', priority: 1 },
    { url: `${basis}/impressum`, lastModified: jetzt, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${basis}/datenschutz`, lastModified: jetzt, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
