import { useState, useEffect } from "react";
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
    ...props
}: OptimizedImageProps) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    // Reset state if src changes
    useEffect(() => {
        setIsLoaded(false);
        setHasError(false);
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
        <div className={cn("relative overflow-hidden w-full h-full", aspectClasses[aspectRatio], containerClassName)}>
            {/* Skeleton placeholder shown during load */}
            {!isLoaded && (
                <Skeleton className="absolute inset-0 w-full h-full z-0" />
            )}
            
            <img
                src={src}
                alt={alt}
                loading="lazy"
                decoding="async"
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
