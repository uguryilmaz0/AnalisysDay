import { initializeApp, getApps } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, onIdTokenChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Firebase'i sadece bir kez initialize et
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Auth persistence'ı LOCAL olarak ayarla (tarayıcı kapansa bile oturum açık kalsın)
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error('Auth persistence error:', error);
  });

  // Token auto-refresh ve idle timeout yönetimi
  let lastActivityTime = Date.now();
  const IDLE_TIMEOUT = 2 * 60 * 60 * 1000; // 2 saat idle timeout
  const TOKEN_REFRESH_INTERVAL = 50 * 60 * 1000; // 50 dakika (token 1 saat önce yenile)

  // Kullanıcı aktivitesini takip et
  const updateActivity = () => {
    lastActivityTime = Date.now();
  };

  ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'].forEach(event => {
    document.addEventListener(event, updateActivity, true);
  });

  // Token yenileme ve idle timeout kontrolü
  onIdTokenChanged(auth, async (user) => {
    if (user) {
      // Token'i otomatik yenile (1 saatten önce)
      const tokenRefreshTimer = setInterval(async () => {
        const now = Date.now();
        const idleTime = now - lastActivityTime;

        // Idle timeout kontrolü (2 saat)
        if (idleTime > IDLE_TIMEOUT) {
          console.log('User idle for 2 hours, logging out...');
          clearInterval(tokenRefreshTimer);
          await auth.signOut();
          return;
        }

        // Token'ı yenile
        try {
          await user.getIdToken(true); // Force refresh
          console.log('Token refreshed successfully');
        } catch (error) {
          console.error('Token refresh failed:', error);
          clearInterval(tokenRefreshTimer);
          await auth.signOut();
        }
      }, TOKEN_REFRESH_INTERVAL);

      // Component unmount'ta timer'ı temizle
      return () => clearInterval(tokenRefreshTimer);
    }
  });
}

export { auth, db, storage };
export default app;
