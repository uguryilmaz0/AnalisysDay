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
  formData.append('folder', 'analysisday/analysis');

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
 * @param userId - Kullanıcı ID'si (klasör organizasyonu için)
 * @returns Cloudinary URL
 */
export async function uploadReceiptImage(file: File, userId: string): Promise<string> {
  if (!CLOUDINARY_CLOUD_NAME || !RECEIPT_PRESET) {
    throw new Error('Cloudinary yapılandırması eksik. .env.local dosyasını kontrol edin.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', RECEIPT_PRESET);
  formData.append('folder', `analysisday/receipts/${userId}`);

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
