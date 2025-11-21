import React from "react";

export type BadgeVariant =
  | "premium"
  | "admin"
  | "user"
  | "success"
  | "warning"
  | "danger"
  | "info";

export interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  size?: "sm" | "md";
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  premium: "bg-purple-100 text-purple-800",
  admin: "bg-orange-100 text-orange-800",
  user: "bg-blue-100 text-blue-800",
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  danger: "bg-red-100 text-red-800",
  info: "bg-gray-100 text-gray-800",
};

const sizeClasses = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2 py-1 text-xs",
};

export function Badge({
  variant,
  children,
  size = "md",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`${variantClasses[variant]} ${sizeClasses[size]} rounded-full font-semibold inline-flex items-center gap-1 ${className}`}
    >
      {children}
    </span>
  );
}
