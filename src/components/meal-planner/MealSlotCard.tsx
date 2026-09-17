import React, { useState } from "react";
import { 
  MealPlanWithRecipe, 
  MealPlanSlot, 
  RecipeWithDetails 
} from "@/types/database";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  Users, 
  Plus, 
  MoreVertical, 
  Trash2, 
  MoveRight, 
  Eye, 
  Sparkles, 
  Check, 
  Utensils, 
  ChefHat, 
  GripVertical 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RecipeImage } from "@/components/RecipeImage";
import { useNavigate } from "react-router-dom";
import { useStock } from "@/hooks/useStock";
import { analyzeRecipeStock } from "@/lib/stock-matching";

interface MealSlotCardProps {
  dateKey: string;
  dayName: string;
  slot: MealPlanSlot;
  plan?: MealPlanWithRecipe;
  onOpenAssign: (dateKey: string, slot: MealPlanSlot) => void;
  onRemove: (planId: string) => void;
  onUpdateServings: (planId: string, servings: number) => void;
  onMoveSlot: (fromPlanId: string, toDate: string, toSlot: MealPlanSlot) => void;
  onSelectRecipeDetails?: (recipe: any) => void;
}

export const MealSlotCard: React.FC<MealSlotCardProps> = ({
  dateKey,
  dayName,
  slot,
  plan,
  onOpenAssign,
  onRemove,
  onUpdateServings,
  onMoveSlot,
  onSelectRecipeDetails,
}) => {
  const navigate = useNavigate();
  const { stock } = useStock();
  const [isDragOver, setIsDragOver] = useState(false);

  const slotLabel = slot === "lunch" ? "Midi" : "Soir";
  const slotIcon = slot === "lunch" ? "☀️" : "🌙";

  const recipe = plan?.recipe || plan?.recipe_snapshot;
  const recipeTitle = plan?.custom_title || recipe?.title;
  const servings = plan?.servings || 2;

  // Stock status calculation if recipe has ingredients
  const stockAnalysis = React.useMemo(() => {
    if (!recipe?.ingredients || recipe.ingredients.length === 0) return null;
    return analyzeRecipeStock(recipe.ingredients as any, stock, servings / (recipe.servings || 2));
  }, [recipe, stock, servings]);

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent) => {
    if (!plan) return;
    e.dataTransfer.setData("text/plain", JSON.stringify({ planId: plan.id, fromDate: dateKey, fromSlot: slot }));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    try {
      const dataStr = e.dataTransfer.getData("text/plain");
      if (!dataStr) return;
      const data = JSON.parse(dataStr);
      if (data.planId && (data.fromDate !== dateKey || data.fromSlot !== slot)) {
        onMoveSlot(data.planId, dateKey, slot);
      }
    } catch (err) {
      console.error("Drop parse error", err);
    }
  };

  // View recipe click handler
  const handleViewRecipe = () => {
    if (plan?.recipe_id) {
      navigate(`/recipe/${plan.recipe_id}`);
    } else if (onSelectRecipeDetails && recipe) {
      onSelectRecipeDetails(recipe);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`transition-all duration-200 rounded-xl ${
        isDragOver ? "ring-2 ring-primary ring-offset-2 bg-primary/5" : ""
      }`}
    >
      {!plan ? (
        // Empty slot state
        <button
          type="button"
          onClick={() => onOpenAssign(dateKey, slot)}
          className="w-full text-left group border border-dashed border-border/80 hover:border-primary/60 bg-card/40 hover:bg-card rounded-xl p-3 flex items-center justify-between transition-all"
        >
          <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground">
            <span className="text-sm font-medium">{slotIcon}</span>
            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
              Ajouter le {slotLabel.toLowerCase()}
            </span>
          </div>
          <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <Plus className="w-3.5 h-3.5" />
          </div>
        </button>
      ) : (
        // Populated meal plan slot
        <Card
          draggable
          onDragStart={handleDragStart}
          className="overflow-hidden border border-border/70 hover:border-primary/40 hover:shadow-sm transition-all relative group bg-card"
        >
          <div className="flex items-stretch min-h-[76px]">
            {/* Drag Handle on desktop / left grab indicator */}
            <div 
              title="Glisser-déposer pour réorganiser"
              className="w-5 bg-muted/20 flex items-center justify-center cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-foreground shrink-0 border-r border-border/30"
            >
              <GripVertical className="w-3.5 h-3.5" />
            </div>

            {/* Thumbnail Image */}
            {recipe?.image_url ? (
              <div 
                className="w-20 relative cursor-pointer shrink-0 overflow-hidden" 
                onClick={handleViewRecipe}
              >
                <RecipeImage
                  src={recipe.image_url}
                  alt={recipeTitle || "Repas"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-xs text-white text-[9px] font-semibold px-1 rounded">
                  {slotLabel}
                </div>
              </div>
            ) : (
              <div 
                className="w-14 bg-primary/10 flex items-center justify-center cursor-pointer shrink-0" 
                onClick={handleViewRecipe}
              >
                <Utensils className="w-5 h-5 text-primary" />
              </div>
            )}

            {/* Main content */}
            <div className="flex-1 p-2.5 min-w-0 flex flex-col justify-between">
              <div className="flex items-start justify-between gap-1">
                <div className="min-w-0 flex-1 cursor-pointer" onClick={handleViewRecipe}>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-0.5">
                      {slotIcon} {slotLabel}
                    </span>
                    {stockAnalysis && (
                      <span
                        className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-full flex items-center gap-0.5 ${
                          stockAnalysis.isCookable
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        }`}
                      >
                        {stockAnalysis.isCookable ? (
                          <>
                            <Check className="w-2.5 h-2.5" /> En stock
                          </>
                        ) : (
                          `${stockAnalysis.missingCount} manquant${stockAnalysis.missingCount > 1 ? "s" : ""}`
                        )}
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {recipeTitle}
                  </h4>
                </div>

                {/* Dropdown Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 -mr-1 text-muted-foreground hover:text-foreground">
                      <MoreVertical className="w-3.5 h-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    {plan.recipe_id && (
                      <DropdownMenuItem onClick={handleViewRecipe} className="text-xs">
                        <Eye className="w-3.5 h-3.5 mr-2" /> Voir la recette
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onOpenAssign(dateKey, slot)} className="text-xs">
                      <Sparkles className="w-3.5 h-3.5 mr-2" /> Remplacer
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onMoveSlot(plan.id, dateKey, slot === "lunch" ? "dinner" : "lunch")}
                      className="text-xs"
                    >
                      <MoveRight className="w-3.5 h-3.5 mr-2" />
                      Basculer au {slot === "lunch" ? "soir" : "midi"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onRemove(plan.id)} 
                      className="text-xs text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-2" /> Retirer du planning
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Bottom line: Time & Servings Stepper */}
              <div className="flex items-center justify-between mt-1 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-2">
                  {((recipe?.prep_time || 0) + (recipe?.cook_time || 0) > 0) && (
                    <span className="flex items-center gap-0.5">
                      <Clock className="w-3 h-3" />
                      {(recipe?.prep_time || 0) + (recipe?.cook_time || 0)} min
                    </span>
                  )}
                  {recipe?.difficulty && (
                    <span className="capitalize">{recipe.difficulty}</span>
                  )}
                </div>

                {/* Servings stepper */}
                <div className="flex items-center gap-1 bg-muted/60 rounded-md px-1.5 py-0.5" title="Nombre de portions">
                  <Users className="w-2.5 h-2.5 text-muted-foreground" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (servings > 1) onUpdateServings(plan.id, servings - 1);
                    }}
                    className="hover:text-primary font-bold px-0.5 cursor-pointer text-[11px]"
                  >
                    -
                  </button>
                  <span className="font-semibold text-foreground">{servings}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (servings < 12) onUpdateServings(plan.id, servings + 1);
                    }}
                    className="hover:text-primary font-bold px-0.5 cursor-pointer text-[11px]"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
