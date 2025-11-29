import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import { ToastProvider } from "@/shared/hooks/useToast";
import { ToastContainer, ErrorBoundary } from "@/shared/components/ui";
import { validateEnv } from "@/lib/validateEnv";

const inter = Inter({ subsets: ["latin"] });

// Validate environment variables on startup (server-side only)
if (typeof window === "undefined") {
  try {
    validateEnv();
  } catch (error) {
    console.error("Environment validation failed:", error);
    // In development, throw error. In production, just log it.
    if (process.env.NODE_ENV === "development") {
      throw error;
    }
  }
}

export const metadata: Metadata = {
  title: "Analiz Günü - Günlük Maç Analizleri ve Yapay Zeka",
  description:
    "Günlük maç analizleri, yapay zeka destekli tahminler ve profesyonel istatistiklerle spor bahis deneyiminizi geliştirin.",
  keywords: ["maç analizi", "yapay zeka", "tahmin", "spor", "istatistik"],
  authors: [{ name: "Analiz Günü" }],
  openGraph: {
    title: "Analiz Günü - Günlük Maç Analizleri ve Yapay Zeka",
    description:
      "Günlük maç analizleri, yapay zeka destekli tahminler ve profesyonel istatistiklerle spor bahis deneyiminizi geliştirin.",
    url: "https://analysisday.com",
    siteName: "Analiz Günü",
    locale: "tr_TR",
    type: "website",
    images: [
      {
        url: "/og-image.png", // Bu dosyayı public/ klasörüne eklemelisiniz
        width: 1200,
        height: 630,
        alt: "Analiz Günü - Günlük Maç Analizleri",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Analiz Günü - Günlük Maç Analizleri ve Yapay Zeka",
    description:
      "Günlük maç analizleri, yapay zeka destekli tahminler ve profesyonel istatistiklerle spor bahis deneyiminizi geliştirin.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${inter.className} antialiased bg-slate-900 flex flex-col min-h-screen`}
      >
        <ErrorBoundary>
          <ToastProvider>
            <AuthProvider>
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
              <WhatsAppWidget />
              <ToastContainer />
            </AuthProvider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
