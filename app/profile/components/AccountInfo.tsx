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

    const daysRemaining = userData.subscriptionEndDate
      ? Math.ceil(
          (userData.subscriptionEndDate.toDate().getTime() -
            new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

    return { hasActiveSubscription, daysRemaining };
  }, [userData.subscriptionEndDate]);

  const { hasActiveSubscription, daysRemaining } = subscriptionInfo;

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center gap-2 sm:gap-3 bg-gray-800 rounded-lg p-3 sm:p-4">
        <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 shrink-0" />
        <div className="min-w-0">
          <p className="text-xs text-gray-400">Email</p>
          <p className="text-white font-medium text-sm sm:text-base truncate">
            {userData.email}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 bg-gray-800 rounded-lg p-3 sm:p-4">
        <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 shrink-0" />
        <div>
          <p className="text-xs text-gray-400">Rol</p>
          <p className="text-white font-medium text-sm sm:text-base">
            {userData.role === "admin" ? (
              <span className="flex items-center gap-1 sm:gap-2 flex-wrap">
                <span className="text-orange-400">⚡ Admin</span>
                {userData.superAdmin && (
                  <span className="bg-yellow-500/20 text-yellow-400 px-1.5 sm:px-2 py-0.5 rounded text-xs">
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
        <div className="flex items-center gap-2 sm:gap-3 bg-gray-800 rounded-lg p-3 sm:p-4">
          <div className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 shrink-0 flex items-center justify-center">
            {hasActiveSubscription ? "✨" : "⏰"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400">Abonelik Durumu</p>
            {hasActiveSubscription ? (
              <div>
                <p className="text-white font-medium text-sm sm:text-base">
                  <span className="text-blue-400">✓ Premium Aktif</span>
                </p>
                <p className="text-xs text-gray-400 mt-0.5 sm:mt-1">
                  {daysRemaining > 0 ? (
                    <span className="flex flex-wrap gap-x-1">
                      <span>{daysRemaining} gün kaldı</span>
                      {userData.subscriptionEndDate && (
                        <span>
                          (
                          {userData.subscriptionEndDate
                            .toDate()
                            .toLocaleDateString("tr-TR")}
                          )
                        </span>
                      )}
                    </span>
                  ) : (
                    "Bugün sona eriyor"
                  )}
                </p>
              </div>
            ) : (
              <p className="font-medium text-yellow-400 text-sm sm:text-base">
                {userData.isPaid ? "Süresi Dolmuş" : "Ücretsiz Üyelik"}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 sm:gap-3 bg-gray-800 rounded-lg p-3 sm:p-4">
        <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 shrink-0" />
        <div>
          <p className="text-xs text-gray-400">Kayıt Tarihi</p>
          <p className="text-white font-medium text-sm sm:text-base">
            {userData.createdAt.toDate().toLocaleDateString("tr-TR")}
          </p>
        </div>
      </div>
    </div>
  );
}
