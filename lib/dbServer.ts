/**
 * Server-only Database Operations
 * Bu fonksiyonlar sadece server-side'da çalışır (API routes, cron jobs)
 * Firebase Admin SDK kullanır
 */

import type { DailyAnalysis } from "@/types";

/**
 * 3 günden eski analizleri sil (Firebase + Cloudinary)
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
    
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const timestamp = Timestamp.fromDate(threeDaysAgo);

    console.log(`📅 3 gün önce: ${threeDaysAgo.toISOString()}`);
    console.log(`📅 Timestamp: ${timestamp.toDate().toISOString()}`);

    let totalImagesDeleted = 0;

    // Günlük analizleri sil
    console.log('🔍 Günlük analizler sorgulanıyor...');
    const dailySnapshot = await adminDb
      .collection('daily_analysis')
      .where('createdAt', '<=', timestamp)
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

    // Yapay zeka analizlerini sil
    console.log('🔍 AI analizler sorgulanıyor...');
    const aiSnapshot = await adminDb
      .collection('ai_analysis')
      .where('createdAt', '<=', timestamp)
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
