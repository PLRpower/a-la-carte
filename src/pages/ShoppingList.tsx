import { useState } from "react";
import { Plus, ArrowRight, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useShoppingList } from "@/hooks/useShoppingList";
import { useToast } from "@/hooks/use-toast";
import { groupItemsByCategory, sortCategories } from "@/lib/shopping-list-utils";
import { ShoppingListCategory } from "@/components/shopping-list/ShoppingListCategory";

const ShoppingList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, loading, toggleItem, deleteItem, addSmartItem, clearCheckedItems } = useShoppingList();
  const [newItemInput, setNewItemInput] = useState("");

  const checkedCount = items.filter((item) => item.checked).length;

  const handleAddItem = async () => {
    if (!newItemInput.trim()) return;

    const { error } = await addSmartItem(newItemInput.trim());
    if (error) {
      toast({
        title: "Erreur",
        description: "Échec de l'ajout de l'article",
        variant: "destructive",
      });
    } else {
      setNewItemInput("");
      toast({
        title: "Ajouté",
        description: "Article ajouté à la liste de courses",
      });
    }
  };

  const handleToggle = async (id: string, checked: boolean) => {
    const { error } = await toggleItem(id, !checked);
    if (error) {
      toast({
        title: "Erreur",
        description: "Échec de la mise à jour de l'article",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await deleteItem(id);
    if (error) {
      toast({
        title: "Erreur",
        description: "Échec de la suppression de l'article",
        variant: "destructive",
      });
    }
  };

  const handleClearChecked = async () => {
    const { error } = await clearCheckedItems();
    if (error) {
      toast({
        title: "Erreur",
        description: "Échec de l'effacement des articles",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Effacé",
        description: `${checkedCount} article(s) retiré(s)`,
      });
    }
  };

  const groupedItems = groupItemsByCategory(items);
  const sortedCategories = sortCategories(Object.keys(groupedItems));

  return (
    <div className="pb-20 min-h-screen">
      {/* Header */}
      <header className="bg-primary text-primary-foreground pt-8 pb-6 px-6">
        <div className="flex items-center gap-3 mb-4">
          <div>
            <h1 className="text-2xl font-bold">Liste de courses</h1>
            <p className="text-sm opacity-90">
              {checkedCount} sur {items.length} articles cochés
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          className="w-full mt-2"
          onClick={() => navigate("/stock")}
        >
          <Package className="w-4 h-4 mr-2" />
          Voir mon Stock
        </Button>
      </header>

      {/* Shopping Items */}
      <section className="px-6 mt-6 pb-6">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Chargement des articles...</p>
          </div>
        ) : items.length > 0 ? (
          <>
            <div className="space-y-6">
              {sortedCategories.map((category) => (
                <ShoppingListCategory
                  key={category}
                  category={category}
                  items={groupedItems[category]}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                />
              ))}
            </div>
            {checkedCount > 0 && (
              <Button variant="outline" className="w-full mt-6" onClick={handleClearChecked}>
                Effacer les articles cochés ({checkedCount})
              </Button>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">Pas encore d'articles</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Ajoutez des articles depuis votre stock ou vos recettes
            </p>
          </div>
        )}
      </section>

      {/* Smart Input Bar */}
      <div className="bg-background border-t p-4 pb-safe z-50">
        <div className="max-w-2xl mx-auto flex gap-2">
          <Input
            placeholder="Ajouter (ex: 2 tomates, 500g farine...)"
            value={newItemInput}
            onChange={(e) => setNewItemInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
            className="flex-1"
          />
          <Button onClick={handleAddItem} size="icon">
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div >
  );
};

export default ShoppingList;
