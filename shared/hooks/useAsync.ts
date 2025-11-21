import { useState, useEffect, useCallback } from "react";

export interface UseAsyncState<T> {
  /**
   * API'den dönen veri
   */
  data: T | null;

  /**
   * Yükleniyor mu?
   */
  loading: boolean;

  /**
   * Hata mesajı (varsa)
   */
  error: Error | null;

  /**
   * İşlem başarılı mı?
   */
  isSuccess: boolean;

  /**
   * İşlem hata aldı mı?
   */
  isError: boolean;

  /**
   * Veriyi yeniden yükle
   */
  refetch: () => Promise<void>;

  /**
   * State'i sıfırla
   */
  reset: () => void;
}

/**
 * Async işlemler için generic hook.
 * Loading, error, success state'lerini otomatik yönetir.
 *
 * @example
 * ```tsx
 * const { data, loading, error, refetch } = useAsync(
 *   async () => await getAnalyses(),
 *   [] // dependencies
 * );
 *
 * if (loading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage error={error} />;
 * return <AnalysisList data={data} />;
 * ```
 */
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  dependencies: React.DependencyList = []
): UseAsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await asyncFunction();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Bir hata oluştu"));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  useEffect(() => {
    execute();
  }, [execute]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    isSuccess: !loading && !error && data !== null,
    isError: !loading && error !== null,
    refetch: execute,
    reset,
  };
}

/**
 * Manuel olarak tetiklenen async işlemler için hook.
 * Otomatik çalışmaz, sadece execute fonksiyonu ile tetiklenir.
 *
 * @example
 * ```tsx
 * const { execute, loading, error } = useAsyncCallback(
 *   async (userId: string) => await deleteUser(userId)
 * );
 *
 * const handleDelete = async () => {
 *   const result = await execute(user.id);
 *   if (result) {
 *     toast.success('Silindi!');
 *   }
 * };
 * ```
 */
export function useAsyncCallback<T, Args extends unknown[]>(
  asyncFunction: (...args: Args) => Promise<T>
): {
  execute: (...args: Args) => Promise<T | null>;
  loading: boolean;
  error: Error | null;
  data: T | null;
  reset: () => void;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (...args: Args): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await asyncFunction(...args);
        setData(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Bir hata oluştu");
        setError(error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [asyncFunction]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    execute,
    loading,
    error,
    data,
    reset,
  };
}
