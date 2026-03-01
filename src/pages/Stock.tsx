import { Plus, AlertCircle, ShoppingCart, Trash2, Pencil, Carrot, Sparkles, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useStock } from "@/hooks/useStock";
import { useToast } from "@/hooks/use-toast";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

const Stock = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { stock: items, loading, deleteStock } = useStock();
  const lowStockCount = items.filter((item) => item.low_stock).length;

  const handleDelete = async (id: string) => {
    const { error } = await deleteStock(id);
    if (error) {
      toast({
        title: "Erreur",
        description: "Échec de la suppression de l'article",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Supprimé",
        description: "Article retiré du stock",
      });
    }
  };

  return (
    <div className="pb-20 min-h-screen">
      {/* Header */}
      <header className="bg-primary text-primary-foreground pt-8 pb-6 px-6">
        <div className="flex items-center gap-3">

          <div className="flex items-center justify-between w-full">
            <h1 className="text-2xl font-bold">Mes ingrédients</h1>
            <Button
              size="icon"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={() => navigate("/stock/add")}
            >
              <Plus className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </header>

      {/* Low Stock Alert */}
      {lowStockCount > 0 && (
        <section className="px-6 -mt-4">
          <Card className="bg-accent text-accent-foreground shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Attention</h3>
                  <p className="text-sm opacity-90">
                    {lowStockCount} article{lowStockCount > 1 ? "s" : ""} presque épuisé{lowStockCount > 1 ? "s" : ""}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => navigate("/shopping-list")}
                >Voir
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      )}



      {/* Stock Items */}
      <section className="px-6 mt-6 pb-6">
        {!loading && items.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Tous les articles ({items.length})</h2>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="shadow-sm border-none">
                <CardContent className="p-4 flex gap-4 items-center">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
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
                                Bas
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => navigate(`/stock/edit/${item.id}`)}
                      >
                        <Pencil className="w-4 h-4 text-[#3D2B1F]" />
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
          <EmptyState
            icon={Carrot}
            title="Garde-manger vide"
            description="Le secret d'une bonne cuisine commence par un inventaire bien tenu. Suivez vos ingrédients ici."
            actions={[
              {
                label: "Ajouter au stock",
                icon: Plus,
                onClick: () => navigate("/stock/add"),
                variant: "default",
              }
            ]}
            tip={{
              icon: Sparkles,
              text: "L'IA utilise votre stock pour vous suggérer des recettes que vous pouvez cuisiner immédiatement sans faire de courses !"
            }}
          />
        )}
      </section>
    </div>
  );
};

export default Stock;
