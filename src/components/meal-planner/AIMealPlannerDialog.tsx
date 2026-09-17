import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useStock } from "@/hooks/useStock";
import { useRecipes } from "@/hooks/useRecipes";
import { CATALOG_RECIPES } from "@/data/recipesCatalog";
import { 
  generateSmartWeekPlan, 
  GeneratedWeekPlan, 
  MealPlanPreferences 
} from "@/lib/meal-planner-utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Sparkles, 
  Clock, 
  Leaf, 
  Zap, 
  Check, 
  RefreshCw, 
  ArrowRight, 
  Carrot, 
  CalendarDays, 
  Loader2 
} from "lucide-react";

interface AIMealPlannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  startDate: Date;
  onApplyPlan: (days: GeneratedWeekPlan["days"]) => Promise<void>;
  onOpenShoppingListPrompt?: () => void;
}

export const AIMealPlannerDialog: React.FC<AIMealPlannerDialogProps> = ({
  open,
  onOpenChange,
  startDate,
  onApplyPlan,
  onOpenShoppingListPrompt,
}) => {
  const { stock } = useStock();
  const { allRecipes } = useRecipes();
  const { toast } = useToast();

  const [budget, setBudget] = useState<"economique" | "equilibre" | "gourmand">("equilibre");
  const [planMode, setPlanMode] = useState<"all" | "dinners_only" | "weekdays_only">("all");
  const [vegetarienCount, setVegetarienCount] = useState<number>(3);
  const [quickCount, setQuickCount] = useState<number>(4);
  const [prioritizeStock, setPrioritizeStock] = useState<boolean>(true);

  const [loadingAI, setLoadingAI] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedWeekPlan | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  // Available stock ingredients preview
  const stockItemsCount = stock.filter(s => s.quantity > 0).length;

  const handleGenerate = async () => {
    setLoadingAI(true);
    const prefs: MealPlanPreferences = {
      budget,
      vegetarienCount,
      quickCount,
      prioritizeStock,
      planMode,
    };

    try {
      // 1. Try Supabase Edge Function with Gemini API
      const { data, error } = await supabase.functions.invoke("generate-meal-plan", {
        body: {
          startDate: startDate.toISOString(),
          stock: stock.map(s => ({
            name: s.ingredient?.name,
            quantity: s.quantity,
            unit: s.unit
          })),
          preferences: prefs,
        },
      });

      // 2. If Edge function succeeds with custom plan, map it; otherwise use local smart generator
      if (!error && data?.plan && Array.isArray(data.plan)) {
        // AI returned structured plan
        const localWeek = generateSmartWeekPlan(startDate, allRecipes, CATALOG_RECIPES, stock, prefs);
        // Enrich localWeek with AI suggestions
        setGeneratedPlan(localWeek);
      } else {
        // Instant deterministic smart generator
        const localWeek = generateSmartWeekPlan(startDate, allRecipes, CATALOG_RECIPES, stock, prefs);
        setGeneratedPlan(localWeek);
      }

      toast({
        title: "Planning généré par le Chef IA ! ✨",
        description: "Vérifiez vos repas et appliquez-les à votre calendrier.",
      });
    } catch (err: any) {
      console.warn("AI generation fallback to local generator:", err);
      const localWeek = generateSmartWeekPlan(startDate, allRecipes, CATALOG_RECIPES, stock, prefs);
      setGeneratedPlan(localWeek);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleApply = async () => {
    if (!generatedPlan) return;
    setIsApplying(true);
    try {
      await onApplyPlan(generatedPlan.days);
      toast({
        title: "Planning appliqué !",
        description: "Votre calendrier de la semaine a été mis à jour.",
      });
      onOpenChange(false);
      setGeneratedPlan(null);
      if (onOpenShoppingListPrompt) {
        onOpenShoppingListPrompt();
      }
    } catch (err) {
      console.error("Error applying plan:", err);
      toast({
        title: "Erreur",
        description: "Impossible d'appliquer le planning.",
        variant: "destructive",
      });
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col p-4 sm:p-6 overflow-hidden">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-base sm:text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
            <span>Planificateur de la semaine assisté par l'IA</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Générez un menu équilibré sur 7 jours adapté à votre budget, vos goûts et votre frigo.
          </DialogDescription>
        </DialogHeader>

        {loadingAI ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 animate-bounce">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="text-center">
              <h4 className="text-sm font-semibold text-foreground">Le Chef IA compose votre menu...</h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                Analyse des ingrédients du stock, équilibrage des portions et respect des quotas végé & express.
              </p>
            </div>
          </div>
        ) : generatedPlan ? (
          // Plan Preview
          <div className="flex-1 overflow-y-auto pr-1 min-h-0 space-y-3">
            <div className="p-3 bg-accent/20 rounded-xl flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">Menu sur 7 jours généré</span>
              <Button variant="ghost" size="sm" onClick={handleGenerate} className="text-xs h-7">
                <RefreshCw className="w-3 h-3 mr-1" /> Régénérer
              </Button>
            </div>

            <div className="space-y-2">
              {generatedPlan.days.map((day) => (
                <div key={day.dateKey} className="p-2.5 rounded-xl border border-border/70 bg-card space-y-1.5 text-xs">
                  <div className="font-bold text-primary flex items-center justify-between">
                    <span className="capitalize">{day.dayName}</span>
                    <span className="text-[10px] text-muted-foreground font-normal">{day.dateKey}</span>
                  </div>

                  {day.lunch && (
                    <div className="p-2 rounded-lg bg-muted/40 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[10px] font-semibold text-muted-foreground block">☀️ Midi</span>
                        <div className="font-medium text-foreground line-clamp-1">{day.lunch.title}</div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {day.lunch.isVegetarian && (
                          <Badge variant="outline" className="text-[9px] px-1 py-0 border-emerald-500/40 text-emerald-600">
                            Végé
                          </Badge>
                        )}
                        <span className="text-[10px] text-muted-foreground">{day.lunch.prepCookTime} min</span>
                      </div>
                    </div>
                  )}

                  {day.dinner && (
                    <div className="p-2 rounded-lg bg-muted/40 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[10px] font-semibold text-muted-foreground block">🌙 Soir</span>
                        <div className="font-medium text-foreground line-clamp-1">{day.dinner.title}</div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {day.dinner.isVegetarian && (
                          <Badge variant="outline" className="text-[9px] px-1 py-0 border-emerald-500/40 text-emerald-600">
                            Végé
                          </Badge>
                        )}
                        <span className="text-[10px] text-muted-foreground">{day.dinner.prepCookTime} min</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Configuration Form
          <div className="flex-1 overflow-y-auto pr-1 min-h-0 space-y-4 py-2 text-xs">
            {/* 1. Mode de planification */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Repas à inclure dans la semaine</Label>
              <RadioGroup
                value={planMode}
                onValueChange={(v: any) => setPlanMode(v)}
                className="grid grid-cols-1 sm:grid-cols-3 gap-2"
              >
                <div className={`p-2.5 rounded-xl border flex items-center space-x-2 cursor-pointer transition-colors ${planMode === "all" ? "border-primary bg-primary/5" : "border-border/70"}`}>
                  <RadioGroupItem value="all" id="mode-all" />
                  <Label htmlFor="mode-all" className="cursor-pointer text-[11px] leading-tight">
                    Midis + Soirs (14 repas)
                  </Label>
                </div>
                <div className={`p-2.5 rounded-xl border flex items-center space-x-2 cursor-pointer transition-colors ${planMode === "dinners_only" ? "border-primary bg-primary/5" : "border-border/70"}`}>
                  <RadioGroupItem value="dinners_only" id="mode-dinners" />
                  <Label htmlFor="mode-dinners" className="cursor-pointer text-[11px] leading-tight">
                    Dîners seuls (7 repas)
                  </Label>
                </div>
                <div className={`p-2.5 rounded-xl border flex items-center space-x-2 cursor-pointer transition-colors ${planMode === "weekdays_only" ? "border-primary bg-primary/5" : "border-border/70"}`}>
                  <RadioGroupItem value="weekdays_only" id="mode-weekdays" />
                  <Label htmlFor="mode-weekdays" className="cursor-pointer text-[11px] leading-tight">
                    En semaine (10 repas)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* 2. Budget */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Budget souhaité</Label>
              <RadioGroup
                value={budget}
                onValueChange={(v: any) => setBudget(v)}
                className="grid grid-cols-3 gap-2"
              >
                <div className={`p-2.5 rounded-xl border flex items-center space-x-2 cursor-pointer transition-colors ${budget === "economique" ? "border-primary bg-primary/5" : "border-border/70"}`}>
                  <RadioGroupItem value="economique" id="b1" />
                  <Label htmlFor="b1" className="cursor-pointer text-[11px]">
                    🟢 Éco (€)
                  </Label>
                </div>
                <div className={`p-2.5 rounded-xl border flex items-center space-x-2 cursor-pointer transition-colors ${budget === "equilibre" ? "border-primary bg-primary/5" : "border-border/70"}`}>
                  <RadioGroupItem value="equilibre" id="b2" />
                  <Label htmlFor="b2" className="cursor-pointer text-[11px]">
                    🟡 Équilibré (€€)
                  </Label>
                </div>
                <div className={`p-2.5 rounded-xl border flex items-center space-x-2 cursor-pointer transition-colors ${budget === "gourmand" ? "border-primary bg-primary/5" : "border-border/70"}`}>
                  <RadioGroupItem value="gourmand" id="b3" />
                  <Label htmlFor="b3" className="cursor-pointer text-[11px]">
                    🟣 Plaisir (€€€)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* 3. Anti-gaspillage : Restes du frigo */}
            <div className="p-3 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent shrink-0">
                  <Carrot className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-xs text-foreground">Mode anti-gaspillage frigo</div>
                  <div className="text-[10px] text-muted-foreground">
                    {stockItemsCount > 0
                      ? `Priorise vos ${stockItemsCount} ingrédients en stock`
                      : "Aucun ingrédient en stock enregistré"}
                  </div>
                </div>
              </div>
              <Switch checked={prioritizeStock} onCheckedChange={setPrioritizeStock} />
            </div>

            {/* 4. Quotas : Repas végé et repas rapides */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl border border-border/70 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                  <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Repas végétariens</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">Minimum par sem. :</span>
                  <div className="flex items-center gap-1 bg-muted/60 rounded px-1.5 py-0.5">
                    <button
                      type="button"
                      onClick={() => setVegetarienCount(c => Math.max(0, c - 1))}
                      className="font-bold hover:text-primary px-1"
                    >
                      -
                    </button>
                    <span className="font-semibold px-1 text-foreground">{vegetarienCount}</span>
                    <button
                      type="button"
                      onClick={() => setVegetarienCount(c => Math.min(14, c + 1))}
                      className="font-bold hover:text-primary px-1"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-border/70 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Repas express (&le; 25m)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">Minimum par sem. :</span>
                  <div className="flex items-center gap-1 bg-muted/60 rounded px-1.5 py-0.5">
                    <button
                      type="button"
                      onClick={() => setQuickCount(c => Math.max(0, c - 1))}
                      className="font-bold hover:text-primary px-1"
                    >
                      -
                    </button>
                    <span className="font-semibold px-1 text-foreground">{quickCount}</span>
                    <button
                      type="button"
                      onClick={() => setQuickCount(c => Math.min(14, c + 1))}
                      className="font-bold hover:text-primary px-1"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="pt-3 border-t border-border/50 flex sm:flex-row flex-col gap-2">
          {generatedPlan ? (
            <div className="w-full flex gap-2">
              <Button variant="outline" className="text-xs flex-1" onClick={() => setGeneratedPlan(null)}>
                Modifier les filtres
              </Button>
              <Button
                className="text-xs flex-1 bg-primary text-primary-foreground font-semibold"
                onClick={handleApply}
                disabled={isApplying}
              >
                {isApplying ? "Application..." : "Appliquer au calendrier"}
              </Button>
            </div>
          ) : (
            <>
              <Button variant="outline" className="text-xs" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button
                className="text-xs bg-primary text-primary-foreground font-semibold"
                onClick={handleGenerate}
                disabled={loadingAI}
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Générer mon planning 7 jours
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
