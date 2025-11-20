"use client";

import { useState } from "react";
import {
  ChevronDown,
  HelpCircle,
  Mail,
  MessageCircle,
  Search,
} from "lucide-react";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    {
      category: "Genel",
      icon: "❓",
      questions: [
        {
          question: "AnalysisDay nedir?",
          answer:
            "AnalysisDay, profesyonel spor analizi platformudur. Günlük olarak güncellenen teknik analizler, hedef fiyatlar ve uzman tahminleri sunar. Premium üyelerimiz tüm analiz içeriklerine sınırsız erişim sağlar.",
        },
        {
          question: "Nasıl üye olabilirim?",
          answer:
            "Kayıt Ol butonuna tıklayarak email adresiniz, kullanıcı adınız ve şifrenizle ücretsiz hesap oluşturabilirsiniz. Email doğrulaması yapmanız gerekir. Premium içeriklere erişmek için aylık abonelik satın almalısınız.",
        },
        {
          question: "Ücretsiz kullanıcılar neler görebilir?",
          answer:
            "Ücretsiz kullanıcılar platform yapısını görebilir ancak günlük analiz içeriklerine erişemez. Premium üyelik ile tüm analizlere tam erişim sağlanır.",
        },
      ],
    },
    {
      category: "Ödeme & Abonelik",
      icon: "💳",
      questions: [
        {
          question: "Premium üyelik ücreti nedir?",
          answer: `Premium üyelik aylık ${
            process.env.NEXT_PUBLIC_SUBSCRIPTION_PRICE || "500"
          } TL'dir. Bu ücret karşılığında 30 gün boyunca tüm günlük analizlere sınırsız erişim sağlarsınız.`,
        },
        {
          question: "Nasıl ödeme yapabilirim?",
          answer:
            "Ödeme havale/EFT yöntemiyle yapılır. Ücretler sayfasından IBAN bilgilerimizi görebilir, havale açıklamasına email adresinizi yazarak ödeme yapabilirsiniz. Ödeme sonrası WhatsApp ile dekont göndererek hızlı onay alabilirsiniz.",
        },
        {
          question: "Ödeme yaptıktan sonra ne kadar sürede aktif olur?",
          answer:
            "WhatsApp üzerinden dekont gönderirseniz 15 dakika içinde hesabınız aktif edilir. Email ile gönderirseniz genellikle 1-2 saat içinde işleme alınır. Çalışma saatleri dışında en geç ertesi gün aktif edilir.",
        },
        {
          question: "Aboneliğim otomatik yenilenir mi?",
          answer:
            "Hayır, otomatik yenileme yoktur. Her ay manuel olarak ödeme yapmanız gerekir. Abonelik süresi bitiminde premium erişiminiz sona erer.",
        },
        {
          question: "İade alabilir miyim?",
          answer:
            "İlk 7 gün içinde herhangi bir sebeple tam iade talep edebilirsiniz. 7-14 gün arası teknik sorunlar için %50 iade yapılır. 14 gün sonrası iade yapılmaz ancak abonelik iptal edilebilir.",
        },
      ],
    },
    {
      category: "Hesap & Güvenlik",
      icon: "🔒",
      questions: [
        {
          question: "Şifremi unuttum, ne yapmalıyım?",
          answer:
            "Giriş sayfasındaki 'Şifremi Unuttum' linkine tıklayın. Email adresinizi girin ve size gönderilen linkle şifrenizi sıfırlayabilirsiniz.",
        },
        {
          question: "Kullanıcı adımı değiştirebilir miyim?",
          answer:
            "Şu anda kullanıcı adı değişikliği yapılamıyor. Kayıt sırasında dikkatli seçmenizi öneririz. Değişiklik için destek ekibimizle iletişime geçebilirsiniz.",
        },
        {
          question: "Hesabımı birden fazla cihazda kullanabilir miyim?",
          answer:
            "Evet, aynı anda birden fazla cihazda giriş yapabilirsiniz. Ancak hesabınızı başkalarıyla paylaşmak kullanım koşullarına aykırıdır ve hesabınızın kapatılmasına neden olabilir.",
        },
        {
          question: "Email doğrulaması neden gerekli?",
          answer:
            "Email doğrulaması hesap güvenliğiniz için zorunludur. Şifre sıfırlama ve önemli bildirimler için geçerli bir email adresine ihtiyaç duyarız. Admin kullanıcılar email doğrulaması yapmadan giriş yapabilir.",
        },
      ],
    },
    {
      category: "İçerik & Analizler",
      icon: "📊",
      questions: [
        {
          question: "Analizler ne sıklıkla güncellenir?",
          answer:
            "Günlük analizler her gün düzenli olarak yayınlanır. Email bildirimlerini açtıysanız, yeni analiz yayınlandığında anında haberdar olursunuz.",
        },
        {
          question: "Analizler garantili kazanç sağlar mı?",
          answer:
            "Hayır. Analizlerimiz bilgilendirme amaçlıdır ve yatırım tavsiyesi niteliği taşımaz. Geçmiş performans gelecekteki sonuçların garantisi değildir. Tüm kararlar size aittir ve sorumluluğu kabul edersiniz.",
        },
        {
          question: "Analiz görsellerini paylaşabilir miyim?",
          answer:
            "Hayır. Tüm içerikler telif hakkı ile korunmaktadır ve izinsiz paylaşım yasaktır. Kişisel kullanım dışında kopyalama, dağıtma veya yayınlama kullanım koşullarına aykırıdır.",
        },
        {
          question: "Eski analizlere erişebilir miyim?",
          answer:
            "Premium aboneliğiniz aktif olduğu sürece güncel analizlere erişebilirsiniz. Geçmiş analizler arşivi şu anda bulunmamaktadır.",
        },
      ],
    },
    {
      category: "Teknik Destek",
      icon: "🛠️",
      questions: [
        {
          question: "Siteye giriş yapamıyorum, ne yapmalıyım?",
          answer:
            "Önce şifrenizi doğru yazdığınızdan emin olun. Email yerine kullanıcı adınızla da giriş yapabilirsiniz. Email doğrulaması yapmadıysanız önce email'inizdeki linke tıklayın. Hala sorun varsa destek ekibimize ulaşın.",
        },
        {
          question: "Görseller yüklenmiyor, ne yapmalıyım?",
          answer:
            "İnternet bağlantınızı kontrol edin. Tarayıcınızı yenileyin (Ctrl+F5). AdBlock gibi eklentileri devre dışı bırakın. Farklı bir tarayıcı deneyin. Sorun devam ederse destek ekibimize bildirin.",
        },
        {
          question: "Mobil uygulamanız var mı?",
          answer:
            "Şu anda mobil uygulamamız bulunmamaktadır. Ancak web sitemiz tüm cihazlarda (telefon, tablet, bilgisayar) sorunsuz çalışacak şekilde tasarlanmıştır.",
        },
        {
          question: "Hangi tarayıcıları destekliyorsunuz?",
          answer:
            "Chrome, Firefox, Safari, Edge ve diğer modern tarayıcıların son sürümlerini destekliyoruz. En iyi deneyim için tarayıcınızı güncel tutmanızı öneririz.",
        },
      ],
    },
    {
      category: "İletişim",
      icon: "📞",
      questions: [
        {
          question: "Size nasıl ulaşabilirim?",
          answer: `Email: ${
            process.env.NEXT_PUBLIC_CONTACT_EMAIL || "support@analysisday.com"
          } | WhatsApp: ${
            process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+90 5XX XXX XX XX"
          } | Destek formu üzerinden de mesaj gönderebilirsiniz.`,
        },
        {
          question: "Destek ekibiniz hangi saatlerde aktif?",
          answer:
            "WhatsApp destek hattımız 09:00 - 22:00 arası aktiftir. Email mesajlarına genellikle 24 saat içinde yanıt verilir.",
        },
        {
          question: "Öneri ve şikayetlerimi nasıl iletebilirim?",
          answer:
            "Tüm öneri ve şikayetlerinizi email veya WhatsApp üzerinden iletebilirsiniz. Geri bildirimleriniz bizim için çok değerlidir.",
        },
      ],
    },
  ];

  const filteredFAQs = faqs
    .map((category) => ({
      ...category,
      questions: category.questions.filter(
        (q) =>
          q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.answer.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((category) => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-gray-950 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-900/30 border border-blue-500/50 rounded-full px-4 py-2 mb-6">
            <HelpCircle className="h-5 w-5 text-blue-400" />
            <span className="text-sm font-semibold text-blue-300">
              Yardım Merkezi
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Sıkça Sorulan Sorular
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Merak ettiğiniz soruların cevaplarını burada bulabilirsiniz. Cevap
            bulamazsanız, destek ekibimizle iletişime geçebilirsiniz.
          </p>
        </div>

        {/* Arama */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Soru ara..."
              className="w-full pl-12 pr-4 py-4 bg-gray-900 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder-gray-500"
            />
          </div>
        </div>

        {/* FAQ Kategorileri */}
        <div className="space-y-8 mb-12">
          {filteredFAQs.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{category.icon}</span>
                <h2 className="text-2xl font-bold text-white">
                  {category.category}
                </h2>
              </div>

              <div className="space-y-3">
                {category.questions.map((faq, index) => {
                  const globalIndex = categoryIndex * 100 + index;
                  const isOpen = openIndex === globalIndex;

                  return (
                    <div
                      key={index}
                      className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-all"
                    >
                      <button
                        onClick={() =>
                          setOpenIndex(isOpen ? null : globalIndex)
                        }
                        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-800/50 transition-colors"
                      >
                        <span className="font-semibold text-white pr-4">
                          {faq.question}
                        </span>
                        <ChevronDown
                          className={`h-5 w-5 text-gray-400 shrink-0 transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {isOpen && (
                        <div className="px-6 pb-4 text-gray-300 leading-relaxed">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {searchQuery && filteredFAQs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-4">
              Aradığınız soruyu bulamadık.
            </p>
            <p className="text-gray-500">
              Lütfen farklı anahtar kelimeler deneyin veya destek ekibimizle
              iletişime geçin.
            </p>
          </div>
        )}

        {/* Destek Kartları */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-blue-900/30 border border-blue-500/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-600 p-3 rounded-lg">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Destek Talebi Oluştur
                </h3>
                <p className="text-sm text-gray-400">
                  Detaylı yardım için form doldurun
                </p>
              </div>
            </div>
            <p className="text-gray-300 mb-4">
              Cevap bulamadınız mı? Destek formunu doldurun, size en kısa sürede
              dönüş yapalım.
            </p>
            <a
              href="/support"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              <Mail className="h-5 w-5" />
              Destek Formu
            </a>
          </div>

          <div className="bg-green-900/30 border border-green-500/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-600 p-3 rounded-lg">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  WhatsApp Destek
                </h3>
                <p className="text-sm text-gray-400">Hızlı yanıt alın</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4">
              Acil yardım için WhatsApp hattımızdan 7/24 bize ulaşabilirsiniz.
            </p>
            <a
              href={`https://wa.me/${
                process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "905xxxxxxxxx"
              }?text=${encodeURIComponent("Merhaba, yardıma ihtiyacım var.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              <MessageCircle className="h-5 w-5" />
              WhatsApp&apos;a Git
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
