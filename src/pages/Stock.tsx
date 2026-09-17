import { useState, useMemo } from "react";
import { Plus, AlertCircle, ShoppingCart, Trash2, Pencil, Carrot, Sparkles, Globe, ScanBarcode, Receipt, AlertTriangle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useStock } from "@/hooks/useStock";
import { useToast } from "@/hooks/use-toast";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { BarcodeScannerDialog } from "@/components/scanner/BarcodeScannerDialog";
import { ReceiptScannerDialog } from "@/components/scanner/ReceiptScannerDialog";
import { getExpiringStockItems, getExpirationStatus } from "@/lib/expiration-tracker";

const Stock = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { stock: items, loading, deleteStock } = useStock();
  const lowStockCount = items.filter((item) => item.low_stock).length;
  const urgentExpiringItems = useMemo(() => getExpiringStockItems(items, 48), [items]);

  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showReceiptScanner, setShowReceiptScanner] = useState(false);

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
            <div className="flex items-center gap-1.5">
              <Button
                size="icon"
                variant="ghost"
                className="text-primary-foreground hover:bg-primary-foreground/15 h-9 w-9"
                onClick={() => setShowBarcodeScanner(true)}
                title="Scanner un code-barres"
              >
                <ScanBarcode className="w-5 h-5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="text-primary-foreground hover:bg-primary-foreground/15 h-9 w-9"
                onClick={() => setShowReceiptScanner(true)}
                title="Scanner un ticket de caisse / Facture Drive"
              >
                <Receipt className="w-5 h-5" />
              </Button>
              <Button
                size="icon"
                className="bg-accent text-accent-foreground hover:bg-accent/90 h-9 w-9"
                onClick={() => navigate("/stock/add")}
                title="Ajouter manuellement"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Anti-Gaspi Alert (< 48h) */}
      {urgentExpiringItems.length > 0 && (
        <section className="px-6 -mt-4 mb-4">
          <Card className="bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg border-0">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-white/20 shrink-0">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-sm">
                      Alerte Anti-Gaspillage
                    </h3>
                    <Badge className="bg-white/25 text-white border-0 text-[10px] px-1.5 py-0 font-medium">
                      DLC &lt; 48h
                    </Badge>
                  </div>
                  <p className="text-xs text-white/90 mb-3 leading-relaxed">
                    <span className="font-semibold">{urgentExpiringItems.length} produit{urgentExpiringItems.length > 1 ? "s" : ""}</span> arrive{urgentExpiringItems.length > 1 ? "nt" : ""} à expiration :{" "}
                    {urgentExpiringItems.map((i) => i.ingredient?.name).filter(Boolean).slice(0, 3).join(", ")}
                    {urgentExpiringItems.length > 3 && ` (+${urgentExpiringItems.length - 3})`}
                  </p>
                  <Button
                    size="sm"
                    className="h-8 text-xs font-semibold bg-white text-amber-700 hover:bg-white/90 shadow-sm"
                    onClick={() => navigate("/", { state: { autoChefGaspi: true } })}
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-600" />
                    Cuisiner avec le Chef IA
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Low Stock Alert */}
      {lowStockCount > 0 && (
        <section className={`px-6 ${urgentExpiringItems.length > 0 ? "mb-4" : "-mt-4"}`}>
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
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
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

                          {/* DLC Expiration badge */}
                          {item.expiration_date && (
                            <div className="flex items-center gap-1.5 pt-0.5">
                              {(() => {
                                const status = getExpirationStatus(item.expiration_date);
                                if (status.urgency === "expired") {
                                  return (
                                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                                      {status.label}
                                    </Badge>
                                  );
                                }
                                if (status.urgency === "critical") {
                                  return (
                                    <Badge className="bg-amber-600 text-white text-[10px] px-1.5 py-0 flex items-center gap-1 border-0 shadow-xs font-semibold">
                                      <Clock className="w-3 h-3" />
                                      <span>{status.label}</span>
                                    </Badge>
                                  );
                                }
                                if (status.urgency === "warning") {
                                  return (
                                    <Badge variant="outline" className="text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700 text-[10px] px-1.5 py-0">
                                      {status.label}
                                    </Badge>
                                  );
                                }
                                return (
                                  <span className="text-[11px] text-muted-foreground">
                                    DLC : {status.formattedDate}
                                  </span>
                                );
                              })()}
                            </div>
                          )}
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
              },
              {
                label: "Scanner code-barres",
                icon: ScanBarcode,
                onClick: () => setShowBarcodeScanner(true),
                variant: "outline",
              },
              {
                label: "Scanner un ticket / Drive",
                icon: Receipt,
                onClick: () => setShowReceiptScanner(true),
                variant: "outline",
              }
            ]}
            tip={{
              icon: Sparkles,
              text: "L'IA utilise votre stock pour vous suggérer des recettes que vous pouvez cuisiner immédiatement sans faire de courses !"
            }}
          />
        )}
      </section>

      <BarcodeScannerDialog
        open={showBarcodeScanner}
        onOpenChange={setShowBarcodeScanner}
        defaultDestination="stock"
      />

      <ReceiptScannerDialog
        open={showReceiptScanner}
        onOpenChange={setShowReceiptScanner}
        defaultDestination="stock"
      />
    </div>
  );
};

export default Stock;
