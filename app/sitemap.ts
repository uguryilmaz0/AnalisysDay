import { MetadataRoute } from 'next';
import { allBlogPosts } from '@/lib/blogData';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://analizgunu.com';
  
  const routes = [
    '',
    '/analysis',
    '/ai-analysis',
    '/blog',
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
      : route === '/blog' ? 'weekly' as const
      : 'monthly' as const,
    priority: route === '' ? 1.0 
      : route === '/analysis' || route === '/ai-analysis' ? 0.9
      : route === '/pricing' ? 0.8
      : route === '/blog' ? 0.8
      : 0.7,
  }));

  // Blog yazıları
  const blogPages = allBlogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...blogPages];
}
