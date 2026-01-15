
import { cn } from "@/lib/utils";
import { ChefHat } from "lucide-react";
import { useState, useEffect } from "react";

interface RecipeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    containerClassName?: string;
}

export const RecipeImage = ({ src, alt, className, containerClassName, ...props }: RecipeImageProps) => {
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setHasError(false);
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
        <img
            src={src}
            alt={alt}
            className={cn("w-full h-full object-cover", className)}
            onError={() => setHasError(true)}
            {...props}
        />
    );
};
