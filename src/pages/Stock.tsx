import { Plus, AlertCircle, ShoppingCart, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useStock } from "@/hooks/useStock";
import { useToast } from "@/hooks/use-toast";

const Stock = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { stock: items, loading, deleteStock } = useStock();
  const lowStockCount = items.filter((item) => item.low_stock).length;

  const handleDelete = async (id: string) => {
    const { error } = await deleteStock(id);
    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Deleted",
        description: "Item removed from stock",
      });
    }
  };

  return (
    <div className="pb-20 min-h-screen">
      {/* Header */}
      <header className="bg-primary text-primary-foreground pt-8 pb-6 px-6">
        <h1 className="text-2xl font-bold">My Ingredients</h1>
      </header>

      {/* Low Stock Alert */}
      {lowStockCount > 0 && (
        <section className="px-6 -mt-4">
          <Card className="bg-accent text-accent-foreground shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Warning</h3>
                  <p className="text-sm opacity-90">
                    {lowStockCount} item{lowStockCount > 1 ? "s" : ""} running low
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => navigate("/shopping-list")}
                >View
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Action Buttons */}
      <section className="px-6 mt-4">
        <div className="grid grid-cols-2 gap-3">
          <Button className="w-full" onClick={() => navigate("/stock/add")}>
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

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading stock...</p>
          </div>
        ) : items.length > 0 ? (
          <div className="space-y-3">
            {items.map((item) => (
              <Card key={item.id} className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        {item.ingredient?.image_url && (
                          <img
                            src={item.ingredient.image_url}
                            alt={item.ingredient.name}
                            className="w-10 h-10 rounded-full object-cover bg-muted"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{item.ingredient?.name}</h3>
                            <span className="text-sm text-muted-foreground">
                              - {item.quantity} {item.unit}
                            </span>
                            {item.low_stock && (
                              <Badge variant="destructive" className="text-xs">
                                Low
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/stock/edit/${item.id}`)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">No items in stock</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start adding ingredients to keep track of your pantry
            </p>
            <Button onClick={() => navigate("/stock/add")}>
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
