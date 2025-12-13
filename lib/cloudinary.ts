/**
 * Cloudinary Upload Helper
 * Client-side image upload için unsigned upload preset kullanır
 */

interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  [key: string]: unknown;
}

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const RECEIPT_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_RECEIPT_PRESET;

/**
 * Analiz görseli yükle (Admin paneli için)
 * @param file - Yüklenecek dosya
 * @returns Cloudinary URL
 */
export async function uploadAnalysisImage(file: File): Promise<string> {
  if (!CLOUDINARY_CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Cloudinary yapılandırması eksik. .env.local dosyasını kontrol edin.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Görsel yüklenemedi');
    }

    const data = await response.json() as CloudinaryUploadResponse;
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload hatası:', error);
    throw error;
  }
}

/**
 * Dekont görseli yükle (Kullanıcı ödeme talebi için)
 * @param file - Yüklenecek dekont dosyası
 * @param userId - Kullanıcı ID'si (şu an kullanılmıyor, preset'te folder tanımlı)
 * @returns Cloudinary URL
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function uploadReceiptImage(file: File, userId: string): Promise<string> {
  if (!CLOUDINARY_CLOUD_NAME || !RECEIPT_PRESET) {
    throw new Error('Cloudinary yapılandırması eksik. .env.local dosyasını kontrol edin.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', RECEIPT_PRESET);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Dekont yüklenemedi');
    }

    const data = await response.json() as CloudinaryUploadResponse;
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload hatası:', error);
    throw error;
  }
}

/**
 * Çoklu görsel yükle (Admin panel için)
 * @param files - Yüklenecek dosyalar
 * @returns Cloudinary URL'leri
 */
export async function uploadMultipleImages(files: File[]): Promise<string[]> {
  const uploadPromises = files.map((file) => uploadAnalysisImage(file));
  return Promise.all(uploadPromises);
}

/**
 * Cloudinary URL'den public_id çıkar
 * @param url - Cloudinary URL
 * @returns public_id veya null
 */
export function extractPublicIdFromUrl(url: string): string | null {
  try {
    // Format: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/{transformations}/{public_id}.{format}
    // Örnek: https://res.cloudinary.com/dfasgevjl/image/upload/v1234567890/analyses/abc123.jpg
    const regex = /\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch (error) {
    console.error('Public ID çıkarılamadı:', error);
    return null;
  }
}

/**
 * Cloudinary'den görsel sil (Server-side only)
 * @param imageUrl - Cloudinary URL
 * @returns Başarılı ise true
 */
export async function deleteCloudinaryImage(imageUrl: string): Promise<boolean> {
  // Server-side API keys gerekli
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (!apiKey || !apiSecret || !cloudName) {
    console.error('❌ Cloudinary API credentials eksik');
    return false;
  }

  const publicId = extractPublicIdFromUrl(imageUrl);
  if (!publicId) {
    console.error('❌ Public ID çıkarılamadı:', imageUrl);
    return false;
  }

  try {
    // Cloudinary delete API endpoint
    const timestamp = Math.round(Date.now() / 1000);
    const signature = await generateCloudinarySignature(
      { public_id: publicId, timestamp },
      apiSecret
    );

    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('timestamp', timestamp.toString());
    formData.append('api_key', apiKey);
    formData.append('signature', signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const result = await response.json();
    
    if (result.result === 'ok' || result.result === 'not found') {
      console.log('✅ Cloudinary görsel silindi:', publicId);
      return true;
    }

    console.error('❌ Cloudinary silme hatası:', result);
    return false;
  } catch (error) {
    console.error('❌ Cloudinary delete error:', error);
    return false;
  }
}

/**
 * Cloudinary signature oluştur
 */
async function generateCloudinarySignature(
  params: Record<string, string | number>,
  apiSecret: string
): Promise<string> {
  // Sort params alphabetically
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  const message = `${sortedParams}${apiSecret}`;
  
  // SHA-1 hash
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

/**
 * Birden fazla görseli Cloudinary'den sil
 * @param imageUrls - Cloudinary URL'leri
 * @returns Silinen görsel sayısı
 */
export async function deleteMultipleCloudinaryImages(imageUrls: string[]): Promise<number> {
  let deletedCount = 0;
  
  for (const url of imageUrls) {
    const success = await deleteCloudinaryImage(url);
    if (success) deletedCount++;
  }
  
  return deletedCount;
}
