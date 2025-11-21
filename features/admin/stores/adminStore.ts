import { create } from "zustand";
import { DailyAnalysis, User } from "@/types";
import { analysisService, userService } from "@/features/admin/services";

interface AdminState {
  // Data
  analyses: DailyAnalysis[];
  users: User[];
  usersWithAuthData: Array<User & { emailVerified: boolean }>;

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
  
  // Analysis actions
  addAnalysis: (analysis: DailyAnalysis) => void;
  removeAnalysis: (id: string) => Promise<void>;
  
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
   * Tüm verileri paralel olarak yükler
   */
  loadAllData: async () => {
    set({ loading: true, error: null });

    try {
      const [analyses, users, usersWithAuth] = await Promise.all([
        analysisService.getAll(),
        userService.getAll(),
        userService.getAllWithAuthData(),
      ]);

      set({
        analyses,
        users,
        usersWithAuthData: usersWithAuth,
        loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error : new Error("Veri yüklenemedi"),
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
      const analyses = await analysisService.getAll();
      set({ analyses, analysesLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error : new Error("Analizler yüklenemedi"),
        analysesLoading: false,
      });
    }
  },

  /**
   * Sadece kullanıcıları yükler
   */
  loadUsers: async () => {
    set({ usersLoading: true });

    try {
      const [users, usersWithAuth] = await Promise.all([
        userService.getAll(),
        userService.getAllWithAuthData(),
      ]);

      set({
        users,
        usersWithAuthData: usersWithAuth,
        usersLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error : new Error("Kullanıcılar yüklenemedi"),
        usersLoading: false,
      });
    }
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
