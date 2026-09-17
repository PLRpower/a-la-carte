import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Loader2 } from "lucide-react";

interface RecipeQRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

export const RecipeQRCode = ({ value, size = 180, className = "" }: RecipeQRCodeProps) => {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(value, {
      width: size * 2, // 2x for sharp retina display
      margin: 2,
      color: {
        dark: "#1c1917", // warm deep charcoal
        light: "#ffffff",
      },
    })
      .then((url) => {
        if (isMounted) {
          setDataUrl(url);
          setError(null);
        }
      })
      .catch((err) => {
        console.error("QR Code generation failed:", err);
        if (isMounted) setError("Erreur QR Code");
      });

    return () => {
      isMounted = false;
    };
  }, [value, size]);

  if (error) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex items-center justify-center bg-muted text-xs text-destructive rounded-xl border ${className}`}
      >
        {error}
      </div>
    );
  }

  if (!dataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex items-center justify-center bg-muted/40 rounded-xl border animate-pulse ${className}`}
      >
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <img
      src={dataUrl}
      alt="QR Code pour partager la recette"
      width={size}
      height={size}
      className={`rounded-xl shadow-xs border border-border/80 bg-white ${className}`}
    />
  );
};
