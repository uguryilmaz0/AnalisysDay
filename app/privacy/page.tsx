"use client";

import { Shield, Lock, Eye, Database, UserCheck, Mail } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-gray-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-900/30 border border-blue-500/50 rounded-full px-4 py-2 mb-6">
            <Shield className="h-5 w-5 text-blue-400" />
            <span className="text-sm font-semibold text-blue-300">
              Gizlilik & Güvenlik
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Gizlilik Politikası
          </h1>
          <p className="text-gray-400 text-lg">
            Son Güncelleme: {new Date().toLocaleDateString("tr-TR")}
          </p>
        </div>

        {/* İçerik */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 space-y-8">
          {/* 1. Giriş */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">1. Giriş</h2>
            </div>
            <div className="text-gray-300 space-y-3 leading-relaxed">
              <p>
                AnalysisDay olarak, kullanıcılarımızın gizliliğini korumayı en
                önemli önceliklerimizden biri olarak görüyoruz. Bu Gizlilik
                Politikası, platformumuz üzerinden topladığımız kişisel
                verilerin nasıl kullanıldığını, saklandığını ve korunduğunu
                açıklamaktadır.
              </p>
              <p>
                Hizmetlerimizi kullanarak, bu politikada açıklanan veri toplama
                ve kullanım uygulamalarını kabul etmiş olursunuz.
              </p>
            </div>
          </section>

          {/* 2. Toplanan Bilgiler */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-600 p-2 rounded-lg">
                <Database className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                2. Toplanan Bilgiler
              </h2>
            </div>
            <div className="text-gray-300 space-y-4">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">
                  Kayıt Sırasında Toplanan Bilgiler:
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Email adresi</li>
                  <li>Kullanıcı adı</li>
                  <li>Şifre (şifrelenmiş olarak)</li>
                  <li>Kayıt tarihi</li>
                </ul>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">
                  Otomatik Toplanan Bilgiler:
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>IP adresi ve konum bilgisi</li>
                  <li>Tarayıcı türü ve sürümü</li>
                  <li>Cihaz bilgileri</li>
                  <li>Sayfa görüntüleme istatistikleri</li>
                  <li>Erişim zamanları</li>
                </ul>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">
                  Ödeme İşlemleri:
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Havale/EFT dekont bilgileri</li>
                  <li>Ödeme tarihi ve tutarı</li>
                  <li>Abonelik durumu</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 3. Bilgilerin Kullanımı */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-600 p-2 rounded-lg">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                3. Bilgilerin Kullanımı
              </h2>
            </div>
            <div className="text-gray-300 space-y-3">
              <p>Topladığımız bilgiler aşağıdaki amaçlarla kullanılır:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 leading-relaxed">
                <li>Hesap oluşturma ve kimlik doğrulama işlemleri için</li>
                <li>Abonelik ve ödeme işlemlerinin yönetimi için</li>
                <li>
                  Günlük analiz içeriklerine erişim kontrolü sağlamak için
                </li>
                <li>
                  Email bildirimleri göndermek için (tercih ettiğiniz takdirde)
                </li>
                <li>Müşteri destek hizmetleri sunmak için</li>
                <li>
                  Platform güvenliğini sağlamak ve dolandırıcılığı önlemek için
                </li>
                <li>
                  Hizmet kalitesini iyileştirmek ve kullanıcı deneyimini
                  optimize etmek için
                </li>
                <li>Yasal yükümlülüklerimizi yerine getirmek için</li>
              </ul>
            </div>
          </section>

          {/* 4. Bilgi Güvenliği */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-600 p-2 rounded-lg">
                <Lock className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                4. Bilgi Güvenliği
              </h2>
            </div>
            <div className="text-gray-300 space-y-3 leading-relaxed">
              <p>
                Kişisel bilgilerinizin güvenliğini sağlamak için endüstri
                standardı güvenlik önlemleri kullanıyoruz:
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">
                    🔐 SSL/TLS Şifreleme
                  </h3>
                  <p className="text-sm text-gray-400">
                    Tüm veri iletişimi şifrelenmiş kanallar üzerinden yapılır
                  </p>
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">
                    🔒 Firebase Authentication
                  </h3>
                  <p className="text-sm text-gray-400">
                    Google&apos;ın güvenli kimlik doğrulama sistemi kullanılır
                  </p>
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">
                    🛡️ Firestore Security
                  </h3>
                  <p className="text-sm text-gray-400">
                    Veritabanı erişimi katı güvenlik kuralları ile korunur
                  </p>
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">
                    👤 Şifre Hashleme
                  </h3>
                  <p className="text-sm text-gray-400">
                    Şifreler hiçbir zaman düz metin olarak saklanmaz
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 5. Çerezler */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-yellow-600 p-2 rounded-lg">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                5. Çerezler (Cookies)
              </h2>
            </div>
            <div className="text-gray-300 space-y-3 leading-relaxed">
              <p>
                Platformumuz, kullanıcı deneyimini iyileştirmek için çerezler
                kullanır. Çerezler, tarayıcınız tarafından saklanan küçük metin
                dosyalarıdır.
              </p>
              <p className="font-semibold text-white">
                Kullandığımız Çerezler:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Zorunlu Çerezler:</strong> Oturum yönetimi ve güvenlik
                  için
                </li>
                <li>
                  <strong>İşlevsel Çerezler:</strong> Tercihlerinizi hatırlamak
                  için
                </li>
                <li>
                  <strong>Analitik Çerezler:</strong> Kullanım istatistikleri
                  için
                </li>
              </ul>
              <p className="text-sm text-gray-400 mt-3">
                Tarayıcı ayarlarınızdan çerezleri yönetebilir veya
                silebilirsiniz, ancak bu durumda bazı özellikler düzgün
                çalışmayabilir.
              </p>
            </div>
          </section>

          {/* 6. Üçüncü Taraf Hizmetler */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                6. Üçüncü Taraf Hizmetler
              </h2>
            </div>
            <div className="text-gray-300 space-y-3 leading-relaxed">
              <p>Platformumuz aşağıdaki üçüncü taraf hizmetleri kullanır:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Firebase (Google):</strong> Kimlik doğrulama ve
                  veritabanı hizmetleri
                </li>
                <li>
                  <strong>Cloudinary:</strong> Görsel depolama ve yönetimi
                </li>
                <li>
                  <strong>Vercel:</strong> Hosting ve CDN hizmetleri
                </li>
              </ul>
              <p className="text-sm bg-yellow-900/30 border border-yellow-700/30 rounded-lg p-3 mt-3">
                Bu hizmetler kendi gizlilik politikalarına tabidir. İlgili
                hizmetlerin gizlilik politikalarını incelemenizi öneririz.
              </p>
            </div>
          </section>

          {/* 7. Kullanıcı Hakları */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-cyan-600 p-2 rounded-lg">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                7. Kullanıcı Hakları
              </h2>
            </div>
            <div className="text-gray-300 space-y-3 leading-relaxed">
              <p>
                KVKK (Kişisel Verilerin Korunması Kanunu) kapsamında aşağıdaki
                haklara sahipsiniz:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                <li>İşlenmişse bilgi talep etme</li>
                <li>İşlenme amacını öğrenme</li>
                <li>
                  Yurt içi veya yurt dışına aktarılıp aktarılmadığını öğrenme
                </li>
                <li>
                  Eksik veya yanlış işlenmiş verilerin düzeltilmesini isteme
                </li>
                <li>Verilerin silinmesini veya yok edilmesini isteme</li>
                <li>
                  Yapılan işlemlerin üçüncü kişilere bildirilmesini isteme
                </li>
              </ul>
              <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4 mt-4">
                <p className="text-sm">
                  Bu haklarınızı kullanmak için{" "}
                  <a
                    href={`mailto:${
                      process.env.NEXT_PUBLIC_CONTACT_EMAIL ||
                      "privacy@analysisday.com"
                    }`}
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    {process.env.NEXT_PUBLIC_CONTACT_EMAIL ||
                      "privacy@analysisday.com"}
                  </a>{" "}
                  adresinden bizimle iletişime geçebilirsiniz.
                </p>
              </div>
            </div>
          </section>

          {/* 8. Veri Saklama */}
          <section>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-3">
                8. Veri Saklama Süresi
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Kişisel verileriniz, hesabınız aktif olduğu sürece saklanır.
                Hesabınızı sildiğinizde, verileriniz 30 gün içinde sistemden
                kalıcı olarak silinir. Yasal yükümlülükler gereği bazı bilgiler
                daha uzun süre saklanabilir.
              </p>
            </div>
          </section>

          {/* 9. Değişiklikler */}
          <section>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-3">
                9. Politika Değişiklikleri
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Bu Gizlilik Politikası zaman zaman güncellenebilir. Önemli
                değişiklikler olduğunda, email yoluyla veya platform üzerinden
                bilgilendirileceksiniz. Değişiklikler bu sayfada yayınlandığı
                anda yürürlüğe girer.
              </p>
            </div>
          </section>

          {/* İletişim */}
          <section className="bg-blue-900/30 border border-blue-500/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <Mail className="h-6 w-6 text-blue-400" />
              İletişim
            </h2>
            <p className="text-gray-300 mb-4">
              Gizlilik politikamız hakkında sorularınız için:
            </p>
            <div className="space-y-2 text-gray-300">
              <p>
                <strong>Email:</strong>{" "}
                <a
                  href={`mailto:${
                    process.env.NEXT_PUBLIC_CONTACT_EMAIL ||
                    "info@analysisday.com"
                  }`}
                  className="text-blue-400 hover:text-blue-300"
                >
                  {process.env.NEXT_PUBLIC_CONTACT_EMAIL ||
                    "info@analysisday.com"}
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
        </div>
      </div>
    </div>
  );
}
