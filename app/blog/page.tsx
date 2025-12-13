"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Calendar,
  Clock,
  Tag,
  ArrowRight,
  Search,
  Brain,
  Target,
  TrendingUp,
  BarChart3,
  Database,
  BookOpen,
} from "lucide-react";
import { blogCategories } from "@/types/blog";
import type { BlogPost, BlogCategory } from "@/types/blog";
import { allBlogPosts } from "@/lib/blogData";
// Örnek blog yazıları (gerçek uygulamada database'den gelecek)
const blogPosts: BlogPost[] = [
  {
    slug: "yapay-zeka-spor-analizinde-nasil-kullanilir",
    title: "Yapay Zeka Spor Analizinde Nasıl Kullanılır?",
    description:
      "Yapay zeka ve makine öğrenmesi teknolojilerinin profesyonel spor analizinde kullanımı, veri işleme süreçleri ve istatistiksel modelleme yöntemleri hakkında eğitici bilgiler.",
    content: "",
    author: "Analiz Günü Araştırma Ekibi",
    publishedAt: "2024-12-10",
    image: "/blog/ai-analysis.jpg",
    category: "yapay-zeka",
    tags: ["yapay zeka", "makine öğrenmesi", "spor analizi", "veri bilimi"],
    readTime: 8,
  },
  {
    slug: "istatistiksel-analiz-yontemleri",
    title: "Sporda İstatistiksel Analiz Yöntemleri",
    description:
      "Futbol'da kullanılan istatistiksel analiz teknikleri, veri değerlendirme metodolojileri ve matematiksel modelleme yaklaşımları.",
    content: "",
    author: "Analiz Günü Araştırma Ekibi",
    publishedAt: "2024-12-08",
    image: "/blog/stats-methods.jpg",
    category: "spor-istatistikleri",
    tags: ["istatistik", "analiz", "metodoloji", "matematik"],
    readTime: 10,
  },
  {
    slug: "futbol-istatistikleri-okuma-rehberi",
    title: "Modern Futbol İstatistiklerini Anlama Rehberi",
    description:
      "xG (beklenen gol), pas ağları, pressing metrikleri ve diğer ileri düzey futbol istatistiklerini nasıl okuyup yorumlayacağınızı öğrenin. Eğitim amaçlı kapsamlı rehber.",
    content: "",
    author: "Analiz Günü Araştırma Ekibi",
    publishedAt: "2024-12-05",
    image: "/blog/football-stats.jpg",
    category: "spor-istatistikleri",
    tags: ["futbol", "istatistik", "xG", "eğitim"],
    readTime: 12,
  },
  {
    slug: "profesyonel-mac-analizi-egitimi",
    title: "Profesyonel Maç Analizi Eğitimi: 5 Temel Prensip",
    description:
      "Akademik ve bilimsel yaklaşımla maç analizi yapma sanatı. Veri toplama, istatistiksel değerlendirme ve objektif yorumlama teknikleri üzerine eğitim rehberi.",
    content: "",
    author: "Analiz Günü Araştırma Ekibi",
    publishedAt: "2024-12-03",
    image: "/blog/match-analysis-education.jpg",
    category: "mac-analizi",
    tags: ["maç analizi", "eğitim", "metodoloji", "akademik"],
    readTime: 6,
  },
  {
    slug: "veri-bilimi-spor-analitiginde",
    title: "Veri Bilimi ve Modern Spor Analitiği",
    description:
      "Python, R, SQL ve büyük veri teknolojileri ile spor verilerinin işlenmesi. Veri bilimciler ve spor analistleri için teknik eğitim içeriği.",
    content: "",
    author: "Analiz Günü Araştırma Ekibi",
    publishedAt: "2024-12-01",
    image: "/blog/data-science-sports.jpg",
    category: "spor-istatistikleri",
    tags: ["veri bilimi", "big data", "Python", "analitik"],
    readTime: 15,
  },
  {
    slug: "takım-performans-metrikleri",
    title: "Takım Performans Metrikleri ve Değerlendirme",
    description:
      "Takım performansını ölçmek için kullanılan modern metrikler, istatistiksel göstergeler ve karşılaştırmalı analiz yöntemleri hakkında bilgilendirici içerik.",
    content: "",
    author: "Analiz Günü Araştırma Ekibi",
    publishedAt: "2024-11-28",
    image: "/blog/team-metrics.jpg",
    category: "mac-analizi",
    tags: ["performans", "metrik", "takım analizi", "ölçüm"],
    readTime: 9,
  },
  {
    slug: "python-ile-spor-verisi-analizi",
    title: "Python ile Spor Verisi Analizi: Başlangıç Rehberi",
    description:
      "Python programlama dili kullanarak spor verilerini nasıl analiz edeceğinizi öğrenin. Pandas, NumPy ve Matplotlib kütüphaneleri ile pratik örnekler.",
    content: "",
    author: "Analiz Günü Araştırma Ekibi",
    publishedAt: "2024-11-22",
    image: "/blog/python-sports.jpg",
    category: "yapay-zeka",
    tags: ["Python", "programlama", "veri analizi", "tutorial"],
    readTime: 14,
  },
];

// Kategori iconları
const categoryIcons: Record<
  BlogCategory,
  React.ComponentType<{ className?: string }>
> = {
  "yapay-zeka": Brain,
  "mac-analizi": Target,
  "spor-istatistikleri": BarChart3,
  "oran-analizi": TrendingUp,
  stratejiler: BookOpen,
  guncel: Database,
};

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState<
    BlogCategory | "all"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory =
      selectedCategory === "all" || post.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Hero Section */}
      <section className="bg-linear-to-r from-emerald-600/10 to-blue-600/10 border-b border-emerald-500/20 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Spor Analizi ve İstatistik
              <span className="block text-emerald-400 mt-2">Eğitim Blog</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300">
              Spor analitiği, veri bilimi, istatistiksel metodoloji ve yapay
              zeka teknolojileri hakkında eğitici içerikler
            </p>
          </div>

          {/* Search Bar */}
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Blog yazılarında ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-emerald-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === "all"
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-800 text-gray-300 hover:bg-slate-700"
              }`}
            >
              Tümü
            </button>
            {(Object.keys(blogCategories) as BlogCategory[]).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-800 text-gray-300 hover:bg-slate-700"
                }`}
              >
                {blogCategories[category].name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">
                Aradığınız kriterlere uygun blog yazısı bulunamadı.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {filteredPosts.map((post) => (
                <article
                  key={post.slug}
                  className="bg-slate-800/50 rounded-xl overflow-hidden border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 group"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-slate-700 overflow-hidden">
                    {/* Icon ile placeholder */}
                    <div className="absolute inset-0 bg-linear-to-br from-emerald-500/20 to-blue-500/20 flex flex-col items-center justify-center">
                      {(() => {
                        const IconComponent = categoryIcons[post.category];
                        return (
                          <IconComponent className="h-16 w-16 text-emerald-400/60 mb-2" />
                        );
                      })()}
                      <span className="text-white/50 text-sm font-medium">
                        {blogCategories[post.category].name}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Category Badge with Icon */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded font-medium flex items-center gap-1">
                        {(() => {
                          const IconComponent = categoryIcons[post.category];
                          return <IconComponent className="h-3 w-3" />;
                        })()}
                        {blogCategories[post.category].name}
                      </span>
                      <span className="flex items-center gap-1 text-gray-400 text-xs">
                        <Clock className="h-3 w-3" />
                        {post.readTime} dk
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors line-clamp-2">
                      {post.title}
                    </h2>

                    {/* Description */}
                    <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                      {post.description}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(post.publishedAt).toLocaleDateString("tr-TR")}
                      </span>
                      <span>{post.author}</span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="flex items-center gap-1 text-xs text-gray-400 bg-slate-700/50 px-2 py-1 rounded"
                        >
                          <Tag className="h-3 w-3" />
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Read More */}
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium text-sm group/link"
                    >
                      Devamını Oku
                      <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 border-t border-slate-700/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Profesyonel Eğitim İçeriklerine Erişin
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Blog yazılarımızı beğendiniz mi? Premium üyelikle günlük analiz
            eğitimlerimize ve detaylı istatistik derslerimize sınırsız erişim
            sağlayın.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold transition-all"
          >
            Premium&apos;a Geçin
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
