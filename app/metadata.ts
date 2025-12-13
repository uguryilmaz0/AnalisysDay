import { Metadata } from 'next';
import { generatePageMetadata, generateBreadcrumbSchema } from '@/lib/seo.config';

export const metadata: Metadata = generatePageMetadata({
  title: 'Yapay Zeka ile Maç Analizi ve Spor İstatistik Platformu - Analiz Günü',
  description: 'Yapay zeka destekli profesyonel maç analizi, spor istatistikleri ve oran analizi. Futbol analizi ve günlük maç tahminleri. Ücretsiz deneyin!',
  keywords: [
    'maç analizi',
    'yapay zeka maç analizi',
    'spor analizi',
    'oran analizi',
    'istatistik analizi',
    'futbol analizi',
    'maç tahmini',
    'yapay zeka tahmin',
    'spor istatistikleri',
    'günlük maç analizi',
    'profesyonel spor analizi',
    'veri odaklı maç analizi',
  ],
  path: '/',
});

export const homePageSchema = generateBreadcrumbSchema([
  { name: 'Ana Sayfa', url: 'https://analysisday.com' },
]);
