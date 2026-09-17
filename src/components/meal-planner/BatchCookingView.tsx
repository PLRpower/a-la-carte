import React, { useState, useEffect } from "react";
import { 
  RecipeWithDetails, 
  MealPlanRecipeSnapshot, 
  BatchCookingTask 
} from "@/types/database";
import { 
  generateBatchCookingSession 
} from "@/lib/meal-planner-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { RecipeImage } from "@/components/RecipeImage";
import { 
  Clock, 
  Flame, 
  Sparkles, 
  CheckCircle2, 
  Boxes, 
  Timer, 
  Play, 
  Pause, 
  RotateCcw, 
  ChefHat, 
  Layers, 
  Calendar, 
  Snowflake, 
  Refrigerator 
} from "lucide-react";

interface BatchCookingViewProps {
  availableRecipes: Array<RecipeWithDetails | MealPlanRecipeSnapshot>;
  onNavigateToCalendar: () => void;
}

export const BatchCookingView: React.FC<BatchCookingViewProps> = ({
  availableRecipes,
  onNavigateToCalendar,
}) => {
  // Select up to 4 recipes by default
  const [selectedTitles, setSelectedTitles] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    availableRecipes.slice(0, 4).forEach((r) => initial.add(r.title));
    return initial;
  });

  const selectedRecipes = availableRecipes.filter((r) => selectedTitles.has(r.title));

  const session = React.useMemo(() => {
    return generateBatchCookingSession(selectedRecipes);
  }, [selectedRecipes]);

  // Track completed tasks
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());

  // Simple integrated cooking timer
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const startTimerWithMinutes = (minutes: number) => {
    setTimerSeconds(minutes * 60);
    setIsTimerRunning(true);
  };

  const toggleRecipeSelection = (title: string) => {
    setSelectedTitles((prev) => {
      const next = new Set(prev);
      if (next.has(title)) {
        if (next.size > 1) next.delete(title);
      } else {
        if (next.size < 5) next.add(title);
      }
      return next;
    });
  };

  const toggleTask = (taskId: string) => {
    setCompletedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const progressPercent = session.tasks.length > 0
    ? Math.round((completedTaskIds.size / session.tasks.length) * 100)
    : 0;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in-50 duration-300">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/20 via-primary/15 to-accent/20 border border-primary/25 p-5 text-foreground">
        <div className="flex items-start justify-between gap-4 relative z-10">
          <div>
            <Badge className="bg-amber-600 text-white hover:bg-amber-700 text-[10px] mb-2">
              Le rituel du week-end
            </Badge>
            <h2 className="text-xl font-bold tracking-tight mb-1">
              Session Batch Cooking Unifiée
            </h2>
            <p className="text-xs text-muted-foreground max-w-md">
              Cuisinez 3 à 4 repas en une seule session optimisée. Toutes les découpes et cuissons
              sont fusionnées pour libérer vos soirées de la semaine.
            </p>
          </div>
          <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-primary/20 items-center justify-center text-primary shrink-0">
            <ChefHat className="w-8 h-8" />
          </div>
        </div>

        {/* Time Savings Stats */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-border/40">
          <div className="p-2 bg-background/60 backdrop-blur-xs rounded-xl text-center">
            <span className="text-[10px] text-muted-foreground block">Session totale</span>
            <span className="text-sm font-bold text-foreground flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5 text-primary" />
              ~{session.estimatedTotalMinutes} min
            </span>
          </div>
          <div className="p-2 bg-emerald-500/15 backdrop-blur-xs border border-emerald-500/20 rounded-xl text-center">
            <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-medium block">
              Temps économisé
            </span>
            <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              ~{session.savedMinutes} min
            </span>
          </div>
          <div className="p-2 bg-background/60 backdrop-blur-xs rounded-xl text-center">
            <span className="text-[10px] text-muted-foreground block">Repas prêts</span>
            <span className="text-sm font-bold text-foreground flex items-center justify-center gap-1">
              <Boxes className="w-3.5 h-3.5 text-amber-600" />
              {selectedRecipes.length} plats
            </span>
          </div>
        </div>
      </div>

      {/* Recipe Selector for Batch Cooking */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-primary" />
            Recettes incluses ({selectedRecipes.length}/4)
          </h3>
          <span className="text-[11px] text-muted-foreground">Cliquez pour ajouter/retirer</span>
        </div>

        {availableRecipes.length === 0 ? (
          <Card className="p-6 text-center border-dashed">
            <p className="text-xs text-muted-foreground mb-3">
              Aucune recette planifiée dans votre menu de la semaine.
            </p>
            <Button size="sm" variant="outline" onClick={onNavigateToCalendar} className="text-xs">
              <Calendar className="w-3.5 h-3.5 mr-1.5" /> Planifier des recettes d'abord
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {availableRecipes.slice(0, 8).map((recipe) => {
              const isSelected = selectedTitles.has(recipe.title);
              return (
                <button
                  key={recipe.title}
                  type="button"
                  onClick={() => toggleRecipeSelection(recipe.title)}
                  className={`p-2 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between h-28 group ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-xs"
                      : "border-border/60 bg-card opacity-50 hover:opacity-80"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-[11px] font-semibold line-clamp-2 text-foreground">
                      {recipe.title}
                    </span>
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
                        isSelected ? "bg-primary text-primary-foreground" : "border border-muted-foreground/50"
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                    <span>{(recipe.prep_time || 0) + (recipe.cook_time || 0)} min</span>
                    <span className="capitalize">{recipe.difficulty || "facile"}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Interactive Cooking Assistant: Progress & Timer */}
      <Card className="border border-border/80 shadow-xs">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Avancement de la session</span>
            </CardTitle>
            <span className="text-xs font-bold text-primary">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2 mt-2" />
        </CardHeader>

        <CardContent className="p-4 pt-2">
          {/* Integrated Timer */}
          <div className="p-3 bg-muted/40 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-background border flex items-center justify-center text-primary">
                <Timer className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block font-medium">Minuteur cuisine</span>
                <span className="text-lg font-mono font-bold text-foreground">
                  {timerSeconds > 0 ? formatTimer(timerSeconds) : "00:00"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {timerSeconds > 0 ? (
                <>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8"
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                  >
                    {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground"
                    onClick={() => {
                      setIsTimerRunning(false);
                      setTimerSeconds(0);
                    }}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </Button>
                </>
              ) : (
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs px-2"
                    onClick={() => startTimerWithMinutes(10)}
                  >
                    10 min
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs px-2"
                    onClick={() => startTimerWithMinutes(20)}
                  >
                    20 min
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs px-2"
                    onClick={() => startTimerWithMinutes(35)}
                  >
                    35 min
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step-by-Step Unified Roadmap */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
          <span>Feuille de route pas à pas</span>
          <Badge variant="outline" className="text-[10px]">
            {completedTaskIds.size}/{session.tasks.length} terminées
          </Badge>
        </h3>

        <div className="space-y-3">
          {session.tasks.map((task, index) => {
            const isCompleted = completedTaskIds.has(task.id);
            return (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isCompleted
                    ? "bg-emerald-500/5 border-emerald-500/30 text-muted-foreground"
                    : "bg-card border-border/80 hover:border-primary/40 shadow-xs"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="pt-0.5">
                    <Checkbox checked={isCompleted} onCheckedChange={() => toggleTask(task.id)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-primary uppercase">
                          Étape {index + 1}
                        </span>
                        <h4
                          className={`text-xs font-semibold ${
                            isCompleted ? "line-through text-muted-foreground" : "text-foreground"
                          }`}
                        >
                          {task.title}
                        </h4>
                      </div>
                      <span className="text-[10px] font-medium text-muted-foreground shrink-0 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> ~{task.durationMinutes} min
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {task.description}
                    </p>

                    {task.ingredients && task.ingredients.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2.5 pt-2 border-t border-border/30">
                        {task.ingredients.slice(0, 6).map((ing) => (
                          <Badge key={ing} variant="secondary" className="text-[9px] px-1.5 py-0 font-normal">
                            {ing}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Storage & Shelf-Life Advice */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Refrigerator className="w-3.5 h-3.5 text-primary" />
          <span>Conservation & Organisation des repas</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {session.storageAdvice.map((advice) => (
            <div
              key={advice.recipeTitle}
              className="p-3 bg-card border border-border/70 rounded-xl space-y-1.5 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground line-clamp-1">{advice.recipeTitle}</span>
                <Badge
                  variant="outline"
                  className={`text-[9px] px-1.5 py-0 flex items-center gap-0.5 shrink-0 ${
                    advice.location === "freezer"
                      ? "border-sky-500/40 text-sky-600 dark:text-sky-400"
                      : "border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {advice.location === "freezer" ? (
                    <>
                      <Snowflake className="w-2.5 h-2.5" /> Congélateur
                    </>
                  ) : (
                    <>
                      <Refrigerator className="w-2.5 h-2.5" /> Frigo (J+{advice.shelfLifeDays})
                    </>
                  )}
                </Badge>
              </div>

              <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Boxes className="w-3 h-3 text-muted-foreground" />
                <span>{advice.containerType}</span>
              </div>

              <p className="text-[10px] text-muted-foreground/90 italic bg-muted/30 p-1.5 rounded-md">
                💡 {advice.tip}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
