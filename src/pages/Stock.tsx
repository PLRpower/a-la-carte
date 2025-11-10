import { useState } from "react";
import { Plus, AlertCircle, ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const stockItems = [
  { id: 1, name: "Arborio Rice", quantity: "2 cups", category: "Grains", lowStock: false },
  { id: 2, name: "Olive Oil", quantity: "500ml", category: "Oils", lowStock: false },
  { id: 3, name: "Garlic", quantity: "2 cloves", category: "Vegetables", lowStock: true },
  { id: 4, name: "Parmesan Cheese", quantity: "50g", category: "Dairy", lowStock: true },
  { id: 5, name: "Mushrooms", quantity: "100g", category: "Vegetables", lowStock: true },
  { id: 6, name: "Butter", quantity: "200g", category: "Dairy", lowStock: false },
  { id: 7, name: "Vegetable Stock", quantity: "1 liter", category: "Broth", lowStock: false },
  { id: 8, name: "White Wine", quantity: "1 bottle", category: "Beverages", lowStock: false },
];

const Stock = () => {
  const [items] = useState(stockItems);
  const navigate = useNavigate();
  const lowStockCount = items.filter((item) => item.lowStock).length;

  return (
    <div className="pb-20 min-h-screen">
      {/* Header */}
      <header className="bg-primary text-primary-foreground pt-8 pb-6 px-6">
        <h1 className="text-2xl font-bold mb-4">My Stock</h1>
        
        {/* Low Stock Alert */}
        {lowStockCount > 0 && (
          <Card className="bg-accent text-accent-foreground">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {lowStockCount} item{lowStockCount > 1 ? "s" : ""} running low
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => navigate("/shopping-list")}
                >
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </header>

      {/* Action Buttons */}
      <section className="px-6 mt-4">
        <div className="grid grid-cols-2 gap-3">
          <Button className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/shopping-list")}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Shopping List
          </Button>
        </div>
      </section>

      {/* Stock Items */}
      <section className="px-6 mt-6 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">All Items ({items.length})</h2>
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id} className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{item.name}</h3>
                      {item.lowStock && (
                        <Badge variant="destructive" className="text-xs">
                          Low
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{item.quantity}</span>
                      <span>•</span>
                      <span>{item.category}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost">
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {items.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">No items in stock</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start adding ingredients to keep track of your pantry
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add First Item
            </Button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Stock;
