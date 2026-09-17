import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  Check,
  ChefHat,
  Sun,
  Moon,
  Maximize2,
  Minimize2,
  Utensils,
  Lightbulb,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { useWakeLock } from "@/hooks/useWakeLock";
import { parseRecipeSteps } from "@/lib/recipe-step-parser";
import {
  segmentTextWithDurations,
  TextSegment,
  requestNotificationPermission,
} from "@/lib/cooking-timer";
import {
  findIngredientSubstitution,
  IngredientSubstitution,
} from "@/lib/ingredient-substitutions";
import { CookingTimerWidget } from "@/components/recipe/CookingTimerWidget";
import { CookingSubstitutionsModal } from "@/components/recipe/CookingSubstitutionsModal";
import { RecipeWithDetails } from "@/types/database";

interface CookingModeModalProps {
  open: boolean;
  onClose: () => void;
  recipe: RecipeWithDetails;
  servings: number;
  onFinishCook?: () => void;
}

export const CookingModeModal: React.FC<CookingModeModalProps> = ({
  open,
  onClose,
  recipe,
  servings,
  onFinishCook,
}) => {
  // Screen Wake Lock
  const wakeLock = useWakeLock(open);

  // Steps
  const steps = useMemo(() => {
    return parseRecipeSteps(recipe.instructions);
  }, [recipe.instructions]);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Checked ingredients in cooking mode
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());

  // Ingredients Drawer
  const [showIngredientsSheet, setShowIngredientsSheet] = useState(false);

  // Substitutions modal
  const [showSubstitutionsModal, setShowSubstitutionsModal] = useState(false);
  const [substitutionSearch, setSubstitutionSearch] = useState("");

  // Timer state
  const [activeTimerSeconds, setActiveTimerSeconds] = useState<number>(0);
  const [timerLabel, setTimerLabel] = useState<string>("Minuteur");
  const [showTimerWidget, setShowTimerWidget] = useState<boolean>(false);

  // Fullscreen toggle (HTML5 Fullscreen API)
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Scale ratio for ingredients
  const initialServings = recipe.servings || 4;
  const scale = servings / initialServings;

  // Request notification permission when cooking mode opens
  useEffect(() => {
    if (open) {
      requestNotificationPermission();
      setCurrentStepIndex(0);
    }
  }, [open]);

  // Handle Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Navigation handlers
  const goToNextStep = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  }, [currentStepIndex, steps.length]);

  const goToPrevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        goToNextStep();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        goToPrevStep();
      } else if (e.key === "Escape") {
        // If modal/sheet is open, let that close first
        if (!showIngredientsSheet && !showSubstitutionsModal) {
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, goToNextStep, goToPrevStep, showIngredientsSheet, showSubstitutionsModal, onClose]);

  // Touch swipe support
  const touchStartXRef = React.useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchEndX - touchStartXRef.current;
    const swipeThreshold = 60; // min distance in px

    if (diffX < -swipeThreshold) {
      // Swiped left -> next step
      goToNextStep();
    } else if (diffX > swipeThreshold) {
      // Swiped right -> prev step
      goToPrevStep();
    }
    touchStartXRef.current = null;
  };

  // Launch a timer
  const handleLaunchTimer = (seconds: number, label: string) => {
    setActiveTimerSeconds(seconds);
    setTimerLabel(label);
    setShowTimerWidget(true);
  };

  // Current step details
  const currentStep = steps[currentStepIndex] || { stepNumber: 1, text: "" };
  const stepSegments = useMemo(() => {
    return segmentTextWithDurations(currentStep.text);
  }, [currentStep.text]);

  // Contextual substitution for the current step:
  // Detect if any recipe ingredient mentioned in this step has a substitute
  const stepSubstitutions = useMemo(() => {
    if (!recipe.ingredients) return [];
    const detected: Array<{ ingredientName: string; sub: IngredientSubstitution }> = [];
    const stepLower = currentStep.text.toLowerCase();

    for (const ing of recipe.ingredients) {
      const ingNameLower = ing.name.toLowerCase();
      // Check if ingredient name is found in the current step instruction
      if (stepLower.includes(ingNameLower) || ingNameLower.split(" ").some((word) => word.length > 3 && stepLower.includes(word))) {
        const sub = findIngredientSubstitution(ing.name);
        if (sub && !detected.some((d) => d.sub.key === sub.key)) {
          detected.push({ ingredientName: ing.name, sub });
        }
      }
    }
    return detected;
  }, [currentStep.text, recipe.ingredients]);

  const toggleIngredientCheck = (name: string) => {
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const openSubstitutionsFor = (name: string) => {
    setSubstitutionSearch(name);
    setShowSubstitutionsModal(true);
  };

  if (!open) return null;

  const progressPercent = ((currentStepIndex + 1) / steps.length) * 100;
  const isLastStep = currentStepIndex === steps.length - 1;

  return (
    <div
      className="fixed inset-0 z-50 bg-background text-foreground flex flex-col select-none overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Header Bar */}
      <header className="h-16 border-b border-border/60 bg-card/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-3 shrink-0">
        {/* Left: Close button + Recipe Title */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground shrink-0"
            title="Quitter le mode cuisine"
          >
            <X className="w-5 h-5" />
          </Button>

          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold truncate text-foreground flex items-center gap-2">
              <span>{recipe.title}</span>
              <Badge variant="outline" className="hidden sm:inline-flex text-[11px] font-semibold py-0 px-2 bg-muted/60">
                {servings} portions
              </Badge>
            </h1>
            <p className="text-[11px] text-muted-foreground">Mode Cuisine Mains-Libres</p>
          </div>
        </div>

        {/* Right Controls: WakeLock, Ingredients, Fullscreen */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Wake Lock indicator / toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={wakeLock.toggle}
            className={`h-9 px-2.5 rounded-full text-xs font-semibold gap-1.5 transition-colors border shadow-xs ${
              wakeLock.isActive
                ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40"
                : "bg-muted/40 text-muted-foreground border-border/60"
            }`}
            title={wakeLock.isActive ? "Écran maintenu allumé (cliquer pour désactiver)" : "Maintien de l'écran désactivé"}
          >
            {wakeLock.isActive ? (
              <>
                <Sun className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />
                <span className="hidden md:inline">Écran allumé</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Veille active</span>
              </>
            )}
          </Button>

          {/* Quick Ingredients Sheet Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowIngredientsSheet(true)}
            className="h-9 px-3 rounded-full text-xs font-semibold gap-1.5 bg-background shadow-xs hover:bg-accent hover:text-accent-foreground border-border/80"
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Ingrédients</span>
            {recipe.ingredients && (
              <span className="text-[10px] bg-muted px-1.5 py-0.2 rounded-full font-bold">
                {checkedIngredients.size}/{recipe.ingredients.length}
              </span>
            )}
          </Button>

          {/* Substitutions Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => openSubstitutionsFor("")}
            className="h-9 px-2.5 rounded-full text-xs font-semibold gap-1.5 bg-background shadow-xs hover:bg-accent hover:text-accent-foreground border-border/80 hidden sm:flex"
            title="Consulter les substitutions d'ingrédients"
          >
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span className="hidden md:inline">Substitutions</span>
          </Button>

          {/* Quick Custom Timer launcher button */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleLaunchTimer(activeTimerSeconds > 0 ? activeTimerSeconds : 300, "Minuteur cuisine")}
            className="w-9 h-9 rounded-full bg-background shadow-xs hover:bg-accent hover:text-accent-foreground border-border/80"
            title="Lancer un minuteur"
          >
            <Clock className="w-4 h-4" />
          </Button>

          {/* Fullscreen toggle button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="w-9 h-9 rounded-full text-muted-foreground hover:text-foreground hidden sm:flex"
            title={isFullscreen ? "Quitter le plein écran" : "Passer en plein écran"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-muted/40 h-1.5">
        <Progress value={progressPercent} className="h-1.5 rounded-none bg-transparent" />
      </div>

      {/* Main Hands-Free Step Canvas */}
      <main className="flex-1 overflow-y-auto p-6 sm:p-10 flex flex-col justify-between max-w-4xl mx-auto w-full">
        <div className="space-y-6">
          {/* Step header pill */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Badge className="bg-primary text-primary-foreground text-sm sm:text-base font-bold px-3 py-1 rounded-xl shadow-xs">
                Étape {currentStepIndex + 1} / {steps.length}
              </Badge>
              <span className="text-xs sm:text-sm text-muted-foreground font-medium">
                {Math.round(progressPercent)}% complété
              </span>
            </div>

            <div className="flex items-center gap-1">
              {steps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentStepIndex
                      ? "w-6 bg-primary"
                      : idx < currentStepIndex
                      ? "w-2 bg-primary/40"
                      : "w-2 bg-muted"
                  }`}
                  aria-label={`Aller à l'étape ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Huge Step Instruction Text - high readability on countertop */}
          <div className="bg-card/40 border border-border/70 rounded-3xl p-6 sm:p-10 shadow-xs">
            <div className="text-xl sm:text-2xl md:text-3xl font-medium leading-relaxed sm:leading-loose text-foreground">
              {stepSegments.map((segment: TextSegment, idx: number) => {
                if (segment.type === "duration" && segment.seconds) {
                  return (
                    <button
                      key={idx}
                      onClick={() =>
                        handleLaunchTimer(segment.seconds!, `Étape ${currentStepIndex + 1} (${segment.label})`)
                      }
                      className="inline-flex items-center gap-1.5 font-bold text-accent bg-accent/15 hover:bg-accent/25 active:scale-95 transition-all px-2.5 py-1 mx-1.5 rounded-xl text-lg sm:text-xl border border-accent/30 shadow-xs cursor-pointer align-baseline"
                      title="Cliquez pour lancer ce minuteur"
                    >
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-accent animate-pulse" />
                      <span>{segment.content}</span>
                    </button>
                  );
                }
                return <span key={idx}>{segment.content}</span>;
              })}
            </div>
          </div>

          {/* Contextual Substitution Helper for this step */}
          {stepSubstitutions.length > 0 && (
            <div className="bg-accent/10 border border-accent/25 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-accent">
                <Lightbulb className="w-4 h-4" />
                <span>Astuce d'ingrédient pour cette étape :</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {stepSubstitutions.map(({ ingredientName, sub }) => (
                  <button
                    key={sub.key}
                    onClick={() => openSubstitutionsFor(ingredientName)}
                    className="text-xs text-left p-2 rounded-xl bg-background/80 hover:bg-background border border-accent/30 transition-colors shadow-2xs"
                  >
                    <span className="font-semibold text-foreground">Pas de {ingredientName} ? </span>
                    <span className="text-muted-foreground">{sub.quickHint.replace(/^Pas de [^?]+\?\s*/i, "")}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Floating / Docked Timer Widget if active */}
        {showTimerWidget && (
          <div className="mt-6 mb-2">
            <CookingTimerWidget
              initialSeconds={activeTimerSeconds}
              label={timerLabel}
              onClose={() => setShowTimerWidget(false)}
            />
          </div>
        )}

        {/* Bottom Giant Touch Buttons */}
        <div className="pt-6 border-t border-border/40 mt-6 flex items-center justify-between gap-4">
          <Button
            size="lg"
            variant="outline"
            disabled={currentStepIndex === 0}
            onClick={goToPrevStep}
            className="h-14 sm:h-16 px-6 sm:px-8 rounded-2xl text-sm sm:text-base font-bold gap-2 bg-background border-border/80 shadow-xs active:scale-98"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            <span>Précédent</span>
          </Button>

          {isLastStep ? (
            <Button
              size="lg"
              onClick={() => {
                if (onFinishCook) {
                  onFinishCook();
                } else {
                  onClose();
                }
              }}
              className="h-14 sm:h-16 flex-1 sm:flex-initial sm:px-10 rounded-2xl text-sm sm:text-base font-bold gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md active:scale-98"
            >
              <ChefHat className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>J'ai terminé la recette !</span>
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={goToNextStep}
              className="h-14 sm:h-16 flex-1 sm:flex-initial sm:px-10 rounded-2xl text-sm sm:text-base font-bold gap-2 bg-accent text-accent-foreground hover:bg-accent/90 shadow-md active:scale-98"
            >
              <span>Suivant</span>
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
          )}
        </div>
      </main>

      {/* Slide-over Sheet for Recipe Ingredients & Checkmarks */}
      <Sheet open={showIngredientsSheet} onOpenChange={setShowIngredientsSheet}>
        <SheetContent side="right" className="w-full sm:max-w-md p-6 flex flex-col">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <SheetTitle className="text-lg font-bold flex items-center gap-2">
                <Utensils className="w-5 h-5 text-accent" />
                <span>Ingrédients ({servings} portions)</span>
              </SheetTitle>
              <Badge variant="secondary" className="text-xs">
                {checkedIngredients.size}/{recipe.ingredients?.length || 0} prêts
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Cochez les ingrédients préparés au fil de la recette.
            </p>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto space-y-2.5 mt-4 pr-1">
            {recipe.ingredients?.map((ing, idx) => {
              const qty = ing.quantity ? ing.quantity * scale : null;
              const formattedQty = qty ? Number(qty.toFixed(1)).toString() : "";
              const isChecked = checkedIngredients.has(ing.name);
              const sub = findIngredientSubstitution(ing.name);

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border transition-all ${
                    isChecked
                      ? "bg-muted/30 border-border/40 opacity-70"
                      : "bg-card border-border/80 shadow-xs"
                  }`}
                >
                  <label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => toggleIngredientCheck(ing.name)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <span
                          className={`font-semibold text-sm truncate ${
                            isChecked ? "line-through text-muted-foreground" : "text-foreground"
                          }`}
                        >
                          {ing.name}
                        </span>
                        <span className="text-xs font-bold text-accent shrink-0">
                          {formattedQty} {ing.unit !== "piece" ? ing.unit : ""}
                        </span>
                      </div>
                    </div>
                  </label>

                  {/* Substitution trigger button if available */}
                  {sub && (
                    <div className="mt-2 pt-2 border-t border-border/40 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-muted-foreground truncate">
                        Pas de {ing.name} ?
                      </span>
                      <button
                        onClick={() => openSubstitutionsFor(ing.name)}
                        className="text-[11px] font-semibold text-accent hover:underline flex items-center gap-1 shrink-0"
                      >
                        <Sparkles className="w-3 h-3" />
                        Voir substitut
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-border/60">
            <Button
              className="w-full h-11 text-xs font-bold rounded-xl"
              onClick={() => setShowIngredientsSheet(false)}
            >
              Reprendre la cuisine
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Substitutions Browse Modal */}
      <CookingSubstitutionsModal
        open={showSubstitutionsModal}
        onOpenChange={setShowSubstitutionsModal}
        recipeIngredients={recipe.ingredients || []}
        initialSearch={substitutionSearch}
      />
    </div>
  );
};
