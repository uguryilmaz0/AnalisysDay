import { useEffect, useState, useCallback } from "react";
import { EnhancedRateLimiter } from "@/lib/rateLimitEnhanced";
import { useToast } from "./useToast";

export interface UseRateLimitOptions {
  key: "login" | "register" | "payment" | "support" | "password-reset";
  showToastOnMount?: boolean;
  showToastOnCheck?: boolean;
}

export interface UseRateLimitReturn {
  isBlocked: boolean;
  remainingTime: number;
  remainingAttempts: number;
  checkAndNotify: () => boolean;
  recordAttempt: () => void;
  reset: () => void;
  getStatusMessage: () => string | null;
}

export function useRateLimit(
  options: UseRateLimitOptions
): UseRateLimitReturn {
  const { key, showToastOnMount = true, showToastOnCheck = true } = options;
  const [rateLimiter] = useState(() => new EnhancedRateLimiter(key));
  const { showToast } = useToast();
  
  const [state] = useState(() => rateLimiter.check());
  const [isBlocked, setIsBlocked] = useState(state.isBlocked);
  const [remainingTime, setRemainingTime] = useState(state.remainingTime);
  const [remainingAttempts, setRemainingAttempts] = useState(state.remainingAttempts);

  useEffect(() => {
    if (state.isBlocked && showToastOnMount) {
      showToast(
        `Çok fazla deneme. Lütfen ${rateLimiter.formatTime(state.remainingTime)} sonra tekrar deneyin.`,
        "warning",
        5000
      );
    }
  }, [state.isBlocked, state.remainingTime, showToastOnMount, showToast, rateLimiter]);

  const checkAndNotify = useCallback(() => {
    const result = rateLimiter.check();
    setIsBlocked(result.isBlocked);
    setRemainingTime(result.remainingTime);
    setRemainingAttempts(result.remainingAttempts);

    if (result.isBlocked && showToastOnCheck) {
      showToast(
        `Çok fazla deneme. Lütfen ${rateLimiter.formatTime(result.remainingTime)} sonra tekrar deneyin.`,
        "warning",
        5000
      );
    }

    return !result.isBlocked;
  }, [rateLimiter, showToastOnCheck, showToast]);

  const recordAttempt = useCallback(() => {
    rateLimiter.recordAttempt();
    const result = rateLimiter.check();
    setIsBlocked(result.isBlocked);
    setRemainingTime(result.remainingTime);
    setRemainingAttempts(result.remainingAttempts);
  }, [rateLimiter]);

  const reset = useCallback(() => {
    rateLimiter.reset();
    setIsBlocked(false);
    setRemainingTime(0);
    setRemainingAttempts(rateLimiter.getRemainingAttempts());
  }, [rateLimiter]);

  const getStatusMessage = useCallback(() => {
    return rateLimiter.getStatusMessage();
  }, [rateLimiter]);

  return {
    isBlocked,
    remainingTime,
    remainingAttempts,
    checkAndNotify,
    recordAttempt,
    reset,
    getStatusMessage,
  };
}

