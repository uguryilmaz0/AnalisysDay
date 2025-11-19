import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import WhatsAppWidget from "@/components/WhatsAppWidget";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AnalysisDay - Daily Match Analysis and Betting Predictions",
  description:
    "Start winning with professional daily match analysis and betting predictions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.className} antialiased bg-slate-900`}>
        <AuthProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
          <WhatsAppWidget />
        </AuthProvider>
      </body>
    </html>
  );
}
