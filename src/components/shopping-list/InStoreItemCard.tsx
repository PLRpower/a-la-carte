import { useState, useRef, TouchEvent, MouseEvent } from "react";
import { Check, HelpCircle } from "lucide-react";
import { ShoppingListItemWithIngredient } from "@/types/database";

interface InStoreItemCardProps {
  item: ShoppingListItemWithIngredient;
  onToggle: (id: string, checked: boolean) => void;
}

export const InStoreItemCard = ({ item, onToggle }: InStoreItemCardProps) => {
  const [offsetX, setOffsetX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startXRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);

  // Trigger haptic feedback if device supports it
  const triggerHaptic = () => {
    try {
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(35);
      }
    } catch {
      // Ignore vibration errors
    }
  };

  // Touch Events
  const handleTouchStart = (e: TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (startXRef.current === null) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startXRef.current;
    // Limit drag bounds
    if (diff > -40 && diff < 160) {
      setOffsetX(diff);
    }
  };

  const handleTouchEnd = () => {
    if (startXRef.current === null) return;
    if (offsetX > 65) {
      // Swiped right enough to toggle!
      triggerHaptic();
      onToggle(item.id, !item.checked);
    }
    startXRef.current = null;
    setIsSwiping(false);
    setOffsetX(0);
  };

  // Mouse drag support for desktop pair-programming / testing
  const handleMouseDown = (e: MouseEvent) => {
    startXRef.current = e.clientX;
    isDraggingRef.current = true;
    setIsSwiping(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDraggingRef.current || startXRef.current === null) return;
    const diff = e.clientX - startXRef.current;
    if (diff > -30 && diff < 150) {
      setOffsetX(diff);
    }
  };

  const handleMouseUp = () => {
    if (isDraggingRef.current && offsetX > 65) {
      triggerHaptic();
      onToggle(item.id, !item.checked);
    }
    isDraggingRef.current = false;
    startXRef.current = null;
    setIsSwiping(false);
    setOffsetX(0);
  };

  const handleClick = () => {
    // Only toggle on simple click if wasn't dragged
    if (Math.abs(offsetX) < 5) {
      triggerHaptic();
      onToggle(item.id, !item.checked);
    }
  };

  const unitDisplay = item.unit && item.unit !== "piece" ? item.unit : "";

  return (
    <div className="relative overflow-hidden rounded-2xl select-none mb-3 shadow-xs">
      {/* Background revealed during swipe */}
      <div
        className={`absolute inset-0 flex items-center px-6 transition-colors duration-200 ${
          item.checked ? "bg-amber-600/30 text-amber-900 dark:text-amber-100" : "bg-emerald-600/30 text-emerald-900 dark:text-emerald-100"
        }`}
      >
        <div className="flex items-center gap-2 font-bold text-base">
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Check className="w-5 h-5 stroke-[3]" />
          </div>
          <span>{item.checked ? "Remettre dans la liste" : "Dans le caddie !"}</span>
        </div>
      </div>

      {/* Front sliding card */}
      <div
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: isSwiping ? "none" : "transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)",
        }}
        className={`relative z-10 flex items-center justify-between p-4 min-h-[72px] border-2 rounded-2xl cursor-pointer active:scale-[0.99] transition-[background-color,border-color,opacity] ${
          item.checked
            ? "bg-muted/70 border-muted-foreground/20 opacity-60 line-through text-muted-foreground"
            : "bg-card border-border hover:border-primary/50 text-card-foreground shadow-xs"
        }`}
      >
        <div className="flex items-center gap-4 min-w-0 flex-1">
          {/* Giant checkbox tap target */}
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
              item.checked
                ? "bg-emerald-600 text-white border-2 border-emerald-600"
                : "border-2 border-muted-foreground/40 bg-background"
            }`}
          >
            {item.checked && <Check className="w-6 h-6 stroke-[3]" />}
          </div>

          {/* Ingredient image if available */}
          {item.ingredient?.image_url ? (
            <img
              src={item.ingredient.image_url}
              alt={item.name}
              className="w-11 h-11 rounded-xl bg-muted object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-11 h-11 rounded-xl bg-muted/60 flex items-center justify-center flex-shrink-0 text-muted-foreground">
              <HelpCircle className="w-6 h-6" />
            </div>
          )}

          {/* Item details */}
          <div className="min-w-0 flex-1">
            <span
              className={`block text-lg font-bold truncate leading-tight ${
                item.checked ? "line-through text-muted-foreground" : "text-foreground"
              }`}
            >
              {item.name}
            </span>

            {item.quantity && (
              <span className="inline-block mt-0.5 text-sm font-semibold text-primary/90 bg-primary/10 px-2 py-0.5 rounded-md">
                {item.quantity} {unitDisplay}
              </span>
            )}
          </div>
        </div>

        {/* Swipe hint on right */}
        <div className="text-[11px] text-muted-foreground/60 font-medium pl-2 text-right hidden sm:block">
          {item.checked ? "Coché" : "Glisser ➔"}
        </div>
      </div>
    </div>
  );
};
