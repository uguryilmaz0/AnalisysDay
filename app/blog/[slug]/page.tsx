"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { use } from "react";
import {
  Calendar,
  Clock,
  Tag,
  User,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { blogCategories } from "@/types/blog";
import { allBlogPosts } from "@/lib/blogData";
import { BlogArticle } from "@/components/blog/BlogArticle";
import {
  aiInSportsArticle,
  statsGuideArticle,
  footballStatsGuide,
  matchAnalysisTraining,
  teamPerformanceMetrics,
  pythonSportsDataAnalysis,
  dataScienceInSports,
} from "@/lib/blogArticles";

// Makale içerik haritası
const articleContentMap: Record<string, typeof aiInSportsArticle> = {
  "yapay-zeka-spor-analizinde-nasil-kullanilir": aiInSportsArticle,
  "istatistiksel-analiz-yontemleri": statsGuideArticle,
  "futbol-istatistikleri-okuma-rehberi": footballStatsGuide,
  "profesyonel-mac-analizi-egitimi": matchAnalysisTraining,
  "takım-performans-metrikleri": teamPerformanceMetrics,
  "python-ile-spor-verisi-analizi": pythonSportsDataAnalysis,
  "veri-bilimi-spor-analitiginde": dataScienceInSports,
};

export default function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = use(params);

  // URL-encoded slug'u decode et (Türkçe karakterler için)
  const slug = decodeURIComponent(rawSlug);

  const post = allBlogPosts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = allBlogPosts
    .filter((p) => p.slug !== post.slug && p.category === post.category)
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Back Button */}
      <div className="border-b border-slate-700/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Blog&apos;a Dön
          </Link>
        </div>
      </div>

      {/* Article Header */}
      <article className="py-8 lg:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Badge */}
          <div className="mb-4">
            <span className="inline-block bg-emerald-500/20 text-emerald-400 text-sm px-3 py-1 rounded-full font-medium">
              {blogCategories[post.category].name}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            {post.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 md:gap-6 text-gray-400 text-sm mb-8 pb-8 border-b border-slate-700/50">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(post.publishedAt).toLocaleDateString("tr-TR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{post.readTime} dakika okuma</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            {post.description}
          </p>

          {/* Yapılandırılmış İçerik */}
          {articleContentMap[post.slug] ? (
            <BlogArticle
              introduction={articleContentMap[post.slug].introduction}
              sections={articleContentMap[post.slug].sections}
              examples={articleContentMap[post.slug].examples}
              keyPoints={articleContentMap[post.slug].keyPoints}
              quote={articleContentMap[post.slug].quote}
              conclusion={articleContentMap[post.slug].conclusion}
            />
          ) : (
            // Eski HTML content için fallback
            <div className="prose prose-invert prose-lg prose-emerald max-w-none">
              <div
                className="text-gray-300 leading-relaxed space-y-6"
                dangerouslySetInnerHTML={{
                  __html: post.content
                    .split("\n\n")
                    .map((paragraph) => {
                      // Başlıkları işle
                      if (paragraph.startsWith("# ")) {
                        return `<h1 class="text-3xl font-bold text-white mt-8 mb-4">${paragraph.slice(
                          2
                        )}</h1>`;
                      }
                      if (paragraph.startsWith("## ")) {
                        return `<h2 class="text-2xl font-bold text-emerald-400 mt-6 mb-3">${paragraph.slice(
                          3
                        )}</h2>`;
                      }
                      if (paragraph.startsWith("### ")) {
                        return `<h3 class="text-xl font-semibold text-white mt-4 mb-2">${paragraph.slice(
                          4
                        )}</h3>`;
                      }
                      // Kod bloklarını işle
                      if (paragraph.includes("```")) {
                        const codeMatch = paragraph.match(
                          /```(\w+)?\n([\s\S]*?)```/
                        );
                        if (codeMatch) {
                          const language = codeMatch[1] || "text";
                          const code = codeMatch[2];
                          return `<pre class="bg-slate-800/80 border border-emerald-500/20 rounded-lg p-4 overflow-x-auto my-4"><code class="language-${language} text-sm text-gray-300">${code
                            .replace(/</g, "&lt;")
                            .replace(/>/g, "&gt;")}</code></pre>`;
                        }
                      }
                      // Liste elemanlarını işle
                      if (paragraph.startsWith("- ")) {
                        const items = paragraph
                          .split("\n")
                          .filter((line) => line.trim())
                          .map(
                            (line) => `<li class="ml-4">${line.slice(2)}</li>`
                          )
                          .join("");
                        return `<ul class="list-disc list-inside space-y-1 my-3">${items}</ul>`;
                      }
                      // Bold metinleri işle
                      let processed = paragraph.replace(
                        /\*\*(.*?)\*\*/g,
                        '<strong class="font-semibold text-emerald-400">$1</strong>'
                      );
                      // Inline code işle
                      processed = processed.replace(
                        /`([^`]+)`/g,
                        '<code class="bg-slate-800/60 px-1.5 py-0.5 rounded text-emerald-300 text-sm">$1</code>'
                      );
                      return `<p class="my-3">${processed}</p>`;
                    })
                    .join(""),
                }}
              />
            </div>
          )}

          {/* Tags */}
          <div className="mt-12 pt-8 border-t border-slate-700/50">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 text-sm text-gray-400 bg-slate-800/50 px-3 py-1 rounded-lg border border-emerald-500/20"
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-12 border-t border-slate-700/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              İlgili Yazılar
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.slug}
                  href={`/blog/${relatedPost.slug}`}
                  className="bg-slate-800/50 rounded-lg p-6 border border-emerald-500/20 hover:border-emerald-500/40 transition-all group"
                >
                  <span className="text-emerald-400 text-xs font-medium mb-2 block">
                    {blogCategories[relatedPost.category].name}
                  </span>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                    {relatedPost.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {relatedPost.description}
                  </p>
                  <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                    Devamını Oku
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 border-t border-slate-700/50 bg-linear-to-r from-emerald-600/10 to-blue-600/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Profesyonel Analiz Eğitimlerine Erişin
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Günlük AI destekli spor analizi eğitimleri ve detaylı istatistiksel
            metodoloji dersleriyle bilginizi geliştirin.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold transition-all"
            >
              Ücretsiz Başla
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-semibold border border-emerald-500/30 hover:border-emerald-500 transition-all"
            >
              Fiyatları İncele
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
