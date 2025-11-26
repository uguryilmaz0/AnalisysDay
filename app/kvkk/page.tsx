"use client";

import { Shield, FileText, Eye, Lock, UserCheck, Scale } from "lucide-react";
import { PageSection } from "@/shared/components/PageSection";

export default function KVKKPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700/50">
        <div className="max-w-5xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Shield className="h-8 w-8 text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold text-white">
              KVKK Aydınlatma Metni
            </h1>
          </div>
          <p className="text-xl text-gray-300 mt-4">
            6698 Sayılı Kişisel Verilerin Korunması Kanunu Kapsamında
            Bilgilendirme
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Son Güncellenme: 21 Kasım 2025
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Veri Sorumlusu */}
          <PageSection icon={Scale} title="Veri Sorumlusu">
            <div className="space-y-4 text-gray-300">
              <p>
                6698 sayılı Kişisel Verilerin Korunması Kanunu
                (&quot;KVKK&quot;) uyarınca, kişisel verileriniz; veri sorumlusu
                olarak <strong className="text-white">Analiz Günü</strong>{" "}
                (&quot;Şirket&quot;) tarafından aşağıda açıklanan kapsamda
                işlenebilecektir.
              </p>

              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 mt-4">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-400" />
                  Şirket İletişim Bilgileri
                </h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Ünvan:</strong> Analiz Günü Eğitim ve Danışmanlık
                    Platformu
                  </p>
                  <p>
                    <strong>Adres:</strong> [Şirket Adresi Eklenecek]
                  </p>
                  <p>
                    <strong>E-posta:</strong> kvkk@analizgunu.com
                  </p>
                  <p>
                    <strong>KEP Adresi:</strong> [KEP Adresi Eklenecek]
                  </p>
                  <p>
                    <strong>Mersis No:</strong> [Mersis No Eklenecek]
                  </p>
                </div>
              </div>
            </div>
          </PageSection>

          {/* İşlenen Kişisel Veriler */}
          <PageSection icon={Eye} title="İşlenen Kişisel Verileriniz">
            <div className="space-y-4 text-gray-300">
              <p>
                Platformumuz üzerinden aşağıdaki kişisel verileriniz
                işlenmektedir:
              </p>

              <div className="grid gap-4 mt-4">
                {/* Kimlik Bilgileri */}
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">
                    1. Kimlik Bilgileri
                  </h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Ad, Soyad</li>
                    <li>E-posta Adresi</li>
                    <li>Kullanıcı Adı</li>
                    <li>Telefon Numarası (isteğe bağlı)</li>
                  </ul>
                </div>

                {/* İletişim Bilgileri */}
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">
                    2. İletişim Bilgileri
                  </h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>E-posta Adresi</li>
                    <li>WhatsApp İletişim Tercihi</li>
                    <li>Bildirim Tercihleri</li>
                  </ul>
                </div>

                {/* Abonelik ve İşlem Bilgileri */}
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">
                    3. Abonelik ve İşlem Bilgileri
                  </h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Abonelik Planı ve Durumu</li>
                    <li>Ödeme Dekontları (görsel)</li>
                    <li>İşlem Tarihleri</li>
                    <li>IBAN Bilgisi (sadece ödeme için)</li>
                  </ul>
                </div>

                {/* Teknik Veriler */}
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">
                    4. Teknik ve İnternet Bilgileri
                  </h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>IP Adresi</li>
                    <li>Çerez Verileri</li>
                    <li>Tarayıcı Bilgileri</li>
                    <li>Cihaz Bilgileri</li>
                    <li>Kullanım Logları</li>
                  </ul>
                </div>
              </div>
            </div>
          </PageSection>

          {/* İşleme Amaçları */}
          <PageSection
            icon={FileText}
            title="Kişisel Verilerin İşlenme Amaçları"
          >
            <div className="space-y-4 text-gray-300">
              <p>Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>

              <div className="space-y-3 mt-4">
                <div className="flex items-start gap-3 bg-slate-800/30 p-4 rounded-lg">
                  <div className="text-blue-400 mt-1">✓</div>
                  <div>
                    <strong className="text-white">
                      Eğitim Platformu Hizmeti:
                    </strong>{" "}
                    Spor istatistik analizi ve veri okuma eğitim içeriklerine
                    erişim sağlamak
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-800/30 p-4 rounded-lg">
                  <div className="text-blue-400 mt-1">✓</div>
                  <div>
                    <strong className="text-white">Üyelik Yönetimi:</strong>{" "}
                    Kullanıcı hesabı oluşturmak, kimlik doğrulama yapmak ve
                    hesap güvenliğini sağlamak
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-800/30 p-4 rounded-lg">
                  <div className="text-blue-400 mt-1">✓</div>
                  <div>
                    <strong className="text-white">Abonelik İşlemleri:</strong>{" "}
                    Ödeme onayları, abonelik yönetimi ve faturalama işlemlerini
                    gerçekleştirmek
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-800/30 p-4 rounded-lg">
                  <div className="text-blue-400 mt-1">✓</div>
                  <div>
                    <strong className="text-white">İletişim:</strong> Destek
                    talepleri, bildirimler ve platform güncellemeleri hakkında
                    bilgilendirme yapmak
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-800/30 p-4 rounded-lg">
                  <div className="text-blue-400 mt-1">✓</div>
                  <div>
                    <strong className="text-white">Hizmet İyileştirme:</strong>{" "}
                    Platform performansını izlemek ve kullanıcı deneyimini
                    geliştirmek
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-800/30 p-4 rounded-lg">
                  <div className="text-blue-400 mt-1">✓</div>
                  <div>
                    <strong className="text-white">Yasal Yükümlülük:</strong>{" "}
                    Yasal düzenlemelere uyum sağlamak ve yetkili otoritelerin
                    taleplerini karşılamak
                  </div>
                </div>
              </div>
            </div>
          </PageSection>

          {/* Hukuki Sebepler */}
          <PageSection icon={Scale} title="İşlemenin Hukuki Sebepleri">
            <div className="space-y-4 text-gray-300">
              <p>
                Kişisel verileriniz KVKK&apos;nın 5. ve 6. maddelerinde
                belirtilen aşağıdaki hukuki sebeplere dayanılarak işlenmektedir:
              </p>

              <div className="grid gap-4 mt-4">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-emerald-400" />
                    Açık Rıza (KVKK m.5/1)
                  </h4>
                  <p className="text-sm">
                    Kayıt sırasında verdiğiniz açık rıza ile e-posta adresi,
                    iletişim tercihleri ve ödeme bilgileriniz işlenmektedir.
                  </p>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">
                    Sözleşmenin İfası (KVKK m.5/2-c)
                  </h4>
                  <p className="text-sm">
                    Platform kullanım sözleşmesinin kurulması ve ifası için
                    gerekli olan kimlik, iletişim ve abonelik bilgileriniz
                    işlenmektedir.
                  </p>
                </div>

                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">
                    Meşru Menfaat (KVKK m.5/2-f)
                  </h4>
                  <p className="text-sm">
                    Platform güvenliği, hizmet kalitesi ve kullanıcı deneyiminin
                    iyileştirilmesi için teknik veriler ve kullanım logları
                    işlenmektedir.
                  </p>
                </div>

                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">
                    Yasal Yükümlülük (KVKK m.5/2-ç)
                  </h4>
                  <p className="text-sm">
                    Vergi mevzuatı, 5651 sayılı kanun ve diğer yasal
                    düzenlemeler gereği zorunlu kayıtlar tutulmaktadır.
                  </p>
                </div>
              </div>
            </div>
          </PageSection>

          {/* Veri Aktarımı */}
          <PageSection icon={Lock} title="Kişisel Verilerin Aktarılması">
            <div className="space-y-4 text-gray-300">
              <p>
                Kişisel verileriniz, yukarıda belirtilen amaçların
                gerçekleştirilebilmesi ve yasal yükümlülüklerin yerine
                getirilebilmesi için aşağıdaki taraflara aktarılabilmektedir:
              </p>

              <div className="space-y-3 mt-4">
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">
                    🔹 Üçüncü Taraf Hizmet Sağlayıcılar
                  </h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>
                      <strong>Firebase (Google):</strong> Kimlik doğrulama,
                      veritabanı (ABD)
                    </li>
                    <li>
                      <strong>Cloudinary:</strong> Görsel dosya depolama (AB)
                    </li>
                    <li>
                      <strong>Resend:</strong> E-posta gönderim hizmeti (ABD)
                    </li>
                    <li>
                      <strong>Vercel:</strong> Hosting ve sunucu hizmetleri
                      (ABD)
                    </li>
                  </ul>
                  <p className="text-xs text-gray-400 mt-2">
                    * Yurtdışı veri aktarımları KVKK m.9 uyarınca açık rızanız
                    ile yapılmaktadır.
                  </p>
                </div>

                <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">
                    🔹 Yasal Yükümlülük Kapsamında
                  </h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Mahkemeler ve icra daireleri</li>
                    <li>Kolluk kuvvetleri ve savcılıklar</li>
                    <li>Vergi daireleri</li>
                    <li>
                      Kişisel Verileri Koruma Kurumu ve diğer düzenleyici
                      otoriteler
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mt-4">
                <p className="text-sm font-semibold text-amber-300 mb-2">
                  ⚠️ Önemli Bilgilendirme:
                </p>
                <p className="text-sm text-gray-300">
                  Kişisel verileriniz, <strong>hiçbir şekilde</strong> üçüncü
                  taraflara ticari amaçla satılmamakta, kiralanmamakta veya
                  pazarlama amacıyla paylaşılmamaktadır.
                </p>
              </div>
            </div>
          </PageSection>

          {/* KVKK Hakları */}
          <PageSection icon={UserCheck} title="KVKK Kapsamındaki Haklarınız">
            <div className="space-y-4 text-gray-300">
              <p>
                KVKK&apos;nın 11. maddesi uyarınca, veri sorumlusuna başvurarak
                aşağıdaki haklarınızı kullanabilirsiniz:
              </p>

              <div className="grid gap-3 mt-4">
                <div className="bg-slate-800/30 p-4 rounded-lg">
                  <strong className="text-white">
                    1. Kişisel verilerinizin işlenip işlenmediğini öğrenme
                  </strong>
                </div>
                <div className="bg-slate-800/30 p-4 rounded-lg">
                  <strong className="text-white">
                    2. İşlenmişse buna ilişkin bilgi talep etme
                  </strong>
                </div>
                <div className="bg-slate-800/30 p-4 rounded-lg">
                  <strong className="text-white">
                    3. İşlenme amacını ve amacına uygun kullanılıp
                    kullanılmadığını öğrenme
                  </strong>
                </div>
                <div className="bg-slate-800/30 p-4 rounded-lg">
                  <strong className="text-white">
                    4. Yurt içi/yurt dışı aktarılan üçüncü kişileri bilme
                  </strong>
                </div>
                <div className="bg-slate-800/30 p-4 rounded-lg">
                  <strong className="text-white">
                    5. Eksik veya yanlış işlenmişse düzeltilmesini isteme
                  </strong>
                </div>
                <div className="bg-slate-800/30 p-4 rounded-lg">
                  <strong className="text-white">
                    6. KVKK m.7 şartları çerçevesinde silinmesini/yok edilmesini
                    isteme
                  </strong>
                </div>
                <div className="bg-slate-800/30 p-4 rounded-lg">
                  <strong className="text-white">
                    7. Düzeltme/silme işlemlerinin aktarıldığı üçüncü kişilere
                    bildirilmesini isteme
                  </strong>
                </div>
                <div className="bg-slate-800/30 p-4 rounded-lg">
                  <strong className="text-white">
                    8. Otomatik sistemlerle analiz sonucu aleyhinize bir sonuç
                    doğmasına itiraz etme
                  </strong>
                </div>
                <div className="bg-slate-800/30 p-4 rounded-lg">
                  <strong className="text-white">
                    9. Kanuna aykırı işleme nedeniyle zararınızı talep etme
                  </strong>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 mt-6">
                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-400" />
                  Başvuru Yöntemleri
                </h4>
                <div className="space-y-3 text-sm">
                  <p>
                    Haklarınızı kullanmak için aşağıdaki yöntemlerle Şirketimize
                    başvurabilirsiniz:
                  </p>

                  <div className="space-y-2 ml-4">
                    <p>
                      <strong>📧 E-posta:</strong> kvkk@analizgunu.com
                    </p>
                    <p>
                      <strong>📬 Posta:</strong> [Şirket Adresi]
                    </p>
                    <p>
                      <strong>📝 KEP:</strong> [KEP Adresi]
                    </p>
                    <p>
                      <strong>🌐 Platform:</strong> Profil {">"} KVKK Başvurusu
                    </p>
                  </div>

                  <p className="text-gray-400 mt-3">
                    Başvurularınız, niteliğine göre en geç{" "}
                    <strong className="text-white">30 gün</strong> içinde
                    ücretsiz olarak sonuçlandırılacaktır. İşlemin ayrıca bir
                    maliyet gerektirmesi halinde, Kişisel Verileri Koruma
                    Kurulunca belirlenen tarifedeki ücret alınabilir.
                  </p>
                </div>
              </div>
            </div>
          </PageSection>

          {/* Veri Güvenliği */}
          <PageSection icon={Lock} title="Veri Güvenliği Önlemleri">
            <div className="space-y-4 text-gray-300">
              <p>
                Şirketimiz, KVKK&apos;nın 12. maddesi gereği, kişisel
                verilerinizin hukuka aykırı işlenmesini, erişilmesini ve
                açıklanmasını önlemek için teknik ve idari tedbirler almaktadır:
              </p>

              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Lock className="h-5 w-5 text-emerald-400" />
                    Teknik Güvenlik
                  </h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>SSL/TLS şifreleme (HTTPS)</li>
                    <li>Güvenli veritabanı (Firebase)</li>
                    <li>Düzenli güvenlik güncellemeleri</li>
                    <li>Firewall ve DDoS koruması</li>
                    <li>Log kayıtları ve izleme</li>
                  </ul>
                </div>

                <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-blue-400" />
                    İdari Güvenlik
                  </h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Erişim yetkilendirme sistemi</li>
                    <li>Gizlilik taahhütnameleri</li>
                    <li>Personel eğitimleri</li>
                    <li>KVKK uyum prosedürleri</li>
                    <li>Düzenli denetim ve kontroller</li>
                  </ul>
                </div>
              </div>
            </div>
          </PageSection>

          {/* İletişim */}
          <PageSection icon={FileText} title="İletişim">
            <div className="space-y-4 text-gray-300">
              <p>
                KVKK kapsamındaki haklarınız veya kişisel veri işleme
                faaliyetlerimiz hakkında detaylı bilgi almak için bizimle
                iletişime geçebilirsiniz:
              </p>

              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-blue-400" />
                    <div>
                      <strong className="text-white">KVKK Sorumlusu:</strong>{" "}
                      [Yetkili Kişi Adı]
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-emerald-400" />
                    <div>
                      <strong className="text-white">E-posta:</strong>{" "}
                      kvkk@analizgunu.com
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-purple-400" />
                    <div>
                      <strong className="text-white">Adres:</strong> [Şirket
                      Adresi]
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mt-6">
                <p className="text-sm">
                  <strong className="text-emerald-300">✓</strong> Bu aydınlatma
                  metni, yasal düzenlemelerdeki değişiklikler doğrultusunda
                  güncellenebilir. Güncellemeler bu sayfada yayımlanacak ve
                  kayıtlı kullanıcılara e-posta ile bildirilecektir.
                </p>
              </div>
            </div>
          </PageSection>
        </div>
      </div>
    </div>
  );
}
