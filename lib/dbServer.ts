/**
 * Server-only Database Operations
 * Bu fonksiyonlar sadece server-side'da çalışır (API routes, cron jobs)
 * Firebase Admin SDK kullanır
 */

import type { DailyAnalysis } from "@/types";

/**
 * Eski analizleri sil (Firebase + Cloudinary)
 * - Günlük analizler: 3 günden eski olanlar silinir
 * - AI analizleri: 15 günden eski olanlar silinir
 * Her gün akşam 23:00 TR saatinde çalışır (20:00 UTC)
 * NOT: Bu fonksiyon Firebase Admin SDK kullanır (server-side only)
 */
export async function deleteOldAnalyses(): Promise<{ 
  dailyDeleted: number; 
  aiDeleted: number;
  imagesDeleted: number;
}> {
  try {
    console.log('🔍 deleteOldAnalyses başladı...');
    
    // Firebase Admin SDK'yı kullan (zaten initialize edilmiş)
    const { adminDb } = await import('./firebaseAdmin');
    const { Timestamp } = await import('firebase-admin/firestore');
    
    // Günlük analizler için 3 gün
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const dailyTimestamp = Timestamp.fromDate(threeDaysAgo);

    // AI analizleri için 15 gün
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
    const aiTimestamp = Timestamp.fromDate(fifteenDaysAgo);

    console.log(`📅 Günlük: 3 gün önce: ${threeDaysAgo.toISOString()}`);
    console.log(`📅 AI: 15 gün önce: ${fifteenDaysAgo.toISOString()}`);

    let totalImagesDeleted = 0;

    // Günlük analizleri sil (3 gün)
    console.log('🔍 Günlük analizler sorgulanıyor...');
    const dailySnapshot = await adminDb
      .collection('daily_analysis')
      .where('createdAt', '<=', dailyTimestamp)
      .get();
    
    console.log(`📊 ${dailySnapshot.size} günlük analiz bulundu`);
    
    // Cloudinary'den görselleri sil
    for (const doc of dailySnapshot.docs) {
      const data = doc.data() as DailyAnalysis;
      if (data.imageUrls && data.imageUrls.length > 0) {
        const { deleteMultipleCloudinaryImages } = await import('@/lib/cloudinary');
        const deletedCount = await deleteMultipleCloudinaryImages(data.imageUrls);
        totalImagesDeleted += deletedCount;
        console.log(`🗑️  Analiz ${doc.id}: ${deletedCount}/${data.imageUrls.length} görsel silindi`);
      }
    }
    
    // Firebase'den analizleri sil
    const dailyDeleteBatch = adminDb.batch();
    dailySnapshot.docs.forEach(doc => {
      dailyDeleteBatch.delete(doc.ref);
    });
    await dailyDeleteBatch.commit();
    console.log(`✅ ${dailySnapshot.size} günlük analiz Firebase'den silindi`);

    // Yapay zeka analizlerini sil (15 gün)
    console.log('🔍 AI analizler sorgulanıyor...');
    const aiSnapshot = await adminDb
      .collection('ai_analysis')
      .where('createdAt', '<=', aiTimestamp)
      .get();
    
    console.log(`📊 ${aiSnapshot.size} AI analiz bulundu`);
    
    // Cloudinary'den görselleri sil
    for (const doc of aiSnapshot.docs) {
      const data = doc.data() as DailyAnalysis;
      if (data.imageUrls && data.imageUrls.length > 0) {
        const { deleteMultipleCloudinaryImages } = await import('@/lib/cloudinary');
        const deletedCount = await deleteMultipleCloudinaryImages(data.imageUrls);
        totalImagesDeleted += deletedCount;
        console.log(`🗑️  AI Analiz ${doc.id}: ${deletedCount}/${data.imageUrls.length} görsel silindi`);
      }
    }
    
    // Firebase'den analizleri sil
    const aiDeleteBatch = adminDb.batch();
    aiSnapshot.docs.forEach(doc => {
      aiDeleteBatch.delete(doc.ref);
    });
    await aiDeleteBatch.commit();
    console.log(`✅ ${aiSnapshot.size} AI analiz Firebase'den silindi`);

    console.log(`✅ Cleanup tamamlandı: ${dailySnapshot.size} günlük + ${aiSnapshot.size} AI analiz, ${totalImagesDeleted} görsel silindi`);

    return {
      dailyDeleted: dailySnapshot.size,
      aiDeleted: aiSnapshot.size,
      imagesDeleted: totalImagesDeleted,
    };
  } catch (error) {
    console.error('❌ Eski analizler silinemedi:', error);
    throw error;
  }
}
