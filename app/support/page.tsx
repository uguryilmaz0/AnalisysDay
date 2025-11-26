"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Mail,
  Send,
  CheckCircle,
  AlertCircle,
  MessageCircle,
  HelpCircle,
} from "lucide-react";

export default function SupportPage() {
  const { user, userData } = useAuth();
  const [formData, setFormData] = useState({
    name: userData?.username || "",
    email: user?.email || "",
    subject: "",
    category: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const categories = [
    { value: "account", label: "Hesap & Giriş Sorunları" },
    { value: "payment", label: "Ödeme & Abonelik" },
    { value: "technical", label: "Teknik Sorun" },
    { value: "content", label: "İçerik & Analizler" },
    { value: "suggestion", label: "Öneri & Şikayet" },
    { value: "other", label: "Diğer" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.subject ||
      !formData.category ||
      !formData.message
    ) {
      setStatus("error");
      setErrorMessage("Lütfen tüm alanları doldurun.");
      return;
    }

    setSending(true);
    setStatus("idle");

    try {
      // Email gönderme API'sine istek
      const response = await fetch("/api/support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userId: user?.uid || "anonymous",
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setStatus("success");
        setFormData({
          name: userData?.username || "",
          email: user?.email || "",
          subject: "",
          category: "",
          message: "",
        });
      } else {
        throw new Error("Gönderim başarısız");
      }
    } catch (err) {
      console.error("Support form error:", err);
      setStatus("error");
      setErrorMessage(
        "Mesajınız gönderilemedi. Lütfen WhatsApp üzerinden iletişime geçin veya tekrar deneyin."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-gray-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-green-900/30 border border-green-500/50 rounded-full px-4 py-2 mb-6">
            <Mail className="h-5 w-5 text-green-400" />
            <span className="text-sm font-semibold text-green-300">
              Destek Merkezi
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Size Nasıl Yardımcı Olabiliriz?
          </h1>
          <p className="text-gray-400 text-lg">
            Sorularınız, önerileriniz veya sorunlarınız için bize ulaşın. En
            kısa sürede size dönüş yapacağız.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sol: İletişim Bilgileri */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                İletişim Bilgileri
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-blue-400 mt-1 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Email</p>
                    <a
                      href={`mailto:${
                        process.env.NEXT_PUBLIC_CONTACT_EMAIL ||
                        "support@analizgunu.com"
                      }`}
                      className="text-blue-400 hover:text-blue-300 underline"
                    >
                      {process.env.NEXT_PUBLIC_CONTACT_EMAIL ||
                        "support@analizgunu.com"}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MessageCircle className="h-5 w-5 text-green-400 mt-1 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-400 mb-1">WhatsApp</p>
                    <a
                      href={`https://wa.me/${
                        process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
                        "905xxxxxxxxx"
                      }`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-green-400 transition"
                    >
                      {process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
                        "+90 5XX XXX XX XX"}
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-800">
                <p className="text-sm text-gray-400">
                  <strong className="text-white">Çalışma Saatleri:</strong>
                  <br />
                  Hafta içi: 09:00 - 22:00
                  <br />
                  Hafta sonu: 10:00 - 20:00
                </p>
              </div>
            </div>

            <div className="bg-blue-900/30 border border-blue-500/50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <HelpCircle className="h-5 w-5 text-blue-400" />
                <h3 className="font-semibold text-white">Hızlı Yardım</h3>
              </div>
              <p className="text-sm text-gray-300 mb-3">
                Cevap arıyorsanız, önce SSS sayfamıza göz atın.
              </p>
              <a
                href="/faq"
                className="text-blue-400 hover:text-blue-300 text-sm font-semibold"
              >
                Sıkça Sorulan Sorular →
              </a>
            </div>

            <div className="bg-green-900/30 border border-green-500/50 rounded-xl p-6">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-green-400" />
                Acil Yardım
              </h3>
              <p className="text-sm text-gray-300 mb-4">
                Acil durumlarda WhatsApp üzerinden anında destek alın.
              </p>
              <a
                href={`https://wa.me/${
                  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "905xxxxxxxxx"
                }?text=${encodeURIComponent(
                  "Merhaba, acil yardıma ihtiyacım var."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition w-full justify-center"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp&apos;a Git
              </a>
            </div>
          </div>

          {/* Sağ: Destek Formu */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                Destek Talebi Oluştur
              </h2>

              {/* Başarı Mesajı */}
              {status === "success" && (
                <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4 mb-6 flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-green-200 font-semibold mb-1">
                      Mesajınız Başarıyla Gönderildi!
                    </p>
                    <p className="text-green-300 text-sm">
                      En kısa sürede size dönüş yapacağız. Email adresinizi
                      kontrol etmeyi unutmayın.
                    </p>
                  </div>
                </div>
              )}

              {/* Hata Mesajı */}
              {status === "error" && (
                <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-6 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-200 font-semibold mb-1">Hata!</p>
                    <p className="text-red-300 text-sm">{errorMessage}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* İsim */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Adınız Soyadınız *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder-gray-500"
                    placeholder="Adınız ve soyadınız"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Adresiniz *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder-gray-500"
                    placeholder="email@example.com"
                    required
                  />
                </div>

                {/* Kategori */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Konu Kategorisi *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    required
                  >
                    <option value="">Kategori seçin...</option>
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Konu */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Konu Başlığı *
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder-gray-500"
                    placeholder="Konuyu kısaca özetleyin"
                    required
                  />
                </div>

                {/* Mesaj */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Mesajınız *
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    rows={6}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder-gray-500 resize-none"
                    placeholder="Sorunuzu veya talebinizi detaylı olarak açıklayın..."
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum 20 karakter
                  </p>
                </div>

                {/* Gönder Butonu */}
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-lg transition flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/20"
                >
                  {sending ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                      <span>Gönderiliyor...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>Mesajı Gönder</span>
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  Genellikle 24 saat içinde yanıt veriyoruz. Acil durumlar için
                  WhatsApp kullanın.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
