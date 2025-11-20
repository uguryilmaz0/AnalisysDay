"use client";

import Link from "next/link";
import { TrendingUp, Mail, MessageCircle, Shield, Heart } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-950 border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Açıklama */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4 group">
              <TrendingUp className="h-8 w-8 text-blue-500 group-hover:text-blue-400 transition" />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-purple-400">
                AnalysisDay
              </span>
            </Link>
            <p className="text-gray-400 text-sm mb-4 max-w-md">
              Profesyonel spor analizi platformu. Günlük teknik analizler, hedef
              fiyatlar ve uzman tahminleri ile kazanmaya başlayın.
            </p>
            <div className="flex items-center space-x-4">
              <a
                href={`https://wa.me/${
                  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "905xxxxxxxxx"
                }`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-green-400 hover:text-green-300 transition"
              >
                <MessageCircle className="h-5 w-5" />
                <span className="text-sm">WhatsApp Destek</span>
              </a>
            </div>
          </div>

          {/* Hızlı Linkler */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">
              Hızlı Linkler
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-gray-400 hover:text-blue-400 transition text-sm"
                >
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <Link
                  href="/analysis"
                  className="text-gray-400 hover:text-blue-400 transition text-sm"
                >
                  Günün Analizi
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-gray-400 hover:text-blue-400 transition text-sm"
                >
                  💎 Ücretler
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="text-gray-400 hover:text-blue-400 transition text-sm"
                >
                  Profil
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-gray-400 hover:text-blue-400 transition text-sm"
                >
                  ❓ Sıkça Sorulan Sorular
                </Link>
              </li>
              <li>
                <Link
                  href="/support"
                  className="text-gray-400 hover:text-blue-400 transition text-sm"
                >
                  📧 Destek
                </Link>
              </li>
            </ul>
          </div>

          {/* Yasal & Politikalar */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Yasal</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-400 hover:text-blue-400 transition text-sm flex items-center space-x-2"
                >
                  <Shield className="h-4 w-4" />
                  <span>Gizlilik Politikası</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-gray-400 hover:text-blue-400 transition text-sm"
                >
                  Kullanım Koşulları
                </Link>
              </li>
              <li>
                <a
                  href={`mailto:${
                    process.env.NEXT_PUBLIC_CONTACT_EMAIL ||
                    "info@analysisday.com"
                  }`}
                  className="text-gray-400 hover:text-blue-400 transition text-sm flex items-center space-x-2"
                >
                  <Mail className="h-4 w-4" />
                  <span>İletişim</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Alt Bar */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © {currentYear} AnalysisDay. Tüm hakları saklıdır.
            </p>
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <span>Provided By</span>
              <Heart className="h-4 w-4 text-red-500 fill-red-500 animate-pulse" />
              <span>in AnalysisDay Team</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
