import React, { useState } from "react";
import { useMealPlanner } from "@/hooks/useMealPlanner";
import { formatWeekRangeDisplay } from "@/lib/meal-planner-utils";
import { MealSlotCard } from "@/components/meal-planner/MealSlotCard";
import { AssignRecipeModal } from "@/components/meal-planner/AssignRecipeModal";
import { WeeklyShoppingListModal } from "@/components/meal-planner/WeeklyShoppingListModal";
import { AIMealPlannerDialog } from "@/components/meal-planner/AIMealPlannerDialog";
import { BatchCookingView } from "@/components/meal-planner/BatchCookingView";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MealPlanSlot, RecipeWithDetails, MealPlanRecipeSnapshot } from "@/types/database";
import { CatalogRecipe } from "@/data/recipesCatalog";
import { 
  ChevronLeft, 
  ChevronRight, 
  CalendarDays, 
  ShoppingCart, 
  Sparkles, 
  Flame, 
  Trash2 
} from "lucide-react";

const MealPlanner: React.FC = () => {
  const {
    currentDate,
    currentWeekDays,
    weekPlans,
    plansByDateAndSlot,
    nextWeek,
    prevWeek,
    goToToday,
    assignMeal,
    removeMeal,
    moveMeal,
    updateServings,
    clearWeek,
    applyGeneratedPlan,
    shoppingListAnalysis,
  } = useMealPlanner();

  // Tab State
  const [activeViewTab, setActiveViewTab] = useState<"calendar" | "batch">("calendar");

  // Modal states
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [targetSlotInfo, setTargetSlotInfo] = useState<{
    dateKey: string;
    dayName: string;
    slot: MealPlanSlot;
  } | null>(null);

  const [shoppingModalOpen, setShoppingModalOpen] = useState(false);
  const [aiPlannerOpen, setAiPlannerOpen] = useState(false);

  const handleOpenAssign = (dateKey: string, slot: MealPlanSlot) => {
    const day = currentWeekDays.find((d) => d.dateKey === dateKey);
    setTargetSlotInfo({
      dateKey,
      dayName: day ? `${day.dayName} ${day.dayNumber} ${day.monthName}` : dateKey,
      slot,
    });
    setAssignModalOpen(true);
  };

  const handleAssignRecipe = async (data: {
    recipe?: RecipeWithDetails;
    catalogRecipe?: CatalogRecipe;
    customTitle?: string;
    servings: number;
  }) => {
    if (!targetSlotInfo) return;
    await assignMeal({
      date: targetSlotInfo.dateKey,
      slot: targetSlotInfo.slot,
      recipe: data.recipe,
      catalogRecipe: data.catalogRecipe,
      customTitle: data.customTitle,
      servings: data.servings,
    });
  };

  const weekRangeLabel = formatWeekRangeDisplay(currentDate);

  // Extract all recipes planned in the week for Batch Cooking view
  const activeRecipesInWeek = weekPlans
    .map((p) => p.recipe || p.recipe_snapshot)
    .filter((r): r is RecipeWithDetails | MealPlanRecipeSnapshot => !!r);

  return (
    <div className="pb-24 md:pb-12 min-h-screen">
      {/* Header */}
      <header className="bg-primary text-primary-foreground pt-7 pb-6 px-6 md:px-8 md:rounded-2xl md:my-6 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Menu de la semaine</h1>
            <p className="text-xs opacity-90">Planifiez, cuisinez en bloc, faites vos courses sans gaspillage</p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="secondary"
              size="sm"
              onClick={goToToday}
              className="text-xs bg-white/20 hover:bg-white/30 text-white border-0 h-8"
            >
              Aujourd'hui
            </Button>
          </div>
        </div>

        {/* Week Navigator */}
        <div className="flex items-center justify-between bg-black/15 backdrop-blur-xs rounded-xl p-1.5 mt-2 max-w-lg mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevWeek}
            className="h-8 w-8 text-primary-foreground hover:bg-white/20"
            title="Semaine précédente"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-wider block opacity-80">
              Semaine
            </span>
            <span className="text-sm font-bold text-white">
              {weekRangeLabel}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={nextWeek}
            className="h-8 w-8 text-primary-foreground hover:bg-white/20"
            title="Semaine suivante"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main Container */}
      <main className="px-4 sm:px-6 mt-4 space-y-4">
        {/* Navigation Tabs between Weekly Calendar & Batch Cooking Session */}
        <Tabs value={activeViewTab} onValueChange={(v) => setActiveViewTab(v as "calendar" | "batch")} className="w-full">
          <TabsList className="grid grid-cols-2 w-full mb-4">
            <TabsTrigger value="calendar" className="text-xs flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              <span>Menu hebdomadaire ({weekPlans.length})</span>
            </TabsTrigger>
            <TabsTrigger value="batch" className="text-xs flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Rituel Batch Cooking</span>
            </TabsTrigger>
          </TabsList>

          {/* VIEW TAB 1: WEEKLY CALENDAR */}
          <TabsContent value="calendar" className="space-y-4 mt-0">
            {/* Quick Actions Bar */}
            <div className="grid grid-cols-2 gap-2">
              {/* Shopping list generator button */}
              <Button
                variant="outline"
                onClick={() => setShoppingModalOpen(true)}
                className="h-auto py-2.5 px-3 flex flex-col items-start gap-1 border-primary/30 hover:border-primary bg-card text-left relative overflow-hidden group"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <ShoppingCart className="w-3.5 h-3.5 text-primary" />
                    Courses semaine
                  </span>
                  {shoppingListAnalysis.missingItems.length > 0 && (
                    <Badge className="bg-amber-500 text-white text-[9px] px-1.5 py-0 h-4">
                      {shoppingListAnalysis.missingItems.length} à acheter
                    </Badge>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground line-clamp-1">
                  Ingrédients requis - stock frigo
                </span>
              </Button>

              {/* AI Planner Button */}
              <Button
                variant="outline"
                onClick={() => setAiPlannerOpen(true)}
                className="h-auto py-2.5 px-3 flex flex-col items-start gap-1 border-amber-500/30 hover:border-amber-500 bg-card text-left relative overflow-hidden group"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Chef IA 7 jours
                  </span>
                  <Badge variant="outline" className="text-[9px] px-1 py-0 border-amber-500/40 text-amber-600">
                    Auto
                  </Badge>
                </div>
                <span className="text-[10px] text-muted-foreground line-clamp-1">
                  Générer selon budget & frigo
                </span>
              </Button>
            </div>

            {/* 7 Days List */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pt-1">
              {currentWeekDays.map((day) => {
                const dayPlans = plansByDateAndSlot[day.dateKey] || {};
                const hasPlans = !!dayPlans.lunch || !!dayPlans.dinner;

                return (
                  <Card
                    key={day.dateKey}
                    className={`overflow-hidden border transition-all ${
                      day.isCurrentDay
                        ? "border-primary/50 shadow-sm ring-1 ring-primary/20 bg-primary/[0.02]"
                        : "border-border/70 bg-card"
                    }`}
                  >
                    {/* Day Header */}
                    <div
                      className={`px-3.5 py-2 border-b flex items-center justify-between ${
                        day.isCurrentDay
                          ? "bg-primary/10 border-primary/20"
                          : "bg-muted/30 border-border/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold capitalize ${
                            day.isCurrentDay ? "text-primary font-extrabold" : "text-foreground"
                          }`}
                        >
                          {day.dayName} {day.dayNumber} {day.monthName}
                        </span>
                        {day.isCurrentDay && (
                          <Badge className="bg-primary text-primary-foreground text-[9px] px-1.5 py-0">
                            Aujourd'hui
                          </Badge>
                        )}
                      </div>

                      <span className="text-[10px] text-muted-foreground">
                        {hasPlans
                          ? `${(dayPlans.lunch ? 1 : 0) + (dayPlans.dinner ? 1 : 0)} repas`
                          : "Non planifié"}
                      </span>
                    </div>

                    {/* Day Slots: Midi & Soir */}
                    <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* Midi (Lunch) */}
                      <MealSlotCard
                        dateKey={day.dateKey}
                        dayName={day.dayName}
                        slot="lunch"
                        plan={dayPlans.lunch}
                        onOpenAssign={handleOpenAssign}
                        onRemove={removeMeal}
                        onUpdateServings={(planId, servings) => updateServings({ planId, servings })}
                        onMoveSlot={(fromPlanId, toDate, toSlot) =>
                          moveMeal({ fromPlanId, toDate, toSlot })
                        }
                      />

                      {/* Soir (Dinner) */}
                      <MealSlotCard
                        dateKey={day.dateKey}
                        dayName={day.dayName}
                        slot="dinner"
                        plan={dayPlans.dinner}
                        onOpenAssign={handleOpenAssign}
                        onRemove={removeMeal}
                        onUpdateServings={(planId, servings) => updateServings({ planId, servings })}
                        onMoveSlot={(fromPlanId, toDate, toSlot) =>
                          moveMeal({ fromPlanId, toDate, toSlot })
                        }
                      />
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Clear Week Helper */}
            {weekPlans.length > 0 && (
              <div className="text-center pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (confirm("Voulez-vous vraiment effacer tous les repas de cette semaine ?")) {
                      clearWeek();
                    }
                  }}
                  className="text-xs text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Effacer le planning de la semaine
                </Button>
              </div>
            )}
          </TabsContent>

          {/* VIEW TAB 2: BATCH COOKING */}
          <TabsContent value="batch" className="mt-0">
            <BatchCookingView
              availableRecipes={activeRecipesInWeek}
              onNavigateToCalendar={() => setActiveViewTab("calendar")}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Assign Recipe Modal */}
      {targetSlotInfo && (
        <AssignRecipeModal
          open={assignModalOpen}
          onOpenChange={setAssignModalOpen}
          targetDateKey={targetSlotInfo.dateKey}
          targetDayName={targetSlotInfo.dayName}
          targetSlot={targetSlotInfo.slot}
          onAssignRecipe={handleAssignRecipe}
        />
      )}

      {/* Weekly Shopping List Generator Modal */}
      <WeeklyShoppingListModal
        open={shoppingModalOpen}
        onOpenChange={setShoppingModalOpen}
        analysis={shoppingListAnalysis}
      />

      {/* AI Smart 7-Day Meal Planner Dialog */}
      <AIMealPlannerDialog
        open={aiPlannerOpen}
        onOpenChange={setAiPlannerOpen}
        startDate={currentDate}
        onApplyPlan={applyGeneratedPlan}
        onOpenShoppingListPrompt={() => setShoppingModalOpen(true)}
      />
    </div>
  );
};

export default MealPlanner;
