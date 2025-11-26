"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
} from "lucide-react";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
  onScreenshotDetected?: () => void;
}

export default function ImageModal({
  isOpen,
  onClose,
  imageUrl,
  title,
  onScreenshotDetected,
}: ImageModalProps) {
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [isScreenshotAttempted, setIsScreenshotAttempted] =
    useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [lastPinchDistance, setLastPinchDistance] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // ESC tuşuyla kapatma ve Screenshot detection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC tuşu
      if (e.key === "Escape") {
        onClose();
        return;
      }

      // Screenshot detection
      // Windows: Win+Shift+S (PrintScreen tuşu JavaScript'te yakalanamaz)
      // Mac: Cmd+Shift+3, Cmd+Shift+4, Cmd+Shift+5
      const isWindowsSnip =
        e.shiftKey && e.key === "S" && (e.metaKey || e.ctrlKey);
      const isMacScreenshot =
        e.metaKey &&
        e.shiftKey &&
        (e.key === "3" || e.key === "4" || e.key === "5");

      if (isWindowsSnip || isMacScreenshot) {
        console.log("📸 [ImageModal] Screenshot detected!", { imageUrl });
        setIsScreenshotAttempted(true);

        // Trigger callback
        onScreenshotDetected?.();

        // Flash warning
        setTimeout(() => setIsScreenshotAttempted(false), 2000);
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, onScreenshotDetected, imageUrl]);

  // Modal açıldığında scroll kilitle
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Kontrolleri otomatik gizle
  useEffect(() => {
    if (!isOpen) return;

    const hideControls = () => {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    hideControls();

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isOpen, zoom, rotation]);

  const handleContainerMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  if (!isOpen) return null;

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleClose = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
    onClose();
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for pan and pinch-to-zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && zoom > 1) {
      // Single touch - pan
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    } else if (e.touches.length === 2) {
      // Two fingers - pinch zoom
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setLastPinchDistance(distance);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging && zoom > 1) {
      // Single touch - pan
      e.preventDefault();
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    } else if (e.touches.length === 2) {
      // Two fingers - pinch zoom
      e.preventDefault();
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );

      if (lastPinchDistance > 0) {
        const delta = distance - lastPinchDistance;
        const zoomDelta = delta * 0.01;
        setZoom((prev) => Math.max(0.5, Math.min(3, prev + zoomDelta)));
      }

      setLastPinchDistance(distance);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setLastPinchDistance(0);
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) => Math.max(0.5, Math.min(3, prev + delta)));
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-9999 bg-black/98 backdrop-blur-sm flex items-center justify-center"
      onClick={handleClose}
      onMouseMove={handleContainerMouseMove}
      onTouchStart={() => setShowControls(true)}
    >
      {/* Üst Kontrol Paneli - Mobil ve Desktop */}
      <div
        className={`absolute top-0 left-0 right-0 z-20 bg-linear-to-b from-black/80 to-transparent p-4 transition-all duration-300 ${
          showControls
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Başlık */}
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-sm md:text-base truncate">
              {title}
            </h3>
          </div>

          {/* Desktop Kontroller */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Uzaklaştır"
            >
              <ZoomOut className="h-4 w-4 text-white" />
            </button>

            <span className="text-white font-medium text-sm min-w-[50px] text-center bg-white/10 px-3 py-2 rounded-lg">
              {Math.round(zoom * 100)}%
            </span>

            <button
              onClick={handleZoomIn}
              disabled={zoom >= 3}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Yakınlaştır"
            >
              <ZoomIn className="h-4 w-4 text-white" />
            </button>

            <div className="w-px h-6 bg-white/20"></div>

            <button
              onClick={handleRotate}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
              title="Döndür (90°)"
            >
              <RotateCw className="h-4 w-4 text-white" />
            </button>

            <button
              onClick={handleReset}
              className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-white text-sm font-medium"
              title="Sıfırla"
            >
              Sıfırla
            </button>

            <div className="w-px h-6 bg-white/20"></div>

            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
              title={isFullscreen ? "Tam Ekrandan Çık" : "Tam Ekran"}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4 text-white" />
              ) : (
                <Maximize2 className="h-4 w-4 text-white" />
              )}
            </button>
          </div>

          {/* Kapat Butonu */}
          <button
            onClick={handleClose}
            className="p-2 rounded-lg bg-red-600/90 hover:bg-red-700 transition-all"
            title="Kapat (ESC)"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>

      {/* Alt Kontrol Paneli - Sadece Mobil */}
      <div
        className={`md:hidden absolute bottom-0 left-0 right-0 z-20 bg-linear-to-t from-black/80 to-transparent p-4 transition-all duration-300 ${
          showControls
            ? "translate-y-0 opacity-100"
            : "translate-y-full opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
            className="p-3 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 active:scale-95 transition-all"
          >
            <ZoomOut className="h-5 w-5 text-white" />
          </button>

          <span className="text-white font-medium px-4 py-2 rounded-lg bg-white/10 min-w-[70px] text-center">
            {Math.round(zoom * 100)}%
          </span>

          <button
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            className="p-3 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 active:scale-95 transition-all"
          >
            <ZoomIn className="h-5 w-5 text-white" />
          </button>

          <div className="w-px h-8 bg-white/20 mx-1"></div>

          <button
            onClick={handleRotate}
            className="p-3 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 transition-all"
          >
            <RotateCw className="h-5 w-5 text-white" />
          </button>

          <button
            onClick={handleReset}
            className="px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white text-sm font-medium"
          >
            Sıfırla
          </button>
        </div>
      </div>

      {/* Görsel Container - Pinch Zoom ve Touch Desteği */}
      <div
        className="relative w-full h-full flex items-center justify-center p-4 md:p-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onWheel={handleWheel}
      >
        <div
          ref={imageRef}
          className={`relative max-w-full max-h-full touch-none select-none ${
            zoom > 1 ? "cursor-move" : "cursor-default"
          }`}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
            transition: isDragging
              ? "none"
              : "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <Image
            src={imageUrl}
            alt={title}
            width={1920}
            height={1080}
            className="max-w-full max-h-[90vh] w-auto h-auto object-contain rounded-lg shadow-2xl pointer-events-none"
            quality={100}
            priority
            draggable={false}
          />
        </div>
      </div>

      {/* Screenshot Warning Flash */}
      {isScreenshotAttempted && (
        <div className="fixed inset-0 bg-red-500/80 backdrop-blur-sm flex items-center justify-center z-10000 pointer-events-none">
          <div className="text-center text-white animate-pulse">
            <p className="text-4xl md:text-6xl font-bold mb-4">⚠️ UYARI</p>
            <p className="text-xl md:text-3xl font-semibold">
              Ekran görüntüsü tespit edildi!
            </p>
            <p className="text-base md:text-xl mt-4">
              Bu işlem kaydedilmiştir.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
