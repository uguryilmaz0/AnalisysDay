"use client";

import { useState } from "react";
import {
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Key, Lock, Save, X } from "lucide-react";
import { Button, Input } from "@/shared/components/ui";
import { useToast } from "@/shared/hooks";

export function PasswordChangeForm() {
  const { showToast } = useToast();

  const [isChanging, setIsChanging] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      showToast("Tüm alanları doldurun", "error");
      return;
    }

    if (newPassword.length < 6) {
      showToast("Yeni şifre en az 6 karakter olmalıdır", "error");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showToast("Yeni şifreler eşleşmiyor", "error");
      return;
    }

    setLoading(true);
    try {
      // Önce mevcut şifre ile yeniden kimlik doğrulama
      if (!auth.currentUser?.email) {
        throw new Error("Email bulunamadı");
      }

      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword
      );

      await reauthenticateWithCredential(auth.currentUser, credential);

      // Şimdi şifreyi değiştir
      await updatePassword(auth.currentUser, newPassword);

      showToast("Şifre başarıyla değiştirildi!", "success");
      setIsChanging(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error: unknown) {
      console.error("Password change error:", error);
      const firebaseError = error as { code?: string; message?: string };

      // Firebase Authentication hata kodları
      if (
        firebaseError.code === "auth/wrong-password" ||
        firebaseError.code === "auth/invalid-credential" ||
        firebaseError.code === "auth/invalid-login-credentials"
      ) {
        showToast("Mevcut şifre yanlış", "error");
      } else if (firebaseError.code === "auth/too-many-requests") {
        showToast(
          "Çok fazla deneme. Lütfen daha sonra tekrar deneyin",
          "error"
        );
      } else if (firebaseError.code === "auth/weak-password") {
        showToast("Şifre çok zayıf, daha güçlü bir şifre seçin", "error");
      } else if (firebaseError.code === "auth/requires-recent-login") {
        showToast("Bu işlem için tekrar giriş yapmanız gerekiyor", "error");
      } else {
        showToast(firebaseError.message || "Şifre değiştirilemedi", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsChanging(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
          <Key className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
          Şifre Değiştir
        </h2>
        {!isChanging && (
          <button
            onClick={() => setIsChanging(true)}
            className="text-purple-400 hover:text-purple-300 transition flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
          >
            <Lock className="h-3 w-3 sm:h-4 sm:w-4" />
            Değiştir
          </button>
        )}
      </div>

      {isChanging ? (
        <div className="space-y-3 sm:space-y-4">
          <Input
            label="Mevcut Şifre"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
            required
            fullWidth
          />

          <Input
            label="Yeni Şifre"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            helperText="En az 6 karakter"
            required
            minLength={6}
            fullWidth
          />

          <Input
            label="Yeni Şifre Tekrar"
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
            fullWidth
          />

          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleChange}
              disabled={loading}
              loading={loading}
              variant="primary"
              size="md"
              fullWidth
            >
              <Save className="h-4 w-4" />
              Kaydet
            </Button>
            <Button
              onClick={handleCancel}
              disabled={loading}
              variant="secondary"
              size="md"
              fullWidth
            >
              <X className="h-4 w-4" />
              İptal
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800/50 rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-gray-400">
            Güvenliğiniz için düzenli olarak şifrenizi değiştirmenizi öneririz
          </p>
        </div>
      )}
    </div>
  );
}
