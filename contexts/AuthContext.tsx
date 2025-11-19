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
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
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
  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
    // Email doğrulama kontrolü yok - admin panelinden manuel onaylanacak
  };

  // Kayıt ol
  const signUp = async (
    email: string,
    password: string,
    emailNotifications: boolean
  ) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Email doğrulama linki gönderilmiyor - kullanıcı profil sayfasından isteyebilir

    // Firestore'a kullanıcı kaydı oluştur
    const newUser: User = {
      uid: userCredential.user.uid,
      email: email,
      role: "user",
      isPaid: false,
      subscriptionEndDate: null,
      lastPaymentDate: null,
      emailNotifications,
      emailVerified: false,
      createdAt: Timestamp.now(),
    };

    await setDoc(doc(db, "users", userCredential.user.uid), newUser);
    setUserData(newUser);

    // Kullanıcı giriş yapmış kalıyor - direkt sisteme erişebilir
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
