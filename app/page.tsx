"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Trophy, Target, Users, ArrowRight } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [terminalPage, setTerminalPage] = useState(1); // 1 or 2
  const [typedText, setTypedText] = useState("");
  const [lineIndex, setLineIndex] = useState(0);

  // Kullanıcı giriş yapmışsa /analysis'e yönlendir
  useEffect(() => {
    if (!loading && user) {
      router.push("/analysis");
    }
  }, [user, loading, router]);

  // Terminal lines for page 1 (Database/Analytics)
  const page1Lines = [
    { type: "command", text: "npm run analyze", delay: 50 },
    { type: "output", text: "✓ Loading database: 10,000+ matches", delay: 30 },
    { type: "output", text: "✓ Processing statistics...", delay: 30 },
    { type: "output", text: "✓ Calculating accuracy: 94.2%", delay: 30 },
    {
      type: "code",
      text: 'import { Database, Stats } from "@analysisday/core"',
      delay: 20,
    },
    { type: "code", text: "export const analyze = () => {", delay: 20 },
    { type: "code", text: "  return <Analytics realtime>", delay: 20 },
    { type: "code", text: "    <Dashboard stats={matchStats} />", delay: 20 },
    { type: "code", text: "  </Analytics>", delay: 20 },
    { type: "code", text: "}", delay: 20 },
    { type: "success", text: "SUCCESS Deployed: analysisday.com", delay: 30 },
  ];

  // Terminal lines for page 2 (AI/ML)
  const page2Lines = [
    {
      type: "command",
      text: "python train_model.py --mode prediction",
      delay: 50,
    },
    { type: "output", text: "✓ Loading neural network model...", delay: 30 },
    { type: "output", text: "✓ Training dataset: 730,000 matches", delay: 30 },
    { type: "output", text: "✓ Accuracy improvement: +3.2%", delay: 30 },
    {
      type: "code",
      text: "from analysisday.ml import NeuralPredictor",
      delay: 20,
    },
    {
      type: "code",
      text: "model = NeuralPredictor(layers=[128, 64, 32])",
      delay: 20,
    },
    { type: "code", text: "model.train(epochs=100, batch_size=32)", delay: 20 },
    {
      type: "code",
      text: "predictions = model.predict(upcoming_matches)",
      delay: 20,
    },
    {
      type: "code",
      text: "confidence = model.get_confidence_score()",
      delay: 20,
    },
    { type: "success", text: "AI Model Ready • Confidence: 96.8%", delay: 30 },
  ];

  const currentLines = terminalPage === 1 ? page1Lines : page2Lines;

  // Character-by-character typing animation
  useEffect(() => {
    if (lineIndex >= currentLines.length) {
      // Finished all lines, wait then switch page or restart
      const timer = setTimeout(() => {
        if (terminalPage === 1) {
          // Switch to page 2
          setTerminalPage(2);
          setLineIndex(0);
          setTypedText("");
        } else {
          // Restart from page 1
          setTerminalPage(1);
          setLineIndex(0);
          setTypedText("");
        }
      }, 2000);
      return () => clearTimeout(timer);
    }

    const currentLine = currentLines[lineIndex];
    const fullText = currentLine.text;

    if (typedText.length < fullText.length) {
      // Continue typing current line
      const timer = setTimeout(() => {
        setTypedText(typedText + fullText[typedText.length]);
      }, currentLine.delay);
      return () => clearTimeout(timer);
    } else {
      // Line finished, move to next line after a pause
      const timer = setTimeout(() => {
        setLineIndex(lineIndex + 1);
        setTypedText("");
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [typedText, lineIndex, currentLines, terminalPage]);

  // Loading veya authenticated ise boş ekran göster (flash önleme)
  if (loading || user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <section className="bg-linear-to-br from-slate-900 via-blue-900 to-slate-900 text-white relative overflow-hidden">
        {/* Arka plan deseni */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Sol Taraf - Metin */}
            <div className="space-y-6">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                Spor İstatistik Analizi ve
                <span className="block text-emerald-400 mt-2">
                  Veri Okuma Eğitimi
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                Profesyonel spor analizleri ve istatistiksel değerlendirme
                eğitimi. Detaylı veri analizi metodolojileri, güncel
                istatistikler ve teknik analiz stratejileri öğrenin.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/register"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  Üye Ol
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/analysis"
                  className="bg-slate-800 hover:bg-slate-700 border-2 border-emerald-500/50 text-white px-6 py-3 rounded-lg font-semibold transition-all hover:border-emerald-500 flex items-center justify-center gap-2"
                >
                  İçerikleri İncele
                  <Trophy className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Sağ Taraf - Terminal Animation */}
            <div className="relative w-full lg:max-w-lg mx-auto lg:ml-auto lg:mr-0">
              {/* Aurora Background */}
              <div className="absolute inset-0 opacity-60">
                <div className="absolute inset-0 bg-linear-to-br from-emerald-500/20 via-blue-500/20 to-purple-500/20 blur-3xl animate-pulse"></div>
              </div>

              {/* Terminal Window */}
              <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-xl shadow-2xl overflow-hidden border border-emerald-500/30">
                {/* Terminal Header */}
                <div className="bg-slate-800/80 px-4 py-3 flex items-center border-b border-slate-700">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="mx-auto text-xs text-gray-400 font-mono">
                    AnalysisDay-CLI — v2.1
                  </div>
                </div>

                {/* Terminal Body */}
                <div className="p-5 font-mono text-xs sm:text-sm space-y-2 min-h-80">
                  {currentLines.slice(0, lineIndex).map((line, idx) => (
                    <div key={idx} className="animate-fadeIn">
                      {line.type === "command" && (
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400 font-bold">➜</span>
                          <span className="text-gray-300">{line.text}</span>
                        </div>
                      )}
                      {line.type === "output" && (
                        <div className="pl-4 text-xs text-gray-400">
                          {line.text}
                        </div>
                      )}
                      {line.type === "code" && (
                        <div className="text-xs">
                          {line.text.includes("import") ||
                          line.text.includes("from") ? (
                            <>
                              <span className="text-red-400">
                                {line.text.split(" ")[0]}
                              </span>
                              <span className="text-gray-300">
                                {" " + line.text.split(" ").slice(1).join(" ")}
                              </span>
                            </>
                          ) : line.text.includes("export") ? (
                            <>
                              <span className="text-red-400">export </span>
                              <span className="text-red-400">const </span>
                              <span className="text-purple-400">
                                {line.text.split(" ")[2]}
                              </span>
                              <span className="text-gray-300">
                                {" " + line.text.split(" ").slice(3).join(" ")}
                              </span>
                            </>
                          ) : line.text.includes("return") ? (
                            <>
                              <span className="text-red-400">return </span>
                              <span className="text-gray-300">
                                {line.text.replace("return ", "")}
                              </span>
                            </>
                          ) : line.text.includes("model") ? (
                            <>
                              <span className="text-purple-400">model</span>
                              <span className="text-gray-300">
                                {line.text.replace("model", "")}
                              </span>
                            </>
                          ) : line.text.includes("predictions") ||
                            line.text.includes("confidence") ? (
                            <>
                              <span className="text-purple-400">
                                {line.text.split(" ")[0]}
                              </span>
                              <span className="text-gray-300">
                                {" " + line.text.split(" ").slice(1).join(" ")}
                              </span>
                            </>
                          ) : (
                            <span className="text-gray-300">{line.text}</span>
                          )}
                        </div>
                      )}
                      {line.type === "success" && (
                        <div className="mt-3 flex items-center gap-2">
                          <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded font-bold">
                            {line.text.includes("AI") ? "AI READY" : "SUCCESS"}
                          </span>
                          <span className="text-gray-400 text-xs">
                            {line.text
                              .replace("SUCCESS ", "")
                              .replace("AI Model Ready • ", "")}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Currently typing line */}
                  {lineIndex < currentLines.length && typedText && (
                    <div className="animate-fadeIn">
                      {currentLines[lineIndex].type === "command" && (
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400 font-bold">➜</span>
                          <span className="text-gray-300">{typedText}</span>
                          <span className="inline-block w-2 h-4 bg-emerald-400 animate-pulse ml-1"></span>
                        </div>
                      )}
                      {currentLines[lineIndex].type === "output" && (
                        <div className="pl-4 text-xs text-gray-400">
                          {typedText}
                          <span className="inline-block w-1.5 h-3 bg-gray-400 animate-pulse ml-0.5"></span>
                        </div>
                      )}
                      {currentLines[lineIndex].type === "code" && (
                        <div className="text-xs text-gray-300">
                          {typedText}
                          <span className="inline-block w-1.5 h-3 bg-gray-400 animate-pulse ml-0.5"></span>
                        </div>
                      )}
                      {currentLines[lineIndex].type === "success" && (
                        <div className="mt-3 flex items-center gap-2">
                          <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded font-bold">
                            {currentLines[lineIndex].text.includes("AI")
                              ? "AI READY"
                              : "SUCCESS"}
                          </span>
                          <span className="text-gray-400 text-xs">
                            {typedText}
                            <span className="inline-block w-1.5 h-3 bg-gray-400 animate-pulse ml-0.5"></span>
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Final cursor when all done */}
                  {lineIndex >= currentLines.length && (
                    <div className="flex items-center gap-2 mt-4 animate-fadeIn">
                      <span className="text-emerald-400 font-bold">➜</span>
                      <span className="inline-block w-2 h-4 bg-gray-400 animate-pulse"></span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Neden Biz? Section */}
      <section className="py-16 lg:py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3">
              Neden Analiz Günü?
            </h2>
            <p className="text-lg md:text-xl text-gray-400">
              Spor istatistik eğitiminde fark yaratan özellikler
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {/* Kart 1 */}
            <div className="bg-linear-to-br from-slate-800 to-slate-700 p-6 lg:p-7 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 group border border-emerald-500/20 hover:border-emerald-500/40">
              <div className="bg-emerald-500 w-14 h-14 rounded-full flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Trophy className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-white mb-3">
                Günlük İstatistik Eğitimleri
              </h3>
              <p className="text-sm lg:text-base text-gray-300 leading-relaxed">
                Her gün güncellenen detaylı spor istatistikleri, veri analizi
                metodolojileri ve teknik değerlendirme örnekleri.
              </p>
            </div>

            {/* Kart 2 */}
            <div className="bg-linear-to-br from-slate-800 to-slate-700 p-6 lg:p-7 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 group border border-emerald-500/20 hover:border-emerald-500/40">
              <div className="bg-emerald-500/20 w-14 h-14 rounded-full flex items-center justify-center mb-5 group-hover:bg-emerald-500/30 transition-colors">
                <Target className="h-7 w-7 text-emerald-400" />
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-white mb-3">
                Profesyonel İçerik
              </h3>
              <p className="text-sm lg:text-base text-gray-300 leading-relaxed">
                Uzman ekibimizin yıllara dayanan deneyimi ve akademik
                metodolojilerle hazırlanmış kapsamlı eğitim içerikleri.
              </p>
            </div>

            {/* Kart 3 */}
            <div className="bg-linear-to-br from-slate-800 to-slate-700 p-6 lg:p-7 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 group border border-emerald-500/20 hover:border-emerald-500/40">
              <div className="bg-emerald-500 w-14 h-14 rounded-full flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Users className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-white mb-3">
                Premium Topluluk
              </h3>
              <p className="text-sm lg:text-base text-gray-300 leading-relaxed">
                Yüzlerce başarılı kullanıcının tercih ettiği platformumuzda siz
                de yerinizi alın. WhatsApp desteği ile 7/24 yanınızdayız.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-linear-to-r from-emerald-600 to-blue-600 py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
            Öğrenmeye Bugün Başlayın
          </h2>
          <p className="text-lg md:text-xl text-emerald-50 mb-8 max-w-2xl mx-auto">
            Sadece ayda 1000 TL ile profesyonel spor istatistik analizi
            eğitimlerine sınırsız erişim
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="bg-white hover:bg-gray-100 text-emerald-600 px-6 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
            >
              Kayıt Ol
            </Link>
            <Link
              href="/pricing"
              className="bg-slate-900 hover:bg-slate-800 text-white border-2 border-white/30 hover:border-white/50 px-6 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              Fiyatlar
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
