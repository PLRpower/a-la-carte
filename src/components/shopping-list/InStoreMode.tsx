import { useState, useMemo } from "react";
import {
  X,
  ShoppingCart,
  CheckCircle2,
  Sparkles,
  Route,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ShoppingListItemWithIngredient } from "@/types/database";
import {
  groupItemsByCategory,
  sortCategories,
  getCategoryLabel,
  getCategoryIcon,
  getAisleOrder,
} from "@/lib/shopping-list-utils";
import { InStoreItemCard } from "./InStoreItemCard";
import { AisleOrderModal } from "./AisleOrderModal";

interface InStoreModeProps {
  items: ShoppingListItemWithIngredient[];
  onToggleItem: (id: string, checked: boolean) => void;
  onFinishShopping: () => Promise<void> | void;
  onClose: () => void;
}

export const InStoreMode = ({
  items,
  onToggleItem,
  onFinishShopping,
  onClose,
}: InStoreModeProps) => {
  const [hideChecked, setHideChecked] = useState(false);
  const [aisleOrder, setAisleOrder] = useState<string[]>(() => getAisleOrder());

  const totalItems = items.length;
  const checkedItems = useMemo(() => items.filter((i) => i.checked), [items]);
  const uncheckedItems = useMemo(() => items.filter((i) => !i.checked), [items]);

  const progressPercent = totalItems > 0 ? Math.round((checkedItems.length / totalItems) * 100) : 0;

  // Filter items based on user preference
  const visibleItems = hideChecked ? uncheckedItems : items;

  // Group and sort by customized aisle order
  const grouped = useMemo(() => groupItemsByCategory(visibleItems), [visibleItems]);
  const sortedCategories = useMemo(
    () => sortCategories(Object.keys(grouped), aisleOrder),
    [grouped, aisleOrder]
  );

  return (
    <div className="fixed inset-0 z-50 bg-background text-foreground flex flex-col select-none overflow-hidden animate-in fade-in duration-200">
      {/* Top Bar: Accessible at glance */}
      <header className="px-4 py-3 border-b bg-card/90 backdrop-blur-md flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-10 w-10 rounded-full hover:bg-muted"
            aria-label="Fermer le mode magasin"
          >
            <X className="w-6 h-6" />
          </Button>

          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              <span>Mode Magasin</span>
            </h1>
            <p className="text-xs text-muted-foreground">
              {checkedItems.length} / {totalItems} dans le caddie
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <AisleOrderModal
            onOrderChange={(newOrder) => setAisleOrder(newOrder)}
            trigger={
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full"
                title="Ajuster l'ordre des rayons"
              >
                <Route className="w-5 h-5 text-muted-foreground" />
              </Button>
            }
          />

          <Button
            variant="outline"
            size="icon"
            onClick={() => setHideChecked(!hideChecked)}
            className={`h-10 w-10 rounded-full ${hideChecked ? "bg-primary/10 text-primary border-primary/40" : ""}`}
            title={hideChecked ? "Afficher tous les articles" : "Masquer les articles cochés"}
          >
            {hideChecked ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      {/* Main Content Area - Large Touch Friendly Scrollable */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-6 pb-36">
        {totalItems === 0 ? (
          <div className="text-center py-16 space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold">Aucun article dans la liste</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              Ajoutez des articles avant de démarrer vos courses en magasin.
            </p>
            <Button onClick={onClose} variant="default" className="mt-2">
              Retour à la liste
            </Button>
          </div>
        ) : hideChecked && uncheckedItems.length === 0 ? (
          <div className="text-center py-16 space-y-4 animate-in zoom-in-95">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold">Tous les articles sont dans le caddie !</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              Vous pouvez valider vos courses pour les ajouter automatiquement à votre stock.
            </p>
            <Button
              variant="outline"
              onClick={() => setHideChecked(false)}
              className="mt-2"
            >
              Voir tous les articles cochés
            </Button>
          </div>
        ) : (
          sortedCategories.map((category) => {
            const categoryItems = grouped[category] || [];
            if (categoryItems.length === 0) return null;

            const aisleUnchecked = categoryItems.filter((i) => !i.checked).length;
            const isAisleComplete = aisleUnchecked === 0;

            return (
              <section key={category} className="space-y-2.5">
                {/* Sticky Aisle Header */}
                <div className="sticky top-0 z-20 py-2 bg-background/95 backdrop-blur-xs flex items-center justify-between border-b pb-1.5 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getCategoryIcon(category)}</span>
                    <h2 className="text-lg font-bold tracking-tight text-foreground">
                      {getCategoryLabel(category)}
                    </h2>
                  </div>

                  {isAisleComplete ? (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 gap-1 py-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Rayon terminé
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="font-semibold px-2 py-0.5">
                      {aisleUnchecked} restant{aisleUnchecked > 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>

                {/* Items in this aisle */}
                <div className="space-y-2">
                  {categoryItems.map((item) => (
                    <InStoreItemCard
                      key={item.id}
                      item={item}
                      onToggle={onToggleItem}
                    />
                  ))}
                </div>
              </section>
            );
          })
        )}
      </main>

      {/* Bottom Sticky Control Zone (Engineered for one thumb reach) */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t p-4 shadow-xl space-y-3 pb-safe">
        {/* Real-time Progress Gauge */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <ShoppingCart className="w-4 h-4 text-primary" />
              Progression caddie
            </span>
            <span className="text-primary font-bold text-sm">
              {progressPercent}% ({checkedItems.length}/{totalItems})
            </span>
          </div>
          <Progress value={progressPercent} className="h-2.5 bg-muted" />
        </div>

        {/* Large One-Hand Thumb Action Buttons */}
        <div className="flex gap-3 pt-1">
          <Button
            size="lg"
            variant="default"
            disabled={checkedItems.length === 0}
            onClick={async () => {
              await onFinishShopping();
              onClose();
            }}
            className="flex-1 h-14 text-base font-bold rounded-2xl shadow-md gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <CheckCircle2 className="w-5 h-5" />
            Terminer & Ajouter au stock ({checkedItems.length})
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={onClose}
            className="h-14 px-5 text-base font-semibold rounded-2xl border-2"
          >
            Quitter
          </Button>
        </div>
      </footer>
    </div>
  );
};
