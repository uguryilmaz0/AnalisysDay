import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo.config';

export const metadata: Metadata = generatePageMetadata({
  title: 'Blog - Spor Analizi ve İstatistik Eğitim Rehberi',
  description: 'Spor analitiği, veri bilimi, istatistiksel metodoloji ve yapay zeka teknolojileri hakkında eğitici makaleler. Akademik yaklaşımla hazırlanmış uzman içerikler.',
  keywords: [
    'spor analizi eğitim',
    'spor istatistikleri rehber',
    'yapay zeka spor',
    'veri bilimi spor',
    'spor analitiği öğrenme',
    'istatistik metodoloji',
    'futbol analizi eğitim',
    'maç analizi rehber',
    'spor verisi eğitimi',
    'AI spor analizi',
    'spor veri bilimi',
    'istatistiksel analiz spor',
  ],
  path: '/blog',
});
