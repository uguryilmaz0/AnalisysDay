"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { TrendingUp, LogOut, User, Lock, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Header() {
  const { user, userData, signOut } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <header className="bg-gray-950 border-b border-gray-800 sticky top-0 z-50 shadow-xl backdrop-blur-lg bg-opacity-95">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <TrendingUp className="h-8 w-8 text-blue-500 group-hover:text-blue-400 transition" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-purple-400">
              AnalysisDay
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {!user && (
              <Link
                href="/"
                className={`${
                  isActive("/")
                    ? "text-blue-400 font-semibold"
                    : "text-gray-300 hover:text-blue-400"
                } transition-all duration-200`}
              >
                Ana Sayfa
              </Link>
            )}
            <Link
              href="/analysis"
              className={`${
                isActive("/analysis")
                  ? "text-blue-400 font-semibold"
                  : "text-gray-300 hover:text-blue-400"
              } transition-all duration-200`}
            >
              Günün Analizi
            </Link>
            <Link
              href="/faq"
              className={`${
                isActive("/faq")
                  ? "text-blue-400 font-semibold"
                  : "text-gray-300 hover:text-blue-400"
              } transition-all duration-200`}
            >
              Yardım
            </Link>

            {/* Ücretler Linki - Sadece premium olmayanlara göster */}
            {(!userData || !userData.isPaid) && (
              <Link
                href="/pricing"
                className={`${
                  isActive("/pricing")
                    ? "text-purple-400 font-bold"
                    : "text-purple-400 hover:text-purple-300"
                } transition-all duration-200`}
              >
                💎 Ücretler
              </Link>
            )}

            {/* Admin Paneli - Sadece admin'e göster */}
            {userData?.role === "admin" && (
              <Link
                href="/admin"
                className={`${
                  isActive("/admin")
                    ? "text-orange-400 font-bold"
                    : "text-orange-400 hover:text-orange-300"
                } transition-all duration-200`}
              >
                ⚡ Admin Panel
              </Link>
            )}
          </div>

          {/* Desktop User Menu */}
          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              <>
                {/* Premium Badge */}
                {userData?.isPaid && (
                  <span className="flex items-center space-x-1 bg-linear-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                    <Lock className="h-3 w-3" />
                    <span>Premium</span>
                  </span>
                )}

                {/* Profil Linki */}
                <Link
                  href="/profile"
                  className="flex items-center space-x-2 text-gray-300 hover:text-blue-400 transition-colors"
                  title="Profil"
                >
                  <User className="h-5 w-5" />
                  <span className="text-sm">
                    @{userData?.username || user.email}
                  </span>
                </Link>

                {/* Çıkış Butonu */}
                <button
                  onClick={() => signOut()}
                  className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-red-500/20"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Çıkış</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-gray-300 hover:text-blue-400 font-medium transition-all duration-200"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/register"
                  className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/20"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-gray-300 hover:text-blue-400 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-4 pt-2 space-y-3 border-t border-gray-800 mt-2">
            {/* Mobile Navigation Links */}
            {!user && (
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2 ${
                  isActive("/")
                    ? "text-blue-400 font-semibold"
                    : "text-gray-300 hover:text-blue-400"
                } transition-colors`}
              >
                Ana Sayfa
              </Link>
            )}
            <Link
              href="/analysis"
              onClick={() => setMobileMenuOpen(false)}
              className={`block py-2 ${
                isActive("/analysis")
                  ? "text-blue-400 font-semibold"
                  : "text-gray-300 hover:text-blue-400"
              } transition-colors`}
            >
              Günün Analizi
            </Link>
            <Link
              href="/faq"
              onClick={() => setMobileMenuOpen(false)}
              className={`block py-2 ${
                isActive("/faq")
                  ? "text-blue-400 font-semibold"
                  : "text-gray-300 hover:text-blue-400"
              } transition-colors`}
            >
              Yardım
            </Link>
            {(!userData || !userData.isPaid) && (
              <Link
                href="/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-purple-400 hover:text-purple-300 font-semibold transition-colors"
              >
                💎 Ücretler
              </Link>
            )}
            {userData?.role === "admin" && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-orange-400 hover:text-orange-300 font-semibold transition-colors"
              >
                ⚡ Admin Panel
              </Link>
            )}

            {/* Mobile User Section */}
            <div className="pt-3 border-t border-gray-800 space-y-3">
              {user ? (
                <>
                  {userData?.isPaid && (
                    <div className="flex items-center space-x-2 bg-linear-to-r from-blue-600 to-purple-600 text-white px-3 py-2 rounded-lg text-sm font-semibold w-fit">
                      <Lock className="h-4 w-4" />
                      <span>Premium</span>
                    </div>
                  )}
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 text-gray-300 hover:text-blue-400 py-2 transition-colors"
                  >
                    <User className="h-5 w-5 text-blue-400" />
                    <span className="text-sm">
                      @{userData?.username || user.email}
                    </span>
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200 w-full justify-center"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Çıkış</span>
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center text-gray-300 hover:text-blue-400 font-medium py-2 transition-colors"
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
                  >
                    Kayıt Ol
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
