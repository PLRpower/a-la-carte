import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ChefHat, Lock, Check, Sparkles, Plus, Minus, Calendar, Flame } from "lucide-react";
import { useRecipeJournal } from "@/hooks/useRecipeJournal";
import { useToast } from "@/hooks/use-toast";

interface RecipeJournalSectionProps {
  recipeId: string;
  recipeTitle: string;
}

export const RecipeJournalSection = ({ recipeId, recipeTitle }: RecipeJournalSectionProps) => {
  const { notes, cookedCount, lastCookedAt, saveNotes, incrementCooked, decrementCooked } = useRecipeJournal(recipeId);
  const { toast } = useToast();

  const [localNotes, setLocalNotes] = useState(notes);
  const [isSaved, setIsSaved] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalNotes(notes);
  }, [notes]);

  const handleNotesChange = (val: string) => {
    setLocalNotes(val);
    setIsSaved(false);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      await saveNotes(val);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    }, 800);
  };

  const handleManualSave = async () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    await saveNotes(localNotes);
    setIsSaved(true);
    toast({
      title: "Notes enregistrées 📝",
      description: "Vos notes personnelles ont été sauvegardées.",
    });
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleCookNow = async () => {
    const newCount = await incrementCooked();
    toast({
      title: "Recette validée ! 🍳",
      description: `Vous avez cuisiné "${recipeTitle}" (${newCount} fois au total).`,
    });
  };

  const formatLastCooked = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(date);
    } catch {
      return null;
    }
  };

  return (
    <section className="px-6 mt-6 print:hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Flame className="w-5 h-5 text-accent" />
            Journal &amp; Notes
          </h2>
          <Badge variant="outline" className="text-[10px] gap-1 text-muted-foreground border-border/70">
            <Lock className="w-2.5 h-2.5" />
            Privé
          </Badge>
        </div>
      </div>

      <Card className="border-border/70 shadow-xs overflow-hidden bg-card">
        <CardContent className="p-4 space-y-4">
          {/* Cook count tracker */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-accent/10 border border-accent/25">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent shrink-0">
                <ChefHat className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">
                    {cookedCount === 0
                      ? "Pas encore cuisiné"
                      : cookedCount === 1
                      ? "Cuisiné 1 fois"
                      : `Cuisiné ${cookedCount} fois`}
                  </span>
                  {cookedCount >= 3 && (
                    <Badge className="bg-accent text-accent-foreground text-[10px] py-0 px-1.5 font-bold">
                      ⭐ Classique
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  {lastCookedAt ? (
                    <>
                      <Calendar className="w-3 h-3 inline" />
                      Dernière réalisation : {formatLastCooked(lastCookedAt)}
                    </>
                  ) : (
                    "Suivez combien de fois vous réussissez ce plat"
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              {/* Decrement / Increment controls */}
              <div className="flex items-center bg-background rounded-lg border border-border/60 p-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-7 h-7 rounded-md hover:bg-muted"
                  disabled={cookedCount === 0}
                  onClick={() => decrementCooked()}
                  title="Diminuer le compteur"
                >
                  <Minus className="w-3.5 h-3.5" />
                </Button>
                <span className="text-xs font-bold w-6 text-center">{cookedCount}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-7 h-7 rounded-md hover:bg-muted"
                  onClick={() => incrementCooked()}
                  title="Augmenter le compteur"
                >
                  <Plus className="w-3.5 h-3.5 text-accent" />
                </Button>
              </div>

              <Button
                size="sm"
                onClick={handleCookNow}
                className="h-8 text-xs font-semibold bg-accent text-accent-foreground hover:bg-accent/90 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                +1 Cuisiné
              </Button>
            </div>
          </div>

          {/* Personal chef notes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="chef-notes" className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <span>Mes remarques &amp; astuces privées</span>
              </label>
              <div className="flex items-center gap-2">
                {isSaved && (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 animate-in fade-in">
                    <Check className="w-3 h-3" />
                    Enregistré
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleManualSave}
                  className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                >
                  Enregistrer
                </Button>
              </div>
            </div>

            <Textarea
              id="chef-notes"
              value={localNotes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Ex : Moins de sel, cuire 5 min de plus au four, ajouter une touche de piment d'Espelette, tester avec du lait d'avoine..."
              className="text-xs leading-relaxed min-h-[85px] bg-muted/20 border-border/70 focus-visible:ring-accent placeholder:text-muted-foreground/60 resize-y"
            />
            <p className="text-[11px] text-muted-foreground italic">
              💡 Ces notes restent strictement privées et apparaîtront sur votre fiche recette imprimable.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
