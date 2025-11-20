"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  getAllAnalyses,
  deleteAnalysis,
  createAnalysis,
  getAllUsers,
  updateUserPaidStatus,
  cancelUserSubscription,
  deleteUser as deleteUserFromDB,
  updateUserEmailVerified,
  updateUserRole,
} from "@/lib/db";
import { uploadMultipleImages } from "@/lib/cloudinary";
import { DailyAnalysis, User } from "@/types";
import {
  Shield,
  Upload,
  Loader2,
  CheckCircle2,
  Trash2,
  Users,
  TrendingUp,
  Image as ImageIcon,
  Download,
  Mail,
  MailWarning,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";

export default function AdminPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<
    "upload" | "analyses" | "users" | "admins"
  >("upload");

  // Upload State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Data State
  const [analyses, setAnalyses] = useState<DailyAnalysis[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [usersWithAuthData, setUsersWithAuthData] = useState<
    Array<User & { emailVerified: boolean }>
  >([]);

  useEffect(() => {
    if (authLoading) return;

    // Admin kontrolü
    if (!user || userData?.role !== "admin") {
      router.push("/");
      return;
    }

    // Email doğrulanmamışsa ve admin değilse (ek güvenlik)
    if (userData.role !== "admin" && !user.emailVerified) {
      router.push("/register/verify-email");
      return;
    }

    loadData();
  }, [user, userData, authLoading, router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [analysesData, usersData] = await Promise.all([
        getAllAnalyses(),
        getAllUsers(),
      ]);
      setAnalyses(analysesData);
      setUsers(usersData);

      // Firebase Auth'dan email verification durumlarını al
      const { getAuth } = await import("firebase/auth");
      const auth = getAuth();
      const usersWithAuth = await Promise.all(
        usersData.map(async (u) => {
          // Client-side'da sadece mevcut kullanıcının bilgilerini alabiliriz
          // Diğer kullanıcılar için Firebase Console kullanılmalı
          const isCurrentUser = auth.currentUser?.uid === u.uid;
          return {
            ...u,
            emailVerified: isCurrentUser
              ? auth.currentUser?.emailVerified || false
              : false,
          };
        })
      );
      setUsersWithAuthData(usersWithAuth);
    } catch {
      // Veri yüklenemedi - sayfa boş görünecek
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
  };

  const handleUploadAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();

    if (imageFiles.length === 0) {
      alert("En az bir görsel seçmelisiniz!");
      return;
    }

    setUploading(true);
    setUploadSuccess(false);

    try {
      // Görselleri Cloudinary'e yükle
      const imageUrls = await uploadMultipleImages(imageFiles);

      // Analizi oluştur
      await createAnalysis(title, imageUrls, description, user!.uid);

      setUploadSuccess(true);
      setTitle("");
      setDescription("");
      setImageFiles([]);

      // Listeyi güncelle
      await loadData();

      setTimeout(() => setUploadSuccess(false), 3000);
    } catch {
      alert("Analiz yüklenemedi!");
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadImage = (url: string, index: number) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `analysis-image-${index + 1}.jpg`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteAnalysis = async (id: string) => {
    if (!confirm("Bu analizi silmek istediğinizden emin misiniz?")) return;

    try {
      await deleteAnalysis(id);
      alert("Analiz silindi!");
      await loadData();
    } catch {
      alert("Analiz silinemedi!");
    }
  };

  const handleMakePremium = async (uid: string) => {
    if (
      !confirm(
        "Bu kullanıcıyı premium yapmak istediğinizden emin misiniz? (30 gün)"
      )
    )
      return;

    try {
      await updateUserPaidStatus(uid, true, 30);
      alert("Kullanıcı premium yapıldı!");
      await loadData();
    } catch {
      alert("Premium yapılamadı!");
    }
  };

  const handleCancelSubscription = async (uid: string) => {
    if (
      !confirm(
        "Bu kullanıcının aboneliğini iptal etmek istediğinizden emin misiniz?"
      )
    )
      return;

    try {
      await cancelUserSubscription(uid);
      alert("Abonelik iptal edildi!");
      await loadData();
    } catch {
      alert("Abonelik iptal edilemedi!");
    }
  };

  const handleDeleteUser = async (uid: string, email: string) => {
    if (
      !confirm(
        `${email} kullanıcısını kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!`
      )
    )
      return;

    try {
      await deleteUserFromDB(uid);
      alert("Kullanıcı silindi!");
      await loadData();
    } catch {
      alert(
        "Kullanıcı silinemedi! Not: Firebase Auth'dan manuel silmeniz gerekebilir."
      );
    }
  };

  const handleMakeAdmin = async (uid: string, username: string) => {
    if (!confirm(`@${username} kullanıcısını admin yapmak istiyor musunuz?`))
      return;

    try {
      await updateUserRole(uid, "admin", false);
      alert("Kullanıcı admin yapıldı!");
      await loadData();
    } catch {
      alert("Admin yapılamadı!");
    }
  };

  const handleRemoveAdmin = async (uid: string, username: string) => {
    if (!confirm(`@${username} admin yetkisini kaldırmak istiyor musunuz?`))
      return;

    try {
      await updateUserRole(uid, "user");
      alert("Admin yetkisi kaldırıldı!");
      await loadData();
    } catch {
      alert("Admin yetkisi kaldırılamadı!");
    }
  };

  const handleToggleSuperAdmin = async (
    uid: string,
    username: string,
    currentStatus: boolean
  ) => {
    const action = currentStatus ? "kaldırmak" : "vermek";
    if (
      !confirm(
        `@${username} kullanıcısına Super Admin yetkisi ${action} istiyor musunuz?`
      )
    )
      return;

    try {
      await updateUserRole(uid, "admin", !currentStatus);
      alert(`Super Admin yetkisi ${currentStatus ? "kaldırıldı" : "verildi"}!`);
      await loadData();
    } catch {
      alert("Super Admin yetkisi güncellenemedi!");
    }
  };

  const handleToggleEmailVerified = async (
    uid: string,
    currentStatus: boolean,
    email: string
  ) => {
    const action = currentStatus ? "doğrulanmamış" : "doğrulanmış";
    if (
      !confirm(
        `${email} kullanıcısının email durumunu ${action} olarak işaretlemek istiyor musunuz?`
      )
    )
      return;

    try {
      await updateUserEmailVerified(uid, !currentStatus);
      alert("Email doğrulama durumu güncellendi!");
      await loadData();
    } catch {
      alert("Email doğrulama durumu güncellenemedi!");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-gray-950 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Admin Header */}
        <div className="bg-linear-to-r from-purple-600 via-blue-600 to-purple-600 text-white rounded-2xl p-8 mb-8 shadow-2xl border border-purple-500/20">
          <div className="flex items-center gap-4">
            <Shield className="h-12 w-12" />
            <div>
              <h1 className="text-3xl font-bold">Admin Panel</h1>
              <p className="text-purple-200">AnalysisDay Yönetim Sistemi</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl p-6 hover:border-blue-500/50 transition">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-8 w-8 text-blue-500" />
              <span className="text-2xl font-bold text-white">
                {analyses.length}
              </span>
            </div>
            <p className="text-gray-400">Toplam Analiz</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl p-6 hover:border-green-500/50 transition">
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-8 w-8 text-green-500" />
              <span className="text-2xl font-bold text-white">
                {
                  users.filter(
                    (u) => (u.isPaid || u.role === "admin") && !u.superAdmin
                  ).length
                }
              </span>
            </div>
            <p className="text-gray-400">Premium Üyeler</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl p-6 hover:border-gray-500/50 transition">
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-8 w-8 text-gray-500" />
              <span className="text-2xl font-bold text-white">
                {users.filter((u) => !u.superAdmin).length}
              </span>
            </div>
            <p className="text-gray-400">Toplam Kullanıcı</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex border-b border-gray-800 overflow-x-auto">
            <button
              onClick={() => setActiveTab("upload")}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${
                activeTab === "upload"
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Upload className="h-5 w-5" />
              Analiz Yükle
            </button>
            <button
              onClick={() => setActiveTab("analyses")}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${
                activeTab === "analyses"
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <TrendingUp className="h-5 w-5" />
              Tüm Analizler
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${
                activeTab === "users"
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Users className="h-5 w-5" />
              Kullanıcılar
            </button>
            <button
              onClick={() => setActiveTab("admins")}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${
                activeTab === "admins"
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Shield className="h-5 w-5" />
              Admin Yönetimi
            </button>
          </div>

          <div className="p-8">
            {/* Upload Tab */}
            {activeTab === "upload" && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">
                  Yeni Analiz Yükle
                </h2>

                {uploadSuccess && (
                  <div className="bg-green-900/50 border border-green-500/50 rounded-lg p-4 mb-6 flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-400" />
                    <p className="text-green-100 font-semibold">
                      Analiz başarıyla yüklendi! ✅
                    </p>
                  </div>
                )}

                <form onSubmit={handleUploadAnalysis} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Başlık *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500"
                      placeholder="Örn: 19 Kasım 2025 BIST Analizi"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Açıklama (Opsiyonel)
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500"
                      rows={3}
                      placeholder="Kısa bir açıklama ekleyebilirsiniz..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Görsel(ler) * (Birden fazla seçilebilir)
                    </label>
                    <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-purple-500 transition bg-gray-800/50">
                      <ImageIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept="image/*"
                        multiple
                        className="hidden"
                        id="analysis-upload"
                        required
                      />
                      <label
                        htmlFor="analysis-upload"
                        className="cursor-pointer"
                      >
                        <span className="text-purple-400 hover:text-purple-300 font-semibold text-lg">
                          Görsel Seç
                        </span>
                        <p className="text-gray-400 mt-2">
                          PNG, JPG veya JPEG (Birden fazla seçilebilir)
                        </p>
                      </label>
                      {imageFiles.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {imageFiles.map((file, index) => (
                            <p key={index} className="text-sm text-green-400">
                              ✓ {file.name}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={uploading}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-4 rounded-lg transition shadow-lg flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Yükleniyor...
                      </>
                    ) : (
                      <>
                        <Upload className="h-5 w-5" />
                        Analizi Yükle
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Analyses Tab */}
            {activeTab === "analyses" && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">
                  Son 7 Analiz
                </h2>

                {analyses.length === 0 ? (
                  <div className="text-center py-12">
                    <TrendingUp className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Henüz analiz yüklenmemiş</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-800">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                            Başlık
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                            Tarih
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                            Görsel Sayısı
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                            Önizleme
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                            İşlemler
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {analyses.slice(0, 7).map((analysis) => (
                          <tr
                            key={analysis.id}
                            className="hover:bg-gray-800/50"
                          >
                            <td className="px-4 py-3">
                              <div>
                                <p className="text-white font-semibold">
                                  {analysis.title}
                                </p>
                                {analysis.description && (
                                  <p className="text-sm text-gray-400 line-clamp-1 mt-1">
                                    {analysis.description}
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-300">
                              {new Date(
                                analysis.date.toDate()
                              ).toLocaleDateString("tr-TR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-300">
                              {analysis.imageUrls.length} görsel
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1">
                                {analysis.imageUrls
                                  .slice(0, 3)
                                  .map((url, index) => (
                                    <Image
                                      key={index}
                                      src={url}
                                      alt={`Preview ${index + 1}`}
                                      width={60}
                                      height={45}
                                      className="rounded object-cover w-15 h-11"
                                    />
                                  ))}
                                {analysis.imageUrls.length > 3 && (
                                  <div className="w-15 h-11 bg-gray-700 rounded flex items-center justify-center text-xs text-gray-400">
                                    +{analysis.imageUrls.length - 3}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                {analysis.imageUrls.map((url, index) => (
                                  <button
                                    key={index}
                                    onClick={() =>
                                      handleDownloadImage(url, index)
                                    }
                                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded text-xs transition"
                                    title={`Görsel ${index + 1} İndir`}
                                  >
                                    <Download className="h-4 w-4" />
                                  </button>
                                ))}
                                <button
                                  onClick={() =>
                                    handleDeleteAnalysis(analysis.id)
                                  }
                                  className="bg-red-600 hover:bg-red-700 text-white p-2 rounded transition ml-2"
                                  title="Analizi Sil"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Admin Management Tab */}
            {activeTab === "admins" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    👑 Admin Yönetimi
                  </h2>
                </div>

                {/* Info Box */}
                <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-6 mb-6">
                  <div className="flex items-start gap-3">
                    <Shield className="h-6 w-6 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-blue-100 font-semibold mb-2">
                        Admin Yönetimi Hakkında
                      </p>
                      <ul className="text-sm text-blue-200 space-y-1">
                        <li>
                          • <strong>Admin:</strong> Analiz yükleyebilir,
                          kullanıcıları yönetebilir, otomatik premium erişim
                        </li>
                        <li>
                          • <strong>Super Admin:</strong> Gizli yönetici, admin
                          yetkisi verebilir/kaldırabilir
                        </li>
                        <li>• Super adminler kullanıcı listesinde görünmez</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Admin List */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  {/* Current Admins */}
                  <div className="bg-gray-800/50 border border-purple-500/30 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-purple-400" />
                      Mevcut Adminler (
                      {
                        users.filter((u) => u.role === "admin" && !u.superAdmin)
                          .length
                      }
                      )
                    </h3>
                    <div className="space-y-3">
                      {users
                        .filter((u) => u.role === "admin" && !u.superAdmin)
                        .map((admin) => (
                          <div
                            key={admin.uid}
                            className="bg-gray-900 rounded-lg p-4"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="text-white font-semibold flex items-center gap-2">
                                  @{admin.username}
                                  {admin.superAdmin && (
                                    <span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded text-xs">
                                      ⭐ Super
                                    </span>
                                  )}
                                  {admin.uid === user?.uid && (
                                    <span className="text-xs text-purple-400">
                                      (Siz)
                                    </span>
                                  )}
                                </p>
                                <p className="text-sm text-gray-400">
                                  {admin.email}
                                </p>
                              </div>
                            </div>

                            {/* Actions - Sadece super adminler görebilir */}
                            {userData?.superAdmin &&
                              admin.uid !== user?.uid && (
                                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-700">
                                  {!admin.superAdmin && (
                                    <button
                                      onClick={() =>
                                        handleToggleSuperAdmin(
                                          admin.uid,
                                          admin.username,
                                          false
                                        )
                                      }
                                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-xs font-semibold transition"
                                      title="Super Admin yap"
                                    >
                                      ⭐ Super Admin Yap
                                    </button>
                                  )}
                                  {admin.superAdmin && (
                                    <button
                                      onClick={() =>
                                        handleToggleSuperAdmin(
                                          admin.uid,
                                          admin.username,
                                          true
                                        )
                                      }
                                      className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs font-semibold transition"
                                      title="Super Admin kaldır"
                                    >
                                      Super Admin Kaldır
                                    </button>
                                  )}
                                  <button
                                    onClick={() =>
                                      handleRemoveAdmin(
                                        admin.uid,
                                        admin.username
                                      )
                                    }
                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-semibold transition"
                                    title="Admin yetkisi kaldır"
                                  >
                                    Admin Yetkisi Kaldır
                                  </button>
                                </div>
                              )}
                          </div>
                        ))}
                      {users.filter((u) => u.role === "admin").length === 0 && (
                        <p className="text-gray-400 text-sm text-center py-4">
                          Henüz admin kullanıcı yok
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Regular Users - Admin Yapılabilir */}
                  <div className="bg-gray-800/50 border border-blue-500/30 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-400" />
                      Normal Kullanıcılar (
                      {users.filter((u) => u.role === "user").length})
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {users
                        .filter((u) => u.role === "user")
                        .map((regularUser) => (
                          <div
                            key={regularUser.uid}
                            className="bg-gray-900 rounded-lg p-4"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-white font-semibold">
                                  @{regularUser.username}
                                </p>
                                <p className="text-sm text-gray-400">
                                  {regularUser.email}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Kayıt:{" "}
                                  {new Date(
                                    regularUser.createdAt.toDate()
                                  ).toLocaleDateString("tr-TR")}
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  handleMakeAdmin(
                                    regularUser.uid,
                                    regularUser.username
                                  )
                                }
                                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs font-semibold transition"
                                title="Admin yap"
                              >
                                Admin Yap
                              </button>
                            </div>
                          </div>
                        ))}
                      {users.filter((u) => u.role === "user").length === 0 && (
                        <p className="text-gray-400 text-sm text-center py-4">
                          Tüm kullanıcılar admin
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Super Admin Info */}
                {!userData?.superAdmin && (
                  <div className="bg-orange-900/20 border border-orange-500/50 rounded-lg p-4">
                    <p className="text-orange-200 text-sm flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Super Admin yetkisi verebilmek için bir Super Admin
                      tarafından yetkilendirilmelisiniz.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    Tüm Kullanıcılar (
                    {users.filter((u) => !u.superAdmin).length})
                  </h2>
                  <button
                    onClick={loadData}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Yenile
                  </button>
                </div>

                {/* Email Doğrulama Bilgisi */}
                <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="text-blue-100 font-semibold mb-1">
                        📧 Email Doğrulama Yönetimi
                      </p>
                      <p className="text-blue-200">
                        Email doğrulama durumunu değiştirmek için{" "}
                        <span className="text-orange-400">"Doğrulanmadı"</span>{" "}
                        veya{" "}
                        <span className="text-green-400">"Doğrulandı"</span>{" "}
                        butonuna tıklayın. Durum anında değişecektir.
                      </p>
                    </div>
                  </div>
                </div>

                {users.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">Henüz kullanıcı yok</p>
                    <button
                      onClick={loadData}
                      className="text-blue-400 hover:text-blue-300 underline"
                    >
                      Yenile
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-800">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                            Kullanıcı Adı
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                            Email
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                            Rol
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                            Premium
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                            Email Doğrulama
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                            Abonelik Bitiş
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                            Kayıt Tarihi
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
                            İşlemler
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {users
                          .filter((u) => !u.superAdmin)
                          .map((u) => {
                            const userWithAuth = usersWithAuthData.find(
                              (ua) => ua.uid === u.uid
                            );
                            return (
                              <tr key={u.uid} className="hover:bg-gray-800/50">
                                <td className="px-4 py-3">
                                  <div className="text-sm">
                                    <span className="text-blue-400 font-medium">
                                      @{u.username}
                                    </span>
                                    {u.uid === user?.uid && (
                                      <span className="ml-2 text-xs text-purple-400">
                                        (Siz)
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="text-sm text-gray-300">
                                    {u.email}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  {u.role === "admin" ? (
                                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-semibold">
                                      Admin
                                    </span>
                                  ) : (
                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                                      User
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  {u.isPaid ? (
                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                                      Premium
                                    </span>
                                  ) : (
                                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold">
                                      Ücretsiz
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  {u.role === "admin" ? (
                                    <span className="flex items-center gap-1 text-purple-400 text-xs">
                                      <Shield className="h-3 w-3" />
                                      Admin
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() =>
                                        handleToggleEmailVerified(
                                          u.uid,
                                          u.emailVerified,
                                          u.email
                                        )
                                      }
                                      className={`flex items-center gap-1 text-xs hover:opacity-80 transition ${
                                        u.emailVerified
                                          ? "text-green-400"
                                          : "text-orange-400"
                                      }`}
                                      title="Email doğrulama durumunu değiştir"
                                    >
                                      {u.emailVerified ? (
                                        <>
                                          <Mail className="h-3 w-3" />
                                          Doğrulandı
                                        </>
                                      ) : (
                                        <>
                                          <MailWarning className="h-3 w-3" />
                                          Doğrulanmadı
                                        </>
                                      )}
                                    </button>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-400">
                                  {u.subscriptionEndDate
                                    ? new Date(
                                        u.subscriptionEndDate.toDate()
                                      ).toLocaleDateString("tr-TR")
                                    : "-"}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-400">
                                  {new Date(
                                    u.createdAt.toDate()
                                  ).toLocaleDateString("tr-TR")}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex gap-2 flex-wrap">
                                    {!u.isPaid && (
                                      <button
                                        onClick={() => handleMakePremium(u.uid)}
                                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-semibold transition"
                                        title="Premium yap (30 gün)"
                                      >
                                        Premium Yap
                                      </button>
                                    )}
                                    {u.isPaid && (
                                      <button
                                        onClick={() =>
                                          handleCancelSubscription(u.uid)
                                        }
                                        className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-xs font-semibold transition"
                                        title="Abonelik iptal"
                                      >
                                        İptal Et
                                      </button>
                                    )}
                                    {u.uid !== user?.uid && (
                                      <button
                                        onClick={() =>
                                          handleDeleteUser(u.uid, u.email)
                                        }
                                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-semibold transition"
                                        title="Kullanıcıyı sil"
                                      >
                                        Sil
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
