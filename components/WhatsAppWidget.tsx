"use client";

import { MessageCircle } from "lucide-react";

export default function WhatsAppWidget() {
  const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "905xxxxxxxxx";
  const message = "Merhaba, AnalizGunu hakkında bilgi almak istiyorum.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    message
  )}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 group"
      aria-label="WhatsApp ile iletişime geç"
    >
      <MessageCircle className="h-6 w-6 group-hover:scale-110 transition-transform" />

      {/* Tooltip */}
      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Bize Ulaşın
      </span>
    </a>
  );
}
