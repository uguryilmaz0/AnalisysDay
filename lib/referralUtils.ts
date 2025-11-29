import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Benzersiz referral kodu üretir
 * Format: 8 karakter, büyük harf ve rakamlardan oluşur (örn: "ABG4X9K2")
 */
export function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Karıştırılabilecek karakterler hariç (O,0,I,1)
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Referral kodunun benzersiz olup olmadığını kontrol eder
 * @param code - Kontrol edilecek referral kodu
 * @returns true ise kod kullanılabilir, false ise başka kullanıcıda var
 */
export async function isReferralCodeUnique(code: string): Promise<boolean> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('referralCode', '==', code));
    const snapshot = await getDocs(q);
    return snapshot.empty;
  } catch (error) {
    console.error('Referral code uniqueness check failed:', error);
    return false;
  }
}

/**
 * Benzersiz bir referral kodu üretir ve veritabanında kontrolü yapar
 * Maksimum 10 deneme yapar, eğer bulamazsa hata fırlatır
 */
export async function generateUniqueReferralCode(): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const code = generateReferralCode();
    const isUnique = await isReferralCodeUnique(code);
    
    if (isUnique) {
      return code;
    }
    
    attempts++;
  }

  throw new Error('Benzersiz referral kodu oluşturulamadı. Lütfen tekrar deneyin.');
}

/**
 * Referral kodu validasyonu
 * @param code - Kontrol edilecek kod
 * @returns true ise format geçerli
 */
export function validateReferralCodeFormat(code: string): boolean {
  // 8 karakter, sadece büyük harf ve rakam
  const regex = /^[A-Z0-9]{8}$/;
  return regex.test(code);
}

/**
 * Referral linki oluşturur
 * @param referralCode - Kullanıcının referral kodu
 * @returns Tam referral URL'i
 */
export function generateReferralLink(referralCode: string): string {
  const baseUrl = 'https://analizgunu.com';
  
  return `${baseUrl}/register?ref=${referralCode}`;
}
