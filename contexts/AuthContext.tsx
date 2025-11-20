"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { User } from "@/types";

interface AuthContextType {
  user: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  signIn: (emailOrUsername: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    username: string,
    password: string,
    emailNotifications: boolean
  ) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Kullanıcı verilerini Firestore'dan çek
  const fetchUserData = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data() as User);
      }
    } catch {
      // Kullanıcı verisi alınamadı - sessizce devam et
    }
  };

  // Auth state değişikliğini dinle
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await fetchUserData(user.uid);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Giriş yap
  const signIn = async (emailOrUsername: string, password: string) => {
    const { getUserByUsername } = await import("@/lib/db");

    let email = emailOrUsername;

    // Eğer @ işareti yoksa, username olarak kabul et
    if (!emailOrUsername.includes("@")) {
      const user = await getUserByUsername(emailOrUsername);
      if (!user) {
        throw new Error("Kullanıcı bulunamadı");
      }
      email = user.email;
    }

    await signInWithEmailAndPassword(auth, email, password);
    // Email doğrulama kontrolü yok - admin panelinden manuel onaylanacak
  };

  // Kayıt ol
  const signUp = async (
    email: string,
    username: string,
    password: string,
    emailNotifications: boolean
  ) => {
    const { isUsernameAvailable } = await import("@/lib/db");
    const { sendEmailVerification } = await import("firebase/auth");

    // Username kontrolü
    const available = await isUsernameAvailable(username);
    if (!available) {
      throw new Error("Bu kullanıcı adı zaten kullanılıyor");
    }

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Email doğrulama linki gönder
    await sendEmailVerification(userCredential.user);

    // Super admin kontrolü (ortam değişkeninden)
    const superAdminEmails =
      process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAILS?.split(",").map((e) =>
        e.trim().toLowerCase()
      ) || [];
    const isSuperAdmin = superAdminEmails.includes(email.toLowerCase());

    // Firestore'a kullanıcı kaydı oluştur
    const newUser: User = {
      uid: userCredential.user.uid,
      email: email,
      username: username.toLowerCase(),
      role: isSuperAdmin ? "admin" : "user",
      superAdmin: isSuperAdmin,
      isPaid: isSuperAdmin ? true : false, // Super adminler otomatik premium
      subscriptionEndDate: isSuperAdmin ? null : null,
      lastPaymentDate: isSuperAdmin ? Timestamp.now() : null,
      emailNotifications,
      emailVerified: false,
      createdAt: Timestamp.now(),
    };

    await setDoc(doc(db, "users", userCredential.user.uid), newUser);
    setUserData(newUser);

    // Kullanıcı email doğrulama sayfasına yönlendirilecek
  };

  // Çıkış yap
  const signOut = async () => {
    await firebaseSignOut(auth);
    setUserData(null);
  };

  // Şifre sıfırlama
  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  // Kullanıcı verisini yenile (Ödeme sonrası kullanılacak)
  const refreshUserData = async () => {
    if (user) {
      await fetchUserData(user.uid);
    }
  };

  const value: AuthContextType = {
    user,
    userData,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
