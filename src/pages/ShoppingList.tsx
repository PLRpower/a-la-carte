import { useState, useRef, useEffect } from "react";
import { Plus, ChevronDown, ChevronRight, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

import { useShoppingList } from "@/hooks/useShoppingList";
import { useToast } from "@/hooks/use-toast";
import { groupItemsByCategory, sortCategories } from "@/lib/shopping-list-utils";
import { ShoppingListCategory } from "@/components/shopping-list/ShoppingListCategory";
import { ShoppingListItem } from "@/components/shopping-list/ShoppingListItem";
import { supabase } from "@/integrations/supabase/client";

const ShoppingList = () => {

  const { toast } = useToast();
  const { items, loading, toggleItem, deleteItem, updateItem, addSmartItem, finishShopping } = useShoppingList();

  const [isAdding, setIsAdding] = useState(false);
  const [newItemInput, setNewItemInput] = useState("");
  const [showChecked, setShowChecked] = useState(true);
  const addItemInputRef = useRef<HTMLInputElement>(null);

  const checkedItems = items.filter((item) => item.checked);
  const uncheckedItems = items.filter((item) => !item.checked);

  // Auto-focus input when adding mode is toggled
  useEffect(() => {
    if (isAdding && addItemInputRef.current) {
      addItemInputRef.current.focus();
    }
  }, [isAdding]);

  const handleAddItem = async () => {
    if (!newItemInput.trim()) {
      setIsAdding(false);
      return;
    }

    const { error } = await addSmartItem(newItemInput.trim());
    if (error) {
      toast({
        title: "Erreur",
        description: "Échec de l'ajout de l'article",
        variant: "destructive",
      });
    } else {
      setNewItemInput("");
      // Keep adding mode? Google Keep usually keeps a new line open.
      // Let's keep focus to allow rapid entry.
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddItem();
    }
  };

  const handleBlur = () => {
    // Small delay to allow 'Enter' to fire if that was the cause of blur
    setTimeout(() => {
      // If empty, close. If not, save.
      if (newItemInput.trim()) {
        handleAddItem();
      } else {
        setIsAdding(false);
      }
    }, 100);
  };

  useEffect(() => {
    // Subscribe to notifications
    const channel = supabase
      .channel('family_notifications')
      .on(
        'broadcast',
        { event: 'shopping_update' },
        (payload) => {
          console.log('Notification received:', payload);
          toast({
            title: "Liste mise à jour",
            description: payload.payload?.message || "La liste de courses a été modifiée.",
            duration: 5000,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const handleUpdate = async (id: string, updates: any) => {
    await updateItem(id, updates);
  };

  const handleSendNotification = async () => {
    try {
      // Send broadcast message
      const channel = supabase.channel('family_notifications');
      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.send({
            type: 'broadcast',
            event: 'shopping_update',
            payload: { message: "La liste de courses a été actualisée !" },
          });

          toast({
            title: "Envoyé",
            description: "La notification a été envoyée à la famille.",
          });
        }
      });
    } catch (error) {
      console.error("Error sending notification:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la notification.",
        variant: "destructive",
      });
    }
  };

  const groupedUnchecked = groupItemsByCategory(uncheckedItems);
  const sortedCategories = sortCategories(Object.keys(groupedUnchecked));

  return (
    <div className="pb-40 min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground pt-8 pb-6 px-6 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Liste de courses</h1>

          <Dialog>
            <DialogTrigger asChild>
              <Button size="icon" variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/20 rounded-full">
                <Bell className="w-6 h-6" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Notifier la famille ?</DialogTitle>
                <DialogDescription>
                  Voulez-vous envoyer une notification à tous les utilisateurs pour les informer que la liste de courses a été actualisée ?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex gap-2 sm:justify-end">
                <DialogClose asChild>
                  <Button variant="outline" type="button">Annuler</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button onClick={handleSendNotification}>Envoyer</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Shopping List Content */}
      <div className="px-4 mt-4 pb-6">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        ) : (
          <>
            {/* Unchecked Items */}
            <div className="space-y-4">
              {sortedCategories.map((category) => (
                <ShoppingListCategory
                  key={category}
                  category={category}
                  items={groupedUnchecked[category]}
                  onToggle={toggleItem}
                  onDelete={deleteItem}
                  onUpdate={handleUpdate}
                />
              ))}

              {uncheckedItems.length === 0 && !isAdding && (
                <div className="text-center py-8 text-muted-foreground italic">
                  Liste vide
                </div>
              )}
            </div>

            {/* Add Item Row */}
            <div className="mt-4">
              {isAdding ? (
                <div className="flex items-center gap-3 py-2 px-1 animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-5 h-5 flex-shrink-0" /> {/* Spacer for checkbox alignment */}
                  <input
                    ref={addItemInputRef}
                    value={newItemInput}
                    onChange={(e) => setNewItemInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    // onBlur={handleBlur} // Blur causing issues with "Enter" key on mobile sometimes, let's rely on Enter or clicking away manually closing? 
                    // Actually better: "Enter" adds and keeps focus. Clicking away (blur) adds and closes.
                    onBlur={handleBlur}
                    className="flex-1 bg-transparent border-none p-0 text-base focus:ring-0 focus:outline-none placeholder:text-muted-foreground"
                    placeholder="Nouvel article..."
                  />
                </div>
              ) : (
                <button
                  onClick={() => setIsAdding(true)}
                  className="flex items-center gap-3 w-full py-3 px-1 text-muted-foreground hover:text-foreground transition-colors text-left"
                >
                  <Plus className="w-5 h-5" />
                  <span className="text-base font-medium">Élément de liste</span>
                </button>
              )}
            </div>

            {/* Checked Items Accordion */}
            {checkedItems.length > 0 && (
              <div className="mt-8 border-t pt-4">
                <button
                  onClick={() => setShowChecked(!showChecked)}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-2 w-full text-left"
                >
                  {showChecked ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  <span className="font-medium text-sm">{checkedItems.length} éléments cochés</span>
                </button>

                {showChecked && (
                  <div className="space-y-0 pl-0 animate-in slide-in-from-top-2">
                    {checkedItems.map((item) => (
                      <ShoppingListItem
                        key={item.id}
                        item={item}
                        onToggle={toggleItem}
                        onDelete={deleteItem}
                        onUpdate={handleUpdate}
                      />
                    ))}

                    <div className="mt-6 pt-4 flex justify-center">
                      <Button variant="outline" onClick={() => finishShopping()}>
                        Terminer et ajouter au stock
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ShoppingList;
