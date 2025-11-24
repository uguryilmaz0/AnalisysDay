import {
  getAllAnalyses,
  deleteAnalysis,
  createAnalysis,
  updateAnalysis,
  updateAnalysisStatus,
} from "@/lib/db";
import { uploadMultipleImages } from "@/lib/cloudinary";
import { DailyAnalysis } from "@/types";
import { BaseService } from "@/shared/services/BaseService";

/**
 * AnalysisService - Analiz işlemleri için servis katmanı
 * Tüm analiz CRUD operasyonları merkezi olarak yönetilir
 */
class AnalysisService extends BaseService {
  constructor() {
    super("AnalysisService");
  }

  /**
   * Tüm analizleri getirir
   */
  async getAll(): Promise<DailyAnalysis[]> {
    return this.executeWithRetry(
      () => getAllAnalyses(),
      "getAll",
      { maxRetries: 2 }
    );
  }

  /**
   * Yeni analiz oluşturur (görsel upload dahil)
   */
  async create(
    title: string,
    imageFiles: File[],
    description: string,
    userId: string
  ): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      // Önce görselleri yükle
      const imageUrls = await uploadMultipleImages(imageFiles);

      // Sonra analizi oluştur
      await createAnalysis(title, imageUrls, description, userId);
    }, "create");
  }

  /**
   * Analiz siler
   */
  async delete(id: string): Promise<void> {
    return this.executeWithErrorHandling(
      () => deleteAnalysis(id),
      "delete"
    );
  }

  /**
   * Analiz günceller (başlık ve açıklama)
   */
  async update(
    id: string,
    title: string,
    description: string
  ): Promise<void> {
    return this.executeWithErrorHandling(
      () => updateAnalysis(id, title, description),
      "update"
    );
  }

  /**
   * Analiz durumunu günceller (kazandı/kaybetti)
   */
  async updateStatus(
    id: string,
    status: 'pending' | 'won' | 'lost',
    userId: string
  ): Promise<void> {
    return this.executeWithErrorHandling(
      () => updateAnalysisStatus(id, status, userId),
      "updateStatus"
    );
  }

  /**
   * Görsel download helper
   */
  downloadImage(url: string, index: number): void {
    const link = document.createElement("a");
    link.href = url;
    link.download = `analysis-image-${index + 1}.jpg`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Singleton instance
export const analysisService = new AnalysisService();
