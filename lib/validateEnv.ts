/**
 * Environment Variables Validation
 * Uygulama başlarken tüm gerekli env'leri kontrol eder
 */

interface RequiredEnvVars {
  // Firebase
  NEXT_PUBLIC_FIREBASE_API_KEY: string;
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: string;
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: string;
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: string;
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string;
  NEXT_PUBLIC_FIREBASE_APP_ID: string;

  // Cloudinary
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: string;
  NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: string;
  NEXT_PUBLIC_CLOUDINARY_RECEIPT_PRESET: string;

  // App Config
  NEXT_PUBLIC_WHATSAPP_NUMBER: string;
  NEXT_PUBLIC_IBAN: string;
  NEXT_PUBLIC_BANK_NAME: string;
  NEXT_PUBLIC_ACCOUNT_HOLDER: string;
  NEXT_PUBLIC_SUBSCRIPTION_PRICE: string;
  NEXT_PUBLIC_SUPER_ADMIN_EMAILS: string;

  // Legal (Opsiyonel - şirket kurulana kadar)
  NEXT_PUBLIC_CONTACT_EMAIL?: string;
  NEXT_PUBLIC_KVKK_EMAIL?: string;
  NEXT_PUBLIC_COMPANY_ADDRESS?: string;
  NEXT_PUBLIC_KEP_ADDRESS?: string;
  NEXT_PUBLIC_MERSIS_NO?: string;
  NEXT_PUBLIC_KVKK_OFFICER?: string;

  // Server-side (Opsiyonel)
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
}

export function validateEnv(): void {
  const missingVars: string[] = [];
  const optionalMissingVars: string[] = [];

  // Zorunlu değişkenler
  const requiredVars: (keyof RequiredEnvVars)[] = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
    'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
    'NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET',
    'NEXT_PUBLIC_CLOUDINARY_RECEIPT_PRESET',
    'NEXT_PUBLIC_WHATSAPP_NUMBER',
    'NEXT_PUBLIC_IBAN',
    'NEXT_PUBLIC_BANK_NAME',
    'NEXT_PUBLIC_ACCOUNT_HOLDER',
    'NEXT_PUBLIC_SUBSCRIPTION_PRICE',
    'NEXT_PUBLIC_SUPER_ADMIN_EMAILS',
  ];

  // Opsiyonel değişkenler (uyarı verir ama hata vermez)
  const optionalVars: (keyof RequiredEnvVars)[] = [
    'NEXT_PUBLIC_CONTACT_EMAIL',
    'NEXT_PUBLIC_KVKK_EMAIL',
    'NEXT_PUBLIC_COMPANY_ADDRESS',
    'NEXT_PUBLIC_KEP_ADDRESS',
    'NEXT_PUBLIC_MERSIS_NO',
    'NEXT_PUBLIC_KVKK_OFFICER',
    'RESEND_API_KEY',
    'RESEND_FROM_EMAIL',
  ];

  // Zorunlu değişkenleri kontrol et
  requiredVars.forEach((varName) => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  // Opsiyonel değişkenleri kontrol et
  optionalVars.forEach((varName) => {
    if (!process.env[varName]) {
      optionalMissingVars.push(varName);
    }
  });

  // Zorunlu değişkenler eksikse hata fırlat (sadece production'da)
  if (missingVars.length > 0) {
    console.error('❌ CRITICAL: Missing required environment variables:');
    missingVars.forEach((varName) => console.error(`   - ${varName}`));
    console.error('\n💡 Please check your .env.local file and add missing variables.');
    console.error('📝 Example .env.local structure in README.md');
    
    // Production'da uygulama başlamasın
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Environment validation failed. Application cannot start.');
    }
    
    // Development'ta sadece uyarı ver, devam et
    console.warn('\n⚠️  Development mode: Application will continue with missing variables.');
    console.warn('⚠️  Some features may not work correctly!');
    return;
  }

  // Opsiyonel değişkenler eksikse sadece uyarı ver
  if (optionalMissingVars.length > 0) {
    console.warn('⚠️  Optional environment variables are missing:');
    optionalMissingVars.forEach((varName) => console.warn(`   - ${varName}`));
    console.warn('💡 These are optional but recommended for full functionality.');
  }

  // Başarılı
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Environment variables validated successfully');
    console.log(`📦 Firebase Project: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`);
    console.log(`☁️  Cloudinary Cloud: ${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}`);
  }
}

/**
 * Specific environment variable getter with fallback
 */
export function getEnvVar(key: keyof RequiredEnvVars, fallback?: string): string {
  const value = process.env[key];
  if (!value && !fallback) {
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  return value || fallback || '';
}

/**
 * Check if we're in production
 */
export const isProduction = process.env.NODE_ENV === 'production';

/**
 * Check if we're in development
 */
export const isDevelopment = process.env.NODE_ENV === 'development';
