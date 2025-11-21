"use client";

import { Cookie, Shield, FileText, Eye, Settings } from "lucide-react";
import { PageSection } from "@/shared/components/PageSection";

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700/50">
        <div className="max-w-5xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-amber-500/20 rounded-xl">
              <Cookie className="h-8 w-8 text-amber-400" />
            </div>
            <h1 className="text-4xl font-bold text-white">Çerez Politikası</h1>
          </div>
          <p className="text-xl text-gray-300 mt-4">
            AnalysisDay Çerez Kullanım Politikası ve Yönetimi
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Son Güncellenme: 21 Kasım 2025
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Çerez Nedir */}
          <PageSection icon={Cookie} title="Çerez (Cookie) Nedir?">
            <div className="space-y-4 text-gray-300">
              <p>
                Çerezler, ziyaret ettiğiniz internet siteleri tarafından
                tarayıcılar aracılığıyla cihazınıza veya ağ sunucusuna depolanan
                küçük metin dosyalarıdır.
              </p>

              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
                <h3 className="font-semibold text-white mb-3">
                  Çerezler Neden Kullanılır?
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-1">✓</span>
                    <span>İnternet sitesinin düzgün çalışmasını sağlamak</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-1">✓</span>
                    <span>Kullanıcı deneyimini iyileştirmek</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-1">✓</span>
                    <span>Güvenlik önlemlerini güçlendirmek</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-1">✓</span>
                    <span>İstatistiksel analiz yapmak</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-1">✓</span>
                    <span>Kullanıcı tercihlerini hatırlamak</span>
                  </li>
                </ul>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="text-sm">
                  <strong className="text-blue-300">📌 KVKK Uyumluluğu:</strong>{" "}
                  Bu politika, 6698 sayılı Kişisel Verilerin Korunması Kanunu ve
                  5651 sayılı İnternet Ortamında Yapılan Yayınların Düzenlenmesi
                  ve Bu Yayınlar Yoluyla İşlenen Suçlarla Mücadele Edilmesi
                  Hakkında Kanun uyarınca hazırlanmıştır.
                </p>
              </div>
            </div>
          </PageSection>

          {/* Çerez Türleri */}
          <PageSection icon={FileText} title="Kullandığımız Çerez Türleri">
            <div className="space-y-4 text-gray-300">
              <div className="grid gap-4">
                {/* Zorunlu Çerezler */}
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-5 w-5 text-red-400" />
                    <h3 className="font-semibold text-white">
                      1. Zorunlu Çerezler (Strictly Necessary)
                    </h3>
                  </div>
                  <p className="text-sm mb-3">
                    Platformun temel işlevlerini yerine getirmek için gerekli
                    çerezlerdir. Bu çerezler olmadan site düzgün çalışamaz.
                  </p>
                  <div className="bg-slate-900/50 rounded p-3 text-xs">
                    <p className="font-semibold text-white mb-2">Örnekler:</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Oturum yönetimi (Firebase Auth)</li>
                      <li>Güvenlik token&apos;ları</li>
                      <li>Form doğrulama</li>
                      <li>CSRF koruması</li>
                    </ul>
                    <p className="text-gray-400 mt-2">
                      <strong>Hukuki Dayanak:</strong> KVKK m.5/2-ç (Hukuki
                      yükümlülük)
                    </p>
                    <p className="text-gray-400">
                      <strong>İzin Gereksinimi:</strong>{" "}
                      <span className="text-red-300">Hayır (Zorunlu)</span>
                    </p>
                  </div>
                </div>

                {/* İşlevsel Çerezler */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Settings className="h-5 w-5 text-blue-400" />
                    <h3 className="font-semibold text-white">
                      2. İşlevsel Çerezler (Functional)
                    </h3>
                  </div>
                  <p className="text-sm mb-3">
                    Tercihlerinizi hatırlayarak kişiselleştirilmiş deneyim sunan
                    çerezler.
                  </p>
                  <div className="bg-slate-900/50 rounded p-3 text-xs">
                    <p className="font-semibold text-white mb-2">Örnekler:</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Dil tercihi</li>
                      <li>Tema ayarı (karanlık/aydınlık mod)</li>
                      <li>Bildirim tercihleri</li>
                      <li>Görüntüleme ayarları</li>
                    </ul>
                    <p className="text-gray-400 mt-2">
                      <strong>Hukuki Dayanak:</strong> KVKK m.5/1 (Açık rıza)
                    </p>
                    <p className="text-gray-400">
                      <strong>İzin Gereksinimi:</strong>{" "}
                      <span className="text-blue-300">Evet</span>
                    </p>
                    <p className="text-gray-400">
                      <strong>Saklama Süresi:</strong> 1 yıl
                    </p>
                  </div>
                </div>

                {/* Performans Çerezleri */}
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Eye className="h-5 w-5 text-emerald-400" />
                    <h3 className="font-semibold text-white">
                      3. Performans Çerezleri (Analytics)
                    </h3>
                  </div>
                  <p className="text-sm mb-3">
                    Site kullanımı hakkında anonim istatistikler toplayan
                    çerezler.
                  </p>
                  <div className="bg-slate-900/50 rounded p-3 text-xs">
                    <p className="font-semibold text-white mb-2">Örnekler:</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Sayfa görüntüleme istatistikleri</li>
                      <li>Kullanıcı davranış analizi</li>
                      <li>Hata raporlama (Sentry)</li>
                      <li>Performans metrikleri (Vercel Analytics)</li>
                    </ul>
                    <p className="text-gray-400 mt-2">
                      <strong>Hukuki Dayanak:</strong> KVKK m.5/2-f (Meşru
                      menfaat)
                    </p>
                    <p className="text-gray-400">
                      <strong>İzin Gereksinimi:</strong>{" "}
                      <span className="text-emerald-300">Evet</span>
                    </p>
                    <p className="text-gray-400">
                      <strong>Saklama Süresi:</strong> 2 yıl
                    </p>
                  </div>
                </div>

                {/* Hedefleme/Reklam Çerezleri */}
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-5 w-5 text-purple-400" />
                    <h3 className="font-semibold text-white">
                      4. Hedefleme/Reklam Çerezleri (Targeting)
                    </h3>
                  </div>
                  <p className="text-sm mb-3">
                    İlgi alanlarınıza göre özelleştirilmiş içerik göstermek için
                    kullanılan çerezler.
                  </p>
                  <div className="bg-slate-900/50 rounded p-3 text-xs">
                    <p className="font-semibold text-white mb-2">
                      <span className="text-red-400">⚠️</span> Şu anda
                      kullanılmıyor
                    </p>
                    <p className="text-gray-400">
                      Platformumuzda şu an için hedefleme veya reklam çerezleri
                      kullanılmamaktadır. Gelecekte kullanılması durumunda açık
                      rızanız alınacaktır.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </PageSection>

          {/* Üçüncü Taraf Çerezler */}
          <PageSection icon={Shield} title="Üçüncü Taraf Çerez Sağlayıcıları">
            <div className="space-y-4 text-gray-300">
              <p>
                Platformumuzda aşağıdaki üçüncü taraf hizmet sağlayıcıların
                çerezleri kullanılmaktadır:
              </p>

              <div className="grid gap-4">
                {/* Firebase */}
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-5">
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                    🔥 Firebase (Google)
                  </h4>
                  <p className="text-sm mb-2">
                    Kimlik doğrulama ve veritabanı hizmetleri
                  </p>
                  <div className="text-xs space-y-1">
                    <p>
                      <strong>Çerez Türü:</strong> Zorunlu + İşlevsel
                    </p>
                    <p>
                      <strong>Amaç:</strong> Oturum yönetimi, kullanıcı kimlik
                      doğrulama
                    </p>
                    <p>
                      <strong>Veri Konumu:</strong> ABD (GDPR/KVKK uyumlu)
                    </p>
                    <p>
                      <strong>Gizlilik Politikası:</strong>{" "}
                      <a
                        href="https://policies.google.com/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        policies.google.com/privacy
                      </a>
                    </p>
                  </div>
                </div>

                {/* Vercel */}
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-5">
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                    ▲ Vercel
                  </h4>
                  <p className="text-sm mb-2">
                    Hosting, performans ve analytics hizmetleri
                  </p>
                  <div className="text-xs space-y-1">
                    <p>
                      <strong>Çerez Türü:</strong> Zorunlu + Performans
                    </p>
                    <p>
                      <strong>Amaç:</strong> Site performansı, hata izleme,
                      analytics
                    </p>
                    <p>
                      <strong>Veri Konumu:</strong> ABD/Global CDN
                    </p>
                    <p>
                      <strong>Gizlilik Politikası:</strong>{" "}
                      <a
                        href="https://vercel.com/legal/privacy-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        vercel.com/legal/privacy-policy
                      </a>
                    </p>
                  </div>
                </div>

                {/* Cloudinary */}
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-5">
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                    ☁️ Cloudinary
                  </h4>
                  <p className="text-sm mb-2">Görsel dosya depolama hizmeti</p>
                  <div className="text-xs space-y-1">
                    <p>
                      <strong>Çerez Türü:</strong> Zorunlu
                    </p>
                    <p>
                      <strong>Amaç:</strong> Ödeme dekontları ve profil
                      fotoğrafları saklama
                    </p>
                    <p>
                      <strong>Veri Konumu:</strong> AB (GDPR uyumlu)
                    </p>
                    <p>
                      <strong>Gizlilik Politikası:</strong>{" "}
                      <a
                        href="https://cloudinary.com/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        cloudinary.com/privacy
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </PageSection>

          {/* Çerez Yönetimi */}
          <PageSection icon={Settings} title="Çerez Tercihlerinizi Yönetin">
            <div className="space-y-4 text-gray-300">
              <p>
                Zorunlu çerezler dışındaki tüm çerezleri kontrol edebilir ve
                istediğiniz zaman tercihlerinizi değiştirebilirsiniz.
              </p>

              <div className="grid gap-4">
                {/* Platform Üzerinden */}
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-5">
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Settings className="h-5 w-5 text-emerald-400" />
                    Platform Ayarlarından
                  </h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>
                      Profil menüsünden &quot;Ayarlar&quot; bölümüne gidin
                    </li>
                    <li>&quot;Gizlilik ve Güvenlik&quot; sekmesini seçin</li>
                    <li>&quot;Çerez Tercihleri&quot; bölümünü bulun</li>
                    <li>İstediğiniz çerez kategorilerini aktif/pasif edin</li>
                  </ol>
                  <div className="mt-4">
                    <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors">
                      Çerez Tercihlerini Yönet
                    </button>
                  </div>
                </div>

                {/* Tarayıcı Ayarları */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-5">
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Eye className="h-5 w-5 text-blue-400" />
                    Tarayıcı Ayarlarından
                  </h4>
                  <p className="text-sm mb-3">
                    Tarayıcınızın ayarlarından tüm çerezleri engelleyebilir veya
                    silebilirsiniz:
                  </p>
                  <div className="space-y-2 text-xs">
                    <p>
                      <strong>Chrome:</strong> Ayarlar → Gizlilik ve güvenlik →
                      Çerezler
                    </p>
                    <p>
                      <strong>Firefox:</strong> Ayarlar → Gizlilik ve Güvenlik →
                      Çerezler ve Site Verileri
                    </p>
                    <p>
                      <strong>Safari:</strong> Tercihler → Gizlilik → Çerezleri
                      ve web sitesi verilerini yönet
                    </p>
                    <p>
                      <strong>Edge:</strong> Ayarlar → Çerezler ve site izinleri
                    </p>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded p-3 mt-3">
                    <p className="text-xs text-amber-300">
                      <strong>⚠️ Uyarı:</strong> Tüm çerezleri engellerseniz
                      platform düzgün çalışmayabilir ve giriş
                      yapamayabilirsiniz.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </PageSection>

          {/* Haklarınız */}
          <PageSection icon={Shield} title="Çerezlerle İlgili Haklarınız">
            <div className="space-y-4 text-gray-300">
              <p>
                KVKK kapsamında çerezlerle ilgili şu haklarınız bulunmaktadır:
              </p>

              <div className="grid gap-3">
                <div className="bg-slate-800/30 p-4 rounded-lg">
                  <strong className="text-white">
                    ✓ Çerez kullanımı hakkında bilgilendirilme hakkı
                  </strong>
                </div>
                <div className="bg-slate-800/30 p-4 rounded-lg">
                  <strong className="text-white">
                    ✓ Çerez tercihlerinizi değiştirme hakkı
                  </strong>
                </div>
                <div className="bg-slate-800/30 p-4 rounded-lg">
                  <strong className="text-white">
                    ✓ Çerezleri silme veya engelleme hakkı
                  </strong>
                </div>
                <div className="bg-slate-800/30 p-4 rounded-lg">
                  <strong className="text-white">
                    ✓ Çerez verilerinizin bir kopyasını isteme hakkı (KVKK m.11)
                  </strong>
                </div>
                <div className="bg-slate-800/30 p-4 rounded-lg">
                  <strong className="text-white">
                    ✓ Açık rızanızı geri çekme hakkı
                  </strong>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-5 mt-4">
                <p className="text-sm">
                  Haklarınızı kullanmak için{" "}
                  <a
                    href="/kvkk"
                    className="text-blue-400 hover:underline font-semibold"
                  >
                    KVKK Aydınlatma Metni
                  </a>
                  &apos;nde belirtilen yöntemlerle bize başvurabilirsiniz.
                </p>
              </div>
            </div>
          </PageSection>

          {/* İletişim */}
          <PageSection icon={FileText} title="İletişim">
            <div className="space-y-4 text-gray-300">
              <p>
                Çerez politikamız hakkında sorularınız için bizimle iletişime
                geçebilirsiniz:
              </p>

              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
                <div className="space-y-3 text-sm">
                  <p>
                    <strong className="text-white">E-posta:</strong>{" "}
                    kvkk@analysisday.com
                  </p>
                  <p>
                    <strong className="text-white">Adres:</strong> [Şirket
                    Adresi]
                  </p>
                </div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mt-6">
                <p className="text-sm">
                  <strong className="text-emerald-300">✓</strong> Bu çerez
                  politikası son olarak 21 Kasım 2025 tarihinde güncellenmiştir.
                  Değişiklikler bu sayfada yayımlanacak ve sizlere
                  bildirilecektir.
                </p>
              </div>
            </div>
          </PageSection>
        </div>
      </div>
    </div>
  );
}
