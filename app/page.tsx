"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Trophy, Target, Users, Lock, ArrowRight } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Kullanıcı giriş yapmışsa /analysis'e yönlendir
  useEffect(() => {
    if (!loading && user) {
      router.push("/analysis");
    }
  }, [user, loading, router]);

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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Sol Taraf - Metin */}
            <div className="space-y-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Spor İstatistik Analizi ve
                <span className="block text-emerald-400">
                  Veri Okuma Eğitimi
                </span>
              </h1>

              <p className="text-xl text-gray-300">
                Profesyonel spor analizleri ve istatistiksel değerlendirme
                eğitimi. Detaylı veri analizi metodolojileri, güncel
                istatistikler ve teknik analiz stratejileri öğrenin.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-lg font-bold text-lg transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  Hemen Üye Ol ve Öğrenmeye Başla
                  <ArrowRight className="h-5 w-5" />
                </Link>

                <Link
                  href="/analysis"
                  className="bg-slate-800 hover:bg-slate-700 border-2 border-emerald-500/50 text-white px-8 py-4 rounded-lg font-bold text-lg transition flex items-center justify-center gap-2"
                >
                  Eğitim İçeriklerini İncele
                  <Trophy className="h-5 w-5" />
                </Link>
              </div>
            </div>

            {/* Sağ Taraf - Maç Tablosu Preview */}
            <div className="relative">
              <div className="relative bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-emerald-500/30 shadow-2xl">
                <div className="absolute inset-0 bg-linear-to-br from-emerald-500/10 to-blue-500/10 rounded-2xl blur-2xl"></div>

                <div className="relative space-y-3">
                  {/* Simüle Maç Listesi - Bulanık */}
                  <div className="space-y-2 filter blur-md">
                    <div className="bg-slate-700/50 rounded-lg p-3 flex items-center justify-between">
                      <span className="text-sm text-gray-300">
                        Galatasaray - Fenerbahçe
                      </span>
                      <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded">
                        2.5 ÜST
                      </span>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-3 flex items-center justify-between">
                      <span className="text-sm text-gray-300">
                        Beşiktaş - Trabzonspor
                      </span>
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                        KG VAR
                      </span>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-3 flex items-center justify-between">
                      <span className="text-sm text-gray-300">
                        Real Madrid - Barcelona
                      </span>
                      <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded">
                        EV
                      </span>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-3 flex items-center justify-between">
                      <span className="text-sm text-gray-300">
                        Liverpool - Man City
                      </span>
                      <span className="bg-yellow-500 text-gray-900 text-xs px-2 py-1 rounded">
                        MS 1
                      </span>
                    </div>
                  </div>

                  {/* Kilit İkonu Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-slate-900/90 backdrop-blur-sm p-6 rounded-full ring-4 ring-emerald-500/50">
                      <Lock className="h-16 w-16 text-emerald-400" />
                    </div>
                  </div>
                </div>

                <p className="text-center mt-6 text-sm text-gray-400">
                  Premium eğitim içerikleri sadece üyelerimize özel
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Neden Biz? Section */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Neden AnalysisDay?
            </h2>
            <p className="text-xl text-gray-400">
              Spor istatistik eğitiminde fark yaratan 3 neden
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Kart 1 */}
            <div className="bg-linear-to-br from-slate-800 to-slate-700 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition group border border-emerald-500/20">
              <div className="bg-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Günlük İstatistik Analiz Eğitimleri
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Her gün güncellenen detaylı spor istatistikleri, veri analizi
                metodolojileri ve teknik değerlendirme örnekleri. Kapsamlı
                eğitim içerikleri.
              </p>
            </div>

            {/* Kart 2 */}
            <div className="bg-linear-to-br from-slate-800 to-slate-700 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition group border border-blue-500/20">
              <div className="bg-blue-500/10 w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Profesyonel Eğitim İçeriği
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Uzman ekibimizin yıllara dayanan deneyimi ve akademik
                metodolojilerle hazırlanmış kapsamlı eğitim içerikleri. Veri
                analizi becerilerinizi geliştirin.
              </p>
            </div>

            {/* Kart 3 */}
            <div className="bg-linear-to-br from-slate-800 to-slate-700 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition group border border-purple-500/20">
              <div className="bg-purple-500 w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Premium Topluluk
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Yüzlerce başarılı kullanıcının tercih ettiği platformumuzda siz
                de yerinizi alın. WhatsApp desteği ile 7/24 yanınızdayız.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-linear-to-r from-emerald-600 to-blue-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Öğrenmeye Bugün Başlayın
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Sadece ayda 600 TL ile profesyonel spor istatistik analizi
            eğitimlerine sınırsız erişim
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-white hover:bg-gray-100 text-emerald-600 px-8 py-4 rounded-lg font-bold text-lg transition shadow-lg hover:shadow-xl"
            >
              Ücretsiz Kayıt Ol
            </Link>
            <Link
              href="/pricing"
              className="bg-slate-900 hover:bg-slate-800 text-white border-2 border-white/30 px-8 py-4 rounded-lg font-bold text-lg transition shadow-lg hover:shadow-xl"
            >
              Ücretleri İncele
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
