"use client";

import { useEffect } from "react";
import {
  X,
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
} from "lucide-react";
import { Toast as ToastType } from "@/shared/types/toast";

interface ToastItemProps {
  toast: ToastType;
  onClose: (id: string) => void;
}

const toastStyles = {
  success: {
    bg: "bg-green-900/90 border-green-500/50",
    icon: CheckCircle2,
    iconColor: "text-green-400",
  },
  error: {
    bg: "bg-red-900/90 border-red-500/50",
    icon: AlertCircle,
    iconColor: "text-red-400",
  },
  warning: {
    bg: "bg-orange-900/90 border-orange-500/50",
    icon: AlertTriangle,
    iconColor: "text-orange-400",
  },
  info: {
    bg: "bg-blue-900/90 border-blue-500/50",
    icon: Info,
    iconColor: "text-blue-400",
  },
};

export function ToastItem({ toast, onClose }: ToastItemProps) {
  const style = toastStyles[toast.type];
  const Icon = style.icon;

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        onClose(toast.id);
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onClose]);

  return (
    <div
      className={`${style.bg} backdrop-blur-md border rounded-lg shadow-2xl p-4 min-w-[320px] max-w-md animate-in slide-in-from-right duration-300`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 ${style.iconColor} shrink-0 mt-0.5`} />
        <p className="text-white text-sm flex-1 leading-relaxed">
          {toast.message}
        </p>
        <button
          onClick={() => onClose(toast.id)}
          className="text-gray-400 hover:text-white transition shrink-0"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
