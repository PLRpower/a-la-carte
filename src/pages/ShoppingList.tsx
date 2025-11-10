import { useState } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";

const initialItems = [
  { id: 1, name: "Garlic", checked: false },
  { id: 2, name: "Parmesan Cheese", checked: false },
  { id: 3, name: "Mushrooms", checked: true },
  { id: 4, name: "Fresh Parsley", checked: false },
];

const ShoppingList = () => {
  const [items, setItems] = useState(initialItems);
  const navigate = useNavigate();

  const toggleItem = (id: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const checkedCount = items.filter((item) => item.checked).length;

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
        <Button className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </section>

      {/* Shopping Items */}
      <section className="px-6 mt-6 pb-6">
        {items.length > 0 ? (
          <div className="space-y-3">
            {items.map((item) => (
              <Card key={item.id} className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={item.checked}
                      onCheckedChange={() => toggleItem(item.id)}
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
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeItem(item.id)}
                      className="flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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

        {items.length > 0 && (
          <Button variant="outline" className="w-full mt-6">
            Clear Checked Items ({checkedCount})
          </Button>
        )}
      </section>
    </div>
  );
};

export default ShoppingList;
