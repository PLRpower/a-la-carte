import { useState, useMemo } from "react";
import {
  ChefHat,
  Package,
  User,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Clock,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { RecipeImage } from "@/components/RecipeImage";
import { STARTER_THEMES, getStarterPackRecipes } from "@/data/starterPacks";
import { PENDING_STARTER_PACK_KEY } from "@/lib/recipe-clone";

interface OnboardingProps {
  onComplete?: () => void;
}

const slides = [
  {
    icon: ChefHat,
    title: "100+ recettes délicieuses prêtes à l'emploi",
    description: "Découvrez notre catalogue public de recettes du quotidien, simples, économiques et savoureuses.",
  },
  {
    icon: Package,
    title: "Gérez votre stock et évitez le gaspillage",
    description: "Suivez vos ingrédients en temps réel et cuisinez selon ce qu'il vous reste dans le frigo.",
  },
  {
    icon: User,
    title: "Un carnet de recettes 100% personnalisé",
    description: "Démarrez avec votre Pack de bienvenue selon vos goûts : étudiant, rapide, végé ou familial.",
  },
];

const Onboarding = ({ onComplete }: OnboardingProps) => {
  const navigate = useNavigate();

  // Steps: 0 = Carousel/Intro, 1 = Themes Selection, 2 = Starter Pack Preview
  const [step, setStep] = useState<number>(0);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Thematic selection
  const [selectedThemes, setSelectedThemes] = useState<string[]>([
    "rapide",
    "etudiant",
  ]);

  // Selected recipe IDs within the recommended pack
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<Set<string>>(
    new Set()
  );

  // Compute recommended starter pack
  const packRecipes = useMemo(() => {
    return getStarterPackRecipes(selectedThemes, 12);
  }, [selectedThemes]);

  // Keep all selected by default when pack updates
  useMemo(() => {
    setSelectedRecipeIds(new Set(packRecipes.map((r) => r.id)));
  }, [packRecipes]);

  const toggleTheme = (themeId: string) => {
    setSelectedThemes((prev) =>
      prev.includes(themeId)
        ? prev.filter((t) => t !== themeId)
        : [...prev, themeId]
    );
  };

  const toggleRecipe = (recipeId: string) => {
    setSelectedRecipeIds((prev) => {
      const next = new Set(prev);
      if (next.has(recipeId)) next.delete(recipeId);
      else next.add(recipeId);
      return next;
    });
  };

  const finishOnboardingWithPack = (recipeIds: string[]) => {
    localStorage.setItem("onboardingCompleted", "true");
    localStorage.setItem(PENDING_STARTER_PACK_KEY, JSON.stringify(recipeIds));
    localStorage.removeItem("isDemoMode");

    if (onComplete) onComplete();
    navigate("/auth", { state: { isSignup: true } });
  };

  const startDemoMode = () => {
    localStorage.setItem("onboardingCompleted", "true");
    localStorage.setItem("isDemoMode", "true");

    if (onComplete) onComplete();
    navigate("/recipes?tab=discover");
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-6 bg-background max-w-lg mx-auto">
      {/* Top Header Controls */}
      <div className="w-full flex items-center justify-between pt-2">
        {step > 0 ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep(step - 1)}
            className="text-muted-foreground -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Retour
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <img
              src="/logo-transparent.png"
              alt="Logo"
              className="w-8 h-8 object-contain"
            />
            <span className="font-bold text-sm text-foreground">À la carte</span>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={startDemoMode}
          className="text-xs text-muted-foreground hover:text-foreground font-medium"
        >
          Mode Démo (visiteur)
        </Button>
      </div>

      {/* STEP 0: PRESENTATION & CAROUSEL */}
      {step === 0 && (
        <div className="flex-1 flex flex-col justify-center py-6 animate-in fade-in duration-300">
          <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
            <div className="w-32 h-32 mb-8 rounded-3xl bg-accent/15 flex items-center justify-center shadow-inner">
              {(() => {
                const Icon = slides[currentSlide].icon;
                return <Icon className="w-16 h-16 text-accent" />;
              })()}
            </div>

            <h1 className="text-2xl font-bold mb-3 text-foreground tracking-tight">
              {slides[currentSlide].title}
            </h1>
            <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
              {slides[currentSlide].description}
            </p>

            {/* Carousel Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide ? "w-7 bg-accent" : "w-2 bg-muted"
                  }`}
                  aria-label={`Diapositive ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-3 mt-8">
            <Button
              onClick={() => setStep(1)}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-md font-semibold h-12"
              size="lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Choisir mes thèmes & recettes
            </Button>

            <Button
              onClick={startDemoMode}
              variant="outline"
              className="w-full h-11 text-xs text-muted-foreground"
            >
              Explorer d'abord sans compte (Démo)
            </Button>
          </div>
        </div>
      )}

      {/* STEP 1: THEMATIC FILTERS */}
      {step === 1 && (
        <div className="flex-1 flex flex-col justify-between py-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <div>
            <div className="flex items-center gap-2 text-accent font-semibold text-xs tracking-wider uppercase mb-1">
              <Sparkles className="w-4 h-4" />
              Étape 1 sur 2
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-1">
              Vos envies en cuisine
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Sélectionnez un ou plusieurs thèmes. Nous composerons un Pack de 12
              recettes sur-mesure pour démarrer votre carnet.
            </p>

            <div className="space-y-3">
              {STARTER_THEMES.map((theme) => {
                const isSelected = selectedThemes.includes(theme.id);
                return (
                  <div
                    key={theme.id}
                    onClick={() => toggleTheme(theme.id)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "border-accent bg-accent/10 shadow-sm"
                        : "border-border bg-card hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center text-2xl shadow-sm border border-border/40 shrink-0">
                        {theme.emoji}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-base text-foreground">
                            {theme.label}
                          </span>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {theme.badge}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {theme.description}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? "bg-accent border-accent text-accent-foreground"
                          : "border-muted-foreground/30"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 mt-8">
            <Button
              onClick={() => setStep(2)}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold h-12 shadow-md"
              size="lg"
            >
              Découvrir mon Pack ({packRecipes.length} recettes)
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: STARTER PACK PREVIEW & CONFIRMATION */}
      {step === 2 && (
        <div className="flex-1 flex flex-col justify-between py-2 animate-in fade-in slide-in-from-right-4 duration-300">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-accent uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Votre Starter Pack
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                {selectedRecipeIds.size} sélectionnées
              </span>
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-1">
              Prêt pour cuisiner ?
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              Voici vos recettes sélectionnées parmi notre bibliothèque. Vous
              pourrez en ajouter d'autres à tout moment.
            </p>

            {/* Selected Recipes List */}
            <div className="max-h-[50vh] overflow-y-auto space-y-2.5 pr-1 no-scrollbar">
              {packRecipes.map((recipe) => {
                const isChecked = selectedRecipeIds.has(recipe.id);
                return (
                  <div
                    key={recipe.id}
                    onClick={() => toggleRecipe(recipe.id)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isChecked
                        ? "border-accent/40 bg-accent/5 shadow-xs"
                        : "border-border/40 opacity-50"
                    }`}
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => toggleRecipe(recipe.id)}
                      className="data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                    />
                    <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-muted">
                      <RecipeImage
                        src={recipe.image_url}
                        alt={recipe.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate text-foreground">
                        {recipe.title}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {recipe.prep_time + recipe.cook_time} min
                        </span>
                        <span>·</span>
                        <span className="capitalize">{recipe.difficulty}</span>
                      </div>
                      <div className="flex gap-1 mt-1">
                        {recipe.tags.slice(0, 2).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-[9px] px-1 py-0"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 mt-6">
            <Button
              onClick={() =>
                finishOnboardingWithPack(Array.from(selectedRecipeIds))
              }
              disabled={selectedRecipeIds.size === 0}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold h-12 shadow-md"
              size="lg"
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Créer mon compte & ajouter mes {selectedRecipeIds.size} recettes
            </Button>

            <Button
              onClick={startDemoMode}
              variant="outline"
              className="w-full h-10 text-xs text-muted-foreground"
            >
              Explorer d'abord en Mode Démo (sans compte)
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
