import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Resend API key optional (environment variable yoksa çalışmaz)
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, category, message, userId, timestamp } = body;

    // Basit validasyon
    if (!name || !email || !subject || !category || !message) {
      return NextResponse.json(
        { error: "Tüm alanlar zorunludur" },
        { status: 400 }
      );
    }

    if (message.length < 20) {
      return NextResponse.json(
        { error: "Mesaj en az 20 karakter olmalıdır" },
        { status: 400 }
      );
    }

    const supportEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "support@analizgunu.com";
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    
    // Kategori etiketleri
    const categoryLabels: { [key: string]: string } = {
      account: "Hesap & Giriş Sorunları",
      payment: "Ödeme & Abonelik",
      technical: "Teknik Sorun",
      content: "İçerik & Analizler",
      suggestion: "Öneri & Şikayet",
      other: "Diğer",
    };

    try {
      // Resend ile email gönder (API key yoksa atlayıp sadece log)
      if (resend) {
        await resend.emails.send({
          from: fromEmail,
        to: supportEmail,
        replyTo: email,
        subject: `[Destek Talebi] ${categoryLabels[category] || category.toUpperCase()}: ${subject}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(to right, #2563eb, #7c3aed); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
                .info-row { margin: 10px 0; padding: 10px; background: white; border-radius: 4px; }
                .label { font-weight: bold; color: #4b5563; }
                .message-box { background: white; padding: 15px; border-left: 4px solid #2563eb; margin-top: 20px; border-radius: 4px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2 style="margin: 0;">🎯 Yeni Destek Talebi</h2>
                </div>
                <div class="content">
                  <div class="info-row">
                    <span class="label">👤 Gönderen:</span> ${name}
                  </div>
                  <div class="info-row">
                    <span class="label">📧 Email:</span> ${email}
                  </div>
                  <div class="info-row">
                    <span class="label">📁 Kategori:</span> ${categoryLabels[category] || category}
                  </div>
                  <div class="info-row">
                    <span class="label">📝 Konu:</span> ${subject}
                  </div>
                  <div class="info-row">
                    <span class="label">🆔 Kullanıcı ID:</span> ${userId}
                  </div>
                  <div class="info-row">
                    <span class="label">📅 Tarih:</span> ${new Date(timestamp).toLocaleString('tr-TR')}
                  </div>
                  
                  <div class="message-box">
                    <h3 style="margin-top: 0; color: #2563eb;">💬 Mesaj:</h3>
                    <p style="white-space: pre-wrap;">${message}</p>
                  </div>
                  
                  <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
                    Bu email Analiz Günü destek formu üzerinden gönderilmiştir.
                  </p>
                </div>
              </div>
            </body>
          </html>
        `,
        });

        console.log("✅ Destek emaili başarıyla gönderildi:", { email, subject });
      } else {
        console.warn("⚠️ Resend API key tanımlı değil. Email gönderilemiyor.");
      }

      // Email gönderilse de gönderilmese de başarılı yanıt dön
      console.log("📝 Destek talebi kaydedildi:", {
        name,
        email,
        subject,
        category,
      });

      return NextResponse.json(
        { 
          success: true, 
          message: "Destek talebiniz başarıyla alındı. En kısa sürede size dönüş yapacağız." 
        },
        { status: 200 }
      );

    } catch (emailError) {
      console.error("❌ Email gönderme hatası:", emailError);
      
      return NextResponse.json(
        { 
          success: true, 
          message: "Destek talebiniz alındı. En kısa sürede size dönüş yapacağız." 
        },
        { status: 200 }
      );
    }

  } catch (error) {
    console.error("Destek talebi hatası:", error);
    return NextResponse.json(
      { error: "Sunucu hatası oluştu" },
      { status: 500 }
    );
  }
}
