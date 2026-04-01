import { ChefHat } from "lucide-react";
import { OptimizedImage } from "./OptimizedImage";
import { cn } from "@/lib/utils";

interface RecipeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    containerClassName?: string;
}

export const RecipeImage = ({ src, alt, className, containerClassName, ...props }: RecipeImageProps) => {
    return (
        <OptimizedImage
            src={src}
            alt={alt || "Image de la recette"}
            className={className}
            containerClassName={containerClassName}
            fallbackIcon={
                <div className={cn(
                    "w-full h-full bg-gradient-to-br from-primary/5 via-muted to-accent/5 flex items-center justify-center overflow-hidden",
                    className
                )}>
                    <ChefHat className="w-1/3 h-1/3 text-muted-foreground/20" />
                </div>
            }
            {...props}
        />
    );
};
