import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    containerClassName?: string;
    aspectRatio?: "square" | "video" | "auto";
    fallbackIcon?: React.ReactNode;
}

export const OptimizedImage = ({
    src,
    alt,
    className,
    containerClassName,
    aspectRatio = "auto",
    fallbackIcon,
    loading = "lazy",
    ...props
}: OptimizedImageProps) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    // Reset state and check cache if src changes
    useEffect(() => {
        if (!src) {
            setHasError(true);
            return;
        }
        
        setHasError(false);
        
        // Critical: Check if image is already complete (cached)
        // We check the ref if it exists, or create a dummy to check the URL
        const img = new Image();
        img.src = src;
        if (img.complete) {
            setIsLoaded(true);
        } else {
            setIsLoaded(false);
        }
    }, [src]);

    const aspectClasses = {
        square: "aspect-square",
        video: "aspect-video",
        auto: "",
    };

    if (!src || hasError) {
        return (
            <div
                className={cn(
                    "w-full h-full bg-muted flex items-center justify-center overflow-hidden",
                    aspectClasses[aspectRatio],
                    containerClassName
                )}
            >
                {fallbackIcon || <div className="text-muted-foreground/20 italic text-xs">Image non disponible</div>}
            </div>
        );
    }

    return (
        <div className={cn("relative overflow-hidden w-full h-full bg-muted/10", aspectClasses[aspectRatio], containerClassName)}>
            {/* Skeleton placeholder shown during load */}
            {!isLoaded && (
                <Skeleton className="absolute inset-0 w-full h-full z-0 animate-pulse bg-muted/30" />
            )}
            
            <img
                key={src} // Force fresh element on src change to ensure onLoad fires
                ref={imgRef}
                src={src}
                alt={alt}
                loading={loading}
                className={cn(
                    "w-full h-full object-cover transition-opacity duration-300 ease-in-out",
                    isLoaded ? "opacity-100" : "opacity-0",
                    className
                )}
                onLoad={() => setIsLoaded(true)}
                onError={() => setHasError(true)}
                {...props}
            />
        </div>
    );
};
