import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://analysisday.com';
  
  const routes = [
    '',
    '/analysis',
    '/ai-analysis',
    '/pricing',
    '/faq',
    '/privacy',
    '/terms',
    '/kvkk',
    '/support',
  ];

  const staticPages = routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' || route === '/analysis' || route === '/ai-analysis' 
      ? 'daily' as const
      : 'weekly' as const,
    priority: route === '' ? 1.0 
      : route === '/analysis' || route === '/ai-analysis' ? 0.9
      : route === '/pricing' ? 0.8
      : 0.7,
  }));

  return staticPages;
}
