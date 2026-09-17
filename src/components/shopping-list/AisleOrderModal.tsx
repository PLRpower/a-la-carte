import { useState } from "react";
import { ArrowUp, ArrowDown, RotateCcw, Route, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_AISLE_ORDER,
  getAisleOrder,
  saveAisleOrder,
  resetAisleOrder,
  getCategoryLabel,
  getCategoryIcon,
} from "@/lib/shopping-list-utils";
import { useToast } from "@/hooks/use-toast";

interface AisleOrderModalProps {
  onOrderChange: (newOrder: string[]) => void;
  trigger?: React.ReactNode;
}

export const AisleOrderModal = ({ onOrderChange, trigger }: AisleOrderModalProps) => {
  const [order, setOrder] = useState<string[]>(() => getAisleOrder());
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= order.length) return;

    const newOrder = [...order];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);

    setOrder(newOrder);
    saveAisleOrder(newOrder);
    onOrderChange(newOrder);
  };

  const handleReset = () => {
    resetAisleOrder();
    const defaults = [...DEFAULT_AISLE_ORDER];
    setOrder(defaults);
    onOrderChange(defaults);
    toast({
      title: "Parcours réinitialisé",
      description: "L'ordre standard de supermarché a été restauré.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2 text-xs sm:text-sm">
            <Route className="w-4 h-4" />
            <span>Parcours rayons</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Route className="w-5 h-5 text-primary" />
            Parcours par rayons en magasin
          </DialogTitle>
          <DialogDescription>
            Organisez les catégories dans l'ordre réel de passage dans votre supermarché pour faire vos courses sans demi-tour.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-1 py-2 space-y-2">
          {order.map((category, index) => {
            const isFirst = index === 0;
            const isLast = index === order.length - 1;
            const icon = getCategoryIcon(category);
            const label = getCategoryLabel(category);

            return (
              <div
                key={category}
                className="flex items-center justify-between p-2.5 rounded-lg border bg-card hover:bg-accent/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-muted-foreground w-5 text-center">
                    {index + 1}
                  </span>
                  <span className="text-lg">{icon}</span>
                  <span className="text-sm font-medium">{label}</span>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    disabled={isFirst}
                    onClick={() => handleMove(index, "up")}
                    aria-label={`Monter ${label}`}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    disabled={isLast}
                    onClick={() => handleMove(index, "down")}
                    aria-label={`Descendre ${label}`}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between pt-2 border-t">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-muted-foreground hover:text-foreground gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Ordre type
          </Button>
          <DialogClose asChild>
            <Button size="sm" className="gap-1.5">
              <Check className="w-4 h-4" />
              Terminé
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
