"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { TrendingUp, LogOut, User, Lock } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Header() {
  const { user, userData, signOut } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-lg">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <TrendingUp className="h-8 w-8 text-emerald-500 group-hover:text-emerald-400 transition" />
            <span className="text-xl font-bold text-white">AnalysisDay</span>
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`${
                isActive("/")
                  ? "text-emerald-400"
                  : "text-gray-300 hover:text-emerald-400"
              } transition`}
            >
              Ana Sayfa
            </Link>
            <Link
              href="/analysis"
              className={`${
                isActive("/analysis")
                  ? "text-emerald-400"
                  : "text-gray-300 hover:text-emerald-400"
              } transition`}
            >
              Günün Analizi
            </Link>

            {/* Ücretler Linki - Sadece premium olmayanlara göster */}
            {(!userData || !userData.isPaid) && (
              <Link
                href="/pricing"
                className={`${
                  isActive("/pricing")
                    ? "text-emerald-400"
                    : "text-emerald-400 hover:text-emerald-300"
                } font-semibold transition`}
              >
                Ücretler
              </Link>
            )}

            {/* Admin Paneli - Sadece admin'e göster */}
            {userData?.role === "admin" && (
              <Link
                href="/admin"
                className={`${
                  isActive("/admin")
                    ? "text-purple-400"
                    : "text-purple-400 hover:text-purple-300"
                } font-semibold transition`}
              >
                Admin Panel
              </Link>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Premium Badge */}
                {userData?.isPaid && (
                  <span className="hidden sm:flex items-center space-x-1 bg-[linear-gradient(to_right,var(--tw-gradient-stops))] from-emerald-500 to-emerald-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    <Lock className="h-3 w-3" />
                    <span>Premium</span>
                  </span>
                )}

                {/* User Email */}
                <div className="hidden sm:flex items-center space-x-2 text-gray-300">
                  <User className="h-5 w-5" />
                  <span className="text-sm">{user.email}</span>
                </div>

                {/* Çıkış Butonu */}
                <button
                  onClick={() => signOut()}
                  className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Çıkış</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-gray-300 hover:text-emerald-400 font-medium transition"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/register"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden pb-4 space-y-2">
          <Link
            href="/"
            className={`block ${
              isActive("/") ? "text-emerald-400" : "text-gray-300"
            }`}
          >
            Ana Sayfa
          </Link>
          <Link
            href="/analysis"
            className={`block ${
              isActive("/analysis") ? "text-emerald-400" : "text-gray-300"
            }`}
          >
            Günün Analizi
          </Link>
          {(!userData || !userData.isPaid) && (
            <Link
              href="/pricing"
              className="block text-emerald-400 font-semibold"
            >
              Ücretler
            </Link>
          )}
          {userData?.role === "admin" && (
            <Link href="/admin" className="block text-purple-400 font-semibold">
              Admin Panel
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
