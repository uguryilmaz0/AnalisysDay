import { Metadata } from 'next';
import { generatePageMetadata, generateBreadcrumbSchema } from '@/lib/seo.config';

export const metadata: Metadata = generatePageMetadata({
  title: 'Yapay Zeka Maç Analizi - AI Destekli Spor Tahminleri',
  description: 'Yapay zeka ve makine öğrenmesi ile gelişmiş maç analizi. AI destekli tahminler, otomatik istatistik değerlendirme ve yüksek doğruluk oranı.',
  keywords: [
    'yapay zeka maç analizi',
    'ai maç tahmini',
    'makine öğrenmesi spor',
    'yapay zeka tahmin',
    'ai spor analizi',
    'otomatik maç analizi',
    'akıllı tahmin sistemi',
    'deep learning maç analizi',
  ],
  path: '/ai-analysis',
});

export const aiAnalysisPageSchema = generateBreadcrumbSchema([
  { name: 'Ana Sayfa', url: 'https://analysisday.com' },
  { name: 'Yapay Zeka Analizi', url: 'https://analysisday.com/ai-analysis' },
]);
