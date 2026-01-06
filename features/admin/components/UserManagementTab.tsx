import {
  Users,
  Mail,
  MailWarning,
  Shield,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/shared/components/ui";
import { useToast, useDebounce } from "@/shared/hooks";
import { userService } from "@/features/admin/services";
import { useAdminStore } from "@/features/admin/stores";
import { useState, useMemo, useEffect, useCallback } from "react";
import { getUsersPaginated, getAllUsers } from "@/lib/db";
import { analysisCache } from "@/lib/analysisCache";
import { User } from "@/types";
import { PremiumDurationModal } from "./PremiumDurationModal";

interface UserManagementTabProps {
  currentUserId?: string;
}

type UserFilter =
  | "all"
  | "premium"
  | "expired"
  | "free"
  | "admin"
  | "verified"
  | "unverified";

export function UserManagementTab({ currentUserId }: UserManagementTabProps) {
  const { showToast } = useToast();

  // ⚡ DİNAMİK PAGİNATİON: Zustand yerine local state
  const [users, setUsers] = useState<User[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cursorStack, setCursorStack] = useState<(string | undefined)[]>([
    undefined,
  ]);
  const removeUser = useAdminStore((state) => state.removeUser);
  const stats = useAdminStore((state) => state.stats);
  const [totalUsers, setTotalUsers] = useState(0);

  // Pagination & Filter state
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<UserFilter>("all");
  const usersPerPage = 50;

  // 🔍 DEBOUNCED SEARCH: Arama için tüm kullanıcılar
  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const [allUsersForSearch, setAllUsersForSearch] = useState<User[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Premium Duration Modal state
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    uid: string;
    email: string;
  } | null>(null);

  // ⚡ DİNAMİK PAGİNATİON: Backend'den sayfa sayfa çek
  const loadUsersPaginated = useCallback(async () => {
    setLoading(true);
    try {
      const currentCursor = cursorStack[currentPage - 1];

      const data = await getUsersPaginated(
        currentPage,
        usersPerPage,
        currentCursor
      );

      setUsers(data.users);
      setHasMore(data.hasMore);
      setTotalUsers(data.totalCount || stats.totalUsers);

      // Yeni cursor'u stack'e ekle
      if (data.lastDocId && currentPage === cursorStack.length) {
        setCursorStack((prev) => [...prev, data.lastDocId]);
      }
    } catch (error) {
      console.error("❌ Users yüklenemedi:", error);
      showToast("Kullanıcılar yüklenemedi", "error");
    } finally {
      setLoading(false);
    }
  }, [currentPage, cursorStack, showToast, stats.totalUsers]);

  // İlk yükleme ve sayfa değişimi
  useEffect(() => {
    loadUsersPaginated();
  }, [loadUsersPaginated]);

  // 🔍 DEBOUNCED SEARCH: Arama yapıldığında tüm kullanıcıları yükle
  useEffect(() => {
    const loadAllUsersForSearch = async () => {
      if (debouncedSearchQuery.trim().length >= 2) {
        setSearchLoading(true);
        try {
          const allUsers = await getAllUsers();
          setAllUsersForSearch(allUsers);
        } catch (error) {
          console.error("❌ Tüm kullanıcılar yüklenemedi:", error);
        } finally {
          setSearchLoading(false);
        }
      } else {
        setAllUsersForSearch([]);
      }
    };

    loadAllUsersForSearch();
  }, [debouncedSearchQuery]);

  // Filtered users - Arama varsa tüm kullanıcılarda ara, yoksa mevcut sayfada
  const filteredUsers = useMemo(() => {
    // Eğer arama yapılıyorsa ve 2+ karakter girilmişse, tüm kullanıcılar içinde ara
    const sourceUsers =
      debouncedSearchQuery.trim().length >= 2 && allUsersForSearch.length > 0
        ? allUsersForSearch
        : users;

    let result = sourceUsers.filter((u) => !u.superAdmin);

    // Search filter
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      result = result.filter(
        (u) =>
          u.username?.toLowerCase().includes(query) ||
          u.email?.toLowerCase().includes(query) ||
          u.firstName?.toLowerCase().includes(query) ||
          u.lastName?.toLowerCase().includes(query)
      );
    }

    // Status filter
    switch (filter) {
      case "premium":
        result = result.filter((u) => u.isPaid);
        break;
      case "expired":
        // Daha önce abone olmuş ama şu an değil (süresi dolmuş)
        result = result.filter(
          (u) => !u.isPaid && (u.lastPaymentDate || u.subscriptionEndDate)
        );
        break;
      case "free":
        // Hiç abone olmamış (lastPaymentDate ve subscriptionEndDate yok)
        result = result.filter(
          (u) =>
            !u.isPaid &&
            !u.lastPaymentDate &&
            !u.subscriptionEndDate &&
            u.role !== "admin"
        );
        break;
      case "admin":
        result = result.filter((u) => u.role === "admin");
        break;
      case "verified":
        result = result.filter((u) => u.emailVerified);
        break;
      case "unverified":
        result = result.filter((u) => !u.emailVerified && u.role !== "admin");
        break;
    }

    return result;
  }, [users, allUsersForSearch, debouncedSearchQuery, filter]);

  // ⚡ SERVER-SIDE PAGİNATİON: Backend'den gelen veriyi göster
  // NOT: Search/filter aktifse client-side pagination, yoksa server-side
  const hasSearchOrFilter = searchQuery.trim() || filter !== "all";

  const paginatedUsers = hasSearchOrFilter
    ? filteredUsers.slice(0, usersPerPage) // Search/filter varsa ilk 10'u göster
    : filteredUsers; // Search/filter yoksa backend'den gelen 10 veriyi göster

  // Reset filters/search when changing pages
  const handlePageChange = (newPage: number) => {
    if (hasSearchOrFilter) {
      // Search/filter aktifse sayfayı değiştiremez
      showToast("Arama/filtre aktifken sayfa değiştirilemez", "warning");
      return;
    }
    setCurrentPage(newPage);
  };

  // Reset pagination when filters change
  useEffect(() => {
    if (!hasSearchOrFilter) {
      setCurrentPage(1);
      setCursorStack([undefined]);
    }
  }, [hasSearchOrFilter]);

  const handleMakePremium = async (days: number) => {
    if (!selectedUser) return;

    // selectedUser'ı kaydet çünkü modal kapandığında null olacak
    const targetUser = { ...selectedUser };

    // Modal'ı kapat
    setPremiumModalOpen(false);

    try {
      // API çağrısı
      await userService.makePremium(targetUser.uid, days);
      showToast(`Kullanıcı premium yapıldı! (${days} gün)`, "success");

      // Yeni abonelik bitiş tarihini hesapla
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);
      const { Timestamp } = await import("firebase/firestore");
      const newSubscriptionEndDate = Timestamp.fromDate(endDate);

      // 🔄 OPTIMISTIC UPDATE: Her iki state'i de güncelle (arama aktifken de çalışsın)
      const updateUserData = (u: User) =>
        u.uid === targetUser.uid
          ? {
              ...u,
              isPaid: true,
              subscriptionEndDate: newSubscriptionEndDate,
              lastPaymentDate: Timestamp.now(),
            }
          : u;

      setUsers((prevUsers) => prevUsers.map(updateUserData));
      setAllUsersForSearch((prevUsers) => prevUsers.map(updateUserData));

      // Cache'i temizle (sonraki yüklemelerde güncel veri gelsin)
      analysisCache.invalidateUserCache();

      setSelectedUser(null);
    } catch {
      showToast("Premium yapılamadı!", "error");
    }
  };

  const openPremiumModal = (uid: string, email: string) => {
    setSelectedUser({ uid, email });
    setPremiumModalOpen(true);
  };

  const handleCancelSubscription = async (uid: string) => {
    if (
      !confirm(
        "Bu kullanıcının aboneliğini iptal etmek istediğinizden emin misiniz?"
      )
    )
      return;

    try {
      await userService.cancelSubscription(uid);
      showToast("Abonelik başarıyla iptal edildi!", "success");

      // 🔄 OPTIMISTIC UPDATE: Her iki state'i de güncelle (arama aktifken de çalışsın)
      const updateUserData = (u: User) =>
        u.uid === uid
          ? {
              ...u,
              isPaid: false,
              subscriptionEndDate: null,
              lastPaymentDate: null,
            }
          : u;

      setUsers((prevUsers) => prevUsers.map(updateUserData));
      setAllUsersForSearch((prevUsers) => prevUsers.map(updateUserData));

      // Cache'i temizle
      analysisCache.invalidateUserCache();
    } catch {
      showToast("Abonelik iptal edilemedi!", "error");
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
      // 🔄 OPTIMISTIC UPDATE: Her iki state'den de kaldır
      setUsers((prevUsers) => prevUsers.filter((u) => u.uid !== uid));
      setAllUsersForSearch((prevUsers) =>
        prevUsers.filter((u) => u.uid !== uid)
      );

      await removeUser(uid);
      showToast("Kullanıcı başarıyla silindi!", "success");

      // Cache'i temizle
      analysisCache.invalidateUserCache();
    } catch {
      // Hata durumunda yeniden yükle
      await loadUsersPaginated();
      showToast(
        "Kullanıcı silinemedi! Firebase Auth'dan manuel silmeniz gerekebilir.",
        "error"
      );
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
      await userService.toggleEmailVerified(uid, !currentStatus);

      // 🔄 OPTIMISTIC UPDATE: Local state'i güncelle
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.uid === uid ? { ...u, emailVerified: !currentStatus } : u
        )
      );

      showToast(
        "Email doğrulama durumu güncellendi! (Firebase Auth + Firestore)",
        "success"
      );

      // Cache'i temizle
      analysisCache.invalidateUserCache();
    } catch {
      showToast("Email doğrulama durumu güncellenemedi!", "error");
    }
  };

  const handleResendVerification = async (uid: string, email: string) => {
    if (!confirm(`${email} adresine doğrulama linki gönderilsin mi?`)) return;

    try {
      const result = await userService.resendVerificationEmail(uid);
      // Link'i panelde göster (TODO: Email service entegrasyonu sonrası otomatik gönderilecek)
      alert(
        `Email doğrulama linki oluşturuldu:\n\n${result.verificationLink}\n\nBu linki kullanıcıya manuel olarak gönderebilirsiniz.`
      );
      showToast("Email doğrulama linki oluşturuldu!", "success");
    } catch {
      showToast("Email doğrulama linki oluşturulamadı!", "error");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">
          Kullanıcılar ({filteredUsers.length} / {totalUsers})
        </h2>
        <button
          onClick={loadUsersPaginated}
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

      {/* Search & Filters */}
      <div className="bg-gray-900 rounded-lg p-4 mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Kullanıcı adı, email, isim ile ara... (min 2 karakter)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-12 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
            </div>
          )}
          {debouncedSearchQuery.trim().length >= 2 &&
            !searchLoading &&
            allUsersForSearch.length > 0 && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-400">
                ✓ Tüm kullanıcılarda aranıyor
              </span>
            )}
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Tümü ({users.filter((u) => !u.superAdmin).length})
          </button>
          <button
            onClick={() => setFilter("premium")}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === "premium"
                ? "bg-green-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Premium ({users.filter((u) => !u.superAdmin && u.isPaid).length})
          </button>
          <button
            onClick={() => setFilter("expired")}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === "expired"
                ? "bg-yellow-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Süresi Doldu (
            {
              users.filter(
                (u) =>
                  !u.superAdmin &&
                  !u.isPaid &&
                  (u.lastPaymentDate || u.subscriptionEndDate)
              ).length
            }
            )
          </button>
          <button
            onClick={() => setFilter("free")}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === "free"
                ? "bg-gray-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Ücretsiz (
            {
              users.filter(
                (u) =>
                  !u.superAdmin &&
                  !u.isPaid &&
                  !u.lastPaymentDate &&
                  !u.subscriptionEndDate &&
                  u.role !== "admin"
              ).length
            }
            )
          </button>
          <button
            onClick={() => setFilter("admin")}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === "admin"
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Admin (
            {users.filter((u) => !u.superAdmin && u.role === "admin").length})
          </button>
          <button
            onClick={() => setFilter("verified")}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === "verified"
                ? "bg-green-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Doğrulanmış (
            {users.filter((u) => !u.superAdmin && u.emailVerified).length})
          </button>
          <button
            onClick={() => setFilter("unverified")}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === "unverified"
                ? "bg-orange-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Doğrulanmamış (
            {
              users.filter(
                (u) => !u.superAdmin && !u.emailVerified && u.role !== "admin"
              ).length
            }
            )
          </button>
        </div>
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
              <span className="text-orange-400">&quot;Doğrulanmadı&quot;</span>{" "}
              veya{" "}
              <span className="text-green-400">&quot;Doğrulandı&quot;</span>{" "}
              butonuna tıklayın. Durum anında değişecektir.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 bg-gray-900 rounded-lg">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Kullanıcılar yükleniyor...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 bg-gray-900 rounded-lg">
          <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">
            {searchQuery || filter !== "all"
              ? "Filtreye uygun kullanıcı bulunamadı"
              : "Henüz kullanıcı yok"}
          </p>
          {(searchQuery || filter !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setFilter("all");
              }}
              className="text-blue-400 hover:text-blue-300 underline text-sm"
            >
              Filtreleri Temizle
            </button>
          )}
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
                  Referral
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
              {paginatedUsers.map((u) => {
                return (
                  <tr key={u.uid} className="hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <span className="text-blue-400 font-medium">
                          @{u.username}
                        </span>
                        {u.uid === currentUserId && (
                          <span className="ml-2 text-xs text-purple-400">
                            (Siz)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-300">{u.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      {u.role === "admin" ? (
                        <Badge variant="admin">Admin</Badge>
                      ) : (
                        <Badge variant="user">User</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {u.isPaid ? (
                        <Badge variant="success">Premium</Badge>
                      ) : u.lastPaymentDate || u.subscriptionEndDate ? (
                        // Daha önce abone olmuş ama şu an değil
                        <div className="flex flex-col gap-1">
                          <Badge variant="warning">Süresi Doldu</Badge>
                          {u.subscriptionEndDate && (
                            <span className="text-xs text-gray-500">
                              {new Date(
                                u.subscriptionEndDate.toDate()
                              ).toLocaleDateString("tr-TR")}
                            </span>
                          )}
                        </div>
                      ) : (
                        // Hiç abone olmamış
                        <Badge variant="info">Ücretsiz</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {u.role === "admin" ? (
                        <span className="flex items-center gap-1 text-purple-400 text-xs">
                          <Shield className="h-3 w-3" />
                          Admin
                        </span>
                      ) : (
                        <div className="flex flex-col gap-1">
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
                          {!u.emailVerified && (
                            <button
                              onClick={() =>
                                handleResendVerification(u.uid, u.email)
                              }
                              className="text-xs text-blue-400 hover:text-blue-300 transition"
                              title="Email doğrulama linkini tekrar gönder"
                            >
                              📧 Linki Yenile
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {u.subscriptionEndDate
                        ? new Date(
                            u.subscriptionEndDate.toDate()
                          ).toLocaleDateString("tr-TR")
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <div className="flex flex-col gap-1">
                        {/* Referral kodu */}
                        {u.referralCode && (
                          <span className="text-purple-400 font-mono">
                            🔗 {u.referralCode}
                          </span>
                        )}
                        {/* Davet eden kullanıcı */}
                        {u.referredBy && (
                          <span className="text-orange-400">
                            ↪️ Davet eden:{" "}
                            {users.find((user) => user.uid === u.referredBy)
                              ?.username || u.referredBy.substring(0, 8)}
                          </span>
                        )}
                        {/* Davet ettikleri */}
                        {u.referredUsers && u.referredUsers.length > 0 && (
                          <span className="text-blue-400">
                            👥 {u.referredUsers.length} davet
                          </span>
                        )}
                        {/* Premium davetliler */}
                        {u.premiumReferrals &&
                          u.premiumReferrals.length > 0 && (
                            <span className="text-green-400">
                              ⭐ {u.premiumReferrals.length} premium
                            </span>
                          )}
                        {/* Referral bilgisi yok */}
                        {!u.referralCode &&
                          !u.referredBy &&
                          !u.referredUsers?.length && (
                            <span className="text-gray-600">-</span>
                          )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {u.createdAt
                        ? new Date(u.createdAt.toDate()).toLocaleDateString(
                            "tr-TR"
                          )
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 flex-wrap">
                        {!u.isPaid && (
                          <button
                            onClick={() => openPremiumModal(u.uid, u.email)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-semibold transition"
                            title="Premium yap"
                          >
                            Premium Yap
                          </button>
                        )}
                        {u.isPaid && (
                          <button
                            onClick={() => handleCancelSubscription(u.uid)}
                            className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-xs font-semibold transition"
                            title="Abonelik iptal"
                          >
                            İptal Et
                          </button>
                        )}
                        {u.uid !== currentUserId && (
                          <button
                            onClick={() => handleDeleteUser(u.uid, u.email)}
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

      {/* Pagination */}
      {!hasSearchOrFilter && (currentPage > 1 || hasMore) && (
        <div className="mt-6 flex items-center justify-between bg-gray-900 rounded-lg p-4">
          <div className="text-sm text-gray-400">
            Sayfa {currentPage}
            <span className="ml-2">
              (Gösterilen: {paginatedUsers.length} kullanıcı)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg font-semibold transition ${
                currentPage === 1
                  ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                  : "bg-gray-800 text-white hover:bg-gray-700"
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
              Önceki
            </button>

            <span className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg">
              Sayfa {currentPage}
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!hasMore}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg font-semibold transition ${
                !hasMore
                  ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                  : "bg-gray-800 text-white hover:bg-gray-700"
              }`}
            >
              Sonraki
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Search/Filter aktifse bilgi mesajı */}
      {hasSearchOrFilter && (
        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-blue-400">
            🔍{" "}
            {debouncedSearchQuery.trim().length >= 2
              ? `Tüm ${allUsersForSearch.length} kullanıcı içinde aranıyor. ${filteredUsers.length} sonuç bulundu.`
              : "Arama sonuçları gösteriliyor. Sayfa değiştirmek için aramayı/filtreyi temizleyin."}
          </p>
        </div>
      )}

      {/* Premium Duration Modal */}
      <PremiumDurationModal
        isOpen={premiumModalOpen}
        onClose={() => {
          setPremiumModalOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleMakePremium}
        userEmail={selectedUser?.email || ""}
      />
    </div>
  );
}
