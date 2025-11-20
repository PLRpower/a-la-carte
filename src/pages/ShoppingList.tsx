import { useState } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useShoppingList } from "@/hooks/useShoppingList";
import { useToast } from "@/hooks/use-toast";

const ShoppingList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, loading, toggleItem, deleteItem, addItem, clearCheckedItems } = useShoppingList();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newItemName, setNewItemName] = useState("");

  const checkedCount = items.filter((item) => item.checked).length;

  const handleAddItem = async () => {
    if (!newItemName.trim()) return;

    const { error } = await addItem(newItemName.trim());
    if (error) {
      toast({
        title: "Error",
        description: "Failed to add item",
        variant: "destructive",
      });
    } else {
      setNewItemName("");
      setShowAddDialog(false);
      toast({
        title: "Added",
        description: "Item added to shopping list",
      });
    }
  };

  const handleToggle = async (id: string, checked: boolean) => {
    const { error } = await toggleItem(id, !checked);
    if (error) {
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await deleteItem(id);
    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    }
  };

  const handleClearChecked = async () => {
    const { error } = await clearCheckedItems();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to clear items",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Cleared",
        description: `${checkedCount} item(s) removed`,
      });
    }
  };

  return (
    <div className="pb-20 min-h-screen">
      {/* Header */}
      <header className="bg-primary text-primary-foreground pt-8 pb-6 px-6">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Shopping List</h1>
            <p className="text-sm opacity-90">
              {checkedCount} of {items.length} items checked
            </p>
          </div>
        </div>
      </header>

      {/* Add Item Button */}
      <section className="px-6 mt-4">
        <Button className="w-full" onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </section>

      {/* Add Item Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Item name"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
            />
            <Button className="w-full" onClick={handleAddItem}>
              Add
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Shopping Items */}
      <section className="px-6 mt-6 pb-6">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading items...</p>
          </div>
        ) : items.length > 0 ? (
          <>
            <div className="space-y-3">
              {items.map((item) => (
                <Card key={item.id} className="shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={item.checked || false}
                        onCheckedChange={() => handleToggle(item.id, item.checked || false)}
                        className="flex-shrink-0"
                      />
                      <span
                        className={`flex-1 ${
                          item.checked
                            ? "line-through text-muted-foreground"
                            : ""
                        }`}
                      >
                        {item.name}
                        {item.quantity && item.unit && (
                          <span className="text-sm text-muted-foreground ml-2">
                            ({item.quantity} {item.unit})
                          </span>
                        )}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(item.id)}
                        className="flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {checkedCount > 0 && (
              <Button variant="outline" className="w-full mt-6" onClick={handleClearChecked}>
                Clear Checked Items ({checkedCount})
              </Button>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">No items yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add items from your stock or recipes
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default ShoppingList;
