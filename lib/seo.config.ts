// SEO Metadata ve Schema.org yapılandırmaları
import { Metadata } from 'next';

export const siteConfig = {
  name: 'Analiz Günü',
  title: 'Analiz Günü - Yapay Zeka ile Maç Analizi ve Spor İstatistik Platformu',
  description: 'Yapay zeka destekli maç analizi, profesyonel spor istatistikleri ve oran analizi. Futbol alanındagünlük analizler ve tahminler.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://analysisday.com',
  ogImage: '/og-image.jpg',
  keywords: [
    // Ana keywords
    'maç analizi',
    'yapay zeka maç analizi',
    'spor analizi',
    'oran analizi',
    'istatistik analizi',
    
    // Spesifik keywords
    'futbol analizi',
    'maç tahmini',
    'yapay zeka tahmin',
    'spor istatistikleri',
    
    // Long-tail keywords
    'maç analizi yapay zeka',
    'günlük maç analizi',
    'profesyonel spor analizi',
    'oran analizi sistemi',
    'veri odaklı maç analizi',
    'istatistiksel maç tahmini',
    
    // Turkish specific
    'bahis analizi',
    'iddaa analizi',
    'canlı maç analizi',
    'maç sonucu tahmini',
  ],
  author: 'Analiz Günü',
  locale: 'tr_TR',
};

// JSON-LD Schema.org yapılandırması
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Analiz Günü',
  url: siteConfig.url,
  logo: `${siteConfig.url}/logo.png`,
  description: siteConfig.description,
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: 'destek@analizgunu.com',
  },
  sameAs: [
    // Sosyal medya linkleriniz
  ],
};

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.description,
  inLanguage: 'tr-TR',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

export const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Analiz Günü',
  applicationCategory: 'Sports Analytics Application',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'TRY',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '250',
  },
  description: siteConfig.description,
};

// Sayfa bazında metadata oluşturucu
export function generatePageMetadata({
  title,
  description,
  keywords,
  path = '',
  image,
}: {
  title: string;
  description: string;
  keywords?: string[];
  path?: string;
  image?: string;
}): Metadata {
  const url = `${siteConfig.url}${path}`;
  const ogImage = image || siteConfig.ogImage;

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: title,
      template: `%s | ${siteConfig.name}`,
    },
    description,
    keywords: keywords || siteConfig.keywords,
    authors: [{ name: siteConfig.author }],
    creator: siteConfig.author,
    publisher: siteConfig.author,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type: 'website',
      locale: siteConfig.locale,
      url,
      title,
      description,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      creator: '@analizgunu', // Twitter hesabınız varsa
    },
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

// FAQ Schema Generator
export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

// Article/Blog Schema Generator
export function generateArticleSchema({
  title,
  description,
  image,
  datePublished,
  dateModified,
  author = siteConfig.author,
}: {
  title: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    image,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Person',
      name: author,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/logo.png`,
      },
    },
  };
}

// Breadcrumb Schema Generator
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
