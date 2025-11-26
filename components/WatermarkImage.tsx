"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface WatermarkImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  userEmail: string;
  userName: string;
  imageIndex?: number;
  onImageClick?: () => void;
  onRightClick?: () => void;
  onScreenshotDetected?: () => void;
  disableRightClick?: boolean;
}

/**
 * Image component with watermark overlay
 * Shows user email and timestamp to prevent unauthorized sharing
 */
export function WatermarkImage({
  src,
  alt,
  width = 1200,
  height = 800,
  className = "",
  priority = false,
  userEmail,
  userName,
  imageIndex = 0,
  onImageClick,
  onRightClick,
  onScreenshotDetected,
  disableRightClick = true,
}: WatermarkImageProps) {
  const [isScreenshotAttempted, setIsScreenshotAttempted] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  // Detect screenshot attempts (keyboard shortcuts)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⚠️ NOT: PrintScreen (PrtScn) tuşu JavaScript tarafından yakalanamaz!
      // Sadece Windows Snipping Tool (Win+Shift+S) ve Mac screenshot kısayolları yakalanabilir.

      // Windows: Win+Shift+S (Snipping Tool)
      // Mac: Cmd+Shift+3, Cmd+Shift+4, Cmd+Shift+5
      const isWindowsSnip =
        e.shiftKey && e.key === "S" && (e.metaKey || e.ctrlKey);
      const isMacScreenshot =
        e.metaKey &&
        e.shiftKey &&
        (e.key === "3" || e.key === "4" || e.key === "5");

      if (isWindowsSnip || isMacScreenshot) {
        console.log("📸 [WatermarkImage] Screenshot detected!", {
          src,
          imageIndex,
        });
        setIsScreenshotAttempted(true);

        // Trigger callback
        onScreenshotDetected?.();

        // Flash warning
        setTimeout(() => setIsScreenshotAttempted(false), 2000);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onScreenshotDetected, imageIndex, src]);

  const handleContextMenu = (e: React.MouseEvent) => {
    console.log("🖱️ Right-click detected!", { src, imageIndex });

    if (disableRightClick) {
      e.preventDefault();
    }

    // Always trigger callback
    onRightClick?.();
  };

  const handleClick = () => {
    console.log("👆 Image clicked!", { src, imageIndex });
    onImageClick?.();
  };

  return (
    <div
      ref={imageRef}
      className={`relative group ${className}`}
      onContextMenu={handleContextMenu}
      onClick={handleClick}
    >
      {/* Main Image */}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="w-full h-auto rounded-xl shadow-2xl border border-gray-800"
        priority={priority}
        draggable={false}
        style={{
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
        }}
      />

      {/* Screenshot Warning Flash */}
      {isScreenshotAttempted && (
        <div className="absolute inset-0 bg-red-500/80 backdrop-blur-sm flex items-center justify-center rounded-xl animate-pulse z-50">
          <div className="text-center text-white">
            <p className="text-3xl font-bold mb-2">⚠️ UYARI</p>
            <p className="text-lg">Ekran görüntüsü tespit edildi!</p>
            <p className="text-sm mt-2">Bu işlem kaydedilmiştir.</p>
          </div>
        </div>
      )}

      {/* Right Click Disabled Overlay */}
      {disableRightClick && (
        <div className="absolute inset-0 pointer-events-none select-none" />
      )}
    </div>
  );
}
