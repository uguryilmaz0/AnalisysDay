import { create } from "zustand";
import { DailyAnalysis, User } from "@/types";
import { analysisService, userService } from "@/features/admin/services";

interface AnalysisStats {
  dailyPending: number;
  dailyWon: number;
  dailyLost: number;
  aiPending: number;
  aiWon: number;
  aiLost: number;
}

interface AdminStats {
  totalUsers: number;
  totalAnalyses: number;
  premiumUsers: number;
  pendingAnalyses: number;
  completedAnalyses: number;
}

interface AdminState {
  // Data
  analyses: DailyAnalysis[];
  users: User[];
  usersWithAuthData: Array<User & { emailVerified: boolean }>;
  analysisStats: AnalysisStats;
  stats: AdminStats;

  // Loading states
  loading: boolean;
  analysesLoading: boolean;
  usersLoading: boolean;

  // Error states
  error: Error | null;

  // Actions
  loadAllData: () => Promise<void>;
  loadAnalyses: () => Promise<void>;
  loadUsers: () => Promise<void>;
  refreshStats: () => Promise<void>;
  
  // Analysis actions
  addAnalysis: (analysis: DailyAnalysis) => void;
  removeAnalysis: (id: string) => Promise<void>;
  updateAnalysisStats: (type: 'daily' | 'ai', fromStatus: 'pending' | 'won' | 'lost', toStatus: 'pending' | 'won' | 'lost') => void;
  
  // User actions
  updateUser: (uid: string, updates: Partial<User>) => void;
  removeUser: (uid: string) => Promise<void>;
  
  // Reset
  reset: () => void;
}

const initialState = {
  analyses: [],
  users: [],
  usersWithAuthData: [],
  analysisStats: {
    dailyPending: 0,
    dailyWon: 0,
    dailyLost: 0,
    aiPending: 0,
    aiWon: 0,
    aiLost: 0,
  },
  stats: {
    totalUsers: 0,
    totalAnalyses: 0,
    premiumUsers: 0,
    pendingAnalyses: 0,
    completedAnalyses: 0,
  },
  loading: false,
  analysesLoading: false,
  usersLoading: false,
  error: null,
};

/**
 * Admin Store - Global state management for admin panel
 * Zustand ile merkezi state yönetimi
 */
export const useAdminStore = create<AdminState>((set, get) => ({
  ...initialState,

  /**
   * ⚡ OPTİMİZE: İlk açılışta sadece stats yükle (lazy loading)
   */
  loadAllData: async () => {
    set({ loading: true, error: null });

    try {
      // Sadece analysis stats yükle, diğerleri tab'e basıldığında yüklenecek
      const analysisStats = await analysisService.getStats();
      
      // Kullanıcı sayıları için basit fallback stats
      const stats = {
        totalUsers: 0, // UserManagementTab'da getUsersPaginated'dan gelecek
        totalAnalyses: analysisStats.dailyPending + analysisStats.dailyWon + analysisStats.dailyLost + analysisStats.aiPending + analysisStats.aiWon + analysisStats.aiLost,
        premiumUsers: 0,
        pendingAnalyses: analysisStats.dailyPending + analysisStats.aiPending,
        completedAnalyses: analysisStats.dailyWon + analysisStats.dailyLost + analysisStats.aiWon + analysisStats.aiLost,
      };

      set({
        analysisStats,
        stats,
        loading: false,
      });
      
      console.log('⚡ Admin: Sadece stats yüklendi (lazy loading aktif)');
    } catch (error) {
      set({
        error: error instanceof Error ? error : new Error("Veri yüklenemedi"),
        loading: false,
      });
    }
  },

  /**
   * ⚡ Sadece kullanıcıları yükler (lazy)
   */
  loadUsers: async () => {
    set({ loading: true });
    try {
      const [users, usersWithAuth] = await Promise.all([
        userService.getAll(),
        userService.getAllWithAuthData(),
      ]);
      set({ users, usersWithAuthData: usersWithAuth, loading: false });
      console.log('✅ Admin: Kullanıcılar yüklendi (50 read)');
    } catch (error) {
      set({
        error: error instanceof Error ? error : new Error("Kullanıcılar yüklenemedi"),
        loading: false,
      });
    }
  },

  /**
   * Sadece analizleri yükler
   */
  loadAnalyses: async () => {
    set({ analysesLoading: true });

    try {
      const [analyses, stats] = await Promise.all([
        analysisService.getAll(),
        analysisService.getStats(),
      ]);
      set({ analyses, analysisStats: stats, analysesLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error : new Error("Analizler yüklenemedi"),
        analysesLoading: false,
      });
    }
  },

  /**
   * Stats'ı yeniden yükler
   */
  refreshStats: async () => {
    try {
      const analysisStats = await analysisService.getStats();
      set({ analysisStats });
      console.log('🔄 Stats yenilendi');
    } catch (error) {
      console.error('Stats yenilenemedi:', error);
    }
  },

  /**
   * Analiz stat'larını optimistic günceller
   */
  updateAnalysisStats: (type, fromStatus, toStatus) => {
    set((state) => {
      const newStats = { ...state.analysisStats };
      const prefix = type === 'daily' ? 'daily' : 'ai';
      
      // Eski status'tan çıkar
      if (fromStatus === 'pending') {
        newStats[`${prefix}Pending` as keyof AnalysisStats]--;
      } else if (fromStatus === 'won') {
        newStats[`${prefix}Won` as keyof AnalysisStats]--;
      } else if (fromStatus === 'lost') {
        newStats[`${prefix}Lost` as keyof AnalysisStats]--;
      }
      
      // Yeni status'a ekle
      if (toStatus === 'pending') {
        newStats[`${prefix}Pending` as keyof AnalysisStats]++;
      } else if (toStatus === 'won') {
        newStats[`${prefix}Won` as keyof AnalysisStats]++;
      } else if (toStatus === 'lost') {
        newStats[`${prefix}Lost` as keyof AnalysisStats]++;
      }
      
      return { analysisStats: newStats };
    });
  },

  /**
   * Yeni analiz ekler (optimistic update)
   */
  addAnalysis: (analysis) => {
    set((state) => ({
      analyses: [analysis, ...state.analyses],
    }));
  },

  /**
   * Analiz siler
   */
  removeAnalysis: async (id) => {
    // Optimistic update
    const { analyses } = get();
    const previousAnalyses = [...analyses];
    
    set({
      analyses: analyses.filter((a) => a.id !== id),
    });

    try {
      await analysisService.delete(id);
    } catch (error) {
      // Rollback on error
      set({ analyses: previousAnalyses });
      throw error;
    }
  },

  /**
   * Kullanıcı günceller (optimistic update)
   */
  updateUser: (uid, updates) => {
    set((state) => ({
      users: state.users.map((u) =>
        u.uid === uid ? { ...u, ...updates } : u
      ),
    }));
  },

  /**
   * Kullanıcı siler
   */
  removeUser: async (uid) => {
    // Optimistic update
    const { users } = get();
    const previousUsers = [...users];
    
    set({
      users: users.filter((u) => u.uid !== uid),
    });

    try {
      await userService.delete(uid);
    } catch (error) {
      // Rollback on error
      set({ users: previousUsers });
      throw error;
    }
  },

  /**
   * Store'u sıfırlar
   */
  reset: () => {
    set(initialState);
  },
}));
