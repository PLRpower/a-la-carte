import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Receipt,
  Camera,
  Upload,
  Loader2,
  Trash2,
  Plus,
  CheckCheck,
  PackagePlus,
  ShoppingCart,
  Store,
  Calendar,
  X,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { compressImage } from "@/utils/imageOptimizer";
import { supabase } from "@/integrations/supabase/client";
import { useStock } from "@/hooks/useStock";
import { useShoppingList } from "@/hooks/useShoppingList";
import { useIngredients } from "@/hooks/useIngredients";
import { IngredientCategory, MeasurementUnit } from "@/types/database";

interface ReceiptItem {
  id: string;
  name: string;
  raw_text?: string;
  quantity: number;
  unit: MeasurementUnit;
  category: IngredientCategory;
  selected: boolean;
}

interface ReceiptScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDestination?: "stock" | "shopping-list";
}

export const ReceiptScannerDialog = ({
  open,
  onOpenChange,
  defaultDestination = "stock",
}: ReceiptScannerDialogProps) => {
  const { addStock } = useStock();
  const { addItems } = useShoppingList();
  const { getOrCreateIngredient } = useIngredients();

  const [loading, setLoading] = useState(false);
  const [storeName, setStoreName] = useState<string | null>(null);
  const [receiptDate, setReceiptDate] = useState<string | null>(null);
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [destination, setDestination] = useState<"stock" | "shopping-list">(defaultDestination);
  const [isSaving, setIsSaving] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;

    setLoading(true);
    try {
      const compressed = await compressImage(rawFile, {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1600,
      });

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;

        try {
          const { data, error } = await supabase.functions.invoke("scan-receipt", {
            body: { imageBase64: base64 },
          });

          if (error) throw error;
          if (data?.error) throw new Error(data.error);

          const parsedItems: ReceiptItem[] = (data?.items || []).map(
            (it: {
              name: string;
              raw_text?: string;
              quantity?: number;
              unit?: MeasurementUnit;
              category?: IngredientCategory;
            }) => ({
              id: crypto.randomUUID(),
              name: it.name || "Article",
              raw_text: it.raw_text,
              quantity: it.quantity || 1,
              unit: (it.unit as MeasurementUnit) || "piece",
              category: (it.category as IngredientCategory) || "autre",
              selected: true,
            })
          );

          if (parsedItems.length === 0) {
            toast.error("Aucun ingrédient détecté sur ce ticket. Veuillez réessayer avec une photo plus nette.");
          } else {
            setItems(parsedItems);
            setStoreName(data.store_name || null);
            setReceiptDate(data.date || null);
            toast.success(`${parsedItems.length} ingrédients identifiés sur votre ticket !`);
          }
        } catch (scanErr) {
          console.error("Receipt AI parsing failed:", scanErr);
          toast.error(
            scanErr instanceof Error
              ? scanErr.message
              : "Échec de la lecture du ticket par l'IA. Vérifiez votre connexion."
          );
        } finally {
          setLoading(false);
        }
      };

      reader.readAsDataURL(compressed);
    } catch (err) {
      console.error("Image handling error:", err);
      toast.error("Impossible de charger l'image");
      setLoading(false);
    }
  };

  const handleToggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleUpdateItem = (id: string, updates: Partial<ReceiptItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleToggleAll = (select: boolean) => {
    setItems((prev) => prev.map((item) => ({ ...item, selected: select })));
  };

  const handleAddItemManual = () => {
    const newItem: ReceiptItem = {
      id: crypto.randomUUID(),
      name: "",
      quantity: 1,
      unit: "piece",
      category: "autre",
      selected: true,
    };
    setItems((prev) => [newItem, ...prev]);
  };

  const handleSaveAll = async () => {
    const selectedItems = items.filter((i) => i.selected && i.name.trim());
    if (selectedItems.length === 0) {
      toast.error("Aucun ingrédient sélectionné à importer");
      return;
    }

    setIsSaving(true);
    let successCount = 0;

    try {
      if (destination === "stock") {
        for (const item of selectedItems) {
          try {
            const { data: ing } = await getOrCreateIngredient(item.name.trim(), item.category);
            if (ing) {
              await addStock(ing.id, item.quantity, item.unit);
              successCount++;
            }
          } catch (e) {
            console.warn(`Failed to add stock item ${item.name}:`, e);
          }
        }
        toast.success(`${successCount} articles ajoutés au stock !`);
      } else {
        const toAdd = selectedItems.map((item) => ({
          name: item.name.trim(),
          quantity: item.quantity,
          unit: item.unit,
        }));
        await addItems(toAdd);
        successCount = toAdd.length;
        toast.success(`${successCount} articles ajoutés à la liste de courses !`);
      }

      onOpenChange(false);
      setItems([]);
      setStoreName(null);
      setReceiptDate(null);
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Une erreur est survenue lors de l'enregistrement");
    } finally {
      setIsSaving(false);
    }
  };

  const selectedCount = items.filter((i) => i.selected).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden sm:rounded-2xl max-h-[92vh] flex flex-col">
        <DialogHeader className="p-4 pb-3 bg-primary text-primary-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              <DialogTitle className="text-lg font-semibold">
                Scan Ticket de caisse / Drive
              </DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/20 rounded-full h-8 w-8"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Hidden File Inputs */}
        <input
          type="file"
          ref={cameraInputRef}
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileSelect}
        />
        <input
          type="file"
          ref={galleryInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />

        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          {/* Initial Capture Screen */}
          {items.length === 0 && !loading && (
            <div className="py-6 space-y-6 text-center">
              <div className="w-16 h-16 rounded-full bg-accent/15 text-accent mx-auto flex items-center justify-center">
                <Receipt className="w-8 h-8" />
              </div>
              <div className="space-y-1.5 max-w-sm mx-auto">
                <h3 className="font-bold text-lg">Mettre à jour le stock en un clin d'œil</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Prenez en photo votre ticket de supermarché ou facture Drive. L'IA déchiffre les
                  abréviations, quantités et catégories automatiquement.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2 max-w-md mx-auto">
                <Button
                  className="flex-1 gap-2 h-11 text-sm font-semibold"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <Camera className="w-4 h-4" />
                  Prendre une photo
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 gap-2 h-11 text-sm"
                  onClick={() => galleryInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4" />
                  Choisir une image
                </Button>
              </div>

              <div className="bg-muted/60 p-3 rounded-xl text-left text-xs text-muted-foreground space-y-1">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  Enseignes compatibles :
                </div>
                <p>Carrefour, E.Leclerc, Auchan, Lidl, Intermarché, Monoprix, Aldi, Drive & supermarchés.</p>
              </div>
            </div>
          )}

          {/* Loading AI state */}
          {loading && (
            <div className="py-14 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-base">Lecture du ticket par l'IA...</h4>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Traduction des abréviations, extraction des quantités et classification des ingrédients
                </p>
              </div>
            </div>
          )}

          {/* Review items extracted */}
          {items.length > 0 && !loading && (
            <div className="space-y-4">
              {/* Header Info */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-muted/60 p-3 rounded-xl text-xs">
                <div className="flex items-center gap-2">
                  {storeName && (
                    <Badge variant="secondary" className="gap-1 font-semibold">
                      <Store className="w-3 h-3" />
                      {storeName}
                    </Badge>
                  )}
                  {receiptDate && (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {receiptDate}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs px-2"
                    onClick={() => handleToggleAll(selectedCount !== items.length)}
                  >
                    <CheckCheck className="w-3.5 h-3.5 mr-1" />
                    {selectedCount === items.length ? "Tout désélectionner" : "Tout sélectionner"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs px-2 gap-1"
                    onClick={handleAddItemManual}
                  >
                    <Plus className="w-3 h-3" /> Ajouter
                  </Button>
                </div>
              </div>

              {/* Destination selector */}
              <div className="flex items-center gap-2 text-xs">
                <span className="font-medium text-muted-foreground">Destination :</span>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant={destination === "stock" ? "default" : "outline"}
                    className="h-7 text-xs gap-1"
                    onClick={() => setDestination("stock")}
                  >
                    <PackagePlus className="w-3 h-3" /> Mon Stock
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={destination === "shopping-list" ? "default" : "outline"}
                    className="h-7 text-xs gap-1"
                    onClick={() => setDestination("shopping-list")}
                  >
                    <ShoppingCart className="w-3 h-3" /> Liste de courses
                  </Button>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl border transition-colors ${
                      item.selected
                        ? "bg-card border-border shadow-sm"
                        : "bg-muted/40 border-transparent opacity-60"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <Checkbox
                        checked={item.selected}
                        onCheckedChange={() => handleToggleItem(item.id)}
                        className="mt-1.5"
                      />

                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2">
                          <Input
                            value={item.name}
                            onChange={(e) =>
                              handleUpdateItem(item.id, { name: e.target.value })
                            }
                            placeholder="Nom de l'ingrédient"
                            className="h-8 text-sm font-medium flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>

                        {item.raw_text && (
                          <p className="text-[10px] text-muted-foreground font-mono truncate">
                            Ticket : {item.raw_text}
                          </p>
                        )}

                        <div className="grid grid-cols-3 gap-2">
                          <Input
                            type="number"
                            step="any"
                            value={item.quantity}
                            onChange={(e) =>
                              handleUpdateItem(item.id, {
                                quantity: parseFloat(e.target.value) || 1,
                              })
                            }
                            className="h-7 text-xs"
                          />

                          <Select
                            value={item.unit}
                            onValueChange={(val) =>
                              handleUpdateItem(item.id, { unit: val as MeasurementUnit })
                            }
                          >
                            <SelectTrigger className="h-7 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="piece">pièce</SelectItem>
                              <SelectItem value="g">g</SelectItem>
                              <SelectItem value="kg">kg</SelectItem>
                              <SelectItem value="ml">ml</SelectItem>
                              <SelectItem value="l">L</SelectItem>
                            </SelectContent>
                          </Select>

                          <Select
                            value={item.category}
                            onValueChange={(val) =>
                              handleUpdateItem(item.id, {
                                category: val as IngredientCategory,
                              })
                            }
                          >
                            <SelectTrigger className="h-7 text-xs truncate">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fruits_legumes">Fruits & Légumes</SelectItem>
                              <SelectItem value="boucherie">Boucherie</SelectItem>
                              <SelectItem value="poissonnerie">Poissonnerie</SelectItem>
                              <SelectItem value="produits_laitiers">Produits laitiers</SelectItem>
                              <SelectItem value="epicerie_salee">Épicerie salée</SelectItem>
                              <SelectItem value="epicerie_sucree">Épicerie sucrée</SelectItem>
                              <SelectItem value="produits_frais">Produits frais</SelectItem>
                              <SelectItem value="produits_surgeles">Surgelés</SelectItem>
                              <SelectItem value="boissons">Boissons</SelectItem>
                              <SelectItem value="autre">Autre</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Confirm Save Bar */}
              <div className="pt-2 border-t space-y-2">
                <Button
                  onClick={handleSaveAll}
                  disabled={isSaving || selectedCount === 0}
                  className="w-full h-10 gap-2 font-semibold"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : destination === "stock" ? (
                    <PackagePlus className="w-4 h-4" />
                  ) : (
                    <ShoppingCart className="w-4 h-4" />
                  )}
                  Importer {selectedCount} article{selectedCount > 1 ? "s" : ""} dans{" "}
                  {destination === "stock" ? "mon Stock" : "mes Courses"}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setItems([]);
                    setStoreName(null);
                    setReceiptDate(null);
                  }}
                  disabled={isSaving}
                  className="w-full text-xs text-muted-foreground"
                >
                  Reprendre une autre photo
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
