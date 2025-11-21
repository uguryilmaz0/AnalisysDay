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
    firstName: string,
    lastName: string,
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

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Email doğrulama kontrolü (Admin ve super admin hariç)
    const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data() as User;
      // Admin değilse ve email doğrulanmamışsa hata ver
      if (userData.role !== "admin" && !userCredential.user.emailVerified) {
        throw new Error("EMAIL_NOT_VERIFIED");
      }
    }
  };

  // Kayıt ol
  const signUp = async (
    email: string,
    username: string,
    firstName: string,
    lastName: string,
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

    // Super admin kontrolü (ortam değişkeninden)
    const superAdminEmails =
      process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAILS?.split(",").map((e) =>
        e.trim().toLowerCase()
      ) || [];
    const isSuperAdmin = superAdminEmails.includes(email.toLowerCase());

    // Admin değilse email doğrulama linki gönder
    if (!isSuperAdmin) {
      await sendEmailVerification(userCredential.user);
    }

    // Firestore'a kullanıcı kaydı oluştur
    const newUser: User = {
      uid: userCredential.user.uid,
      email: email,
      username: username.toLowerCase(),
      firstName: firstName,
      lastName: lastName,
      role: isSuperAdmin ? "admin" : "user",
      superAdmin: isSuperAdmin,
      isPaid: false, // Admin rolü zaten premium erişim sağlar
      subscriptionEndDate: null,
      lastPaymentDate: null,
      emailNotifications,
      emailVerified: isSuperAdmin, // Admin kullanıcılar için otomatik true
      createdAt: Timestamp.now(),
    };

    await setDoc(doc(db, "users", userCredential.user.uid), newUser);

    // Kayıt sonrası otomatik giriş yapıldığı için çıkış yap
    await firebaseSignOut(auth);

    // Kullanıcı email doğrulama sayfasına yönlendirilecek (admin değilse)
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
