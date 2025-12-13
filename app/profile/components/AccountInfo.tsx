"use client";

import { useMemo } from "react";
import { Mail, Shield, Calendar } from "lucide-react";
import type { User } from "@/types";

interface AccountInfoProps {
  userData: User;
}

export function AccountInfo({ userData }: AccountInfoProps) {
  // Abonelik durumu kontrolü - useMemo ile Date.now() impure function hatasını çözüyoruz
  const subscriptionInfo = useMemo(() => {
    const hasActiveSubscription = userData.subscriptionEndDate
      ? userData.subscriptionEndDate.toDate() > new Date()
      : false;

    const isTrialUser = !userData.isPaid && hasActiveSubscription;
    const daysRemaining = userData.subscriptionEndDate
      ? Math.ceil(
          (userData.subscriptionEndDate.toDate().getTime() -
            new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

    return { hasActiveSubscription, isTrialUser, daysRemaining };
  }, [userData.subscriptionEndDate, userData.isPaid]);

  const { hasActiveSubscription, isTrialUser, daysRemaining } =
    subscriptionInfo;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 bg-gray-800 rounded-lg p-4">
        <Mail className="h-5 w-5 text-gray-400" />
        <div>
          <p className="text-xs text-gray-400">Email</p>
          <p className="text-white font-medium">{userData.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-gray-800 rounded-lg p-4">
        <Shield className="h-5 w-5 text-gray-400" />
        <div>
          <p className="text-xs text-gray-400">Rol</p>
          <p className="text-white font-medium">
            {userData.role === "admin" ? (
              <span className="flex items-center gap-2">
                <span className="text-orange-400">⚡ Admin</span>
                {userData.superAdmin && (
                  <span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded text-xs">
                    ⭐ Super
                  </span>
                )}
              </span>
            ) : (
              "Kullanıcı"
            )}
          </p>
        </div>
      </div>

      {/* Abonelik Durumu */}
      {userData.role !== "admin" && (
        <div className="flex items-center gap-3 bg-gray-800 rounded-lg p-4">
          <div className="h-5 w-5 text-gray-400">
            {hasActiveSubscription ? "✨" : "⏰"}
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-400">Abonelik Durumu</p>
            {hasActiveSubscription ? (
              <div>
                <p className="text-white font-medium">
                  {isTrialUser ? (
                    <span className="text-green-400">
                      🎁 Deneme Süresi Aktif
                    </span>
                  ) : (
                    <span className="text-blue-400">✓ Premium Aktif</span>
                  )}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {daysRemaining > 0 ? (
                    <>
                      {daysRemaining} gün kaldı
                      {userData.subscriptionEndDate && (
                        <span className="ml-2">
                          (
                          {userData.subscriptionEndDate
                            .toDate()
                            .toLocaleDateString("tr-TR")}
                          )
                        </span>
                      )}
                    </>
                  ) : (
                    "Bugün sona eriyor"
                  )}
                </p>
              </div>
            ) : (
              <p className="font-medium text-yellow-400">
                {userData.isPaid ? "Süresi Dolmuş" : "Ücretsiz Üyelik"}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 bg-gray-800 rounded-lg p-4">
        <Calendar className="h-5 w-5 text-gray-400" />
        <div>
          <p className="text-xs text-gray-400">Kayıt Tarihi</p>
          <p className="text-white font-medium">
            {userData.createdAt.toDate().toLocaleDateString("tr-TR")}
          </p>
        </div>
      </div>
    </div>
  );
}
