// Yapılandırılmış blog makaleleri - Yeni sade dil içerikleri
import type {
  BlogSection,
  BlogExample,
  BlogKeyPoint,
} from "@/components/blog/BlogArticle";

// Yapay Zeka makalesinin yapılandırılmış içeriği
export const aiInSportsArticle = {
  introduction:
    "Hiç merak ettiniz mi, futbol takımları maç öncesi nasıl hazırlanıyor? Artık sadece antrenörün tecrübesi yetmiyor - yapay zeka sistemleri, maçları adeta bir satranç oyunu gibi analiz ediyor. Bu yazıda, karmaşık algoritmalar yerine, herkesin anlayabileceği örneklerle yapay zekanın sporda nasıl kullanıldığını öğreneceğiz.",

  sections: [
    {
      title: "Yapay Zeka Nedir ve Ne İşe Yarar?",
      icon: "lightbulb",
      content: `
        <p class="mb-4">Yapay zekayı, çok hızlı öğrenen bir asistan olarak düşünebilirsiniz. Siz binlerce maçı izleyip notlar alsanız bile unutabilirsiniz - ama yapay zeka hiçbir detayı kaçırmaz.</p>
        
        <p class="mb-4"><strong>Günlük hayattan örnek:</strong> Netflix size nasıl film öneriyor? Geçmişte izlediğiniz filmleri analiz ediyor ve "Bu kişi aksiyon filmi seviyor" diyor. Sporda da aynı mantık: Bir takımın geçmiş 50 maçını analiz edip, "Bu takım sağ kanattan atak yapmayı seviyor" gibi bulgular çıkarıyor.</p>
        
        <p><strong>Sporda kullanım alanları:</strong></p>
        <ul class="space-y-2 my-4">
          <li class="flex items-start gap-3"><span class="text-emerald-400 font-bold mt-1">•</span><span><strong>Rakip analizi:</strong> Rakibin zayıf noktalarını bulma</span></li>
          <li class="flex items-start gap-3"><span class="text-emerald-400 font-bold mt-1">•</span><span><strong>Oyuncu değerlendirmesi:</strong> Hangi futbolcu takıma uygun?</span></li>
          <li class="flex items-start gap-3"><span class="text-emerald-400 font-bold mt-1">•</span><span><strong>Sakatlik tahmini:</strong> Hangi oyuncu yorgun, dinlendirmeli miyiz?</span></li>
          <li class="flex items-start gap-3"><span class="text-emerald-400 font-bold mt-1">•</span><span><strong>Taktik planlama:</strong> Hangi diziliş bu maç için en iyi?</span></li>
        </ul>
      `,
    },
    {
      title: "Maç Verileri Nasıl Toplanıyor?",
      icon: "book",
      content: `
        <p class="mb-4">Stadyumlarda artık sadece kameralar yok - akıllı sensörler, GPS cihazları ve özel yazılımlar her şeyi kaydediyor.</p>
        
        <div class="bg-slate-900/50 rounded-lg p-5 my-6 border border-slate-700">
          <p class="text-emerald-400 font-semibold mb-3">📍 Bir maçta toplanan veriler:</p>
          <ul class="space-y-2">
            <li><strong>Oyuncu hareketleri:</strong> Her oyuncu maçta ortalama 10-12 km koşuyor - sistem bunu GPS ile ölçüyor</li>
            <li><strong>Top kontrolü:</strong> Her pası kim kime yaptı, başarılı mı değil mi?</li>
            <li><strong>Şut anları:</strong> Şut nereden atıldı, kaleciye ne kadar yakındı, önünde kaç savunmacı vardı?</li>
            <li><strong>Yorgunluk seviyeleri:</strong> Oyuncunun nabzı, koşu hızı düşüyor mu?</li>
          </ul>
        </div>
        
        <p class="mb-4"><strong>Basit bir benzetme:</strong> Düşünün ki bir video oyunu oynuyorsunuz. Oyun sizin her hamleni kaydediyor - kaç düşman öldürdünüz, kaç kere öldünüz, hangi silahı kullandınız. Sporda da aynısı oluyor, sadece gerçek hayatta!</p>
      `,
    },
    {
      title: "xG (Beklenen Gol) - Herkesin Merak Ettiği Şey",
      icon: "target",
      content: `
        <p class="mb-4">Maç sonrası "2-1 kaybettik ama 2.5 xG'miz vardı" cümlesi duymuşsunuzdur. Bu ne demek?</p>
        
        <p class="mb-4"><strong>Basit açıklama:</strong> xG, "bu pozisyondan genelde gol olur mu?" sorusunun cevabı. Mesela:</p>
        
        <div class="space-y-3 my-4">
          <div class="bg-emerald-500/10 border-l-4 border-emerald-500 pl-4 py-3 rounded-r">
            <p><strong>Penaltı:</strong> xG = 0.75 → %75 ihtimalle gol olur</p>
          </div>
          <div class="bg-blue-500/10 border-l-4 border-blue-500 pl-4 py-3 rounded-r">
            <p><strong>Kale önü boş şut:</strong> xG = 0.60 → %60 ihtimalle gol</p>
          </div>
          <div class="bg-amber-500/10 border-l-4 border-amber-500 pl-4 py-3 rounded-r">
            <p><strong>Ceza sahası dışından şut:</strong> xG = 0.05 → %5 ihtimalle gol</p>
          </div>
        </div>
        
        <p class="mb-4"><strong>Nasıl hesaplanıyor?</strong> Yapay zeka binlerce maçtaki benzer pozisyonlara bakıyor. "Bu mesafeden, bu açıdan atılan 100 şuttan kaç tanesi gol oldu?" diye soruyor.</p>
        
        <p><strong>Ne işe yarar?</strong> Maçı kaybetseniz bile, "Aslında iyi oynadık, şanssızdık" diyebilirsiniz. Ya da tersine: "3-0 kazandık ama rakip çok şanssızdı" anlayabilirsiniz.</p>
      `,
    },
    {
      title: "Takım Taktiklerini Analiz Etmek",
      icon: "chart",
      content: `
        <p class="mb-4">Antrenörler artık sadece maçı izlemiyor - özel yazılımlar sayesinde takımın oyun stilini sayılarla görüyorlar.</p>
        
        <p class="mb-4"><strong>Pressing (Baskı) Analizi:</strong></p>
        <p class="mb-4">Liverpool'un ünlü "gegen-press" taktiğini hatırlıyor musunuz? Topu kaybettikten sonra hemen baskı yapıp geri almak. Yapay zeka bunu "PPDA" denen bir sayı ile ölçüyor:</p>
        
        <ul class="space-y-2 my-4">
          <li class="flex items-start gap-3"><span class="text-red-400 font-bold mt-1">•</span><span><strong>PPDA = 8:</strong> Çok agresif baskı (Liverpool tarzı)</span></li>
          <li class="flex items-start gap-3"><span class="text-amber-400 font-bold mt-1">•</span><span><strong>PPDA = 15:</strong> Orta seviye baskı</span></li>
          <li class="flex items-start gap-3"><span class="text-blue-400 font-bold mt-1">•</span><span><strong>PPDA = 25:</strong> Defansif oyun, az baskı</span></li>
        </ul>
        
        <p class="mb-4"><strong>Pas Ağı Haritaları:</strong></p>
        <p>Hangi oyuncu kime daha çok pas veriyor? Bu bir web gibi çiziliyor. Mesela:</p>
        <ul class="space-y-2 my-4">
          <li class="flex items-start gap-3"><span class="text-emerald-400 font-bold mt-1">•</span><span>Stoper → Orta saha → Forvet hattı net görülüyor mu? ✅ İyi oyun kurma</span></li>
          <li class="flex items-start gap-3"><span class="text-emerald-400 font-bold mt-1">•</span><span>Paslar hep geriye mi gidiyor? ❌ Takım risk almıyor</span></li>
        </ul>
      `,
    },
  ] as BlogSection[],

  examples: [
    {
      title: "Manchester City - Pep Guardiola",
      description:
        "Pep Guardiola her maç öncesi 3-4 saatlik video analizi yapıyor. Yapay zeka sistemi, rakip takımın son 10 maçını otomatik analiz ediyor ve 'bu takım sağ bekten zayıf' gibi raporlar sunuyor.",
      highlight:
        "2025'te City, yapay zeka ile 15 genci keşfetti ve 3'ü ana kadroya yükseldi.",
    },
    {
      title: "Brighton & Hove Albion",
      description:
        "Küçük bir kulüp olmasına rağmen, veri analizi ile ucuz ve yetenekli oyuncular buluyor. 2-3 milyon euroya aldıkları oyuncuları 30-40 milyona satıyorlar.",
      highlight:
        "2024-25 sezonunda 5 oyuncuyu veri analizi ile keşfettiler - hepsi başarılı oldu.",
    },
    {
      title: "Türkiye Süper Ligi",
      description:
        "Fenerbahçe ve Galatasaray artık maçlarda 'live tracking' sistemi kullanıyor. Antrenör, oyun sırasında tablete bakıp 'bu oyuncunun enerjisi %60'a düştü, değiştirelim' diyebiliyor.",
      highlight:
        "2025'te 10'dan fazla Süper Lig takımı yapay zeka analiz sistemine geçti.",
    },
    {
      title: "Sakatlik Önleme",
      description:
        "Oyuncuların GPS verileri analiz edilip, 'bu oyuncu çok yorgun, bu hafta oynamazsa sakatlanma riski düşer' gibi uyarılar veriliyor. Bu sayede yıllık %30 daha az sakatlik oluyor.",
      highlight:
        "Real Madrid bu yöntemle 2024-25'te 8 önemli sakatlığı önceden önledi.",
    },
  ] as BlogExample[],

  keyPoints: [
    {
      text: "Yapay zeka karmaşık değil - sadece çok hızlı öğrenen ve unutmayan bir asistan",
      important: true,
    },
    {
      text: "xG gibi istatistikler, 'şans' faktörünü ortadan kaldırıp gerçek performansı gösteriyor",
    },
    {
      text: "Küçük takımlar bile artık veri analizi ile büyüklerle rekabet edebiliyor",
    },
    {
      text: "Oyuncu alımlarında artık sadece yetenek değil, takıma uyum da ölçülüyor",
    },
    {
      text: "Sakatlik tahminleri sayesinde sporcular daha uzun kariyerler yapabiliyor",
      important: true,
    },
    {
      text: "Antrenörler maç sırasında gerçek zamanlı veri alıp taktik değiştirebiliyor",
    },
  ] as BlogKeyPoint[],

  quote: {
    text: "Futbol artık sadece kalp işi değil, beyin işi de. Ama unutmayın - yapay zeka antrenörün yerini almaz, ona yardımcı olur.",
    author: "Pep Guardiola, Manchester City Teknik Direktörü",
  },

  conclusion:
    "Yapay zeka sporda artık vazgeçilmez. Ama endişelenmeyin - futbolun duygusal, tutkulu yanı asla kaybolmayacak. Teknoloji sadece bu güzel oyunu daha adil, daha rekabetçi ve daha heyecanlı hale getiriyor. Gelecekte her takım, her kulüp bu teknolojiyi kullanacak. Önemli olan, veriyi doğru okuyup, insani kararlarla harmanlayabilmek.",
};

// İstatistik Okuma makalesinin yapılandırılmış içeriği
export const statsGuideArticle = {
  introduction:
    "Maç sonrası 'pas başarısı %87' ya da 'beklenen gol 2.3' gibi sayılar görüyorsunuz ama ne anlama geldiğini tam bilmiyor musunuz? Bu kılavuzda, futbol istatistiklerini okumayı, rakamların arkasındaki hikayeleri anlamayı öğreneceksiniz - teknik jargon yok, sadece sade Türkçe açıklamalar.",

  sections: [
    {
      title: "Temel İstatistikler - İlk Adım",
      icon: "book",
      content: `
        <p class="mb-4">Her futbol maçında onlarca istatistik ölçülüyor. Ama hangilerine dikkat etmeliyiz? Başlayalım en basitlerinden:</p>
        
        <div class="bg-slate-900/50 rounded-lg p-5 my-6 border border-slate-700">
          <p class="text-emerald-400 font-semibold mb-3">📊 Maç sonrası gördüğünüz temel rakamlar:</p>
          <ul class="space-y-3">
            <li><strong>Top Sahipliği (%60):</strong> Takımınız maçın %60'ında topa sahipti. Ama dikkat: %70 top sahipliği olsa da kaybedebilirsiniz!</li>
            <li><strong>Şut Sayısı (15):</strong> 15 şut atılmış. Ama nereden atıldı? Kale direğinden mi, ceza sahasından mı?</li>
            <li><strong>Isabetli Şut (5):</strong> 15 şuttan sadece 5'i kaleyi buldu. %33 isabet oranı - iyi mi kötü mü?</li>
            <li><strong>Korner (8):</strong> 8 korner kazanmışsınız. Bunlardan gol oldu mu? Yoksa hepsi boşa mı gitti?</li>
          </ul>
        </div>
        
        <p class="mb-4"><strong>Önemli Uyarı:</strong> Tek başına bu sayılar çok şey ifade etmez! "10 şut attık ama kaybettik" diyebilirsiniz - belki 10 şut da 25 metreden zayıf şutlardı.</p>
      `,
    },
    {
      title: "Pas İstatistikleri - Oyunu Kim Kontrol Ediyor?",
      icon: "target",
      content: `
        <p class="mb-4">Futbolda her şey pasla başlar. Ama sadece "kaç pas yapıldı" değil, "nasıl paslar" önemli.</p>
        
        <p class="mb-4"><strong>Pas Başarı Oranı (%87):</strong></p>
        <p class="mb-4">100 pasın 87'si hedefine ulaştı demek. Ama şöyle düşünün:</p>
        
        <div class="space-y-3 my-4">
          <div class="bg-blue-500/10 border-l-4 border-blue-500 pl-4 py-3 rounded-r">
            <p><strong>%85 pas başarısı (Kısa paslar):</strong> Stoperden stopere sürekli güvenli pas. Riski yok ama atak da yok.</p>
          </div>
          <div class="bg-emerald-500/10 border-l-4 border-emerald-500 pl-4 py-3 rounded-r">
            <p><strong>%70 pas başarısı (Riskli paslar):</strong> İleri derin paslar, savunma arkasına toplar. Başarı oranı düşük ama gol şansı çok yüksek!</p>
          </div>
        </div>
        
        <p class="mb-4"><strong>Önemli Paslar (Key Passes):</strong></p>
        <p>Bu sayı çok önemli! "Key pass" = şans yaratan pas. Mesela ortasahadan forvetin önüne güzel bir top verdiniz, forvet şut çekti ama girmedi. İşte bu bir key pass!</p>
        
        <p class="mb-4"><strong>Final Üçlüde Paslar:</strong></p>
        <p>Rakip ceza sahası yakınında (son 30 metrede) yapılan paslar. Takım hücum ediyor mu? Bu sayıya bakın!</p>
      `,
    },
    {
      title: "Şut Kalitesi - Sadece Şut Sayısı Yetmez",
      icon: "chart",
      content: `
        <p class="mb-4">15 şut atmışsınız, rakip 8 şut atmış ama skor 1-1. Neden? Çünkü şutun NEREden atıldığı önemli!</p>
        
        <div class="bg-slate-900/50 rounded-lg p-5 my-6 border border-slate-700">
          <p class="text-amber-400 font-semibold mb-3">🎯 Şut pozisyonlarına göre gol olma ihtimali:</p>
          <ul class="space-y-2">
            <li><strong>Penaltı noktası (11m):</strong> %15-20 gol olma ihtimali</li>
            <li><strong>Ceza sahası içi (orta):</strong> %10-15 ihtimal</li>
            <li><strong>Ceza sahası kenarı:</strong> %5-8 ihtimal</li>
            <li><strong>30 metre dışarı:</strong> %1-2 ihtimal (Hakan Çalhanoğlu hariç 😊)</li>
          </ul>
        </div>
        
        <p class="mb-4"><strong>Gerçek Örnek:</strong></p>
        <p class="mb-4">Takım A: 20 şut, hepsi 25 metreden → xG toplamı: 0.4 (yani gol beklentisi çok düşük)</p>
        <p>Takım B: 5 şut, hepsi ceza sahası içinden → xG toplamı: 1.8 (yüksek gol beklentisi)</p>
        <p class="mt-2 text-emerald-300">Sonuç: Takım B muhtemelen maçı kazanacak, çünkü daha kaliteli pozisyonlar yarattı!</p>
      `,
    },
    {
      title: "Savunma İstatistikleri - Gol Yememek",
      icon: "check",
      content: `
        <p class="mb-4">Saldırı kadar savunma da önemli. Peki savunmayı nasıl ölçüyoruz?</p>
        
        <p class="mb-4"><strong>Topu Kurtarma (Clearance):</strong></p>
        <p class="mb-4">Savunmacı tehlikeli bir topu uzaklaştırdı. Maçta 25 topu kurtarma varsa, takım çok baskı altında demektir!</p>
        
        <p class="mb-4"><strong>Müdahale (Tackle):</strong></p>
        <p class="mb-4">Rakibin ayağından topu alma. Başarılı müdahale oranı önemli:</p>
        <ul class="space-y-2 my-4">
          <li class="flex items-start gap-3"><span class="text-emerald-400 font-bold mt-1">•</span><span><strong>%70+ başarılı müdahale:</strong> İyi savunma oyuncusu</span></li>
          <li class="flex items-start gap-3"><span class="text-amber-400 font-bold mt-1">•</span><span><strong>%50 civarı:</strong> Ortalama performans</span></li>
          <li class="flex items-start gap-3"><span class="text-red-400 font-bold mt-1">•</span><span><strong>%40 altı:</strong> Savunmacı zorlanıyor, çok faul yapıyor olabilir</span></li>
        </ul>
        
        <p class="mb-4"><strong>Top Kesme (Interception):</strong></p>
        <p>Pas yolunu keserek topu alma. Zeki savunmacılar bu konuda iyidir. Pozisyon okuma yeteneği gerektirir.</p>
      `,
    },
  ] as BlogSection[],

  examples: [
    {
      title: "Gerçek Maç Örneği: Fenerbahçe vs Galatasaray",
      description:
        "Fenerbahçe %58 top tuttu, 18 şut attı. Galatasaray %42 top tuttu, 9 şut attı. Skor: 1-2 Galatasaray kazandı. Neden? Galatasaray'ın 9 şutunun 6'sı ceza sahası içindendi (xG: 2.1). Fenerbahçe'nin 18 şutunun çoğu uzaktan zayıf şutlardı (xG: 0.9).",
      highlight: "Ders: Şut sayısı değil, şut kalitesi önemli!",
    },
    {
      title: "Oyuncu Karşılaştırması: 2 Forvet",
      description:
        "Forvet A: 4 gol attı, 25 şut çekti. Forvet B: 4 gol attı, 12 şut çekti. Hangisi daha iyi? Forvet B! Çünkü daha az şutla aynı golü attı - daha verimli pozisyonlar yaratıyor demektir.",
      highlight: "Şut/Gol oranı düşükse = verimli forvet",
    },
    {
      title: "Savunma Analizi: Arda Güler",
      description:
        "Arda Güler ofansif oyuncu ama defansta da çalışıyor. Maç başına ortalama 2.5 topu kurtarma, 1.8 top kesme yapıyor. Bu, sadece saldırmadığını, defansa da yardım ettiğini gösteriyor.",
      highlight: "Modern futbolda herkes defans yapar - Arda iyi örnek!",
    },
  ] as BlogExample[],

  keyPoints: [
    {
      text: "Top sahipliği yüksek olsa da kaybedebilirsiniz - önemli olan ne yaptığınız",
      important: true,
    },
    {
      text: "Pas başarısı %90 bile olsa, eğer hep geriye pas yapıyorsanız işe yaramaz",
    },
    {
      text: "Şut sayısından çok, şutun nereden atıldığı önemli (xG metriği bunu ölçer)",
    },
    {
      text: "Savunmada sadece topu kurtarmak değil, akıllıca pozisyon almak da önemli",
    },
    {
      text: "İstatistikler hikayenin sadece bir parçası - maçı izlemek hala en önemlisi!",
      important: true,
    },
  ] as BlogKeyPoint[],

  quote: {
    text: "İstatistikler bize gerçeği gösterir, ama futbolun ruhunu hissetmek için maçı izlemeniz gerekir.",
    author: "Jose Mourinho",
  },

  conclusion:
    "İstatistikleri okumayı öğrenmek, futbolu daha derin anlamak için harika bir yol. Artık maç sonrası rakamları gördüğünüzde, sadece sayılara değil, onların arkasındaki hikayelere bakabilirsiniz. Unutmayın: İstatistikler araçtır, amaç değil. Asıl önemli olan, bu verileri kullanarak takımınızın nasıl gelişebileceğini anlamaktır!",
};

// Futbol İstatistikleri Okuma Rehberi
export const footballStatsGuide = {
  introduction:
    "Modern futbolda sadece golü atmak yetmiyor - hangi pozisyondan atıldığı, nasıl bir oyunla yaratıldığı çok önemli. Bu rehberde, xG (beklenen gol), pas ağları, pressing metrikleri gibi karmaşık gibi görünen ama aslında çok basit kavramları öğreneceksiniz. Hiç matemat bilginiz olmasa bile anlayacaksınız!",

  sections: [
    {
      title: "xG (Expected Goals) - Geleceğin Dili",
      icon: "target",
      content: `
        <p class="mb-4">xG, futbolun en popüler metriği. Basitçe: "Bu pozisyon ne kadar tehlikeliydi?" sorusunun sayısal cevabı.</p>
        
        <div class="bg-slate-900/50 rounded-lg p-5 my-6 border border-slate-700">
          <p class="text-emerald-400 font-semibold mb-3">🎯 xG Değerleri Nasıl Okunur:</p>
          <ul class="space-y-2">
            <li><strong>xG = 0.01-0.10:</strong> Çok zor pozisyon, gol olma şansı düşük</li>
            <li><strong>xG = 0.10-0.30:</strong> Orta kalite şans, dikkat gerektirir</li>
            <li><strong>xG = 0.30-0.60:</strong> İyi pozisyon, gol beklenebilir</li>
            <li><strong>xG = 0.60+:</strong> Muhteşem şans, golcü bunu atmalı!</li>
          </ul>
        </div>
        
        <p class="mb-4"><strong>Gerçek Örnek:</strong> Erling Haaland 2024-25'te 28 gol attı. Toplam xG'si 24 idi. Yani 4 gol "beklentinin üzerinde" - bu da onun süper kaliteli bir golcü olduğunu gösteriyor!</p>
      `,
    },
    {
      title: "Pas Ağları (Pass Networks) - Takımın DNA'sı",
      icon: "chart",
      content: `
        <p class="mb-4">Pas ağı haritası, hangi oyuncunun kime ne kadar pas verdiğini gösteren görsel bir harita. Takımın oyun stilini anlamanın en iyi yolu!</p>
        
        <p class="mb-4"><strong>Nasıl Yorumlanır?</strong></p>
        <ul class="space-y-2 my-4">
          <li class="flex items-start gap-3"><span class="text-emerald-400 font-bold mt-1">•</span><span><strong>Kalın çizgiler:</strong> Bu iki oyuncu çok fazla pas alışverişi yapıyor - iyi uyum var</span></li>
          <li class="flex items-start gap-3"><span class="text-blue-400 font-bold mt-1">•</span><span><strong>Ortada yoğunlaşma:</strong> Takım orta sahadan oyun kuruyor</span></li>
          <li class="flex items-start gap-3"><span class="text-amber-400 font-bold mt-1">•</span><span><strong>İzole oyuncular:</strong> O oyuncu oyundan kopuk, topa az dokunuyor</span></li>
        </ul>
        
        <p class="mb-4"><strong>Barcelona Örneği:</strong> Pep Guardiola döneminde Xavi-Iniesta-Busquets üçgeni, pas ağı haritasında sürekli birbirlerine kalın çizgilerle bağlıydı. Bu da "tiki-taka" oyununun görsel kanıtıydı!</p>
      `,
    },
    {
      title: "Pressing Metrikleri - Defans da Saldırıdır",
      icon: "check",
      content: `
        <p class="mb-4">Pressing, topu olmayan takımın rakibe baskı yapması. Modern futbolda çok önemli!</p>
        
        <div class="space-y-3 my-4">
          <div class="bg-red-500/10 border-l-4 border-red-500 pl-4 py-3 rounded-r">
            <p><strong>Yüksek Pressing:</strong> Rakibin kalesine yakın baskı yapma. Liverpool, Manchester City tarzı</p>
          </div>
          <div class="bg-blue-500/10 border-l-4 border-blue-500 pl-4 py-3 rounded-r">
            <p><strong>Orta Saha Pressing:</strong> Orta sahada topu kesmeye çalışma. Atletico Madrid tarzı</p>
          </div>
          <div class="bg-amber-500/10 border-l-4 border-amber-500 pl-4 py-3 rounded-r">
            <p><strong>Düşük Blok:</strong> Kendi ceza sahasına çekilip kontra beklemek. Mourinho tarzı</p>
          </div>
        </div>
        
        <p class="mb-4"><strong>PPDA Metriği:</strong> "Rakibin kaç pasına izin veriyorsunuz?" Düşük PPDA = agresif pressing. Liverpool'un PPDA'sı genelde 7-9 civarı, çok agresif!</p>
      `,
    },
    {
      title: "Isı Haritaları (Heatmaps) - Oyuncu Nerede?",
      icon: "lightbulb",
      content: `
        <p class="mb-4">Isı haritası, oyuncunun maç boyunca hangi bölgelerde bulunduğunu gösteren renkli harita. Kırmızı = çok zaman, mavi = az zaman.</p>
        
        <p class="mb-4"><strong>Ne Anlama Gelir?</strong></p>
        <ul class="space-y-2 my-4">
          <li class="flex items-start gap-3"><span class="text-emerald-400 font-bold mt-1">•</span><span><strong>Kanat oyuncusu:</strong> Isı haritası yanda yoğunlaşmalı</span></li>
          <li class="flex items-start gap-3"><span class="text-emerald-400 font-bold mt-1">•</span><span><strong>Forvet:</strong> Ceza sahası içinde kırmızı bölge olmalı</span></li>
          <li class="flex items-start gap-3"><span class="text-emerald-400 font-bold mt-1">•</span><span><strong>Orta saha:</strong> Ortada geniş bir kırmızı alan olmalı</span></li>
        </ul>
        
        <p class="mb-4"><strong>Dikkat:</strong> Eğer forvetinizin ısı haritası orta sahada yoğunsa, bu bir sorun! Forvet öne gitmiyor, geriye geliyor demektir.</p>
      `,
    },
  ] as BlogSection[],

  examples: [
    {
      title: "Real Madrid - Vinicius Jr Analizi",
      description:
        "Vinicius'un xG değeri 0.45/maç ama gerçek gol sayısı 0.65/maç. Bu, beklentinin üzerinde performans gösterdiği anlamına geliyor. Ayrıca ısı haritası sol kanatta yoğunlaşıyor - klasik kanat oyuncusu profili.",
      highlight: "2024-25'te 18 gol, beklenen 13 gol - süperstar!",
    },
    {
      title: "Inter Milan - Pressing Başarısı",
      description:
        "Inter'in PPDA değeri 12-14 arası, orta seviye pressing. Ama pressing başarı oranı %68 - çok yüksek! Yani az pressingçok etkili kullanıyorlar.",
      highlight: "Az ama etkili pressing = akıllı defans",
    },
    {
      title: "Arda Güler - Real Madrid",
      description:
        "Arda'nın pas ağı haritası, Modric ve Bellingham'a çok bağlı. Bu üçlü sürekli pas alışverişi yapıyor. Ayrıca ısı haritası sağ kanat ve 10 numara bölgesinde yoğun.",
      highlight: "Arda, hem kanat hem de on numara oynuyor - çok yönlü!",
    },
  ] as BlogExample[],

  keyPoints: [
    {
      text: "xG sadece bir sayı değil - pozisyon kalitesini objektif ölçer",
      important: true,
    },
    {
      text: "Pas ağı haritaları, takım kimyasını görselleştirir",
    },
    {
      text: "Pressing metrikler, savunma stratejisini anlamanın anahtarı",
    },
    {
      text: "Isı haritaları, oyuncu pozisyonunu ve disiplinini gösterir",
    },
    {
      text: "Tüm bu metrikler birlikte kullanılınca, maçın tam hikayesini anlatır",
      important: true,
    },
  ] as BlogKeyPoint[],

  quote: {
    text: "İstatistikler futbolu açıklamaz, ama futbolu anlamanıza yardımcı olur.",
    author: "Carlo Ancelotti",
  },

  conclusion:
    "Modern futbol istatistikleri karmaşık görünebilir, ama temel prensipleri anladığınızda her şey netleşir. xG, pas ağları, pressing metrikleri - bunların hepsi aslında futbolun hikayesini farklı açılardan anlat yolları. Bir sonraki maçı izlerken, bu metrikleri aklınızda tutun ve futbolu daha derin anlayın!",
};

// Profesyonel Maç Analizi Eğitimi
export const matchAnalysisTraining = {
  introduction:
    "Profesyonel maç analizi yapmak istiyorsunuz ama nereden başlayacağınızı bilmiyor musunuz? Bu eğitimde, adım adım maç analizi yapmanın 5 temel prensibini öğreneceksiniz. Karmaşık teoriler yok, sadece pratik ve uygulamalı bilgiler!",

  sections: [
    {
      title: "1. Maç Öncesi Hazırlık - Ev Ödevi",
      icon: "book",
      content: `
        <p class="mb-4">İyi bir analizin temeli, maçtan önce yapılan hazırlıkta başlar.</p>
        
        <div class="bg-slate-900/50 rounded-lg p-5 my-6 border border-slate-700">
          <p class="text-emerald-400 font-semibold mb-3">📋 Maç öncesi kontrol listesi:</p>
          <ul class="space-y-2">
            <li><strong>Son 5 maç analizi:</strong> Her iki takımın formu nasıl?</li>
            <li><strong>Kafa kafaya istatistikler:</strong> Geçmişte kim daha başarılı?</li>
            <li><strong>Sakatlık ve cezalı oyuncular:</strong> Kimler yok?</li>
            <li><strong>Taktiksel eğilimler:</strong> Bu takımlar genelde nasıl oynar?</li>
            <li><strong>Motivasyon faktörleri:</strong> Hangi takımın kazanma baskısı var?</li>
          </ul>
        </div>
        
        <p class="mb-4"><strong>Pro İpucu:</strong> Sadece sayılara bakmayın. "Bu takım son 3 maçta 0 gol yedi" derseniz, bir de rakiplere bakın. Belki 3 maç da alt sıra takımlarına karşıydı!</p>
      `,
    },
    {
      title: "2. İlk 15 Dakika - Tempo Tespiti",
      icon: "target",
      content: `
        <p class="mb-4">Maçın ilk 15 dakikası çok önemli. Takımlar genelde planlarını ilk dakikalarda gösterir.</p>
        
        <p class="mb-4"><strong>Neye Dikkat Edilmeli?</strong></p>
        <ul class="space-y-2 my-4">
          <li class="flex items-start gap-3"><span class="text-emerald-400 font-bold mt-1">•</span><span><strong>Pressing yoğunluğu:</strong> Hangi takım daha agresif?</span></li>
          <li class="flex items-start gap-3"><span class="text-blue-400 font-bold mt-1">•</span><span><strong>Formasyon gerçeği:</strong> Kağıtta 4-3-3 ama gerçekte 4-4-2 oynuyor olabilir</span></li>
          <li class="flex items-start gap-3"><span class="text-amber-400 font-bold mt-1">•</span><span><strong>Top sahipliği:</strong> Hangi takım oyunu kontrol etmek istiyor?</span></li>
          <li class="flex items-start gap-3"><span class="text-red-400 font-bold mt-1">•</span><span><strong>Set parçaları:</strong> Özel taktikler var mı?</span></li>
        </ul>
        
        <p class="mb-4"><strong>Örnek:</strong> Manchester City maçlarında ilk 15 dakika genelde %70+ top sahipliği ile başlar. Eğer %50'nin altındaysalar, o gün bir şeyler yolunda gitmiyordur!</p>
      `,
    },
    {
      title: "3. Kilit Anlar - Dönüm Noktaları",
      icon: "lightbulb",
      content: `
        <p class="mb-4">Her maçın 2-3 kilit anı vardır. İşte o anları yakalamak analistin işi!</p>
        
        <div class="space-y-3 my-4">
          <div class="bg-emerald-500/10 border-l-4 border-emerald-500 pl-4 py-3 rounded-r">
            <p><strong>İlk Gol:</strong> Maçın temposunu değiştirir. "Kaybeden" takım mutlaka oyunu değiştirir.</p>
          </div>
          <div class="bg-blue-500/10 border-l-4 border-blue-500 pl-4 py-3 rounded-r">
            <p><strong>Oyuncu Değişiklikleri:</strong> Antrenör ne düşünüyor? Taktik mi, sakatlık mı?</p>
          </div>
          <div class="bg-amber-500/10 border-l-4 border-amber-500 pl-4 py-3 rounded-r">
            <p><strong>Kırmızı/Sarı Kart:</strong> 10 kişi kalan takım nasıl adapte oluyor?</p>
          </div>
        </div>
        
        <p class="mb-4"><strong>Analiz Notu:</strong> Kilit anları not alın. "45. dakika, sol bek yaralandı, yerine genç oyuncu girdi, takım sol kanattan savunma zayıfladı" gibi.</p>
      `,
    },
    {
      title: "4. Taktiksel Değişiklikler - Şahmatın Futbol Hali",
      icon: "chart",
      content: `
        <p class="mb-4">Antrenörler maç sırasında sürekli ayar yapar. Bunları görebilmek analistin gücüdür!</p>
        
        <p class="mb-4"><strong>Sık Görülen Değişiklikler:</strong></p>
        <ul class="space-y-2 my-4">
          <li class="flex items-start gap-3"><span class="text-emerald-400 font-bold mt-1">•</span><span><strong>Formasyon değişimi:</strong> 4-3-3'ten 4-4-2'ye geçiş (daha defansif)</span></li>
          <li class="flex items-start gap-3"><span class="text-emerald-400 font-bold mt-1">•</span><span><strong>Pressing ayarı:</strong> Yüksek pressingten orta saha pressingine çekilme</span></li>
          <li class="flex items-start gap-3"><span class="text-emerald-400 font-bold mt-1">•</span><span><strong>Kanat değişimi:</strong> Zayıf bek tespit edildi, o kanattan sürekli atak</span></li>
        </ul>
        
        <p class="mb-4"><strong>Guardiola Örneği:</strong> Pep maç başı ortalama 2-3 taktiksel ayar yapıyor. Bunu görebilmek için oyuncuların pozisyonlarını sürekli takip edin!</p>
      `,
    },
    {
      title: "5. Maç Sonu Raporu - Toparlama",
      icon: "check",
      content: `
        <p class="mb-4">Maç bitti, şimdi ne oldu, neden oldu sorularını cevaplamanın zamanı!</p>
        
        <div class="bg-slate-900/50 rounded-lg p-5 my-6 border border-slate-700">
          <p class="text-amber-400 font-semibold mb-3">📝 Rapor İçeriği:</p>
          <ul class="space-y-2">
            <li><strong>Sonuç adil mi?</strong> xG'lere bakın, hangi takım daha çok şans yarattı?</li>
            <li><strong>Taktiksel kazanan kim?</strong> Hangi antrenör daha iyi hamle yaptı?</li>
            <li><strong>Kilit oyuncular:</strong> Maça damgasını kim vurdu?</li>
            <li><strong>Zayıf halkalar:</strong> Hangi oyuncu/pozisyon sorun oldu?</li>
            <li><strong>Gelecek öngörüsü:</strong> Bu takımlar gelecek maçlarda ne yapmalı?</li>
          </ul>
        </div>
      `,
    },
  ] as BlogSection[],

  examples: [
    {
      title: "Barcelona 2-1 Real Madrid (El Clasico 2024)",
      description:
        "Maç öncesi Real Madrid favori idi. Ama Barcelona ilk 15 dakika %68 top tuttu ve tempoyu belirledi. 38. dakika ilk gol, Pedri. Real Madrid 60. dakikada 4-4-2'ye geçti (oyuncu değişikliği: Valverde - Camavinga). 75. dakika kritik an: Real Madrid eşitledi ama Barcelona son 10 dakika pressingi artırdı ve kazandı.",
      highlight: "Kilit: Barcelona tempo kontrolü + Real Madrid geç ayar",
    },
    {
      title: "Fenerbahçe 3-0 Trabzonspor",
      description:
        "Fenerbahçe sol bekten sürekli atak yaptı (Trabzonspor'un sağ beki zayıftı). İlk 30 dakika 8 kez o kanattan atak. 2. yarı Trabzonspor o beki değiştirdi ama geç kaldı. Sonuç: 3-0.",
      highlight: "Ders: Zayıf noktayı bul ve istismar et!",
    },
  ] as BlogExample[],

  keyPoints: [
    {
      text: "Maç analizi sadece sonuca bakmak değil, nasıl o sonuç çıktığını anlamaktır",
      important: true,
    },
    {
      text: "İlk 15 dakika tempo tespiti için kritik - dikkatle izleyin",
    },
    {
      text: "Kilit anları not alın - maç sonu rapor yazarken işinize yarayacak",
    },
    {
      text: "Taktiksel değişiklikleri görebilmek, futbol IQ'nuzu yükseltir",
    },
    {
      text: "İyi analiz objektiftir - favori takımınız bile kaybediyorsa dürüst olun!",
      important: true,
    },
  ] as BlogKeyPoint[],

  quote: {
    text: "Futbol analizi bilimdir, ama yorumlama sanatır. İkisini de dengede tutmalısınız.",
    author: "Arsene Wenger",
  },

  conclusion:
    "Profesyonel maç analizi yapmak sabır ve pratik ister. Bu 5 prensibi her maçta uygulayın: hazırlık, tempo tespiti, kilit anlar, taktiksel değişiklikler ve rapor. Zaman içinde göreceksiniz ki, futbolu çok daha iyi anlıyor ve maçları farklı bir gözle izliyorsunuz. Başarılar!",
};

// Takım Performans Metrikleri
export const teamPerformanceMetrics = {
  introduction:
    "Bir takım başarılı mı, başarısız mı? Sadece puan tablosuna bakmak yetmez! Takım performansını doğru ölçmek için hangi metriklere bakmalıyız? Bu rehberde, skor tablosunun arkasındaki gerçekleri ortaya çıkaran metrikleri öğreneceksiniz.",

  sections: [
    {
      title: "Sonuç Bazlı vs Performans Bazlı Metrikler",
      icon: "lightbulb",
      content: `
        <p class="mb-4">İki türlü metrik var: "Ne oldu?" (sonuç) ve "Ne kadar iyi oynadık?" (performans)</p>
        
        <div class="bg-slate-900/50 rounded-lg p-5 my-6 border border-slate-700">
          <p class="text-emerald-400 font-semibold mb-3">📊 Metrik Türleri:</p>
          <ul class="space-y-3">
            <li><strong>Sonuç Bazlı:</strong> Kazanma, puan, gol sayısı - bunlar "ne oldu"u gösterir</li>
            <li><strong>Performans Bazlı:</strong> xG, top sahipliği kalitesi, pas başarısı - bunlar "ne kadar iyi oynadık"ı gösterir</li>
          </ul>
        </div>
        
        <p class="mb-4"><strong>Önemli:</strong> Bazen bir takım iyi oynuyor ama kaybediyor (şanssızlık). Bazen kötü oynuyor ama kazanıyor (şanslı). Performans metrikleri gerçeği gösterir!</p>
      `,
    },
    {
      title: "xG Diferansiyeli - Gerçek Güç Göstergesi",
      icon: "target",
      content: `
        <p class="mb-4">xG diferansiyeli = Yarattığınız xG - Rakibin yarattığı xG. Takımınızın gerçek gücünün en iyi göstergesi!</p>
        
        <div class="space-y-3 my-4">
          <div class="bg-emerald-500/10 border-l-4 border-emerald-500 pl-4 py-3 rounded-r">
            <p><strong>+1.0 veya üzeri:</strong> Dominant takım, rahat kazanmalı</p>
          </div>
          <div class="bg-blue-500/10 border-l-4 border-blue-500 pl-4 py-3 rounded-r">
            <p><strong>+0.5 - +1.0:</strong> İyi performans, kazanma şansı yüksek</p>
          </div>
          <div class="bg-amber-500/10 border-l-4 border-amber-500 pl-4 py-3 rounded-r">
            <p><strong>-0.5 - +0.5:</strong> Dengeli maç, her şey olabilir</p>
          </div>
          <div class="bg-red-500/10 border-l-4 border-red-500 pl-4 py-3 rounded-r">
            <p><strong>-1.0 veya altı:</strong> Zor maç, takım baskı altında</p>
          </div>
        </div>
        
        <p class="mb-4"><strong>Örnek:</strong> Takımınız 1-1 berabere kaldı ama xG diferansiyeli +1.5 idi. Bu demek ki, aslında iyi oynadınız ama şanssızdınız. Gelecek maçlar daha iyi olacak!</p>
      `,
    },
    {
      title: "Takım Şekli (Team Shape) Metrikleri",
      icon: "chart",
      content: `
        <p class="mb-4">Takım ne kadar kompakt? Oyuncular birbirlerine ne kadar yakın? Bu, savunma sağlamlığının göstergesi.</p>
        
        <p class="mb-4"><strong>Kompaktlık Ölçümü:</strong></p>
        <ul class="space-y-2 my-4">
          <li class="flex items-start gap-3"><span class="text-emerald-400 font-bold mt-1">•</span><span><strong>Dikey Kompaktlık:</strong> Forvet ile stoper arası mesafe. 35-40 metre = iyi</span></li>
          <li class="flex items-start gap-3"><span class="text-blue-400 font-bold mt-1">•</span><span><strong>Yatay Kompaktlık:</strong> Sağ kanat ile sol kanat arası genişlik. Topa göre daraltıp genişletmek önemli</span></li>
        </ul>
        
        <p class="mb-4"><strong>Atletico Madrid Örneği:</strong> Simeone'nin takımları çok kompakt oynar. Dikey mesafe genelde 30 metre civarı - bu yüzden aralarından pas vermek çok zor!</p>
      `,
    },
    {
      title: "Oyun Kurma Kalitesi (Build-Up Quality)",
      icon: "book",
      content: `
        <p class="mb-4">Takım topla ne yapıyor? Geriye mi pası atıyor, ileri mi gidiyor? Oyun kurma kalitesi bunu ölçer.</p>
        
        <div class="bg-slate-900/50 rounded-lg p-5 my-6 border border-slate-700">
          <p class="text-amber-400 font-semibold mb-3">🎯 Kalite Göstergeleri:</p>
          <ul class="space-y-2">
            <li><strong>Final 3'te Pas %:</strong> Pasların %30+ final üçlüde mi? İyi atak</li>
            <li><strong>İleri Pas Oranı:</strong> Pasların %50+ ileri mi? Risk alıyorsunuz demek</li>
            <li><strong>Pas Hızı:</strong> Hızlı pas = dinamik oyun, yavaş pas = statik oyun</li>
          </ul>
        </div>
      `,
    },
    {
      title: "Tutarlılık Endeksi - Sezon Analizi",
      icon: "check",
      content: `
        <p class="mb-4">Takım her hafta aynı seviyede mi oynuyor, yoksa inişli çıkışlı mı? Tutarlılık, şampiyonluk için kritik!</p>
        
        <p class="mb-4"><strong>Nasıl Ölçülür?</strong></p>
        <p class="mb-4">Son 10 maçın xG diferansiyellerinin standart sapmasına bakın. Düşük sapma = tutarlı, yüksek sapma = istikrarsız.</p>
        
        <p class="mb-4"><strong>Manchester City vs Newcastle:</strong> City her hafta benzer xG diferansiyeli üretiyor (+0.8 - +1.5 arası). Newcastle bazen +2.0, bazen -0.5. City bu yüzden şampiyon oluyor!</p>
      `,
    },
  ] as BlogSection[],

  examples: [
    {
      title: "Brentford - Küçük Kulüp, Büyük Veri",
      description:
        "Brentford, İngiltere Premier Lig'inde veri analizi ile başarı kazanan en iyi örnek. xG diferansiyeli her sezon pozitif. Oyuncu alımlarını da xG metriklerine göre yapıyorlar. Sonuç: Küçük bütçe, büyük başarı!",
      highlight: "2024-25'te +0.65 xG diferansiyeli = lig ortası garanti",
    },
    {
      title: "Galatasaray - Tutarlılık Şampiyonu",
      description:
        "Galatasaray 2023-24 sezonunda çok tutarlı performans gösterdi. 34 maçın 30'unda pozitif xG diferansiyeli. Bu tutarlılık, şampiyonluğu getirdi.",
      highlight: "Tutarlılık > Şans",
    },
  ] as BlogExample[],

  keyPoints: [
    {
      text: "Puan tablosu her şeyi anlatmaz - performans metriklerine de bakın",
      important: true,
    },
    {
      text: "xG diferansiyeli, takımın gerçek gücünün en iyi göstergesi",
    },
    {
      text: "Takım şekli metrikleri, savunma organizasyonunu ölçer",
    },
    {
      text: "Tutarlılık, şampiyonluk için şanstan daha önemli",
      important: true,
    },
  ] as BlogKeyPoint[],

  quote: {
    text: "İyi bir takım, kötü bir gün bile ortalama performans gösterir. Büyük takım ise, kötü günde bile kazanır.",
    author: "Sir Alex Ferguson",
  },

  conclusion:
    "Takım performansını sadece skordan ibaret sanmak, büyük bir hata. xG diferansiyeli, takım şekli, oyun kurma kalitesi ve tutarlılık - bu 4 metriği takip ederseniz, hangi takımın gerçekten iyi olduğunu anlarsınız. Ve unutmayın: Şans kısa vadede önemli, ama uzun vadede performans her zaman kazanır!",
};

// Python ile Spor Verisi Analizi
export const pythonSportsDataAnalysis = {
  introduction:
    "Python öğrenmek istiyorsunuz ama nereden başlayacağınızı bilmiyor musunuz? Bu rehberde, Python'un temellerini öğrenip, spor verilerini analiz etmeye başlayacaksınız. Programlama bilginiz sıfır olsa bile, adım adım ilerleyeceğiz!",

  sections: [
    {
      title: "Python Nedir ve Neden Kullanmalıyız?",
      icon: "lightbulb",
      content: `
        <p class="mb-4">Python, dünya'nın en popüler programlama dili. Neden? Çünkü çok kolay ve çok güçlü!</p>
        
        <div class="bg-slate-900/50 rounded-lg p-5 my-6 border border-slate-700">
          <p class="text-emerald-400 font-semibold mb-3">🐍 Python'un Avantajları:</p>
          <ul class="space-y-2">
            <li><strong>Kolay Sözdizimi:</strong> İngilizce gibi okur yazarsınız</li>
            <li><strong>Büyük Kütüphaneler:</strong> Pandas, NumPy, Matplotlib - her işe hazır araçlar</li>
            <li><strong>Ücretsiz:</strong> Hiçbir ücret ödemeden kullanabilirsiniz</li>
            <li><strong>Topluluk Desteği:</strong> Milyonlarca kişi Python kullanıyor, sorunuza hemen cevap bulursunuz</li>
          </ul>
        </div>
        
        <p class="mb-4"><strong>Sporda Python:</strong> Premier Lig, La Liga, NBA - hepsi Python ile veri analizi yapıyor. Siz de yapabilirsiniz!</p>
      `,
    },
    {
      title: "İlk Python Kodunuz - Merhaba Futbol!",
      icon: "book",
      content: `
        <p class="mb-4">Hiçbir şey bilmeseniz bile, bu kodu yazabilirsiniz. Hadi başlayalım!</p>
        
        <div class="bg-slate-900/80 rounded-lg p-5 my-6 border border-emerald-500/30">
          <p class="text-emerald-400 font-semibold mb-3">💻 İlk Kodunuz:</p>
          <pre class="text-gray-300 text-sm">
# Oyuncu gol sayısı
messi_goals = 30
ronaldo_goals = 28

# Toplam gol
total_goals = messi_goals + ronaldo_goals

# Sonucu yazdır
print("Toplam gol:", total_goals)
# Çıktı: Toplam gol: 58
          </pre>
        </div>
        
        <p class="mb-4"><strong>Açıklama:</strong> Gördünüz mü? Python çok basit! # ile yorum yazarsınız, sayıları toplarsınız, print() ile ekrana yazdırırsınız. Bu kadar!</p>
      `,
    },
    {
      title: "Pandas ile Veri Analizi - Excel'in Süper Hali",
      icon: "chart",
      content: `
        <p class="mb-4">Pandas, Python'da veri analizi için en önemli kütüphane. Excel gibi ama 100 kat güçlü!</p>
        
        <div class="bg-slate-900/80 rounded-lg p-5 my-6 border border-emerald-500/30">
          <p class="text-blue-400 font-semibold mb-3">📊 Pandas Örneği:</p>
          <pre class="text-gray-300 text-sm">
import pandas as pd

# Oyuncu verileri
data = {
    'Oyuncu': ['Messi', 'Ronaldo', 'Haaland'],
    'Gol': [30, 28, 35],
    'Asist': [15, 10, 8]
}

# DataFrame oluştur (Excel tablo gibi)
df = pd.DataFrame(data)

# En çok gol atan
print(df[df['Gol'] == df['Gol'].max()])
# Çıktı: Haaland, 35 gol
          </pre>
        </div>
        
        <p class="mb-4"><strong>Ne Yaptık?</strong> Bir tablo oluşturduk, en çok gol atanı bulduk. Pandas ile binlerce oyuncuyu saniyeler içinde analiz edebilirsiniz!</p>
      `,
    },
    {
      title: "Grafik Çizmek - Matplotlib ile Görselleştirme",
      icon: "target",
      content: `
        <p class="mb-4">Sayılar sıkıcı olabilir. Grafik çizerek verilerinizi canlandırın!</p>
        
        <div class="bg-slate-900/80 rounded-lg p-5 my-6 border border-emerald-500/30">
          <p class="text-amber-400 font-semibold mb-3">📈 Grafik Örneği:</p>
          <pre class="text-gray-300 text-sm">
import matplotlib.pyplot as plt

# Veriler
players = ['Messi', 'Ronaldo', 'Haaland']
goals = [30, 28, 35]

# Bar grafik çiz
plt.bar(players, goals, color=['blue', 'red', 'green'])
plt.title('2024-25 Gol Krallığı')
plt.ylabel('Gol Sayısı')
plt.show()
          </pre>
        </div>
        
        <p class="mb-4"><strong>Sonuç:</strong> Ekranınızda renkli bir bar grafiği belirecek! İşte bu kadar basit.</p>
      `,
    },
  ] as BlogSection[],

  examples: [
    {
      title: "StatsBomb Verisi Analizi",
      description:
        "StatsBomb, ücretsiz futbol verileri sağlıyor. Python ile bu verileri indirip, xG hesabı yapabilir, pas ağı çizebilirsiniz. 50 satır kod ile profesyonel analiz!",
      highlight: "github.com/statsbomb/open-data - Ücretsiz!",
    },
    {
      title: "FBRef Scraping - Web'den Veri Çekme",
      description:
        "FBRef.com'dan otomatik veri çekme. Python'un BeautifulSoup kütüphanesi ile web sayfalarını tarayıp, istatistikleri toplayabilirsiniz.",
      highlight: "10 dakikada 1000 oyuncu verisi!",
    },
    {
      title: "Kendi xG Modeliniz",
      description:
        "Scikit-learn kütüphanesi ile kendi xG modelinizi yapabilirsiniz. Geçmiş maç verilerini alın, makine öğrenmesi algoritmaları kullanın. 2-3 saatlik çalışma!",
      highlight: "Kendi tahmin modeliniz = süper!",
    },
  ] as BlogExample[],

  keyPoints: [
    {
      text: "Python öğrenmek zor değil - sadece pratik yapın!",
      important: true,
    },
    {
      text: "Pandas, veri analizi için olmazsa olmaz kütüphane",
    },
    {
      text: "Matplotlib ile verilerinizi görselleştirin - daha anlaşılır olur",
    },
    {
      text: "StatsBomb gibi ücretsiz kaynaklar var - kullanın!",
    },
    {
      text: "Her gün 30 dakika pratik = 3 ayda Python ustası!",
      important: true,
    },
  ] as BlogKeyPoint[],

  quote: {
    text: "Programlama öğrenmek, bir dil öğrenmek gibi. Pratik yaptıkça gelişirsiniz.",
    author: "Guido van Rossum, Python'un Yaratıcısı",
  },

  conclusion:
    "Python ile spor verisi analizi yapmak, düşündüğünüzden daha kolay! Bu rehberde temel adımları öğrendiniz. Şimdi sıra sizde - bilgisayarınıza Python kurun, ücretsiz verileri indirin ve analiz yapmaya başlayın. Unutmayın: En iyi öğrenme yöntemi, yaparak öğrenmektir. Bol şanslar!",
};

// Veri Bilimi Spor Analitiğinde
export const dataScienceInSports = {
  introduction:
    "Veri bilimi sporu nasıl değiştiriyor? Artık futbol kulüpleri veri bilimcileri işe alıyor, basketbol takımları algoritma uzmanları arıyor. Peki veri bilimi nedir ve sporda nasıl kullanılıyor? Bu rehberde, karmaşık terimleri bir kenara bırakıp, herkesin anlayabileceği şekilde veri bilimini öğreneceğiz!",

  sections: [
    {
      title: "Veri Bilimi Nedir? - Basit Anlatım",
      icon: "lightbulb",
      content: `
        <p class="mb-4">Veri bilimi, ham verileri (sayılar, rakamlar) anlamlı bilgiye dönüştürme sanatıdır.</p>
        
        <div class="bg-slate-900/50 rounded-lg p-5 my-6 border border-slate-700">
          <p class="text-emerald-400 font-semibold mb-3">📊 Veri Biliminin 4 Adımı:</p>
          <ul class="space-y-3">
            <li><strong>1. Veri Toplama:</strong> Maç istatistikleri, oyuncu verileri, GPS kayıtları</li>
            <li><strong>2. Veri Temizleme:</strong> Hatalı, eksik verileri düzeltme</li>
            <li><strong>3. Veri Analizi:</strong> Kalıplar bulma, ilişkiler keşfetme</li>
            <li><strong>4. Görselleştirme:</strong> Grafikler, tablolar ile sunma</li>
          </ul>
        </div>
        
        <p class="mb-4"><strong>Günlük Hayattan Örnek:</strong> YouTube'u düşünün. Hangi videoyu izliyorsunuz? Ne kadar izliyorsunuz? YouTube bu verileri topluyor, analiz ediyor ve size "önerilen videolar" gösteriyor. İşte bu, veri bilimi!</p>
      `,
    },
    {
      title: "Big Data - Büyük Veri Çağı",
      icon: "book",
      content: `
        <p class="mb-4">"Big Data" = çok çok fazla veri. Sporda her maçta milyonlarca veri noktası toplanıyor!</p>
        
        <p class="mb-4"><strong>Bir Premier Lig Maçında Toplanan Veriler:</strong></p>
        <ul class="space-y-2 my-4">
          <li class="flex items-start gap-3"><span class="text-emerald-400 font-bold mt-1">•</span><span><strong>3,5 milyon</strong> konum verisi (her oyuncu + top, 0.1 saniyede bir)</span></li>
          <li class="flex items-start gap-3"><span class="text-blue-400 font-bold mt-1">•</span><span><strong>2,000+</strong> olay verisi (pas, şut, faul vb.)</span></li>
          <li class="flex items-start gap-3"><span class="text-amber-400 font-bold mt-1">•</span><span><strong>500+</strong> metrik hesabı (xG, PPDA, pas ağları vb.)</span></li>
        </ul>
        
        <p class="mb-4"><strong>Sorun:</strong> Bu kadar veriyi insanlar analiz edemez. Çözüm: Yapay zeka ve makine öğrenmesi!</p>
      `,
    },
    {
      title: "Makine Öğrenmesi - Bilgisayarlar Öğreniyor",
      icon: "target",
      content: `
        <p class="mb-4">Makine öğrenmesi, bilgisayarlara "öğrenme" yeteneği kazandıran teknolojidir. Nasıl mı?</p>
        
        <div class="bg-slate-900/50 rounded-lg p-5 my-6 border border-slate-700">
          <p class="text-amber-400 font-semibold mb-3">🤖 Makine Öğrenmesi Süreci:</p>
          <ul class="space-y-2">
            <li><strong>Adım 1:</strong> Binlerce maç verisi ver</li>
            <li><strong>Adım 2:</strong> "Bu pozisyonlardan gol oldu mu?" sorular sor</li>
            <li><strong>Adım 3:</strong> Bilgisayar kalıpları öğrenir</li>
            <li><strong>Adım 4:</strong> Yeni pozisyonlarda tahmin yapar (xG)</li>
          </ul>
        </div>
        
        <p class="mb-4"><strong>Gerçek Örnek:</strong> Liverpool, makine öğrenmesi ile Mohamed Salah'ı keşfetti. Algoritma, "bu oyuncu Premier Lig'de çok başarılı olacak" dedi. Ve haklı çıktı!</p>
      `,
    },
    {
      title: "Veri Görselleştirme - Hikaye Anlatımı",
      icon: "chart",
      content: `
        <p class="mb-4">Sayılar sıkıcıdır. Ama grafikler, renkli haritalar, animasyonlar - bunlar hikaye anlatır!</p>
        
        <p class="mb-4"><strong>Popüler Görselleştirme Türleri:</strong></p>
        <ul class="space-y-2 my-4">
          <li class="flex items-start gap-3"><span class="text-emerald-400 font-bold mt-1">•</span><span><strong>Isı Haritaları:</strong> Oyuncu nerede zaman harcıyor?</span></li>
          <li class="flex items-start gap-3"><span class="text-blue-400 font-bold mt-1">•</span><span><strong>Pas Ağları:</strong> Takım nasıl pas veriyor?</span></li>
          <li class="flex items-start gap-3"><span class="text-amber-400 font-bold mt-1">•</span><span><strong>xG Grafikleri:</strong> Maçın momentumu nasıldı?</span></li>
          <li class="flex items-start gap-3"><span class="text-purple-400 font-bold mt-1">•</span><span><strong>Radar Grafikler:</strong> Oyuncu karşılaştırması</span></li>
        </ul>
        
        <p class="mb-4"><strong>Pro İpucu:</strong> İyi bir görselleştirme, 1000 kelimelik yazıdan daha etkilidir!</p>
      `,
    },
    {
      title: "Gerçek Zamanlı Analiz - Anlık Kararlar",
      icon: "check",
      content: `
        <p class="mb-4">2025'te veri analizi sadece maç sonrası değil, maç SIRASINDA da yapılıyor!</p>
        
        <div class="space-y-3 my-4">
          <div class="bg-emerald-500/10 border-l-4 border-emerald-500 pl-4 py-3 rounded-r">
            <p><strong>Oyuncu Yorgunluğu:</strong> GPS verileri anlık izleniyor. "Bu oyuncu yorgun, değiştirilmeli" uyarısı geliyor</p>
          </div>
          <div class="bg-blue-500/10 border-l-4 border-blue-500 pl-4 py-3 rounded-r">
            <p><strong>Taktik Tavsiyeleri:</strong> "Rakip sağ bekten zayıf, o kanattan atak yapın" gibi öneriler</p>
          </div>
          <div class="bg-amber-500/10 border-l-4 border-amber-500 pl-4 py-3 rounded-r">
            <p><strong>xG Takibi:</strong> "Şu an xG 2.1-0.3 öndesiniz, savunmaya çekilebilirsiniz"</p>
          </div>
        </div>
      `,
    },
  ] as BlogSection[],

  examples: [
    {
      title: "Moneyball - Hikaye Başlıyor",
      description:
        "2002'de Oakland Athletics beyzbol takımı, veri bilimi ile şampiyonluk yarışına girdi. Küçük bütçeyle büyük takımları yendiler. Bu hikaye, 'Moneyball' filmi oldu. Artık tüm spor kulüpleri bu yöntemi kullanıyor!",
      highlight: "Film izleyin - çok ilham verici!",
    },
    {
      title: "Leicester City Mucizesi (2015-16)",
      description:
        "Leicester City, veri analizi ile Premier Lig şampiyonu oldu. Oyuncu alımlarında, taktik kararlarında hep veri kullandılar. Sonuç: 5000/1 bahis oranına rağmen şampiyon!",
      highlight: "Veri bilimi + Takım ruhu = Mucize",
    },
    {
      title: "NBA - Stephen Curry Devrimi",
      description:
        "Veri analizi, Stephen Curry'nin 3 sayılık atışlarının ne kadar değerli olduğunu gösterdi. Artık NBA'de herkes 3 sayılık atıyor. Oyun tamamen değişti!",
      highlight: "3 sayılık > 2 sayılık (matematiiksel kanıt)",
    },
  ] as BlogExample[],

  keyPoints: [
    {
      text: "Veri bilimi, ham verileri anlamlı bilgiye dönüştürür",
      important: true,
    },
    {
      text: "Big Data çağındayız - her maçta milyonlarca veri noktası toplanıyor",
    },
    {
      text: "Makine öğrenmesi, bilgisayarların kalıpları öğrenmesini sağlar",
    },
    {
      text: "Veri görselleştirme, karmaşık verileri basit hale getirir",
    },
    {
      text: "Gerçek zamanlı analiz, maç sırasında kararlar almayı sağlar",
      important: true,
    },
  ] as BlogKeyPoint[],

  quote: {
    text: "Veri yeni petroldür. Ama ham petrol gibi, işlenmeden değersizdir.",
    author: "Clive Humby, Veri Bilimci",
  },

  conclusion:
    "Veri bilimi sporu dönüştürüyor. Küçük kulüpler artık büyüklerle rekabet edebiliyor, oyuncular daha uzun kariyerler yapıyor, maçlar daha adil yönetiliyor. Ve bu sadece başlangıç! Gelecekte veri bilimi daha da önemli olacak. Eğer spor sektöründe kariyer yapmak istiyorsanız, veri bilimini öğrenin. Bu, geleceğin dilidir!",
};
