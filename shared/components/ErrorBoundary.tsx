"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("React Error Boundary caught an error", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-red-500/50 rounded-2xl p-8 max-w-md text-center">
            <div className="bg-red-500/20 p-4 rounded-full inline-block mb-4">
              <AlertTriangle className="h-12 w-12 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Bir Hata Oluştu
            </h1>
            <p className="text-gray-400 mb-6">
              Üzgünüz, beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin
              veya daha sonra tekrar deneyin.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Sayfayı Yenile
            </button>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-red-400 cursor-pointer mb-2 text-sm font-semibold">
                  Hata Detayları (Development Mode)
                </summary>
                <div className="bg-gray-950 p-4 rounded mt-2">
                  <p className="text-red-300 text-sm font-semibold mb-2">
                    {this.state.error.message}
                  </p>
                  <pre className="text-xs text-gray-400 overflow-auto max-h-64">
                    {this.state.error.stack}
                  </pre>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
