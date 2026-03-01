
import { cn } from "@/lib/utils";
import { ChefHat } from "lucide-react";
import { useState, useEffect } from "react";

interface RecipeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    containerClassName?: string;
}

export const RecipeImage = ({ src, alt, className, containerClassName, ...props }: RecipeImageProps) => {
    const [hasError, setHasError] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setHasError(false);
        setIsLoaded(false);
    }, [src]);

    if (!src || hasError) {
        return (
            <div
                className={cn(
                    "w-full h-full bg-gradient-to-br from-primary/5 via-muted to-accent/5 flex items-center justify-center overflow-hidden",
                    className
                )}
            >
                <ChefHat className="w-1/3 h-1/3 text-muted-foreground/20" />
            </div>
        );
    }

    return (
        <div className={cn("relative w-full h-full overflow-hidden", containerClassName)}>
            {!isLoaded && (
                <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
                    <ChefHat className="w-1/4 h-1/4 text-muted-foreground/10" />
                </div>
            )}
            <img
                src={src}
                alt={alt}
                className={cn(
                    "w-full h-full object-cover transition-opacity duration-500",
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
