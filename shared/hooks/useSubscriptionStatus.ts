import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "./usePermissions";
import { checkSubscriptionExpiry } from "@/lib/db";

export interface SubscriptionStatus {
  isActive: boolean;
  isPremium: boolean;
  expiryDate: Date | null;
  isAdmin: boolean;
  loading: boolean;
}

export interface UseSubscriptionStatusReturn extends SubscriptionStatus {
  refreshStatus: () => Promise<void>;
  getDaysRemaining: () => number;
}

/**
 * useSubscriptionStatus Hook
 * 
 * Manages subscription status logic - premium access, expiry checks
 * Consolidates subscription logic from Analysis and Profile pages
 * 
 * @example
 * const subscription = useSubscriptionStatus();
 * 
 * if (subscription.isPremium) {
 *   // Show premium content
 * }
 * 
 * const days = subscription.getDaysRemaining();
 * if (days < 7) {
 *   // Show renewal warning
 * }
 */
export function useSubscriptionStatus(): UseSubscriptionStatusReturn {
  const { userData, refreshUserData } = useAuth();
  const { hasPremiumAccess } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [subscriptionValid, setSubscriptionValid] = useState(false);

  // Get expiry date
  const expiryDate = userData?.subscriptionEndDate
    ? userData.subscriptionEndDate.toDate()
    : null;

  // Check if user is admin
  const isAdmin = userData?.role === "admin";

  // Check subscription validity
  useEffect(() => {
    const checkValidity = async () => {
      if (!userData?.uid) {
        setLoading(false);
        return;
      }

      // Admin always has access
      if (isAdmin) {
        setSubscriptionValid(true);
        setLoading(false);
        return;
      }

      // Check if subscription is valid for paid users
      if (userData.isPaid) {
        const isValid = await checkSubscriptionExpiry(userData.uid);
        setSubscriptionValid(isValid);

        // Refresh user data if subscription expired
        if (!isValid) {
          await refreshUserData();
        }
      }

      setLoading(false);
    };

    checkValidity();
  }, [userData?.uid, userData?.isPaid, isAdmin, refreshUserData]);

  // Calculate days remaining (callable function to avoid render issues)
  const getDaysRemaining = () => {
    if (hasPremiumAccess && userData?.subscriptionEndDate) {
      return Math.ceil(
        (userData.subscriptionEndDate.toDate().getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      );
    }
    return 0;
  };

  // Refresh subscription status
  const refreshStatus = async () => {
    setLoading(true);
    await refreshUserData();
    
    if (userData?.uid && userData.isPaid && !isAdmin) {
      const isValid = await checkSubscriptionExpiry(userData.uid);
      setSubscriptionValid(isValid);
    }
    
    setLoading(false);
  };

  return {
    isActive: subscriptionValid || isAdmin,
    isPremium: hasPremiumAccess,
    expiryDate,
    isAdmin,
    loading,
    refreshStatus,
    getDaysRemaining,
  };
}
