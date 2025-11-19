"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  getAllAnalyses,
  getPendingPaymentRequests,
  approvePaymentRequest,
  rejectPaymentRequest,
  deleteAnalysis,
  createAnalysis,
  getAllUsers,
} from "@/lib/db";
import { uploadMultipleImages } from "@/lib/cloudinary";
import { DailyAnalysis, PaymentRequest, User } from "@/types";
import {
  Shield,
  Upload,
  Loader2,
  CheckCircle2,
  XCircle,
  Trash2,
  Calendar,
  Users,
  CreditCard,
  TrendingUp,
  Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";

export default function AdminPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<
    "upload" | "payments" | "analyses" | "users"
  >("upload");

  // Upload State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Data State
  const [analyses, setAnalyses] = useState<DailyAnalysis[]>([]);
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    // Admin kontrolü
    if (!user || userData?.role !== "admin") {
      router.push("/");
      return;
    }

    loadData();
  }, [user, userData, authLoading, router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [analysesData, paymentsData, usersData] = await Promise.all([
        getAllAnalyses(),
        getPendingPaymentRequests(),
        getAllUsers(),
      ]);
      setAnalyses(analysesData);
      setPayments(paymentsData);
      setUsers(usersData);
    } catch (error) {
      console.error("Veri yüklenemedi:", error);
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
    } catch (error) {
      console.error("Analiz yüklenemedi:", error);
      alert("Analiz yüklenemedi!");
    } finally {
      setUploading(false);
    }
  };

  const handleApprovePayment = async (payment: PaymentRequest) => {
    if (!confirm("Bu ödemeyi onaylamak istediğinizden emin misiniz?")) return;

    try {
      await approvePaymentRequest(payment.id, user!.uid, payment.userId);
      alert("Ödeme onaylandı ve kullanıcı premium oldu!");
      await loadData();
    } catch (error) {
      console.error("Ödeme onaylanamadı:", error);
      alert("Ödeme onaylanamadı!");
    }
  };

  const handleRejectPayment = async (paymentId: string) => {
    const reason = prompt("Red nedeni (Opsiyonel):");

    try {
      await rejectPaymentRequest(paymentId, user!.uid, reason || undefined);
      alert("Ödeme reddedildi.");
      await loadData();
    } catch (error) {
      console.error("Ödeme reddedilemedi:", error);
      alert("Ödeme reddedilemedi!");
    }
  };

  const handleDeleteAnalysis = async (id: string) => {
    if (!confirm("Bu analizi silmek istediğinizden emin misiniz?")) return;

    try {
      await deleteAnalysis(id);
      alert("Analiz silindi!");
      await loadData();
    } catch (error) {
      console.error("Analiz silinemedi:", error);
      alert("Analiz silinemedi!");
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
    <div className="min-h-screen bg-[linear-gradient(to_bottom_right,var(--tw-gradient-stops))] from-purple-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Admin Header */}
        <div className="bg-[linear-gradient(to_right,var(--tw-gradient-stops))] from-purple-600 to-blue-600 text-white rounded-2xl p-8 mb-8 shadow-xl">
          <div className="flex items-center gap-4">
            <Shield className="h-12 w-12" />
            <div>
              <h1 className="text-3xl font-bold">Admin Panel</h1>
              <p className="text-purple-100">AnalysisDay Yönetim Sistemi</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">
                {analyses.length}
              </span>
            </div>
            <p className="text-gray-600">Toplam Analiz</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="h-8 w-8 text-yellow-600" />
              <span className="text-2xl font-bold text-gray-900">
                {payments.length}
              </span>
            </div>
            <p className="text-gray-600">Bekleyen Ödeme</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">
                {users.filter((u) => u.isPaid).length}
              </span>
            </div>
            <p className="text-gray-600">Premium Üyeler</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-8 w-8 text-gray-600" />
              <span className="text-2xl font-bold text-gray-900">
                {users.length}
              </span>
            </div>
            <p className="text-gray-600">Toplam Kullanıcı</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex border-b overflow-x-auto">
            <button
              onClick={() => setActiveTab("upload")}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${
                activeTab === "upload"
                  ? "bg-purple-600 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Upload className="h-5 w-5" />
              Analiz Yükle
            </button>
            <button
              onClick={() => setActiveTab("payments")}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition relative ${
                activeTab === "payments"
                  ? "bg-purple-600 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <CreditCard className="h-5 w-5" />
              Ödeme Onayları
              {payments.length > 0 && (
                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {payments.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("analyses")}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${
                activeTab === "analyses"
                  ? "bg-purple-600 text-white"
                  : "text-gray-600 hover:bg-gray-50"
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
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Users className="h-5 w-5" />
              Kullanıcılar
            </button>
          </div>

          <div className="p-8">
            {/* Upload Tab */}
            {activeTab === "upload" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Yeni Analiz Yükle
                </h2>

                {uploadSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                    <p className="text-green-800 font-semibold">
                      Analiz başarıyla yüklendi! ✅
                    </p>
                  </div>
                )}

                <form onSubmit={handleUploadAnalysis} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Başlık *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Örn: 19 Kasım 2025 BIST Analizi"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Açıklama (Opsiyonel)
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows={3}
                      placeholder="Kısa bir açıklama ekleyebilirsiniz..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Görsel(ler) * (Birden fazla seçilebilir)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-500 transition">
                      <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
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
                        <span className="text-purple-600 hover:text-purple-700 font-semibold text-lg">
                          Görsel Seç
                        </span>
                        <p className="text-gray-500 mt-2">
                          PNG, JPG veya JPEG (Birden fazla seçilebilir)
                        </p>
                      </label>
                      {imageFiles.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {imageFiles.map((file, index) => (
                            <p key={index} className="text-sm text-green-600">
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

            {/* Payments Tab */}
            {activeTab === "payments" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Bekleyen Ödeme Onayları ({payments.length})
                </h2>

                {payments.length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Bekleyen ödeme talebi yok</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="bg-gray-50 rounded-lg p-6 border border-gray-200"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="font-semibold text-gray-900 mb-1">
                              {payment.userEmail}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(
                                payment.requestedAt.toDate()
                              ).toLocaleString("tr-TR")}
                            </p>
                          </div>
                          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                            {payment.amount} TL
                          </span>
                        </div>

                        {payment.receiptUrl && (
                          <div className="mb-4">
                            <Image
                              src={payment.receiptUrl}
                              alt="Dekont"
                              width={400}
                              height={300}
                              className="rounded-lg border"
                            />
                          </div>
                        )}

                        <div className="flex gap-3">
                          <button
                            onClick={() => handleApprovePayment(payment)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 className="h-5 w-5" />
                            Onayla
                          </button>
                          <button
                            onClick={() => handleRejectPayment(payment.id)}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                          >
                            <XCircle className="h-5 w-5" />
                            Reddet
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Analyses Tab */}
            {activeTab === "analyses" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Tüm Analizler ({analyses.length})
                </h2>

                {analyses.length === 0 ? (
                  <div className="text-center py-12">
                    <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Henüz analiz yüklenmemiş</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {analyses.map((analysis) => (
                      <div
                        key={analysis.id}
                        className="bg-gray-50 rounded-lg p-6 border border-gray-200"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-lg text-gray-900 mb-1">
                              {analysis.title}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="h-4 w-4" />
                              {new Date(
                                analysis.date.toDate()
                              ).toLocaleDateString("tr-TR")}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteAnalysis(analysis.id)}
                            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>

                        {analysis.description && (
                          <p className="text-gray-600 mb-3">
                            {analysis.description}
                          </p>
                        )}

                        <p className="text-sm text-gray-500 mb-3">
                          {analysis.imageUrls.length} görsel
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {analysis.imageUrls.slice(0, 4).map((url, index) => (
                            <Image
                              key={index}
                              src={url}
                              alt={`Preview ${index + 1}`}
                              width={200}
                              height={150}
                              className="rounded-lg object-cover w-full h-32"
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Tüm Kullanıcılar ({users.length})
                </h2>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Email
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Durum
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Abonelik Bitiş
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Kayıt Tarihi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {users.map((user) => (
                        <tr key={user.uid} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {user.email}
                          </td>
                          <td className="px-4 py-3">
                            {user.isPaid ? (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                                Premium
                              </span>
                            ) : (
                              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold">
                                Ücretsiz
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {user.subscriptionEndDate
                              ? new Date(
                                  user.subscriptionEndDate.toDate()
                                ).toLocaleDateString("tr-TR")
                              : "-"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(
                              user.createdAt.toDate()
                            ).toLocaleDateString("tr-TR")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
