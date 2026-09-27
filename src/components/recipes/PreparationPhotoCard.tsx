import React from "react";
import { ZoomIn } from "lucide-react";
import { useImageOrientation } from "@/utils/imageExif";

interface PreparationPhotoCardProps {
  url: string;
  index: number;
  total: number;
  onClick: () => void;
}

export const PreparationPhotoCard: React.FC<PreparationPhotoCardProps> = ({
  url,
  index,
  total,
  onClick,
}) => {
  const { rotationDegrees, needsCssRotation } = useImageOrientation(url);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="group relative rounded-2xl overflow-hidden border border-border/70 bg-muted/40 shadow-xs hover:shadow-md transition-all cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-accent active:scale-[0.99]"
      aria-label={`Agrandir la photo de préparation ${index + 1} sur ${total}`}
    >
      <div className="relative w-full overflow-hidden bg-muted/20 flex items-center justify-center min-h-[220px] max-h-[420px]">
        <img
          src={url}
          alt={`Photo de préparation ${index + 1}`}
          loading="lazy"
          className="w-full h-auto object-contain max-h-[420px] transition-transform duration-300 group-hover:scale-[1.02]"
          style={{
            imageOrientation: "from-image",
            ...(needsCssRotation && rotationDegrees !== 0
              ? { transform: `rotate(${rotationDegrees}deg)` }
              : {}),
          }}
        />

        {/* Hover / Tap overlay */}
        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/75 text-white text-xs font-semibold backdrop-blur-xs shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <ZoomIn className="w-3.5 h-3.5 text-accent" />
            Agrandir
          </span>
        </div>

        {/* Badge on mobile/desktop bottom right */}
        <div className="absolute bottom-2.5 right-2.5 sm:hidden">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 text-white text-[11px] font-medium backdrop-blur-xs">
            <ZoomIn className="w-3 h-3 text-accent" />
            Zoom
          </span>
        </div>
      </div>
    </div>
  );
};
