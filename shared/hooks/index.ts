// Central export for all custom hooks
export { useRequireAuth } from "./useRequireAuth";
export type { UseRequireAuthOptions } from "./useRequireAuth";

export { usePermissions } from "./usePermissions";
export type { UserPermissions } from "./usePermissions";

export { useAsync, useAsyncCallback } from "./useAsync";
export type { UseAsyncState } from "./useAsync";

export { useToast, ToastProvider } from "./useToast";

export { useFormValidation } from "./useFormValidation";
export type {
  ValidationError,
  ValidationResult,
  FormValues,
  ValidationOptions,
} from "./useFormValidation";

export { useRateLimit } from "./useRateLimit";
export type { UseRateLimitOptions, UseRateLimitReturn } from "./useRateLimit";

export { useCopyToClipboard, useToggle, useModal } from "./useUtilities";
export type { UseModalReturn } from "./useUtilities";

export { useSubscriptionStatus } from "./useSubscriptionStatus";
export type {
  SubscriptionStatus,
  UseSubscriptionStatusReturn,
} from "./useSubscriptionStatus";

export { useDebounce } from "./useDebounce";
