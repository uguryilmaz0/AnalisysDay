"use client";

import { useState, useEffect } from "react";
import { Users, Copy, CheckCircle2, TrendingUp, Award } from "lucide-react";
import { Button, LoadingSpinner } from "@/shared/components/ui";
import { useToast } from "@/shared/hooks";
import { generateReferralLink } from "@/lib/referralUtils";
import { getReferralStats, setUserReferralCode } from "@/lib/db";
import { generateUniqueReferralCode } from "@/lib/referralUtils";
import type { User } from "@/types";

interface ReferralSectionProps {
  userData: User;
}

export function ReferralSection({ userData }: ReferralSectionProps) {
  const { showToast } = useToast();
  const [referralLink, setReferralLink] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    premiumReferrals: 0,
    referredUsers: [] as User[],
    premiumUsers: [] as User[],
  });

  useEffect(() => {
    loadReferralData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData.uid]);

  const loadReferralData = async () => {
    setLoading(true);
    try {
      // Eğer referral kodu yoksa, premium kullanıcıya otomatik oluştur
      let currentCode = userData.referralCode;
      if (!currentCode) {
        currentCode = await generateUniqueReferralCode();
        await setUserReferralCode(userData.uid, currentCode);
      }

      // Referral linkini oluştur
      const link = generateReferralLink(currentCode);
      setReferralLink(link);

      // İstatistikleri getir
      const referralStats = await getReferralStats(userData.uid);
      setStats(referralStats);
    } catch {
      showToast("Referral bilgileri yüklenemedi", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      showToast("Referral linki kopyalandı! 🎉", "success");
    } catch {
      showToast("Kopyalama başarısız oldu", "error");
    }
  };

  const handleRegenerateCode = async () => {
    if (
      !confirm(
        "Yeni bir referral kodu oluşturmak istediğinizden emin misiniz? Eski link artık çalışmayacak."
      )
    ) {
      return;
    }

    setGenerating(true);
    try {
      const newCode = await generateUniqueReferralCode();
      await setUserReferralCode(userData.uid, newCode);
      const newLink = generateReferralLink(newCode);
      setReferralLink(newLink);
      showToast("Yeni referral kodu oluşturuldu!", "success");
    } catch {
      showToast("Kod oluşturulamadı", "error");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
        <LoadingSpinner size="md" text="Referral verileri yükleniyor..." />
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Users className="h-5 w-5 text-purple-400" />
        Arkadaşını Davet Et
      </h2>

      <p className="text-gray-400 text-sm mb-4">
        Premium üye olarak arkadaşlarınızı davet edebilirsiniz. Davet ettiğiniz
        kişiler premium olduğunda burada görüntülenir.
      </p>

      {/* Referral Link */}
      <div className="bg-gray-800 rounded-lg p-4 mb-4">
        <label className="text-xs text-gray-400 mb-2 block">
          Davet Linkiniz
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <Button
            onClick={handleCopyLink}
            variant="primary"
            size="md"
            className="shrink-0"
          >
            <Copy className="h-4 w-4" />
            Kopyala
          </Button>
        </div>
        <button
          onClick={handleRegenerateCode}
          disabled={generating}
          className="text-xs text-gray-500 hover:text-gray-400 mt-2 transition"
        >
          {generating ? "Oluşturuluyor..." : "Yeni kod oluştur"}
        </button>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-blue-400" />
            <span className="text-xs text-gray-400">Toplam Davet</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {stats.totalReferrals}
          </p>
        </div>

        <div className="bg-purple-900/30 border border-purple-500/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Award className="h-4 w-4 text-purple-400" />
            <span className="text-xs text-gray-400">Premium Olanlar</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {stats.premiumReferrals}
          </p>
        </div>
      </div>

      {/* Davet Edilen Kullanıcılar */}
      {stats.totalReferrals > 0 && (
        <div className="border-t border-gray-800 pt-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Davet Ettikleriniz
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {stats.referredUsers.map((user) => {
              const isPremium = stats.premiumUsers.some(
                (pu) => pu.uid === user.uid
              );
              return (
                <div
                  key={user.uid}
                  className="bg-gray-800 rounded-lg p-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-white text-sm font-medium">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-gray-400 text-xs">@{user.username}</p>
                  </div>
                  {isPremium && (
                    <div className="flex items-center gap-1 bg-green-900/30 border border-green-500/50 rounded px-2 py-1">
                      <CheckCircle2 className="h-3 w-3 text-green-400" />
                      <span className="text-xs text-green-400 font-semibold">
                        Premium
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Hiç davet yoksa */}
      {stats.totalReferrals === 0 && (
        <div className="text-center py-6">
          <Users className="h-12 w-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">
            Henüz kimseyi davet etmediniz.
            <br />
            Yukarıdaki linki paylaşarak başlayın! 🚀
          </p>
        </div>
      )}
    </div>
  );
}
