import { Metadata } from 'next';
import { generatePageMetadata, generateBreadcrumbSchema } from '@/lib/seo.config';

export const metadata: Metadata = generatePageMetadata({
  title: 'Günlük Maç Analizi - Profesyonel Spor İstatistikleri',
  description: 'Günlük maç analizleri, detaylı istatistikler ve oran değerlendirmeleri. Futbol alanında profesyonel analizler.',
  keywords: [
    'günlük maç analizi',
    'günlük spor analizi',
    'maç istatistikleri',
    'oran analizi',
    'detaylı maç analizi',
    'futbol maç analizi',
    'güncel maç analizleri',
  ],
  path: '/analysis',
});

export const analysisPageSchema = generateBreadcrumbSchema([
  { name: 'Ana Sayfa', url: 'https://analysisday.com' },
  { name: 'Maç Analizleri', url: 'https://analysisday.com/analysis' },
]);
