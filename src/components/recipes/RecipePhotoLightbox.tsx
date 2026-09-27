import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Maximize2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useImageOrientation } from "@/utils/imageExif";

interface RecipePhotoLightboxProps {
  photos: string[];
  initialIndex?: number;
  open: boolean;
  onClose: () => void;
  title?: string;
}

export const RecipePhotoLightbox: React.FC<RecipePhotoLightboxProps> = ({
  photos,
  initialIndex = 0,
  open,
  onClose,
  title,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [userRotation, setUserRotation] = useState(0); // in degrees: 0, 90, 180, 270

  // Touch tracking
  const touchStartRef = useRef<{
    touches: { x: number; y: number }[];
    distance: number;
    initialScale: number;
    initialPos: { x: number; y: number };
    time: number;
  }>({
    touches: [],
    distance: 0,
    initialScale: 1,
    initialPos: { x: 0, y: 0 },
    time: 0,
  });

  // Mouse dragging
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, initialPos: { x: 0, y: 0 } });
  const lastTapRef = useRef<number>(0);

  const currentPhoto = photos[currentIndex] || "";
  const { rotationDegrees: exifRotation, needsCssRotation } = useImageOrientation(currentPhoto);

  // Total rotation combining EXIF (if not natively handled) and manual user rotation
  const totalRotation = (userRotation + (needsCssRotation ? exifRotation : 0)) % 360;

  // Sync index when initialIndex changes or modal opens
  useEffect(() => {
    if (open) {
      setCurrentIndex(Math.max(0, Math.min(initialIndex, photos.length - 1)));
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setUserRotation(0);
    }
  }, [open, initialIndex, photos.length]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  // Reset transform when changing photo
  const resetTransform = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setUserRotation(0);
  }, []);

  const handlePrev = useCallback(() => {
    if (photos.length <= 1) return;
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
    resetTransform();
  }, [photos.length, resetTransform]);

  const handleNext = useCallback(() => {
    if (photos.length <= 1) return;
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
    resetTransform();
  }, [photos.length, resetTransform]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "+" || e.key === "=") {
        setScale((prev) => Math.min(prev + 0.5, 4));
      } else if (e.key === "-") {
        setScale((prev) => {
          const next = Math.max(prev - 0.5, 1);
          if (next === 1) setPosition({ x: 0, y: 0 });
          return next;
        });
      } else if (e.key === "0") {
        setScale(1);
        setPosition({ x: 0, y: 0 });
      } else if (e.key === "r" || e.key === "R") {
        setUserRotation((prev) => (prev + 90) % 360);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, handlePrev, handleNext]);

  // Zoom handlers
  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setScale((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleRotateCw = () => {
    setUserRotation((prev) => (prev + 90) % 360);
  };

  const handleRotateCcw = () => {
    setUserRotation((prev) => (prev + 270) % 360);
  };

  // Double tap / double click to toggle zoom
  const handleToggleZoom = (clientX: number, clientY: number) => {
    if (scale > 1) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    } else {
      // Zoom centered towards tap position
      setScale(2.5);
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      setPosition({
        x: (centerX - clientX) * 0.8,
        y: (centerY - clientY) * 0.8,
      });
    }
  };

  // Desktop Mouse Events
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialPos: { ...position },
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPosition({
      x: dragStartRef.current.initialPos.x + dx,
      y: dragStartRef.current.initialPos.y + dy,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.25 : -0.25;
    setScale((prev) => {
      const next = Math.min(Math.max(prev + delta, 1), 4);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  // Mobile Touch Events: Pinch-to-zoom, Pan, Double-tap, and Swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    const now = Date.now();
    const touches = Array.from(e.touches).map((t) => ({ x: t.clientX, y: t.clientY }));

    if (e.touches.length === 2) {
      // Pinch started
      const d = Math.hypot(touches[0].x - touches[1].x, touches[0].y - touches[1].y);
      touchStartRef.current = {
        touches,
        distance: d,
        initialScale: scale,
        initialPos: { ...position },
        time: now,
      };
    } else if (e.touches.length === 1) {
      // Single finger touch
      touchStartRef.current = {
        touches,
        distance: 0,
        initialScale: scale,
        initialPos: { ...position },
        time: now,
      };

      // Check double tap
      if (now - lastTapRef.current < 300) {
        handleToggleZoom(touches[0].x, touches[0].y);
        lastTapRef.current = 0;
      } else {
        lastTapRef.current = now;
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartRef.current.distance > 0) {
      // Pinch zoom in progress
      e.preventDefault();
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDistance = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const ratio = currentDistance / touchStartRef.current.distance;
      const newScale = Math.min(Math.max(touchStartRef.current.initialScale * ratio, 1), 4);
      setScale(newScale);

      if (newScale === 1) {
        setPosition({ x: 0, y: 0 });
      }
    } else if (e.touches.length === 1 && scale > 1) {
      // Pan image when zoomed in
      e.preventDefault();
      const currentTouch = e.touches[0];
      const startTouch = touchStartRef.current.touches[0];
      if (startTouch) {
        const dx = currentTouch.clientX - startTouch.x;
        const dy = currentTouch.clientY - startTouch.y;
        setPosition({
          x: touchStartRef.current.initialPos.x + dx,
          y: touchStartRef.current.initialPos.y + dy,
        });
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (scale <= 1) {
      // Check for horizontal swipe gesture to switch photos
      const startTouch = touchStartRef.current.touches[0];
      if (startTouch && e.changedTouches.length > 0) {
        const endTouch = e.changedTouches[0];
        const dx = endTouch.clientX - startTouch.x;
        const dy = endTouch.clientY - startTouch.y;
        // Significant horizontal swipe with minimal vertical movement
        if (Math.abs(dx) > 60 && Math.abs(dy) < 50) {
          if (dx < 0) {
            handleNext();
          } else {
            handlePrev();
          }
        }
      }
    }
  };

  if (!open || photos.length === 0) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Visionneuse de photos de préparation"
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between select-none animate-in fade-in duration-200"
    >
      {/* Top Toolbar */}
      <header className="flex items-center justify-between px-3 py-3 sm:px-6 z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div className="flex items-center gap-2 text-white/90">
          <span className="font-semibold text-sm sm:text-base">
            {photos.length > 1 ? `Photo ${currentIndex + 1} / ${photos.length}` : "Photo de préparation"}
          </span>
          {title && (
            <span className="hidden md:inline text-xs text-white/60 truncate max-w-xs border-l border-white/20 pl-2">
              {title}
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Rotation controls */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRotateCcw}
            className="w-9 h-9 text-white/80 hover:text-white hover:bg-white/10 rounded-full"
            title="Pivoter à gauche (90°)"
            aria-label="Pivoter à gauche"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleRotateCw}
            className="w-9 h-9 text-white/80 hover:text-white hover:bg-white/10 rounded-full"
            title="Pivoter à droite (90°)"
            aria-label="Pivoter à droite"
          >
            <RotateCw className="w-4 h-4" />
          </Button>

          {/* Zoom Out */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            disabled={scale <= 1}
            className="w-9 h-9 text-white/80 hover:text-white hover:bg-white/10 rounded-full disabled:opacity-30"
            title="Dézoomer"
            aria-label="Dézoomer"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>

          {/* Zoom In */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            disabled={scale >= 4}
            className="w-9 h-9 text-white/80 hover:text-white hover:bg-white/10 rounded-full disabled:opacity-30"
            title="Zoomer"
            aria-label="Zoomer"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>

          {/* Reset Zoom indicator / button */}
          {scale > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetZoom}
              className="h-9 px-2 text-xs font-semibold text-accent hover:text-accent hover:bg-accent/15 rounded-lg"
              title="Réinitialiser le zoom"
            >
              <Maximize2 className="w-3.5 h-3.5 mr-1" />
              {Math.round(scale * 100)}%
            </Button>
          )}

          {/* Open full native image in new tab */}
          <a
            href={currentPhoto}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-9 h-9 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            title="Ouvrir l'image en plein écran natif dans le navigateur"
            aria-label="Ouvrir l'image originale"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          {/* Close Lightbox */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-9 h-9 text-white/90 hover:text-white hover:bg-white/20 rounded-full ml-1"
            title="Fermer (Échap)"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Image Stage */}
      <main
        className="flex-1 relative flex items-center justify-center overflow-hidden touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={(e) => handleToggleZoom(e.clientX, e.clientY)}
      >
        <div
          className="relative transition-transform duration-75 flex items-center justify-center max-w-full max-h-full p-2 sm:p-4"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${totalRotation}deg)`,
            cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in",
          }}
        >
          <img
            key={currentPhoto}
            src={currentPhoto}
            alt={title || `Photo ${currentIndex + 1}`}
            className="max-h-[82vh] max-w-[95vw] object-contain rounded-lg shadow-2xl pointer-events-none select-none"
            style={{
              imageOrientation: "from-image",
            }}
            draggable={false}
          />
        </div>

        {/* Previous Button */}
        {photos.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-20 backdrop-blur-xs border border-white/10"
            aria-label="Photo précédente"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Next Button */}
        {photos.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-20 backdrop-blur-xs border border-white/10"
            aria-label="Photo suivante"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </main>

      {/* Bottom Footer & Thumbnail Strip */}
      <footer className="z-20 px-4 py-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col items-center gap-2">
        {/* Help hint for mobile & desktop */}
        <div className="text-[11px] text-white/50 text-center flex items-center gap-2">
          <span>Pincez ou double-cliquez pour zoomer</span>
          <span>•</span>
          <span>Glissez pour vous déplacer</span>
          {photos.length > 1 && (
            <>
              <span>•</span>
              <span>Balayez pour naviguer</span>
            </>
          )}
        </div>

        {/* Thumbnails if multiple photos */}
        {photos.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1 px-2 scrollbar-none">
            {photos.map((url, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setCurrentIndex(idx);
                  resetTransform();
                }}
                className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                  idx === currentIndex
                    ? "border-accent scale-105 shadow-md shadow-accent/20"
                    : "border-white/30 opacity-60 hover:opacity-100"
                }`}
                aria-label={`Aller à la photo ${idx + 1}`}
              >
                <img
                  src={url}
                  alt={`Vignette ${idx + 1}`}
                  className="w-full h-full object-cover"
                  style={{ imageOrientation: "from-image" }}
                />
              </button>
            ))}
          </div>
        )}
      </footer>
    </div>
  );
};
