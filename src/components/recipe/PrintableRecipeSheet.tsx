import { RecipeWithDetails } from "@/types/database";
import { RecipeQRCode } from "./RecipeQRCode";
import { parseRecipeSteps } from "@/lib/recipe-step-parser";

interface PrintableRecipeSheetProps {
  recipe: RecipeWithDetails;
  servings: number;
  personalNotes?: string;
  shareUrl?: string;
}

export const PrintableRecipeSheet = ({
  recipe,
  servings,
  personalNotes,
  shareUrl,
}: PrintableRecipeSheetProps) => {
  const initialServings = recipe.servings || 4;
  const scale = servings / initialServings;
  const steps = parseRecipeSteps(recipe.instructions || "");
  const today = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const currentUrl = shareUrl || `${window.location.origin}/shared/recipe/${recipe.id}`;

  return (
    <div className="hidden print:block w-full max-w-4xl mx-auto bg-white text-black p-4 print:p-0">
      {/* Header */}
      <div className="border-b-2 border-black pb-4 mb-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-600 block mb-1">
              Fiche Recette · À la carte
            </span>
            <h1 className="text-2xl font-bold font-serif leading-tight mb-2">
              {recipe.title}
            </h1>
            {recipe.description && (
              <p className="text-xs text-gray-700 italic mb-2 leading-relaxed">
                "{recipe.description}"
              </p>
            )}
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-800 font-medium">
              <span>⏱️ Prép : {recipe.prep_time || 0} min</span>
              <span>🔥 Cuisson : {recipe.cook_time || 0} min</span>
              <span>👥 {servings} portions</span>
              {recipe.difficulty && <span className="capitalize">⭐ {recipe.difficulty}</span>}
              {recipe.category && <span className="capitalize">🏷️ {recipe.category}</span>}
            </div>
          </div>

          <div className="text-right shrink-0 flex flex-col items-center">
            <RecipeQRCode value={currentUrl} size={80} className="rounded-none border border-black shadow-none" />
            <span className="text-[8px] text-gray-600 mt-1">Scanner pour voir en ligne</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Content */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left column: Ingredients */}
        <div className="col-span-5 border-r border-gray-300 pr-4">
          <h2 className="text-sm font-bold uppercase tracking-wider border-b border-black pb-1 mb-3">
            Ingrédients ({servings} portions)
          </h2>
          <ul className="space-y-2 text-xs">
            {recipe.ingredients?.map((ing, idx) => {
              const qty = ing.quantity ? ing.quantity * scale : null;
              const formattedQty = qty ? Number(qty.toFixed(1)).toString() : "";
              return (
                <li key={idx} className="flex items-start gap-2 leading-tight">
                  <span className="w-3.5 h-3.5 border border-black rounded-xs inline-block shrink-0 mt-0.5" />
                  <span>
                    <strong>
                      {formattedQty} {ing.unit !== "piece" ? ing.unit : ""}
                    </strong>{" "}
                    {ing.name}
                  </span>
                </li>
              );
            })}
          </ul>

          {personalNotes && personalNotes.trim() && (
            <div className="mt-5 p-2.5 bg-gray-100 border border-gray-300 rounded-sm">
              <h3 className="text-[11px] font-bold uppercase tracking-wide text-gray-800 mb-1">
                📝 Notes du chef :
              </h3>
              <p className="text-[11px] text-gray-800 leading-snug whitespace-pre-wrap italic">
                {personalNotes}
              </p>
            </div>
          )}
        </div>

        {/* Right column: Steps */}
        <div className="col-span-7">
          <h2 className="text-sm font-bold uppercase tracking-wider border-b border-black pb-1 mb-3">
            Préparation
          </h2>
          <ol className="space-y-3 text-xs leading-relaxed">
            {steps.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2.5 break-inside-avoid">
                <span className="w-5 h-5 rounded-full bg-black text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  {step.stepNumber || idx + 1}
                </span>
                <span className="flex-1">{step.text}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-3 border-t border-gray-300 flex items-center justify-between text-[9px] text-gray-500">
        <span>Fiche imprimée le {today}</span>
        <span>À la carte — Votre carnet de recettes intelligent</span>
      </div>
    </div>
  );
};
