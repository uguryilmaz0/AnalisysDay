import { Users, Mail, MailWarning, Shield } from "lucide-react";
import { Badge } from "@/shared/components/ui";
import { useToast } from "@/shared/hooks";
import { userService } from "@/features/admin/services";
import { useAdminStore } from "@/features/admin/stores";

interface UserManagementTabProps {
  currentUserId?: string;
}

export function UserManagementTab({ currentUserId }: UserManagementTabProps) {
  const { showToast } = useToast();
  const users = useAdminStore((state) => state.users);
  const loadUsers = useAdminStore((state) => state.loadUsers);
  const removeUser = useAdminStore((state) => state.removeUser);

  const handleMakePremium = async (uid: string) => {
    if (
      !confirm(
        "Bu kullanıcıyı premium yapmak istediğinizden emin misiniz? (30 gün)"
      )
    )
      return;

    try {
      await userService.makePremium(uid, 30);
      showToast("Kullanıcı premium yapıldı! (30 gün)", "success");
      await loadUsers();
    } catch {
      showToast("Premium yapılamadı!", "error");
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
      await userService.cancelSubscription(uid);
      showToast("Abonelik başarıyla iptal edildi!", "success");
      await loadUsers();
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
      await removeUser(uid);
      showToast("Kullanıcı başarıyla silindi!", "success");
    } catch {
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
      showToast(
        "Email doğrulama durumu güncellendi! (Firebase Auth + Firestore)",
        "success"
      );
      await loadUsers();
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
          Tüm Kullanıcılar ({users.filter((u) => !u.superAdmin).length})
        </h2>
        <button
          onClick={loadUsers}
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
              <span className="text-orange-400">&quot;Doğrulanmadı&quot;</span>{" "}
              veya{" "}
              <span className="text-green-400">&quot;Doğrulandı&quot;</span>{" "}
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
            onClick={loadUsers}
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
                  Deneme
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
                        ) : (
                          <Badge variant="info">Ücretsiz</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {u.role === "admin" ? (
                          <span className="text-gray-500 text-xs">-</span>
                        ) : u.trialEndDate ? (
                          new Date() < u.trialEndDate.toDate() ? (
                            <Badge variant="warning">
                              Aktif (
                              {Math.ceil(
                                (u.trialEndDate.toDate().getTime() -
                                  Date.now()) /
                                  (1000 * 60 * 60 * 24)
                              )}
                              g)
                            </Badge>
                          ) : (
                            <Badge variant="info">Bitti</Badge>
                          )
                        ) : (
                          <span className="text-gray-500 text-xs">-</span>
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
                              onClick={() => handleMakePremium(u.uid)}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-semibold transition"
                              title="Premium yap (30 gün)"
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
    </div>
  );
}
