"use client";

import { Mail, Shield, Calendar } from "lucide-react";
import type { User } from "@/types";

interface AccountInfoProps {
  userData: User;
}

export function AccountInfo({ userData }: AccountInfoProps) {
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
