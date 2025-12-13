// Blog içerikleri - Merkezi veri kaynağı
import type { BlogPost } from "@/types/blog";
import type { BlogSection, BlogExample, BlogKeyPoint } from "@/components/blog/BlogArticle";

// Yapay Zeka makalesinin yapılandırılmış içeriği
export const aiInSportsArticle = {
  introduction: "Hiç merak ettiniz mi, futbol takımları maç öncesi nasıl hazırlanıyor? Artık sadece antrenörün tecrübesi yetmiyor - yapay zeka sistemleri, maçları adeta bir satranç oyunu gibi analiz ediyor. Bu yazıda, karmaşık algoritmalar yerine, herkesin anlayabileceği örneklerle yapay zekanın sporda nasıl kullanıldığını öğreneceğiz.",
  
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
      `
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
      `
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
      `
    },
    {
      title: "Takım Taktiklerini Analiz Etmek",
      icon: "chart",
      content: `
        <p class="mb-4">Antrenörler artık sadece maçı izlemiyor - özel yazılımlar sayesinde takımın oyun stilini sayılarla görüyorlar.</p>
        
        <p class="mb-4"><strong>Pressing (Baskı) Analizi:</strong></p>
        <p class="mb-4">Liverpool'un ünlü "gegen-press" taktik hatırlıyor musunuz? Topu kaybettikten sonra hemen baskı yapıp geri almak. Yapay zeka bunu "PPDA" denen bir sayı ile ölçüyor:</p>
        
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
      `
    }
  ] as BlogSection[],
  
  examples: [
    {
      title: "Manchester City - Pep Guardiola",
      description: "Pep Guardiola her maç öncesi 3-4 saatlik video analizi yapıyor. Yapay zeka sistemi, rakip takımın son 10 maçını otomatik analiz ediyor ve 'bu takım sağ bekten zayıf' gibi raporlar sunuyor.",
      highlight: "2025'te City, yapay zeka ile 15 genci keşfetti ve 3'ü ana kadroya yükseldi."
    },
    {
      title: "Brighton & Hove Albion",
      description: "Küçük bir kulüp olmasına rağmen, veri analizi ile ucuz ve yetenekli oyuncular buluyor. 2-3 milyon euroya aldıkları oyuncuları 30-40 milyona satıyorlar.",
      highlight: "2024-25 sezonunda 5 oyuncuyu veri analizi ile keşfettiler - hepsi başarılı oldu."
    },
    {
      title: "Türkiye Süper Ligi",
      description: "Fenerbahçe ve Galatasaray artık maçlarda 'live tracking' sistemi kullanıyor. Antrenör, oyun sırasında tablete bakıp 'bu oyuncunun enerjisi %60'a düştü, değiştirelim' diyebiliyor.",
      highlight: "2025'te 10'dan fazla Süper Lig takımı yapay zeka analiz sistemine geçti."
    },
    {
      title: "Sakatlik Önleme",
      description: "Oyuncuların GPS verileri analiz edilip, 'bu oyuncu çok yorgun, bu hafta oynamazsa sakatlanma riski düşer' gibi uyarılar veriliyor. Bu sayede yıllık %30 daha az sakatlik oluyor.",
      highlight: "Real Madrid bu yöntemle 2024-25'te 8 önemli sakatlığı önceden önledi."
    }
  ] as BlogExample[],
  
  keyPoints: [
    { text: "Yapay zeka karmaşık değil - sadece çok hızlı öğrenen ve unutmayan bir asistan", important: true },
    { text: "xG gibi istatistikler, 'şans' faktörünü ortadan kaldırıp gerçek performansı gösteriyor" },
    { text: "Küçük takımlar bile artık veri analizi ile büyüklerle rekabet edebiliyor" },
    { text: "Oyuncu alımlarında artık sadece yetenek değil, takıma uyum da ölçülüyor" },
    { text: "Sakatlik tahminleri sayesinde sporcular daha uzun kariyerler yapabiliyor", important: true },
    { text: "Antrenörler maç sırasında gerçek zamanlı veri alıp taktik değiştirebiliyor" }
  ] as BlogKeyPoint[],
  
  quote: {
    text: "Futbol artık sadece kalp işi değil, beyin işi de. Ama unutmayın - yapay zeka antrenörün yerini almaz, ona yardımcı olur.",
    author: "Pep Guardiola, Manchester City Teknik Direktörü"
  },
  
  conclusion: "Yapay zeka sporda artık vazgeçilmez. Ama endişelenmeyin - futbolun duygusal, tutkulu yanı asla kaybolmayacak. Teknoloji sadece bu güzel oyunu daha adil, daha rekabetçi ve daha heyecanlı hale getiriyor. Gelecekte her takım, her kulüp bu teknolojiyi kullanacak. Önemli olan, veriyi doğru okuyup, insani kararlarla harmanlayabilmek."
};

export const allBlogPosts: BlogPost[] = [
  {
    slug: "yapay-zeka-spor-analizinde-nasil-kullanilir",
    title: "Yapay Zeka Spor Analizinde Nasıl Kullanılır?",
    description:
      "Yapay zeka ve makine öğrenmesi teknolojilerinin profesyonel spor analizinde kullanımı, veri işleme süreçleri ve istatistiksel modelleme yöntemleri hakkında eğitici bilgiler.",
    content: `# Yapay Zeka Spor Analizinde Nasıl Kullanılır?

## Giriş

2025 yılında yapay zeka (AI) ve makine öğrenmesi (ML), profesyonel spor takımlarının vazgeçilmez araçları haline gelmiştir. Manchester City'den Barcelona'ya, büyük kulüpler milyonlarca euro değerinde AI sistemlerine yatırım yapıyor. Bu eğitici içerikte, yapay zeka teknolojilerinin spor verilerini nasıl işlediğini, hangi istatistiksel modellerin kullanıldığını ve veri bilimi yaklaşımlarını akademik perspektifle inceleyeceğiz.

## Veri Toplama ve İşleme Süreci

### 1. Temel Maç Verileri

Modern spor analitiğinde toplanan veri miktarı inanılmaz boyutlarda:

**Tracking Data (Takip Verileri):**
- Her 0.1 saniyede bir, her oyuncunun X-Y koordinatları
- Topun konumu ve hızı (km/saat cinsinden)
- Oyuncu sprint mesafeleri ve yoğunluk haritaları
- Pas ağları ve pozisyonel heatmap'ler

**Event Data (Olay Verileri):**
- Paslar, şutlar, müdahaleler, dueller
- Her olayın başarı/başarısızlık durumu
- Baskı (pressing) metrikleri
- Set parçası verimliliği (korner, serbest vuruş)

### 2. Gelişmiş Metrikler ve KPI'lar

**xG (Expected Goals - Beklenen Gol):**
2025'te xG artık sadece şut pozisyonundan değil, defans dizilimi, kaleci pozisyonu, oyuncu yorgunluğu gibi 50+ parametreyi içeriyor. Örnek: 0.85 xG değerli bir pozisyon, 100 denemede yaklaşık 85 kez gol ile sonuçlanır.

**PPDA (Passes Allowed Per Defensive Action):**
Takımın pressing yoğunluğunu ölçer. Düşük PPDA = agresif pressing. Liverpool'un Klopp dönemindeki PPDA değeri ~8-10 civarındaydı.

**pAdj Metrics (Possession-Adjusted):**
Top sahipliği ayarlamalı metrikler. %70 topa sahip bir takımla %30 topa sahip bir takımı adil karşılaştırma.

### 3. Oyuncu Performans Endeksleri

**WAR (Wins Above Replacement):**
Bir oyuncunun takıma katkısını ölçer. "Bu oyuncu yerine ortalama bir oyuncu oynasaydı, takım kaç puan kaybederdi?"

**VAEP (Valuing Actions by Estimating Probabilities):**
Her aksiyonun (pas, dribling, şut) gol olasılığını artırma/azaltma etkisini ölçer.

## Makine Öğrenmesi Modelleri (2025 Güncel Yaklaşımlar)

### 1. Transformer Modeller

GPT ve BERT'e benzer transformer mimariler spor analitiğinde devrim yarattı:

\`\`\`python
# Örnek: Maç sekansı tahmini için Transformer
import torch
import torch.nn as nn

class MatchTransformer(nn.Module):
    def __init__(self, d_model=512, nhead=8, num_layers=6):
        super().__init__()
        self.encoder_layer = nn.TransformerEncoderLayer(
            d_model=d_model, 
            nhead=nhead,
            batch_first=True
        )
        self.transformer = nn.TransformerEncoder(
            self.encoder_layer, 
            num_layers=num_layers
        )
        self.fc = nn.Linear(d_model, 3)  # Home-Draw-Away
    
    def forward(self, x):
        # x: (batch, sequence_length, features)
        encoded = self.transformer(x)
        # Son zaman adımını kullan
        output = self.fc(encoded[:, -1, :])
        return output
\`\`\`

### 2. Graph Neural Networks (GNN)

Pas ağlarını ve takım yapısını modellemek için:

- **Node (Düğüm):** Her oyuncu
- **Edge (Kenar):** Oyuncular arası paslar ve pozisyonel ilişkiler
- **GNN Çıktısı:** Takım sinerjisi, oyun kurma kalitesi

### 3. Computer Vision ve Görüntü İşleme

\`\`\`python
# YOLOv8 ile oyuncu tespiti
from ultralytics import YOLO

model = YOLO('yolov8x.pt')
results = model.track(
    source='match_video.mp4',
    conf=0.3,
    iou=0.5,
    classes=[0],  # Person class
    persist=True
)

# Her frame'de oyuncu pozisyonları
for frame_id, result in enumerate(results):
    boxes = result.boxes.xyxy  # Bounding boxes
    ids = result.boxes.id  # Tracking IDs
    # Pozisyonel analiz...
\`\`\`

## Gerçek Dünya Uygulamaları (2025)

### Liverpool FC - Opta Advance Scout

Liverpool, her maç öncesi rakip analizinde AI kullanıyor:
- Rakip takımın zayıf noktaları
- Set parçası savunma açıkları
- Oyuncu eşleşmeleri (player matchups)

### StatsBomb & Wyscout

Profesyonel veri sağlayıcılar:
- 500+ lig, 1M+ maç veritabanı
- API entegrasyonu
- Gerçek zamanlı veri akışı

### Second Spectrum (Google Cloud)

NBA'de kullanılan tracking sistemi, futbola adapte edildi:
- Oyuncu hızı ve ivme
- Off-ball movement analysis
- Defans rotasyonu optimizasyonu

## Model Değerlendirme Metrikleri

### Sınıflandırma Metrikleri

\`\`\`python
from sklearn.metrics import classification_report, roc_auc_score

# Gerçek sonuçlar ve tahminler
y_true = [0, 1, 2, 0, 1, 2]  # 0:Ev, 1:Beraberlik, 2:Deplasman
y_pred = [0, 1, 1, 0, 1, 2]

print(classification_report(y_true, y_pred))

# ROC-AUC Score (multi-class)
from sklearn.preprocessing import label_binarize
y_true_bin = label_binarize(y_true, classes=[0, 1, 2])
y_pred_proba = model.predict_proba(X_test)
roc_auc = roc_auc_score(y_true_bin, y_pred_proba, average='macro')
print(f"ROC-AUC: {roc_auc:.3f}")
\`\`\`

### Regresyon Metrikleri (xG tahmini için)

- **MAE (Mean Absolute Error):** Ortalama mutlak hata
- **RMSE (Root Mean Squared Error):** Kök ortalama kare hata
- **Calibration:** Tahmin edilen xG ile gerçek gol sayısı uyumu

## Etik ve Sorumluluk

### Bias (Önyargı) Problemleri

**Seçim Bias:** Veri seti sadece büyük liglerden mi? Küçük takımlar underrepresented mı?

**Temporal Bias:** Eski sezon verileri güncel taktikleri yansıtmayabilir.

### Açıklanabilirlik (Explainability)

**SHAP Values:** Her özelliğin tahmine katkısını gösterir.

\`\`\`python
import shap

# Model ve veri
explainer = shap.TreeExplainer(xgb_model)
shap_values = explainer.shap_values(X_test)

# Görselleştirme
shap.summary_plot(shap_values, X_test, feature_names=feature_names)
\`\`\`

## Sonuç ve Gelecek

2025'te yapay zeka spor analitiğinde:
- ✅ Gerçek zamanlı taktiksel öneriler
- ✅ Sakatlık riski tahmini (injury prediction)
- ✅ Transfer değerleme (player valuation)
- 🔮 Oyuncu gelişim simülasyonları (career trajectory)
- 🔮 Virtual reality antrenman optimizasyonu

**Eğitim Notları:**
- Bu teknolojiler akademik araştırma ve profesyonel eğitim amaçlıdır
- Veri bilimi prensipleri objektif analiz için kullanılır
- İstatistiksel yaklaşımlar peer-reviewed metodolojilere dayanır
- Etik kullanım ve açıklanabilirlik kritik öneme sahiptir

## Kaynaklar

- [StatsBomb Open Data](https://github.com/statsbomb/open-data)
- [Friends of Tracking YouTube Channel](https://www.youtube.com/@friendsoftracking755)
- [Soccer Analytics Handbook (2024)](https://socceranalytics.com)
- [DeepMind: Game Plan - AlphaGo meets football](https://deepmind.google/)`,
    author: "Analiz Günü Araştırma Ekibi",
    publishedAt: "2024-12-10",
    image: "/blog/ai-analysis.jpg",
    category: "yapay-zeka",
    tags: ["yapay zeka", "makine öğrenmesi", "spor analizi", "veri bilimi"],
    readTime: 12,
  },
  {
    slug: "istatistiksel-analiz-yontemleri",
    title: "Sporda İstatistiksel Analiz Yöntemleri",
    description:
      "Futbol ve diğer spor dallarında kullanılan istatistiksel analiz teknikleri, veri değerlendirme metodolojileri ve matematiksel modelleme yaklaşımları.",
    content: `# Sporda İstatistiksel Analiz Yöntemleri

## Giriş

İstatistik, modern spor analizinin temel taşıdır. 2025 yılında artık sadece "gol, asist, pas" gibi temel metriklere bakmıyoruz - karmaşık istatistiksel modelleme, hipotez testleri ve Bayesian yaklaşımlar kullanıyoruz.

## Temel İstatistiksel Kavramlar

### 1. Merkezi Eğilim ve Dağılım Ölçüleri

**Ortalama (Mean) vs Medyan (Median):**

Bir takımın son 10 maçtaki gol sayıları: [1, 2, 0, 3, 1, 5, 2, 1, 0, 2]
- Ortalama: (1+2+0+3+1+5+2+1+0+2)/10 = 1.7 gol/maç
- Medyan: Sıralı liste [0,0,1,1,1,2,2,2,3,5] → (1+2)/2 = 1.5 gol/maç

**Standart Sapma (σ):**
Verilerin ortalamadan ne kadar uzaklaştığını gösterir.

\`\`\`python
import numpy as np

goals = [1, 2, 0, 3, 1, 5, 2, 1, 0, 2]
mean = np.mean(goals)  # 1.7
std = np.std(goals)    # 1.34

print(f"Ortalama: {mean:.2f} ± {std:.2f} gol/maç")
# "±" işareti belirsizlik aralığını gösterir
\`\`\`

### 2. Korelasyon ve Nedensellik

**Pearson Korelasyon Katsayısı (r):**
- r = +1: Mükemmel pozitif korelasyon
- r = 0: İlişki yok
- r = -1: Mükemmel negatif korelasyon

\`\`\`python
from scipy.stats import pearsonr

# Örnek: Top sahipliği vs Galibiyet
possession = [65, 58, 72, 45, 68, 55, 62, 70, 48, 64]
wins = [1, 1, 1, 0, 1, 0, 1, 1, 0, 1]

r, p_value = pearsonr(possession, wins)
print(f"Korelasyon: r = {r:.3f}, p-value = {p_value:.3f}")

# p < 0.05 ise istatistiksel olarak anlamlı
\`\`\`

**DİKKAT:** Korelasyon ≠ Nedensellik!
"Dondurma satışları arttıkça, boğulma vakaları artar" → İkisi de yaz aylarında artar, ama birisi diğerine sebep olmaz.

## Hipotez Testleri

### T-Testi: İki Grup Karşılaştırması

Örnek: "Ev sahibi takımlar, deplasman takımlarından daha çok gol atar mı?"

**H₀ (Null Hypothesis):** Ev sahibi ve deplasman gol ortalamaları aynıdır.
**H₁ (Alternative Hypothesis):** Farklıdır.

\`\`\`python
from scipy.stats import ttest_ind

home_goals = [2, 3, 1, 4, 2, 3, 2, 5, 1, 3]  # Ev sahibi
away_goals = [1, 0, 2, 1, 1, 0, 2, 1, 0, 1]  # Deplasman

t_stat, p_value = ttest_ind(home_goals, away_goals)

print(f"t-statistic: {t_stat:.3f}")
print(f"p-value: {p_value:.3f}")

if p_value < 0.05:
    print("✓ İstatistiksel olarak anlamlı fark var (H₀ reddedildi)")
else:
    print("✗ Anlamlı fark yok (H₀ kabul edildi)")
\`\`\`

### Chi-Square Test: Kategorik Veri Analizi

"Set parçalarından gol gelme oranı ligden lige değişir mi?"

\`\`\`python
from scipy.stats import chi2_contingency

# Premier League, La Liga, Serie A
observed = [
    [45, 355],  # PL: Gol olan set parçaları, Gol olmayan
    [52, 348],  # La Liga
    [38, 362]   # Serie A
]

chi2, p_value, dof, expected = chi2_contingency(observed)
print(f"Chi-square: {chi2:.3f}, p-value: {p_value:.3f}")
\`\`\`

## Regresyon Analizi

### Basit Lineer Regresyon

Y = β₀ + β₁X + ε

Örnek: "xG değeri, gerçek gol sayısını ne kadar iyi tahmin eder?"

\`\`\`python
from sklearn.linear_model import LinearRegression
import matplotlib.pyplot as plt

# Veri: 20 takımın xG ve gerçek gol sayıları
xG = np.array([55.2, 62.8, 48.3, 71.5, 45.9, ...]).reshape(-1, 1)
actual_goals = np.array([52, 65, 45, 68, 42, ...])

model = LinearRegression()
model.fit(xG, actual_goals)

# Model parametreleri
print(f"Intercept (β₀): {model.intercept_:.2f}")
print(f"Coefficient (β₁): {model.coef_[0]:.2f}")
print(f"R² Score: {model.score(xG, actual_goals):.3f}")

# Görselleştirme
plt.scatter(xG, actual_goals, alpha=0.6)
plt.plot(xG, model.predict(xG), color='red', linewidth=2)
plt.xlabel('Expected Goals (xG)')
plt.ylabel('Actual Goals')
plt.title('xG vs Actual Goals')
plt.show()
\`\`\`

### Çoklu Regresyon

Birden fazla bağımsız değişken:

Y = β₀ + β₁X₁ + β₂X₂ + ... + βₙXₙ + ε

\`\`\`python
from sklearn.linear_model import LinearRegression

# Özellikler: xG, xGA (against), possession, PPDA
X = np.column_stack([xG, xGA, possession, ppda])
y = points  # Puan

model = LinearRegression()
model.fit(X, y)

# Her özelliğin önemi
feature_importance = pd.DataFrame({
    'Feature': ['xG', 'xGA', 'Possession', 'PPDA'],
    'Coefficient': model.coef_
}).sort_values('Coefficient', ascending=False)

print(feature_importance)
\`\`\`

## Zaman Serisi Analizi

### Form Analizi ve Moving Average

\`\`\`python
import pandas as pd

# Takımın son 15 maçtaki puanları
points = [3, 1, 3, 0, 3, 3, 1, 3, 0, 3, 3, 1, 3, 3, 0]
df = pd.DataFrame({'points': points})

# 5 maçlık hareketli ortalama
df['MA_5'] = df['points'].rolling(window=5).mean()

# Exponential Moving Average (son maçlara daha fazla ağırlık)
df['EMA_5'] = df['points'].ewm(span=5, adjust=False).mean()

print(df)
\`\`\`

## Bayesian İstatistik

### Bayesian Yaklaşım

P(H|E) = [P(E|H) × P(H)] / P(E)

- P(H): Prior probability (önceki inanç)
- P(E|H): Likelihood (veri olasılığı)
- P(H|E): Posterior probability (güncel inanç)

**Örnek Senaryo:**
"Messi bugün gol atar mı?"

1. **Prior:** Messi'nin son 10 sezondaki gol ortalaması: %35 (maç başına)
2. **Yeni Bilgi:** Bugün rakip savunma sakatlıklardan dolayı zayıf
3. **Update:** Bayesian güncelleme ile olasılık %45'e çıkar

\`\`\`python
# Basit Bayesian update
prior = 0.35
likelihood_boost = 1.3  # Zayıf savunma etkisi
posterior = prior * likelihood_boost
posterior = min(posterior, 1.0)  # Max %100

print(f"Prior: {prior:.2%}")
print(f"Posterior: {posterior:.2%}")
\`\`\`

## Monte Carlo Simülasyonu

Belirsizliği modellemek için 10,000 kez maç simüle et:

\`\`\`python
import numpy as np

def simulate_match(home_xg, away_xg, n_simulations=10000):
    home_wins = 0
    draws = 0
    away_wins = 0
    
    for _ in range(n_simulations):
        # Poisson dağılımı ile gol üret
        home_goals = np.random.poisson(home_xg)
        away_goals = np.random.poisson(away_xg)
        
        if home_goals > away_goals:
            home_wins += 1
        elif home_goals == away_goals:
            draws += 1
        else:
            away_wins += 1
    
    return {
        'Home Win %': home_wins / n_simulations * 100,
        'Draw %': draws / n_simulations * 100,
        'Away Win %': away_wins / n_simulations * 100
    }

# Örnek kullanım
result = simulate_match(home_xg=1.8, away_xg=1.2)
print(result)
# {'Home Win %': 51.2, 'Draw %': 25.3, 'Away Win %': 23.5}
\`\`\`

## Bootstrapping

Küçük veri setlerinde güvenilir tahmin:

\`\`\`python
from sklearn.utils import resample

# Orijinal veri
goals = [2, 1, 3, 0, 2, 1, 4, 2]

# 1000 bootstrap örneği
bootstrap_means = []
for _ in range(1000):
    sample = resample(goals, replace=True, n_samples=len(goals))
    bootstrap_means.append(np.mean(sample))

# %95 güven aralığı
confidence_interval = np.percentile(bootstrap_means, [2.5, 97.5])
print(f"Ortalama gol: {np.mean(goals):.2f}")
print(f"%95 GA: [{confidence_interval[0]:.2f}, {confidence_interval[1]:.2f}]")
\`\`\`

## Sonuç

İstatistiksel analiz spor analitiğinin omurgasıdır. 2025'te:
- Daha karmaşık modeller (XGBoost, Neural Networks)
- Gerçek zamanlı Bayesian güncelleme
- Causal inference (nedensellik analizi)
- Uncertainty quantification (belirsizlik ölçümü)

**Eğitim Notları:**
- p < 0.05 "altın standart" ancak context önemli
- Korelasyon ≠ Nedensellik, dikkatli yorumlayın
- Cross-validation ile model güvenilirliği test edin
- Domain knowledge + istatistik = güçlü analiz`,
    author: "Analiz Günü Araştırma Ekibi",
    publishedAt: "2024-12-08",
    image: "/blog/stats-methods.jpg",
    category: "spor-istatistikleri",
    tags: ["istatistik", "analiz", "metodoloji", "matematik"],
    readTime: 15,
  },
  {
    slug: "futbol-istatistikleri-okuma-rehberi",
    title: "Modern Futbol İstatistiklerini Anlama Rehberi",
    description:
      "xG (beklenen gol), pas ağları, pressing metrikleri ve diğer ileri düzey futbol istatistiklerini nasıl okuyup yorumlayacağınızı öğrenin.",
    content: "Yapılandırılmış içerik için blogArticles.tsx dosyasına bakın",
    author: "Analiz Günü Araştırma Ekibi",
    publishedAt: "2024-12-05",
    image: "/blog/football-stats.jpg",
    category: "spor-istatistikleri",
    tags: ["futbol", "istatistik", "xG", "eğitim"],
    readTime: 12,
  },
  {
    slug: "profesyonel-mac-analizi-egitimi",
    title: "Profesyonel Maç Analizi Eğitimi: 5 Temel Prensip",
    description:
      "Akademik ve bilimsel yaklaşımla maç analizi yapma sanatı. Veri toplama, istatistiksel değerlendirme ve objektif yorumlama teknikleri üzerine eğitim rehberi.",
    content: "Yapılandırılmış içerik için blogArticles.tsx dosyasına bakın",
    author: "Analiz Günü Araştırma Ekibi",
    publishedAt: "2024-12-03",
    image: "/blog/match-analysis-education.jpg",
    category: "mac-analizi",
    tags: ["maç analizi", "eğitim", "metodoloji", "akademik"],
    readTime: 6,
  },
  {
    slug: "veri-bilimi-spor-analitiginde",
    title: "Veri Bilimi ve Modern Spor Analitiği",
    description:
      "Python, R, SQL ve büyük veri teknolojileri ile spor verilerinin işlenmesi. Veri bilimciler ve spor analistleri için teknik eğitim içeriği.",
    content: "Yapılandırılmış içerik için blogArticles.tsx dosyasına bakın",
    author: "Analiz Günü Araştırma Ekibi",
    publishedAt: "2024-12-01",
    image: "/blog/data-science-sports.jpg",
    category: "spor-istatistikleri",
    tags: ["veri bilimi", "big data", "Python", "analitik"],
    readTime: 15,
  },
  {
    slug: "takım-performans-metrikleri",
    title: "Takım Performans Metrikleri ve Değerlendirme",
    description:
      "Takım performansını ölçmek için kullanılan modern metrikler, istatistiksel göstergeler ve karşılaştırmalı analiz yöntemleri hakkında bilgilendirici içerik.",
    content: "Yapılandırılmış içerik için blogArticles.tsx dosyasına bakın",
    author: "Analiz Günü Araştırma Ekibi",
    publishedAt: "2024-11-28",
    image: "/blog/team-metrics.jpg",
    category: "mac-analizi",
    tags: ["performans", "metrik", "takım analizi", "ölçüm"],
    readTime: 9,
  },
  {
    slug: "python-ile-spor-verisi-analizi",
    title: "Python ile Spor Verisi Analizi: Başlangıç Rehberi",
    description:
      "Python programlama dili kullanarak spor verilerini nasıl analiz edeceğinizi öğrenin. Pandas, NumPy ve Matplotlib kütüphaneleri ile pratik örnekler.",
    content: "Yapılandırılmış içerik için blogArticles.tsx dosyasına bakın",
    author: "Analiz Günü Araştırma Ekibi",
    publishedAt: "2024-11-22",
    image: "/blog/python-sports.jpg",
    category: "yapay-zeka",
    tags: ["Python", "programlama", "veri analizi", "tutorial"],
    readTime: 14,
  },
];
