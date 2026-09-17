import { useState, useEffect, useRef, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ScanBarcode,
  Camera,
  Upload,
  RefreshCw,
  Check,
  AlertTriangle,
  PackagePlus,
  ShoppingCart,
  Loader2,
  X,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  fetchProductByBarcode,
  ScannedProduct,
  NUTRISCORE_CONFIG,
} from "@/lib/openfoodfacts";
import { useStock } from "@/hooks/useStock";
import { useShoppingList } from "@/hooks/useShoppingList";
import { useIngredients } from "@/hooks/useIngredients";
import { IngredientCategory, MeasurementUnit } from "@/types/database";

interface BarcodeScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDestination?: "stock" | "shopping-list";
  onProductAdded?: (product: ScannedProduct, destination: "stock" | "shopping-list") => void;
}

export const BarcodeScannerDialog = ({
  open,
  onOpenChange,
  defaultDestination = "stock",
  onProductAdded,
}: BarcodeScannerDialogProps) => {
  const { addStock } = useStock();
  const { addSmartItem } = useShoppingList();
  const { getOrCreateIngredient } = useIngredients();

  const [scanning, setScanning] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<ScannedProduct | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);

  // Form edit state for scanned product
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState<IngredientCategory>("autre");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState<MeasurementUnit>("piece");
  const [expirationDate, setExpirationDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const qrCodeInstanceRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const readerElementId = "barcode-scanner-viewport";

  const playBeep = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (_) {
      // Audio not supported or blocked
    }
    if (navigator.vibrate) {
      navigator.vibrate(120);
    }
  }, []);

  const stopScanner = useCallback(async () => {
    if (qrCodeInstanceRef.current) {
      try {
        if (qrCodeInstanceRef.current.isScanning) {
          await qrCodeInstanceRef.current.stop();
        }
        qrCodeInstanceRef.current.clear();
      } catch (err) {
        console.warn("Error stopping scanner:", err);
      }
      qrCodeInstanceRef.current = null;
    }
    setScanning(false);
  }, []);

  const handleBarcodeDetected = useCallback(
    async (barcode: string) => {
      playBeep();
      await stopScanner();
      setLoadingProduct(true);
      setCameraError(null);

      try {
        const prod = await fetchProductByBarcode(barcode);
        setScannedProduct(prod);
        setProductName(prod.name);
        setCategory(prod.category);
        setQuantity(prod.quantity ? prod.quantity.toString() : "1");
        setUnit(prod.unit);
      } catch (err) {
        console.error("OpenFoodFacts error:", err);
        toast.error("Produit non trouvé sur Open Food Facts. Saisie manuelle activée.");
        setScannedProduct({
          barcode,
          name: "",
          category: "autre",
          allergens: [],
          quantity: 1,
          unit: "piece",
        });
        setProductName("");
        setCategory("autre");
        setQuantity("1");
        setUnit("piece");
      } finally {
        setLoadingProduct(false);
      }
    },
    [playBeep, stopScanner]
  );

  const startScanner = useCallback(async () => {
    setCameraError(null);
    setScannedProduct(null);

    // Wait a frame for the viewport container to be mounted in dialog DOM
    setTimeout(async () => {
      try {
        const container = document.getElementById(readerElementId);
        if (!container) return;

        if (qrCodeInstanceRef.current) {
          await stopScanner();
        }

        const html5Qr = new Html5Qrcode(readerElementId);
        qrCodeInstanceRef.current = html5Qr;

        await html5Qr.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: (viewfinderWidth, viewfinderHeight) => {
              const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
              return {
                width: Math.floor(minEdge * 0.8),
                height: Math.floor(minEdge * 0.45),
              };
            },
            aspectRatio: 1.333,
          },
          (decodedText) => {
            handleBarcodeDetected(decodedText);
          },
          () => {
            // Frame scan failure (quietly ignore)
          }
        );

        setScanning(true);
      } catch (err) {
        console.error("Failed to start scanner:", err);
        setScanning(false);
        setCameraError(
          "Impossible d'accéder à la caméra. Vérifiez les autorisations ou téléversez une photo."
        );
      }
    }, 150);
  }, [handleBarcodeDetected, stopScanner]);

  useEffect(() => {
    if (open) {
      startScanner();
    } else {
      stopScanner();
      setScannedProduct(null);
      setCameraError(null);
      setShowManualInput(false);
      setManualCode("");
    }
    return () => {
      stopScanner();
    };
  }, [open, startScanner, stopScanner]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoadingProduct(true);
    setCameraError(null);

    try {
      await stopScanner();
      const html5Qr = new Html5Qrcode(readerElementId);
      const decodedText = await html5Qr.scanFile(file, true);
      handleBarcodeDetected(decodedText);
    } catch (err) {
      console.error("File barcode decode error:", err);
      toast.error("Aucun code-barres lisible détecté sur cette photo.");
      setLoadingProduct(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleBarcodeDetected(manualCode.trim());
  };

  const handleSaveToDestination = async (destination: "stock" | "shopping-list") => {
    if (!productName.trim()) {
      toast.error("Veuillez saisir un nom pour le produit");
      return;
    }

    setIsSaving(true);
    try {
      const { data: ingredient, error: ingError } = await getOrCreateIngredient(
        productName.trim(),
        category
      );

      if (ingError || !ingredient) {
        throw new Error("Erreur lors de la création de l'ingrédient");
      }

      const parsedQty = parseFloat(quantity) || 1;

      if (destination === "stock") {
        const { error: stockErr } = await addStock(
          ingredient.id,
          parsedQty,
          unit,
          expirationDate || undefined
        );
        if (stockErr) throw stockErr;
        toast.success(`${productName} ajouté à votre stock !`);
      } else {
        const smartInput = `${parsedQty} ${unit} ${productName}`.trim();
        const { error: listErr } = await addSmartItem(smartInput);
        if (listErr) throw listErr;
        toast.success(`${productName} ajouté à votre liste de courses !`);
      }

      if (onProductAdded && scannedProduct) {
        onProductAdded(
          {
            ...scannedProduct,
            name: productName,
            category,
            quantity: parsedQty,
            unit,
          },
          destination
        );
      }

      // Reset to scan next
      setScannedProduct(null);
      startScanner();
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err instanceof Error ? err.message : "Échec de l'enregistrement");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden sm:rounded-2xl max-h-[95vh] flex flex-col">
        <DialogHeader className="p-4 pb-2 bg-primary text-primary-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ScanBarcode className="w-5 h-5" />
              <DialogTitle className="text-lg font-semibold">Scanner Code-Barres</DialogTitle>
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

        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          {/* Scanning & Camera Area */}
          {!scannedProduct && !loadingProduct && (
            <div className="space-y-3">
              <div className="relative bg-black rounded-xl overflow-hidden aspect-[4/3] flex items-center justify-center border border-muted">
                <div id={readerElementId} className="w-full h-full" />

                {/* Targeting Overlay box */}
                {scanning && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-3/4 h-2/5 border-2 border-dashed border-emerald-400 rounded-lg shadow-[0_0_15px_rgba(52,211,153,0.5)] animate-pulse" />
                  </div>
                )}

                {cameraError && (
                  <div className="absolute inset-0 bg-background/90 p-4 flex flex-col items-center justify-center text-center gap-2">
                    <AlertTriangle className="w-8 h-8 text-destructive" />
                    <p className="text-sm font-medium">{cameraError}</p>
                    <Button size="sm" variant="outline" onClick={startScanner} className="mt-2 gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5" /> Réessayer
                    </Button>
                  </div>
                )}
              </div>

              {/* Action Buttons for scanner */}
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5 text-xs"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-3.5 h-3.5" />
                  Depuis la galerie
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5 text-xs"
                  onClick={() => setShowManualInput(!showManualInput)}
                >
                  <Camera className="w-3.5 h-3.5" />
                  Saisie manuelle
                </Button>
              </div>

              {showManualInput && (
                <form onSubmit={handleManualSubmit} className="flex gap-2 pt-1">
                  <Input
                    placeholder="Entrez les chiffres du code..."
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    className="text-sm h-9"
                  />
                  <Button type="submit" size="sm" className="h-9">
                    Rechercher
                  </Button>
                </form>
              )}
            </div>
          )}

          {/* Loading OpenFoodFacts Product */}
          {loadingProduct && (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="font-semibold text-base">Recherche sur Open Food Facts...</p>
              <p className="text-xs text-muted-foreground">
                Récupération de la marque, catégorie, Nutri-Score et allergènes
              </p>
            </div>
          )}

          {/* Product Scanned & Editing Card */}
          {scannedProduct && !loadingProduct && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              {/* Product Header Card */}
              <div className="flex gap-3 bg-accent/10 p-3 rounded-xl border border-accent/20">
                {scannedProduct.imageUrl ? (
                  <img
                    src={scannedProduct.imageUrl}
                    alt={scannedProduct.name}
                    className="w-20 h-20 rounded-lg object-contain bg-background border p-1"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                    <ScanBarcode className="w-8 h-8" />
                  </div>
                )}

                <div className="flex-1 min-w-0 space-y-1">
                  {scannedProduct.brand && (
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {scannedProduct.brand}
                    </span>
                  )}
                  <h3 className="font-bold text-sm leading-snug line-clamp-2">
                    {scannedProduct.name || "Produit sans titre"}
                  </h3>
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {/* NutriScore badge */}
                    {scannedProduct.nutriscore && (
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          NUTRISCORE_CONFIG[scannedProduct.nutriscore].bg
                        } ${NUTRISCORE_CONFIG[scannedProduct.nutriscore].text}`}
                      >
                        Nutri-Score {scannedProduct.nutriscore.toUpperCase()}
                      </span>
                    )}

                    {scannedProduct.rawQuantity && (
                      <Badge variant="secondary" className="text-[10px]">
                        {scannedProduct.rawQuantity}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Allergens warning */}
              {scannedProduct.allergens.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs">
                    <span className="font-semibold text-amber-900 dark:text-amber-200">
                      Allergènes détectés :
                    </span>{" "}
                    <span className="text-amber-800 dark:text-amber-300">
                      {scannedProduct.allergens.join(", ")}
                    </span>
                  </div>
                </div>
              )}

              {/* Editable Fields */}
              <div className="space-y-3 pt-1">
                <div className="space-y-1">
                  <Label htmlFor="prod-name" className="text-xs">
                    Nom de l'ingrédient
                  </Label>
                  <Input
                    id="prod-name"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="prod-qty" className="text-xs">
                      Quantité
                    </Label>
                    <Input
                      id="prod-qty"
                      type="number"
                      step="any"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="prod-unit" className="text-xs">
                      Unité
                    </Label>
                    <Select value={unit} onValueChange={(val) => setUnit(val as MeasurementUnit)}>
                      <SelectTrigger id="prod-unit" className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="piece">Pièce</SelectItem>
                        <SelectItem value="g">Grammes (g)</SelectItem>
                        <SelectItem value="kg">Kilos (kg)</SelectItem>
                        <SelectItem value="ml">Millilitres (ml)</SelectItem>
                        <SelectItem value="l">Litres (L)</SelectItem>
                        <SelectItem value="cuillere_soupe">Cuillère à soupe</SelectItem>
                        <SelectItem value="cuillere_the">Cuillère à café</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="prod-cat" className="text-xs">
                    Catégorie
                  </Label>
                  <Select
                    value={category}
                    onValueChange={(val) => setCategory(val as IngredientCategory)}
                  >
                    <SelectTrigger id="prod-cat" className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fruits_legumes">Fruits & Légumes</SelectItem>
                      <SelectItem value="boucherie">Boucherie & Volailles</SelectItem>
                      <SelectItem value="poissonnerie">Poissonnerie</SelectItem>
                      <SelectItem value="produits_laitiers">Produits laitiers & Fromages</SelectItem>
                      <SelectItem value="epicerie_salee">Épicerie salée</SelectItem>
                      <SelectItem value="epicerie_sucree">Épicerie sucrée</SelectItem>
                      <SelectItem value="produits_frais">Produits frais & Traiteur</SelectItem>
                      <SelectItem value="produits_surgeles">Surgelés</SelectItem>
                      <SelectItem value="boissons">Boissons</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="prod-exp" className="text-xs text-muted-foreground">
                    Date de péremption (optionnel pour le stock)
                  </Label>
                  <Input
                    id="prod-exp"
                    type="date"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              {/* Final Action Buttons */}
              <div className="space-y-2 pt-2 border-t">
                {defaultDestination === "stock" ? (
                  <>
                    <Button
                      onClick={() => handleSaveToDestination("stock")}
                      disabled={isSaving}
                      className="w-full gap-2 font-semibold h-10"
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <PackagePlus className="w-4 h-4" />
                      )}
                      Ajouter au Stock
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleSaveToDestination("shopping-list")}
                      disabled={isSaving}
                      className="w-full gap-2 text-xs h-9"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Ajouter plutôt à la liste de courses
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => handleSaveToDestination("shopping-list")}
                      disabled={isSaving}
                      className="w-full gap-2 font-semibold h-10"
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ShoppingCart className="w-4 h-4" />
                      )}
                      Ajouter à la liste de courses
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleSaveToDestination("stock")}
                      disabled={isSaving}
                      className="w-full gap-2 text-xs h-9"
                    >
                      <PackagePlus className="w-3.5 h-3.5" />
                      Ajouter plutôt au Stock
                    </Button>
                  </>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setScannedProduct(null);
                    startScanner();
                  }}
                  disabled={isSaving}
                  className="w-full text-xs text-muted-foreground"
                >
                  Scanner un autre produit
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
