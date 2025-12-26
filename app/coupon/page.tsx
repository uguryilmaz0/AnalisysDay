"use client";

import { useState, useEffect, useCallback } from "react";
import { getPendingCoupons } from "@/lib/db";
import { DailyAnalysis } from "@/types";
import { Lock, Calendar, AlertCircle, Gift, Clock } from "lucide-react";
import Link from "next/link";
import { WatermarkImage } from "@/components/WatermarkImage";
import ImageModal from "@/components/ImageModal";
import { LoadingSpinner, EmptyState, Button } from "@/shared/components/ui";
import { useRequireAuth, usePermissions, useModal } from "@/shared/hooks";

export default function CouponPage() {
  const { userData, loading: authLoading } = useRequireAuth({
    requireEmailVerified: true,
  });
  const { hasPremiumAccess } = usePermissions();
  const [coupons, setCoupons] = useState<DailyAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    title: string;
    coupon: DailyAnalysis;
    imageIndex: number;
  } | null>(null);
  const modal = useModal();

  // Track image view
  const trackImageView = useCallback(
    async (
      type: "view" | "right_click" | "screenshot",
      coupon: DailyAnalysis,
      imageUrl: string,
      imageIndex: number
    ) => {
      if (!userData) return;

      try {
        await fetch("/api/track/image-view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type,
            userId: userData.uid,
            userEmail: userData.email,
            userName:
              userData.username || `${userData.firstName} ${userData.lastName}`,
            analysisId: coupon.id,
            analysisTitle: `[KUPON] ${coupon.title}`,
            imageUrl,
            imageIndex,
          }),
        });
      } catch (error) {
        console.error("Failed to track image view:", error);
      }
    },
    [userData]
  );

  // Kalan süreyi hesapla
  const getTimeRemaining = (expiresAt: { toDate: () => Date }) => {
    const now = new Date();
    const expires = expiresAt.toDate();
    const diff = expires.getTime() - now.getTime();

    if (diff <= 0) return "Süresi doldu";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours} saat ${minutes} dakika`;
    }
    return `${minutes} dakika`;
  };

  useEffect(() => {
    const loadData = async () => {
      if (authLoading) return;

      if (hasPremiumAccess) {
        try {
          const pendingCoupons = await getPendingCoupons();
          setCoupons(pendingCoupons);
        } catch (error) {
          console.error("Kuponlar yüklenemedi:", error);
        }
      }

      setLoading(false);
    };

    loadData();
  }, [authLoading, hasPremiumAccess]);

  // Loading state
  if (authLoading || loading) {
    return <LoadingSpinner fullScreen size="xl" text="Kuponlar yükleniyor..." />;
  }

  // Premium erişimi yoksa - KİLİT EKRANI
  if (!hasPremiumAccess) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-yellow-900 to-orange-900 relative overflow-hidden">
        {/* Arka Plan Bulanık Efekti */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-linear-to-br from-yellow-500/20 to-orange-500/20 blur-3xl"></div>
        </div>

        {/* Kilit İçeriği */}
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
          <div className="max-w-2xl w-full text-center">
            {/* Kilit İkonu */}
            <div className="bg-linear-to-br from-yellow-400 to-orange-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <Lock className="h-12 w-12 text-white" />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Günün Kuponu
            </h1>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-8">
              <AlertCircle className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
              <p className="text-xl text-white mb-4">
                Günün kuponlarını görmek için{" "}
                <span className="font-bold text-yellow-400">Premium Üye</span>{" "}
                olmalısınız.
              </p>
              <p className="text-gray-300 mb-6">
                Her gün yeni kupon önerileri ile kazanç fırsatlarını kaçırmayın!
              </p>

              {/* Özellikler */}
              <div className="grid md:grid-cols-3 gap-4 mb-6 text-left">
                <div className="bg-white/5 rounded-lg p-4">
                  <Gift className="h-6 w-6 text-yellow-400 mb-2" />
                  <p className="text-white text-sm">Günlük Kupon Önerileri</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <Clock className="h-6 w-6 text-orange-400 mb-2" />
                  <p className="text-white text-sm">24 Saat Geçerli</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <Lock className="h-6 w-6 text-yellow-400 mb-2" />
                  <p className="text-white text-sm">Sadece Üyelere Özel</p>
                </div>
              </div>

              <Link href="/pricing">
                <Button variant="premium" size="lg">
                  Ücretleri İncele & Premium Ol
                </Button>
              </Link>
            </div>

            <p className="text-gray-400">
              Sorularınız mı var?{" "}
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300 font-semibold"
              >
                WhatsApp üzerinden bize ulaşın
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Premium kullanıcı - KUPONLARI GÖSTER
  return (
    <div className="min-h-screen bg-gray-950 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-linear-to-r from-yellow-600 to-orange-600 rounded-2xl p-8 text-white mb-8 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
                <span>🎫</span> Günün Kuponu
              </h1>
              <p className="text-yellow-100">
                Premium üyeliğinizle günlük kupon önerilerine sınırsız erişim
              </p>
            </div>

            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <p className="text-sm text-yellow-100">Aktif Kuponlar</p>
              <p className="font-semibold text-2xl">{coupons.length}</p>
            </div>
          </div>
        </div>

        {/* Kuponlar */}
        <div className="space-y-8">
          {coupons.length === 0 ? (
            <EmptyState
              icon={<Gift className="h-16 w-16" />}
              title="Aktif kupon yok"
              description="Şu anda aktif kupon bulunmuyor. Yeni kuponlar için takipte kalın!"
            />
          ) : (
            coupons.map((coupon, index) => (
              <div
                key={coupon.id}
                className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden hover:border-yellow-500/50 transition-all duration-300"
              >
                {/* Başlık */}
                <div className="bg-linear-to-r from-yellow-900/50 to-orange-900/50 p-6 border-b border-gray-800">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <Calendar className="h-5 w-5 text-yellow-400" />
                    <span className="text-sm text-gray-400">
                      {new Date(coupon.date.toDate()).toLocaleDateString("tr-TR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                      {" • "}
                      <span className="text-yellow-400 font-semibold">
                        {new Date(coupon.createdAt.toDate()).toLocaleTimeString(
                          "tr-TR",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                    </span>

                    {/* Kalan Süre */}
                    <span className="ml-auto flex items-center gap-2 bg-orange-600/20 text-orange-400 px-3 py-1 rounded-full text-xs font-semibold">
                      <Clock className="h-3 w-3" />
                      {getTimeRemaining(coupon.expiresAt)}
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold text-white mb-3">
                    {coupon.title}
                  </h2>

                  {/* Editör Bilgisi */}
                  {coupon.createdByUsername && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-gray-400 font-medium">Editör:</span>
                      <span className="inline-flex items-center gap-1.5 bg-linear-to-r from-yellow-600 to-orange-600 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                        @{coupon.createdByUsername}
                      </span>
                    </div>
                  )}

                  {coupon.description && (
                    <div
                      className="text-gray-400 mt-2 prose prose-invert max-w-none"
                      style={{ whiteSpace: "pre-wrap" }}
                      dangerouslySetInnerHTML={{
                        __html: coupon.description
                          .replace(/\n/g, "<br />")
                          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                          .replace(/\*(.*?)\*/g, "<em>$1</em>"),
                      }}
                    />
                  )}
                </div>

                {/* Görseller */}
                <div className="p-6 space-y-6 bg-linear-to-b from-gray-900 to-gray-950">
                  {coupon.imageUrls.map((url, imgIndex) => (
                    <WatermarkImage
                      key={imgIndex}
                      src={url}
                      alt={`${coupon.title} - Görsel ${imgIndex + 1}`}
                      width={1200}
                      height={800}
                      className="cursor-pointer"
                      priority={index === 0 && imgIndex === 0}
                      imageIndex={imgIndex}
                      userEmail={userData?.email || "Unknown"}
                      userName={
                        userData?.username ||
                        `${userData?.firstName || ""} ${userData?.lastName || ""}`.trim()
                      }
                      onImageClick={() => {
                        trackImageView("view", coupon, url, imgIndex);
                        setSelectedImage({ url, title: coupon.title, coupon, imageIndex: imgIndex });
                        modal.open();
                      }}
                      onRightClick={() => trackImageView("right_click", coupon, url, imgIndex)}
                      onScreenshotDetected={() => trackImageView("screenshot", coupon, url, imgIndex)}
                      disableRightClick={true}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Image Modal */}
        {selectedImage && (
          <ImageModal
            isOpen={modal.isOpen}
            onClose={() => {
              modal.close();
              setSelectedImage(null);
            }}
            imageUrl={selectedImage.url}
            title={selectedImage.title}
            onScreenshotDetected={() => {
              trackImageView(
                "screenshot",
                selectedImage.coupon,
                selectedImage.url,
                selectedImage.imageIndex
              );
            }}
          />
        )}
      </div>
    </div>
  );
}
