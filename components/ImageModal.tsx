"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, ZoomIn, ZoomOut, RotateCw } from "lucide-react";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
}

export default function ImageModal({
  isOpen,
  onClose,
  imageUrl,
  title,
}: ImageModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  // ESC tuşuyla kapatma
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

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
  };

  const handleClose = () => {
    setZoom(1);
    setRotation(0);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-100 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleClose}
    >
      {/* Kontrol Paneli */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-gray-900/90 backdrop-blur-md rounded-full px-4 py-2 border border-gray-700 shadow-2xl">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleZoomOut();
          }}
          disabled={zoom <= 0.5}
          className="p-2 rounded-full hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Uzaklaştır"
        >
          <ZoomOut className="h-5 w-5 text-white" />
        </button>

        <span className="text-white font-semibold min-w-[60px] text-center">
          {Math.round(zoom * 100)}%
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleZoomIn();
          }}
          disabled={zoom >= 3}
          className="p-2 rounded-full hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Yakınlaştır"
        >
          <ZoomIn className="h-5 w-5 text-white" />
        </button>

        <div className="w-px h-6 bg-gray-700 mx-2"></div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRotate();
          }}
          className="p-2 rounded-full hover:bg-gray-800 transition-colors"
          title="Döndür"
        >
          <RotateCw className="h-5 w-5 text-white" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleReset();
          }}
          className="px-3 py-2 rounded-full hover:bg-gray-800 transition-colors text-white text-sm font-medium"
          title="Sıfırla"
        >
          Sıfırla
        </button>
      </div>

      {/* Kapatma Butonu */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-900/90 hover:bg-red-600 border border-gray-700 transition-all duration-200 group"
        title="Kapat (ESC)"
      >
        <X className="h-6 w-6 text-white" />
      </button>

      {/* Başlık */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-gray-900/90 backdrop-blur-md rounded-full px-6 py-3 border border-gray-700 max-w-2xl mx-4">
        <p className="text-white font-medium text-center truncate">{title}</p>
      </div>

      {/* Görsel Container */}
      <div
        className="relative max-w-6xl max-h-[90vh] overflow-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent cursor-grab active:cursor-grabbing"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => {
          const container = e.currentTarget;
          const startX = e.pageX - container.offsetLeft;
          const startY = e.pageY - container.offsetTop;
          const scrollLeft = container.scrollLeft;
          const scrollTop = container.scrollTop;

          const handleMouseMove = (e: MouseEvent) => {
            const x = e.pageX - container.offsetLeft;
            const y = e.pageY - container.offsetTop;
            const walkX = (x - startX) * 2;
            const walkY = (y - startY) * 2;
            container.scrollLeft = scrollLeft - walkX;
            container.scrollTop = scrollTop - walkY;
          };

          const handleMouseUp = () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
          };

          document.addEventListener("mousemove", handleMouseMove);
          document.addEventListener("mouseup", handleMouseUp);
        }}
      >
        <div
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transition: "transform 0.3s ease-out",
          }}
          className="relative"
        >
          <Image
            src={imageUrl}
            alt={title}
            width={1920}
            height={1080}
            className="max-w-full h-auto rounded-lg shadow-2xl select-none"
            quality={100}
            priority
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}
