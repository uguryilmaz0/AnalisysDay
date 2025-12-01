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
import { logger } from "@/lib/logger";

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
    emailNotifications: boolean,
    referralCode?: string
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

        // Kullanıcı giriş yaptıysa analiz verilerini arka planda yükle
        if (typeof window !== "undefined") {
          // Dynamic import to avoid SSR issues
          import("@/lib/matchService").then(
            ({ getLeagues, getAllTeams, getLeagueMatchCounts }) => {
              Promise.all([getLeagues(), getAllTeams(), getLeagueMatchCounts()])
                .then(() => {
                  console.log(
                    "✅ Analiz verileri otomatik yüklendi (localStorage cache)"
                  );
                })
                .catch((error) => {
                  console.error("❌ Analiz verileri yükleme hatası:", error);
                });
            }
          );
        }
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
        // Email doğrulama durumunu Firestore'a senkronize et (önce)
        if (user.emailVerified) {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists() && !userDoc.data().emailVerified) {
            await setDoc(userDocRef, { emailVerified: true }, { merge: true });
          }
        }

        // Sonra user data'yı çek
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
    let loginSuccess = false;
    let userId: string | null = null;
    let failReason: string | null = null;

    try {
      // Eğer @ işareti yoksa, username olarak kabul et
      if (!emailOrUsername.includes("@")) {
        const user = await getUserByUsername(emailOrUsername);
        if (!user) {
          failReason = "User not found";
          throw new Error("Kullanıcı bulunamadı");
        }
        email = user.email;
      }

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      userId = userCredential.user.uid;

      // Email doğrulama kontrolü (Admin ve super admin hariç)
      const userDocRef = doc(db, "users", userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data() as User;

        // Firebase Auth'da email doğrulanmışsa Firestore'u güncelle
        if (userCredential.user.emailVerified && !userData.emailVerified) {
          await setDoc(userDocRef, { emailVerified: true }, { merge: true });
        }

        // Admin değilse VE hem Firebase Auth HEM Firestore'da email doğrulanmamışsa hata ver
        // DÜZELTME: Firestore'da true ise (admin manuel güncellemiş) login izin ver
        const isEmailVerified =
          userCredential.user.emailVerified || userData.emailVerified;

        if (userData.role !== "admin" && !isEmailVerified) {
          failReason = "Email not verified";
          logger.warn("Login attempt with unverified email", {
            userId: userCredential.user.uid,
            email: userCredential.user.email || email,
            action: "login_failed",
            authEmailVerified: userCredential.user.emailVerified,
            firestoreEmailVerified: userData.emailVerified,
          });
          throw new Error("EMAIL_NOT_VERIFIED");
        }

        // Başarılı girişi logla
        logger.info("User logged in", {
          userId: userCredential.user.uid,
          email: userCredential.user.email || email,
          role: userData.role,
          action: "login_success",
        });

        loginSuccess = true;
      }

      // Login activity'yi IP bilgisiyle kaydet
      await fetch("/api/logs/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          email,
          success: true,
          failReason: null,
        }),
      }).catch((err) => {
        // Login logging hatası uygulamayı kırmamalı
        console.error("Failed to log login activity:", err);
      });
    } catch (error) {
      // Hatalı girişi de kaydet
      await fetch("/api/logs/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          email,
          success: false,
          failReason:
            failReason ||
            (error instanceof Error ? error.message : "Unknown error"),
        }),
      }).catch((err) => {
        console.error("Failed to log failed login activity:", err);
      });

      // Hatayı yeniden fırlat
      throw error;
    }
  };

  // Kayıt ol
  const signUp = async (
    email: string,
    username: string,
    firstName: string,
    lastName: string,
    password: string,
    emailNotifications: boolean,
    referralCode?: string
  ) => {
    const { isUsernameAvailable, getUserByReferralCode, linkReferredUser } =
      await import("@/lib/db");
    const { sendEmailVerification } = await import("firebase/auth");

    // Username kontrolü
    const available = await isUsernameAvailable(username);
    if (!available) {
      throw new Error("Bu kullanıcı adı zaten kullanılıyor");
    }

    // Referral kodu kontrolü (varsa)
    let referrerUserId: string | undefined;
    if (referralCode) {
      const referrer = await getUserByReferralCode(referralCode);
      if (referrer) {
        referrerUserId = referrer.uid;
      }
      // Referral kodu geçersiz olsa bile kayıt devam etsin
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
      // referredBy linkReferredUser fonksiyonu tarafından set edilecek
    };

    await setDoc(doc(db, "users", userCredential.user.uid), newUser);

    // Referral bağlantısını kur (davet eden varsa)
    if (referrerUserId) {
      try {
        console.log("🔗 Attempting to link referral:", {
          newUserId: userCredential.user.uid,
          referrerId: referrerUserId,
        });
        await linkReferredUser(userCredential.user.uid, referrerUserId);
        console.log("✅ Referral link created successfully");
        logger.info("Referral link created", {
          newUserId: userCredential.user.uid,
          referrerId: referrerUserId,
        });
      } catch (error) {
        console.error("❌ Referral linking failed:", error);
        logger.error("Referral bağlantısı kurulamadı:", {
          error: error instanceof Error ? error.message : String(error),
          errorStack: error instanceof Error ? error.stack : undefined,
          newUserId: userCredential.user.uid,
          referrerId: referrerUserId,
        });
        // Referral hatası kayıt işlemini durdurmaz ama kullanıcıya bilgi ver
        console.warn(
          "⚠️ Kayıt başarılı ama referral bağlantısı kurulamadı. Admin manuel ekleyebilir."
        );
      }
    }

    // Kayıt başarısını logla
    logger.info("User registered", {
      userId: userCredential.user.uid,
      email: email,
      username: username,
      role: isSuperAdmin ? "admin" : "user",
      referredBy: referrerUserId || null,
      action: "register_success",
    });

    // Kayıt sonrası otomatik giriş yapıldığı için çıkış yap
    await firebaseSignOut(auth);

    // Kullanıcı email doğrulama sayfasına yönlendirilecek (admin değilse)
  };

  // Çıkış yap
  const signOut = async () => {
    const currentUser = user;

    // Cache'i temizle
    if (typeof window !== "undefined") {
      import("@/lib/matchService").then(({ clearCache }) => {
        clearCache();
        console.log("🗑️ Cache temizlendi (logout)");
      });
    }

    await firebaseSignOut(auth);
    setUserData(null);

    // Çıkışı logla
    if (currentUser) {
      logger.info("User logged out", {
        userId: currentUser.uid,
        email: currentUser.email || undefined,
        action: "logout",
      });
    }

    // Ana sayfaya yönlendir
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  // Şifre sıfırlama
  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  // Kullanıcı verisini yenile (Ödeme sonrası veya email doğrulama sonrası kullanılacak)
  const refreshUserData = async () => {
    if (user) {
      // Firebase Auth'dan güncel bilgiyi al
      await user.reload();

      // Email doğrulama durumunu Firestore'a senkronize et
      if (user.emailVerified) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && !userDoc.data().emailVerified) {
          await setDoc(userDocRef, { emailVerified: true }, { merge: true });
        }
      }

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
