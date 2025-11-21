import { useEffect, useState, useCallback } from "react";
import { RateLimiter, formatRemainingTime } from "@/lib/rateLimit";
import { useToast } from "./useToast";

export interface UseRateLimitOptions {
  key: "login" | "register"; // Type-safe keys
  showToastOnMount?: boolean; // Show toast if blocked on mount
  showToastOnCheck?: boolean; // Show toast if blocked on manual check
}

export interface UseRateLimitReturn {
  isBlocked: boolean;
  remainingTime: number;
  remainingAttempts: number;
  checkAndNotify: () => boolean; // Returns true if allowed, false if blocked
  recordAttempt: () => void;
  reset: () => void;
}

export function useRateLimit(
  options: UseRateLimitOptions
): UseRateLimitReturn {
  const { key, showToastOnMount = true, showToastOnCheck = true } = options;
  const [rateLimiter] = useState(() => new RateLimiter(key));
  const { showToast } = useToast();
  
  // Initialize state with rate limiter check
  const [state] = useState(() => {
    const result = rateLimiter.check();
    return {
      isBlocked: result.isBlocked,
      remainingTime: result.remainingTime,
    };
  });
  
  const [isBlocked, setIsBlocked] = useState(state.isBlocked);
  const [remainingTime, setRemainingTime] = useState(state.remainingTime);

  // Show toast on mount if blocked
  useEffect(() => {
    if (state.isBlocked && showToastOnMount) {
      showToast(
        `Çok fazla deneme. Lütfen ${formatRemainingTime(state.remainingTime)} sonra tekrar deneyin.`,
        "warning"
      );
    }
  }, [state.isBlocked, state.remainingTime, showToastOnMount, showToast]);

  // Check rate limit and show toast if blocked
  const checkAndNotify = useCallback(() => {
    const { isBlocked: blocked, remainingTime: time } = rateLimiter.check();
    setIsBlocked(blocked);
    setRemainingTime(time);

    if (blocked && showToastOnCheck) {
      showToast(
        `Çok fazla deneme. Lütfen ${formatRemainingTime(time)} sonra tekrar deneyin.`,
        "warning"
      );
    }

    return !blocked; // Return true if allowed
  }, [rateLimiter, showToastOnCheck, showToast]);

  // Record failed attempt
  const recordAttempt = useCallback(() => {
    rateLimiter.recordAttempt();
    const { isBlocked: blocked, remainingTime: time } = rateLimiter.check();
    setIsBlocked(blocked);
    setRemainingTime(time);
  }, [rateLimiter]);

  // Reset rate limiter
  const reset = useCallback(() => {
    rateLimiter.reset();
    setIsBlocked(false);
    setRemainingTime(0);
  }, [rateLimiter]);

  // Get remaining attempts
  const remainingAttempts = rateLimiter.getRemainingAttempts();

  return {
    isBlocked,
    remainingTime,
    remainingAttempts,
    checkAndNotify,
    recordAttempt,
    reset,
  };
}
