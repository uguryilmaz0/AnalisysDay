// Blog yazıları için tip tanımları
export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  content: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  image: string;
  category: BlogCategory;
  tags: string[];
  readTime: number; // dakika cinsinden
}

export type BlogCategory = 
  | 'mac-analizi'
  | 'yapay-zeka'
  | 'spor-istatistikleri'
  | 'oran-analizi'
  | 'stratejiler'
  | 'guncel';

export const blogCategories: Record<BlogCategory, { name: string; description: string }> = {
  'mac-analizi': {
    name: 'Maç Analizi',
    description: 'Detaylı maç analizleri ve değerlendirmeler',
  },
  'yapay-zeka': {
    name: 'Yapay Zeka',
    description: 'AI ve makine öğrenmesi ile spor analitiği',
  },
  'spor-istatistikleri': {
    name: 'Spor İstatistikleri',
    description: 'İstatistiksel analiz ve veri bilimi',
  },
  'oran-analizi': {
    name: 'Oran Analizi',
    description: 'Bahis oranları ve değer analizi',
  },
  'stratejiler': {
    name: 'Stratejiler',
    description: 'Analiz stratejileri ve metodolojiler',
  },
  'guncel': {
    name: 'Güncel',
    description: 'Güncel haberler ve gelişmeler',
  },
};
