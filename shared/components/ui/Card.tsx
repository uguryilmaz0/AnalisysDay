import React from "react";

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  gradient?: boolean;
}

const paddingClasses = {
  none: "p-0",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Card({
  children,
  className = "",
  padding = "md",
  hover = false,
  gradient = false,
}: CardProps) {
  const baseClasses =
    "bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden";
  const hoverClasses = hover
    ? "hover:border-gray-700 transition-all duration-300"
    : "";
  const gradientClasses = gradient
    ? "bg-linear-to-br from-gray-900 to-gray-950"
    : "";

  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${gradientClasses} ${paddingClasses[padding]} ${className}`}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function CardHeader({
  title,
  subtitle,
  icon,
  action,
  className = "",
}: CardHeaderProps) {
  return (
    <div className={`flex items-center justify-between mb-6 ${className}`}>
      <div className="flex items-center gap-3">
        {icon && <div className="shrink-0">{icon}</div>}
        <div>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
