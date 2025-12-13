import React from "react";
import {
  Lightbulb,
  BookOpen,
  Target,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Quote,
} from "lucide-react";

// Blog içerik tipleri
export interface BlogSection {
  title: string;
  content: string | React.ReactNode;
  icon?: "lightbulb" | "book" | "target" | "chart" | "check" | "alert";
}

export interface BlogExample {
  title: string;
  description: string;
  highlight?: string;
}

export interface BlogKeyPoint {
  text: string;
  important?: boolean;
}

interface BlogArticleProps {
  introduction?: string;
  sections: BlogSection[];
  examples?: BlogExample[];
  keyPoints?: BlogKeyPoint[];
  conclusion?: string;
  quote?: {
    text: string;
    author: string;
  };
}

const iconMap = {
  lightbulb: Lightbulb,
  book: BookOpen,
  target: Target,
  chart: TrendingUp,
  check: CheckCircle2,
  alert: AlertCircle,
};

export function BlogArticle({
  introduction,
  sections,
  examples,
  keyPoints,
  conclusion,
  quote,
}: BlogArticleProps) {
  return (
    <div className="space-y-8">
      {/* Giriş Bölümü */}
      {introduction && (
        <div className="bg-linear-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-xl p-6 lg:p-8">
          <p className="text-lg lg:text-xl text-gray-200 leading-relaxed">
            {introduction}
          </p>
        </div>
      )}

      {/* Ana İçerik Bölümleri */}
      <div className="space-y-10">
        {sections.map((section, index) => {
          const Icon = section.icon ? iconMap[section.icon] : BookOpen;
          return (
            <div
              key={index}
              className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 lg:p-8 hover:border-emerald-500/30 transition-all duration-300"
            >
              {/* Bölüm Başlığı */}
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-emerald-500/20 p-2.5 rounded-lg">
                  <Icon className="h-6 w-6 text-emerald-400" />
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold text-white">
                  {section.title}
                </h2>
              </div>

              {/* Bölüm İçeriği */}
              <div className="text-gray-300 leading-relaxed text-base lg:text-lg space-y-4">
                {typeof section.content === "string" ? (
                  <div dangerouslySetInnerHTML={{ __html: section.content }} />
                ) : (
                  section.content
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Örnekler Bölümü */}
      {examples && examples.length > 0 && (
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Target className="h-6 w-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">
              Gerçek Hayattan Örnekler
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4 lg:gap-6">
            {examples.map((example, index) => (
              <div
                key={index}
                className="bg-slate-800/50 rounded-lg p-5 border border-slate-700/30 hover:border-blue-500/50 transition-all"
              >
                <h3 className="text-lg font-semibold text-blue-400 mb-2">
                  {example.title}
                </h3>
                <p className="text-gray-300 mb-3 leading-relaxed">
                  {example.description}
                </p>
                {example.highlight && (
                  <div className="bg-blue-500/10 border-l-4 border-blue-500 pl-4 py-2 rounded-r">
                    <p className="text-sm text-blue-300 font-medium">
                      {example.highlight}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Önemli Noktalar */}
      {keyPoints && keyPoints.length > 0 && (
        <div className="bg-linear-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <AlertCircle className="h-6 w-6 text-amber-400" />
            <h2 className="text-2xl font-bold text-white">Önemli Noktalar</h2>
          </div>

          <ul className="space-y-3">
            {keyPoints.map((point, index) => (
              <li key={index} className="flex items-start gap-3 text-gray-300">
                <CheckCircle2
                  className={`h-5 w-5 mt-0.5 shrink-0 ${
                    point.important ? "text-amber-400" : "text-emerald-400"
                  }`}
                />
                <span className="text-base lg:text-lg leading-relaxed">
                  {point.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Alıntı */}
      {quote && (
        <div className="relative bg-linear-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6 lg:p-8">
          <Quote className="absolute top-6 left-6 h-8 w-8 text-purple-400/30" />
          <div className="pl-12">
            <p className="text-xl lg:text-2xl text-gray-200 italic mb-4 leading-relaxed">
              &ldquo;{quote.text}&rdquo;
            </p>
            <p className="text-purple-400 font-medium">— {quote.author}</p>
          </div>
        </div>
      )}

      {/* Sonuç */}
      {conclusion && (
        <div className="bg-linear-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl p-6 lg:p-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4 flex items-center gap-3">
            <CheckCircle2 className="h-7 w-7 text-emerald-400" />
            Sonuç
          </h2>
          <p className="text-lg lg:text-xl text-gray-200 leading-relaxed">
            {conclusion}
          </p>
        </div>
      )}
    </div>
  );
}

// Yardımcı Bileşenler
export function ArticleList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 my-4">
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-3">
          <span className="text-emerald-400 font-bold mt-1">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function ArticleHighlight({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-emerald-500/10 border-l-4 border-emerald-500 pl-6 pr-4 py-4 my-4 rounded-r-lg">
      <p className="text-emerald-100 font-medium">{children}</p>
    </div>
  );
}

export function ArticleCode({ children }: { children: string }) {
  return (
    <code className="bg-slate-900 text-emerald-400 px-2 py-1 rounded text-sm font-mono">
      {children}
    </code>
  );
}

export function ArticleParagraph({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-gray-300 leading-relaxed mb-4 text-base lg:text-lg">
      {children}
    </p>
  );
}
