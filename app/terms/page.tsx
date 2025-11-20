"use client";

import {
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Scale,
  Clock,
} from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-gray-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-900/30 border border-purple-500/50 rounded-full px-4 py-2 mb-6">
            <FileText className="h-5 w-5 text-purple-400" />
            <span className="text-sm font-semibold text-purple-300">
              Yasal Belgeler
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Kullanım Koşulları
          </h1>
          <p className="text-gray-400 text-lg">
            Son Güncelleme: {new Date().toLocaleDateString("tr-TR")}
          </p>
        </div>

        {/* İçerik */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 space-y-8">
          {/* 1. Kabul */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                1. Koşulların Kabulü
              </h2>
            </div>
            <div className="text-gray-300 space-y-3 leading-relaxed">
              <p>
                AnalysisDay platformuna erişerek ve hizmetlerimizi kullanarak,
                bu Kullanım Koşullarını okuduğunuzu, anladığınızı ve kabul
                ettiğinizi beyan edersiniz.
              </p>
              <p>
                Bu koşulları kabul etmiyorsanız, lütfen platformumuzu
                kullanmayınız.
              </p>
              <div className="bg-yellow-900/30 border border-yellow-700/30 rounded-lg p-4 mt-4">
                <p className="text-sm text-yellow-200">
                  <strong>⚠️ Önemli:</strong> 18 yaşından küçükseniz, bu hizmeti
                  kullanmanız yasaktır.
                </p>
              </div>
            </div>
          </section>

          {/* 2. Hizmet Tanımı */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-600 p-2 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                2. Hizmet Tanımı
              </h2>
            </div>
            <div className="text-gray-300 space-y-4">
              <p>AnalysisDay, aşağıdaki hizmetleri sunar:</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">
                    ✅ Sunulan Hizmetler:
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Günlük spor analizi içerikleri</li>
                    <li>Teknik analiz raporları</li>
                    <li>Analiz ve öneriler</li>
                    <li>Premium içerik erişimi</li>
                    <li>Email bildirimleri</li>
                    <li>WhatsApp destek hizmeti</li>
                  </ul>
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">
                    ❌ Sunmadığımız:
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Garantili kazanç vaadi</li>
                    <li>Yatırım danışmanlığı</li>
                    <li>Mali tavsiye</li>
                    <li>Lisanslı bahis hizmeti</li>
                    <li>Kesin sonuç garantisi</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* 3. Üyelik ve Hesap */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-600 p-2 rounded-lg">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                3. Üyelik ve Hesap Güvenliği
              </h2>
            </div>
            <div className="text-gray-300 space-y-3 leading-relaxed">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-3">
                  Kullanıcı Sorumlulukları:
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    Kayıt bilgilerinizin doğru ve güncel olmasını sağlamak
                  </li>
                  <li>Şifrenizi güvende tutmak ve kimseyle paylaşmamak</li>
                  <li>
                    Hesabınızda gerçekleşen tüm aktivitelerden sorumlu olmak
                  </li>
                  <li>Şüpheli aktivite fark ettiğinizde derhal bildirmek</li>
                  <li>Her kullanıcı yalnızca bir hesap açabilir</li>
                  <li>Hesabınızı başkasına devredemez veya satamazsınız</li>
                </ul>
              </div>
              <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4">
                <p className="text-sm text-red-200">
                  <strong>🚫 Yasak:</strong> Sahte bilgilerle kayıt olmak, bot
                  kullanmak veya birden fazla hesap açmak hesabınızın kalıcı
                  olarak askıya alınmasına neden olabilir.
                </p>
              </div>
            </div>
          </section>

          {/* 4. Ödeme ve İptal */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-yellow-600 p-2 rounded-lg">
                <Scale className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                4. Ödeme ve İptal Koşulları
              </h2>
            </div>
            <div className="text-gray-300 space-y-4">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-3">
                  Ödeme Şartları:
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Premium üyelik aylık abonelik sistemi ile çalışır</li>
                  <li>Ödeme havale/EFT yöntemi ile yapılır</li>
                  <li>Ödeme onayı sonrası hesabınız aktif hale gelir</li>
                  <li>Abonelik süresi ödeme tarihinden itibaren 30 gündür</li>
                  <li>Otomatik yenileme yoktur, manuel ödeme gerekir</li>
                </ul>
              </div>

              <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
                <p className="text-sm text-blue-200">
                  <strong>💡 Not:</strong> Teknik aksaklıklar nedeniyle hizmet
                  alamadığınız günler abonelik sürenize eklenir.
                </p>
              </div>
            </div>
          </section>

          {/* 5. Kullanım Kuralları */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-600 p-2 rounded-lg">
                <XCircle className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                5. Yasak Faaliyetler
              </h2>
            </div>
            <div className="text-gray-300 space-y-3">
              <p>Aşağıdaki faaliyetler kesinlikle yasaktır:</p>
              <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4">
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>İçerikleri izinsiz kopyalamak, paylaşmak veya satmak</li>
                  <li>Analiz görsellerini başka platformlarda yayınlamak</li>
                  <li>Birden fazla kişiyle hesap paylaşımı yapmak</li>
                  <li>Sistemi hacklemek veya güvenlik açıkları aramak</li>
                  <li>Bot veya otomatik araçlar kullanmak</li>
                  <li>
                    Spam, kötü amaçlı yazılım veya zararlı içerik göndermek
                  </li>
                  <li>Diğer kullanıcıları taciz etmek veya rahatsız etmek</li>
                  <li>Sahte kimlik veya bilgilerle kayıt olmak</li>
                </ul>
              </div>
              <div className="bg-yellow-900/30 border border-yellow-700/30 rounded-lg p-4 mt-4">
                <p className="text-sm text-yellow-200">
                  <strong>⚠️ Uyarı:</strong> Bu kurallara uymayan kullanıcıların
                  hesapları uyarı yapılmaksızın askıya alınabilir veya kalıcı
                  olarak kapatılabilir. İade yapılmaz.
                </p>
              </div>
            </div>
          </section>

          {/* 6. Risk Uyarısı */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-orange-600 p-2 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                6. Risk Uyarısı ve Sorumluluk Reddi
              </h2>
            </div>
            <div className="text-gray-300 space-y-3 leading-relaxed">
              <div className="bg-orange-900/30 border border-orange-500/50 rounded-lg p-5 space-y-3">
                <p className="font-semibold text-white text-lg">
                  ⚠️ ÖNEMLİ UYARI
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    Bu platformda sunulan analizler, tahminler ve öneriler
                    <strong> yalnızca bilgilendirme amaçlıdır</strong>
                  </li>
                  <li>
                    İçeriklerimiz{" "}
                    <strong>yatırım tavsiyesi niteliği taşımaz</strong>
                  </li>
                  <li>
                    Geçmiş performans, gelecekteki sonuçların garantisi değildir
                  </li>
                  <li>
                    Tüm yatırım kararları <strong>size aittir</strong>
                  </li>
                  <li>
                    AnalysisDay, kararlarınızdan kaynaklanan mali kayıplardan
                    <strong> sorumlu tutulamaz</strong>
                  </li>
                </ul>
                <p className="text-sm mt-3 bg-red-900/30 border border-red-700/30 rounded p-3">
                  <strong>18 yaş altı kişiler</strong> bu platformu kullanamaz.
                  Platformumuz yalnızca analiz amaçlıdır.
                </p>
              </div>
            </div>
          </section>

          {/* 7. Fikri Mülkiyet */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                7. Fikri Mülkiyet Hakları
              </h2>
            </div>
            <div className="text-gray-300 space-y-3 leading-relaxed">
              <p>
                AnalysisDay platformunda yer alan tüm içerikler (analizler,
                metinler, görseller, logolar, grafikler) AnalysisDay&apos;in
                fikri mülkiyetidir ve telif hakkı yasaları ile korunmaktadır.
              </p>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">İzin Verilen:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                  <li>Kişisel kullanım için içerikleri görüntülemek</li>
                  <li>Premium üyelik süreniz boyunca erişim sağlamak</li>
                </ul>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">
                  İzin Verilmeyen:
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                  <li>İçerikleri kopyalamak, çoğaltmak veya dağıtmak</li>
                  <li>Ticari amaçla kullanmak</li>
                  <li>Başka platformlarda yayınlamak</li>
                  <li>Düzenleyerek veya değiştirerek kullanmak</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 8. Hesap Askıya Alma */}
          <section>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="h-6 w-6 text-yellow-400" />
                <h2 className="text-xl font-bold text-white">
                  8. Hesap Askıya Alma ve Sonlandırma
                </h2>
              </div>
              <p className="text-gray-300 leading-relaxed mb-3">
                AnalysisDay, herhangi bir zamanda ve herhangi bir sebeple (veya
                sebepsiz) hesabınızı askıya alma veya sonlandırma hakkını saklı
                tutar. Özellikle:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-gray-300">
                <li>Kullanım koşullarını ihlal etmeniz</li>
                <li>Sahte veya yanıltıcı bilgi vermeniz</li>
                <li>Yasadışı faaliyetlerde bulunmanız</li>
                <li>Diğer kullanıcılara zarar vermeniz</li>
                <li>Ödeme yapmakta başarısız olmanız</li>
              </ul>
            </div>
          </section>

          {/* 9. Değişiklikler */}
          <section>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-3">
                9. Koşullarda Değişiklik Yapma Hakkı
              </h2>
              <p className="text-gray-300 leading-relaxed">
                AnalysisDay, bu Kullanım Koşullarını istediği zaman güncelleme
                veya değiştirme hakkını saklı tutar. Önemli değişiklikler
                olduğunda, email veya platform bildirimi ile haberdar
                edileceksiniz. Değişiklikler yayınlandıktan sonra platformu
                kullanmaya devam etmeniz, yeni koşulları kabul ettiğiniz
                anlamına gelir.
              </p>
            </div>
          </section>

          {/* 10. Uygulanacak Hukuk */}
          <section>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-3">
                10. Uygulanacak Hukuk ve Yetki
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Bu Kullanım Koşulları Türkiye Cumhuriyeti yasalarına tabidir. Bu
                sözleşmeden doğan veya bu sözleşme ile ilgili her türlü
                uyuşmazlıkta İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.
              </p>
            </div>
          </section>

          {/* İletişim */}
          <section className="bg-blue-900/30 border border-blue-500/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-3">
              Sorularınız İçin İletişim
            </h2>
            <p className="text-gray-300 mb-4">
              Kullanım koşulları hakkında sorularınız için:
            </p>
            <div className="space-y-2 text-gray-300">
              <p>
                <strong>Email:</strong>{" "}
                <a
                  href={`mailto:${
                    process.env.NEXT_PUBLIC_CONTACT_EMAIL ||
                    "support@analysisday.com"
                  }`}
                  className="text-blue-400 hover:text-blue-300"
                >
                  {process.env.NEXT_PUBLIC_CONTACT_EMAIL ||
                    "support@analysisday.com"}
                </a>
              </p>
              <p>
                <strong>WhatsApp:</strong>{" "}
                <a
                  href={`https://wa.me/${
                    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "905xxxxxxxxx"
                  }`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300"
                >
                  {process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
                    "+90 5XX XXX XX XX"}
                </a>
              </p>
            </div>
          </section>

          {/* Son Onay */}
          <div className="bg-linear-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/50 rounded-xl p-6 text-center">
            <p className="text-white font-semibold mb-2">
              Bu koşulları kabul ederek AnalysisDay&apos;i kullanmaya
              başlayabilirsiniz
            </p>
            <p className="text-gray-400 text-sm">
              Platformumuzu kullanmaktan mutluluk duyarız. Sorumlu ve bilinçli
              kullanım dileklerimizle...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
