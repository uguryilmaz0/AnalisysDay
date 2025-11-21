import React from "react";
import { LucideIcon } from "lucide-react";

export interface PageSectionProps {
  /** Section title */
  title: string;
  /** Icon component from lucide-react */
  icon: LucideIcon;
  /** Icon background color (Tailwind class) */
  iconBgColor?: string;
  /** Icon color (Tailwind class) */
  iconColor?: string;
  /** Section content */
  children: React.ReactNode;
  /** Additional CSS classes for the section */
  className?: string;
}

/**
 * Reusable page section component with icon and title
 * Used for Terms and Privacy pages to reduce code duplication
 */
export function PageSection({
  title,
  icon: Icon,
  iconBgColor = "bg-blue-600",
  iconColor = "text-white",
  children,
  className = "",
}: PageSectionProps) {
  return (
    <section className={className}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`${iconBgColor} p-2 rounded-lg`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
      </div>
      <div className="text-gray-300 space-y-3 leading-relaxed">{children}</div>
    </section>
  );
}
