import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://www.vetaia.fr';
  const now = new Date();

  return [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/assistant`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/demo`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/login`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${base}/signup`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${base}/cgu`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/confidentialite`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ];
}
