"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { deleteUser } from "firebase/auth";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import {
  User as UserIcon,
  Mail,
  Calendar,
  CheckCircle2,
  XCircle,
  Trash2,
  AlertTriangle,
  Bell,
  BellOff,
  Shield,
  Loader2,
} from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { user, userData, refreshUserData } = useAuth();
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [updatingNotifications, setUpdatingNotifications] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    // Email doğrulanmamışsa ve admin değilse verify sayfasına yönlendir
    if (userData && userData.role !== "admin" && !user.emailVerified) {
      router.push("/register/verify-email");
      return;
    }
  }, [user, userData, router]);

  // Show nothing while checking auth or if no user data
  if (!user || !userData) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  // Admin her zaman premium sayılır
  const isActive =
    userData.role === "admin" ||
    (userData.isPaid && userData.subscriptionEndDate);
  const daysRemaining =
    isActive && userData.subscriptionEndDate
      ? Math.ceil(
          (userData.subscriptionEndDate.toDate().getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "SİL") {
      alert("Lütfen 'SİL' yazarak onaylayın");
      return;
    }

    if (
      !confirm("Bu işlem geri alınamaz! Hesabınız kalıcı olarak silinecek.")
    ) {
      return;
    }

    setDeleting(true);

    try {
      const userId = user.uid;

      // 1. Önce Firestore'dan kullanıcı verisini sil
      await deleteDoc(doc(db, "users", userId));

      // 2. Sonra Firebase Authentication'dan kullanıcıyı sil
      if (auth.currentUser) {
        await deleteUser(auth.currentUser);
      }

      // 3. Ana sayfaya yönlendir (hata olmadı, başarılı)
      router.push("/");
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string };

      // Check if re-authentication is required
      if (firebaseError.code === "auth/requires-recent-login") {
        setDeleting(false);
        alert(
          "Güvenlik nedeniyle hesabınızı silmek için yeniden giriş yapmanız gerekiyor. " +
            "Lütfen çıkış yapıp tekrar giriş yapın ve hesap silme işlemini tekrarlayın."
        );
      } else {
        // Hesap silindi ama Firestore hatası olabilir (permission error after auth deleted)
        // Bu durumda da başarılı sayılır
        router.push("/");
      }
    }
  };

  const handleToggleNotifications = async () => {
    setUpdatingNotifications(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        emailNotifications: !userData.emailNotifications,
      });
      await refreshUserData();
    } catch {
      alert("Bildirim ayarları güncellenemedi");
    } finally {
      setUpdatingNotifications(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-gray-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8 shadow-xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
              <UserIcon className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Profil Ayarları</h1>
              <p className="text-blue-100">Hesap bilgilerinizi yönetin</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Sol Kolon - Hesap Bilgileri */}
          <div className="space-y-6">
            {/* Genel Bilgiler */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-blue-400" />
                Hesap Bilgileri
              </h2>

              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-gray-800 rounded-lg p-4">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Kullanıcı Adı</p>
                    <p className="text-white font-medium">
                      @{userData.username}
                    </p>
                  </div>
                </div>

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
            </div>

            {/* Bildirim Ayarları */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Bell className="h-5 w-5 text-purple-400" />
                Bildirim Ayarları
              </h2>

              <button
                onClick={handleToggleNotifications}
                disabled={updatingNotifications}
                className="w-full flex items-center justify-between bg-gray-800 hover:bg-gray-750 rounded-lg p-4 transition"
              >
                <div className="flex items-center gap-3">
                  {userData.emailNotifications ? (
                    <Bell className="h-5 w-5 text-green-400" />
                  ) : (
                    <BellOff className="h-5 w-5 text-gray-400" />
                  )}
                  <div className="text-left">
                    <p className="text-white font-medium">Email Bildirimleri</p>
                    <p className="text-xs text-gray-400">
                      Yeni analiz yayınlandığında email al
                    </p>
                  </div>
                </div>
                {updatingNotifications ? (
                  <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                ) : (
                  <div
                    className={`w-12 h-6 rounded-full transition-colors ${
                      userData.emailNotifications
                        ? "bg-green-600"
                        : "bg-gray-600"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform transform ${
                        userData.emailNotifications
                          ? "translate-x-6"
                          : "translate-x-1"
                      } mt-0.5`}
                    ></div>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Sağ Kolon - Üyelik ve Hesap Yönetimi */}
          <div className="space-y-6">
            {/* Üyelik Durumu */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                Üyelik Durumu
              </h2>

              {userData.role === "admin" || isActive ? (
                <div className="space-y-4">
                  <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                      <span className="text-green-400 font-bold">
                        {userData.role === "admin"
                          ? "Admin - Premium Erişim"
                          : "Aktif Premium Üyelik"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300">
                      Günlük analizlere sınırsız erişiminiz var
                    </p>
                  </div>

                  {userData.role !== "admin" && (
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">
                            Başlangıç Tarihi
                          </p>
                          <p className="text-white font-medium">
                            {userData.lastPaymentDate
                              ?.toDate()
                              .toLocaleDateString("tr-TR")}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">
                            Bitiş Tarihi
                          </p>
                          <p className="text-white font-medium">
                            {userData.subscriptionEndDate
                              ?.toDate()
                              .toLocaleDateString("tr-TR")}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {userData.role === "admin" ? (
                    <div className="bg-orange-900/30 border border-orange-500/50 rounded-lg p-4">
                      <p className="text-sm text-orange-100">
                        <span className="font-bold text-orange-400">
                          ⚡ Sınırsız
                        </span>{" "}
                        admin erişiminiz bulunmaktadır
                      </p>
                    </div>
                  ) : (
                    <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
                      <p className="text-sm text-blue-100">
                        <span className="font-bold text-blue-400">
                          {daysRemaining} gün
                        </span>{" "}
                        premium erişiminiz kaldı
                      </p>
                    </div>
                  )}

                  <Link
                    href="/analysis"
                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-lg font-semibold transition"
                  >
                    Analizlere Git
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-400 font-bold">
                        Premium Üyelik Yok
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">
                      Günlük analizlere erişmek için premium üye olun
                    </p>
                  </div>

                  <Link
                    href="/pricing"
                    className="block w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-center py-3 rounded-lg font-semibold transition shadow-lg"
                  >
                    💎 Premium Ol
                  </Link>
                </div>
              )}
            </div>

            {/* Tehlikeli Alan - Hesap Silme */}
            <div className="bg-red-900/20 border border-red-500/50 rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Tehlikeli Alan
              </h2>

              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                >
                  <Trash2 className="h-5 w-5" />
                  Hesabımı Sil
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="bg-red-950/50 border border-red-500/50 rounded-lg p-4">
                    <p className="text-sm text-red-200 mb-2">
                      ⚠️ <strong>Uyarı:</strong> Bu işlem geri alınamaz!
                    </p>
                    <ul className="text-xs text-red-300 space-y-1 list-disc list-inside">
                      <li>Tüm verileriniz kalıcı olarak silinecek</li>
                      <li>Premium üyeliğiniz iptal edilecek</li>
                      <li>Bu hesaba tekrar erişemeyeceksiniz</li>
                    </ul>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      Onaylamak için{" "}
                      <strong className="text-red-400">SİL</strong> yazın:
                    </label>
                    <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) =>
                        setDeleteConfirmText(e.target.value.toUpperCase())
                      }
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="SİL"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteConfirmText("");
                      }}
                      disabled={deleting}
                      className="bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition"
                    >
                      İptal
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmText !== "SİL" || deleting}
                      className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                    >
                      {deleting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Siliniyor...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-5 w-5" />
                          Hesabı Sil
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
