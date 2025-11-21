"use client";

import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User as UserIcon, Save, X, Edit } from "lucide-react";
import { Button, Input } from "@/shared/components/ui";
import { useToast } from "@/shared/hooks";
import { useAuth } from "@/contexts/AuthContext";
import type { User } from "@/types";

interface ProfileEditFormProps {
  userData: User;
  userId: string;
}

export function ProfileEditForm({ userData, userId }: ProfileEditFormProps) {
  const { showToast } = useToast();
  const { refreshUserData } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [updating, setUpdating] = useState(false);

  const handleEdit = () => {
    setEditFirstName(userData.firstName);
    setEditLastName(userData.lastName);
    setEditUsername(userData.username);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditFirstName("");
    setEditLastName("");
    setEditUsername("");
  };

  const handleSave = async () => {
    if (!editFirstName.trim() || !editLastName.trim()) {
      showToast("Ad ve soyad boş bırakılamaz", "error");
      return;
    }

    if (editUsername.trim().length < 3) {
      showToast("Kullanıcı adı en az 3 karakter olmalıdır", "error");
      return;
    }

    // Username değiştiyse kontrol et
    if (editUsername.toLowerCase() !== userData.username) {
      const { isUsernameAvailable } = await import("@/lib/db");
      const available = await isUsernameAvailable(editUsername.toLowerCase());
      if (!available) {
        showToast("Bu kullanıcı adı zaten kullanılıyor", "error");
        return;
      }
    }

    setUpdating(true);
    try {
      await updateDoc(doc(db, "users", userId), {
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
        username: editUsername.toLowerCase().trim(),
      });
      await refreshUserData();
      showToast("Profil bilgileri güncellendi!", "success");
      setIsEditing(false);
    } catch {
      showToast("Profil güncellenemedi", "error");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <UserIcon className="h-5 w-5 text-blue-400" />
          Hesap Bilgileri
        </h2>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="text-blue-400 hover:text-blue-300 transition flex items-center gap-2 text-sm"
          >
            <Edit className="h-4 w-4" />
            Düzenle
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Ad"
              value={editFirstName}
              onChange={(e) => setEditFirstName(e.target.value)}
              placeholder="Adınız"
              required
              fullWidth
            />
            <Input
              label="Soyad"
              value={editLastName}
              onChange={(e) => setEditLastName(e.target.value)}
              placeholder="Soyadınız"
              required
              fullWidth
            />
          </div>

          <Input
            label="Kullanıcı Adı"
            value={editUsername}
            onChange={(e) => setEditUsername(e.target.value.toLowerCase())}
            placeholder="kullaniciadi"
            helperText="En az 3 karakter, sadece harf, rakam ve alt çizgi"
            required
            minLength={3}
            pattern="[a-zA-Z0-9_]+"
            fullWidth
          />

          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleSave}
              disabled={updating}
              loading={updating}
              variant="success"
              size="md"
              fullWidth
            >
              <Save className="h-4 w-4" />
              Kaydet
            </Button>
            <Button
              onClick={handleCancel}
              disabled={updating}
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
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-gray-800 rounded-lg p-4">
            <UserIcon className="h-5 w-5 text-gray-400" />
            <div className="flex-1">
              <p className="text-xs text-gray-400">Ad Soyad</p>
              <p className="text-white font-medium">
                {userData.firstName} {userData.lastName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-gray-800 rounded-lg p-4">
            <UserIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Kullanıcı Adı</p>
              <p className="text-white font-medium">@{userData.username}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
