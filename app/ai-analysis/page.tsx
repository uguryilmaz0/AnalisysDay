"use client";

import { Sparkles } from "lucide-react";

export default function AIAnalysisPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-950 via-purple-900/20 to-gray-950 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Icon */}
        <div className="bg-linear-to-br from-purple-500 to-blue-600 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl animate-pulse">
          <Sparkles className="h-16 w-16 text-white" />
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-6xl font-bold  mb-6 bg-linear-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
          Yapay Zeka Analizi
        </h1>

        {/* Description */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 mb-6">
          <p className="text-2xl text-white font-semibold mb-4">
            🚀 Yakında...
          </p>
          <p className="text-gray-300 text-lg">
            Yapay zeka tablo analizleri özelliğimiz üzerinde çalışıyoruz.
            <br />
            Çok yakında sizlerle!
          </p>
        </div>
      </div>
    </div>
  );
}
