import { Shield, Users } from "lucide-react";
import { useToast } from "@/shared/hooks";
import { userService } from "@/features/admin/services";
import { useAdminStore } from "@/features/admin/stores";

interface AdminManagementTabProps {
  currentUserId?: string;
  isSuperAdmin?: boolean;
}

export function AdminManagementTab({
  currentUserId,
  isSuperAdmin,
}: AdminManagementTabProps) {
  const { showToast } = useToast();
  const users = useAdminStore((state) => state.users);
  const loadUsers = useAdminStore((state) => state.loadUsers);

  const handleMakeAdmin = async (uid: string, username: string) => {
    if (!confirm(`@${username} kullanıcısını admin yapmak istiyor musunuz?`))
      return;

    try {
      await userService.makeAdmin(uid, false);
      showToast(`@${username} admin yapıldı!`, "success");
      await loadUsers();
    } catch {
      showToast("Admin yapılamadı!", "error");
    }
  };

  const handleRemoveAdmin = async (uid: string, username: string) => {
    if (!confirm(`@${username} admin yetkisini kaldırmak istiyor musunuz?`))
      return;

    try {
      await userService.removeAdmin(uid);
      showToast(`@${username} admin yetkisi kaldırıldı!`, "success");
      await loadUsers();
    } catch {
      showToast("Admin yetkisi kaldırılamadı!", "error");
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
      await userService.toggleSuperAdmin(uid, currentStatus);
      showToast(
        `@${username} Super Admin yetkisi ${
          currentStatus ? "kaldırıldı" : "verildi"
        }!`,
        "success"
      );
      await loadUsers();
    } catch {
      showToast("Super Admin yetkisi güncellenemedi!", "error");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-white">
          👑 Admin Yönetimi
        </h2>
      </div>

      {/* Info Box */}
      <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4 md:p-6 mb-6">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 md:h-6 md:w-6 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-100 font-semibold mb-2 text-sm md:text-base">
              Admin Yönetimi Hakkında
            </p>
            <ul className="text-xs md:text-sm text-blue-200 space-y-1">
              <li>
                • <strong>Admin:</strong> Analiz yükleyebilir, kullanıcıları
                yönetebilir, otomatik premium erişim
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Admin List */}
      <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-8">
        {/* Current Admins */}
        <div className="bg-gray-800/50 border border-purple-500/30 rounded-xl p-4 md:p-6">
          <h3 className="text-base md:text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Shield className="h-4 w-4 md:h-5 md:w-5 text-purple-400" />
            Mevcut Adminler (
            {users.filter((u) => u.role === "admin" && !u.superAdmin).length})
          </h3>
          <div className="space-y-3">
            {users
              .filter((u) => u.role === "admin" && !u.superAdmin)
              .map((admin) => (
                <div
                  key={admin.uid}
                  className="bg-gray-900 rounded-lg p-3 md:p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-white font-semibold flex flex-wrap items-center gap-2 text-sm md:text-base">
                        @{admin.username}
                        {admin.superAdmin && (
                          <span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded text-xs">
                            ⭐ Super
                          </span>
                        )}
                        {admin.uid === currentUserId && (
                          <span className="text-xs text-purple-400">(Siz)</span>
                        )}
                      </p>
                      <p className="text-xs md:text-sm text-gray-400 break-all">
                        {admin.email}
                      </p>
                    </div>
                  </div>

                  {/* Actions - Sadece super adminler görebilir */}
                  {isSuperAdmin && admin.uid !== currentUserId && (
                    <div className="flex flex-col sm:flex-row gap-2 mt-3 pt-3 border-t border-gray-700">
                      {!admin.superAdmin && (
                        <button
                          onClick={() =>
                            handleToggleSuperAdmin(
                              admin.uid,
                              admin.username,
                              false
                            )
                          }
                          className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded text-xs font-semibold transition"
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
                          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-xs font-semibold transition"
                          title="Super Admin kaldır"
                        >
                          Super Admin Kaldır
                        </button>
                      )}
                      <button
                        onClick={() =>
                          handleRemoveAdmin(admin.uid, admin.username)
                        }
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-xs font-semibold transition"
                        title="Admin yetkisi kaldır"
                      >
                        Admin Yetkisi Kaldır
                      </button>
                    </div>
                  )}
                </div>
              ))}
            {users.filter((u) => u.role === "admin").length === 0 && (
              <p className="text-gray-400 text-xs md:text-sm text-center py-4">
                Henüz admin kullanıcı yok
              </p>
            )}
          </div>
        </div>

        {/* Regular Users - Admin Yapılabilir */}
        <div className="bg-gray-800/50 border border-blue-500/30 rounded-xl p-4 md:p-6">
          <h3 className="text-base md:text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 md:h-5 md:w-5 text-blue-400" />
            Normal Kullanıcılar ({users.filter((u) => u.role === "user").length}
            )
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {users
              .filter((u) => u.role === "user")
              .map((regularUser) => (
                <div
                  key={regularUser.uid}
                  className="bg-gray-900 rounded-lg p-3 md:p-4"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-white font-semibold text-sm md:text-base">
                        @{regularUser.username}
                      </p>
                      <p className="text-xs md:text-sm text-gray-400 break-all">
                        {regularUser.email}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Kayıt:{" "}
                        {regularUser.createdAt
                          ? new Date(
                              regularUser.createdAt.toDate()
                            ).toLocaleDateString("tr-TR")
                          : "-"}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        handleMakeAdmin(regularUser.uid, regularUser.username)
                      }
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-xs font-semibold transition w-full sm:w-auto"
                      title="Admin yap"
                    >
                      Admin Yap
                    </button>
                  </div>
                </div>
              ))}
            {users.filter((u) => u.role === "user").length === 0 && (
              <p className="text-gray-400 text-xs md:text-sm text-center py-4">
                Tüm kullanıcılar admin
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
