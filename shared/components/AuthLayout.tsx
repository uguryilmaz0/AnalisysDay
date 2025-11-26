import React, { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  icon: LucideIcon;
  iconBgColor?: string; // Default: "bg-emerald-500"
}

/**
 * AuthLayout Component
 *
 * Shared layout for authentication pages (Login, Register, ForgotPassword, VerifyEmail)
 * Provides consistent styling, header structure, and container pattern
 *
 * @example
 * <AuthLayout
 *   title="Giriş Yap"
 *   description="Analiz Günü hesabınıza giriş yapın"
 *   icon={LogIn}
 * >
 *   <form>...</form>
 * </AuthLayout>
 */
export function AuthLayout({
  children,
  title,
  description,
  icon: Icon,
  iconBgColor = "bg-emerald-500",
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-linear-to-r from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-2xl p-8 border border-emerald-500/20">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className={`${iconBgColor} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}
          >
            <Icon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
          <p className="text-gray-400">{description}</p>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
}
