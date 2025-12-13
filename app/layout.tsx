import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import { CacheMonitor } from "@/components/CacheMonitor";
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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://analysisday.com"
  ),
  title: "Analiz Günü - Günlük Maç Analizleri ve Yapay Zeka",
  description:
    "Günlük maç analizleri, yapay zeka destekli tahminler ve profesyonel istatistiklerle deneyiminizi geliştirin.",
  keywords: ["maç analizi", "yapay zeka", "tahmin", "spor", "istatistik"],
  authors: [{ name: "Analiz Günü" }],
  openGraph: {
    title: "Analiz Günü - Günlük Maç Analizleri ve Yapay Zeka",
    description:
      "Günlük maç analizleri, yapay zeka destekli tahminler ve profesyonel istatistiklerle deneyiminizi geliştirin.",
    url: "https://analizgunu.com",
    siteName: "Analiz Günü",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Analiz Günü - Günlük Maç Analizleri ve Yapay Zeka",
    description:
      "Günlük maç analizleri, yapay zeka destekli tahminler ve profesyonel istatistiklerle deneyiminizi geliştirin.",
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
              <CacheMonitor />
            </AuthProvider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
