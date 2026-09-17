import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RecipeQRCode } from "./RecipeQRCode";
import { Copy, Check, Share2, Printer, QrCode, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RecipeWithDetails } from "@/types/database";

interface ShareRecipeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipe: RecipeWithDetails;
  onPrint?: () => void;
}

export const ShareRecipeModal = ({
  open,
  onOpenChange,
  recipe,
  onPrint,
}: ShareRecipeModalProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/shared/recipe/${recipe.id}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Lien copié ! 📋",
        description: "Le lien public a été copié dans votre presse-papiers.",
      });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien.",
        variant: "destructive",
      });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: `Découvrez la recette "${recipe.title}" sur À la carte !`,
          url: shareUrl,
        });
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Share error", err);
        }
      }
    } else {
      handleCopy();
    }
  };

  const handlePrintClick = () => {
    onOpenChange(false);
    setTimeout(() => {
      if (onPrint) {
        onPrint();
      } else {
        window.print();
      }
    }, 250);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col p-5 overflow-y-auto">
        <DialogHeader className="text-left space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Partager la recette</DialogTitle>
              <DialogDescription className="text-xs">
                Accès direct sans compte et sans télécharger l'application.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* QR Code Presentation */}
        <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-muted/30 border border-border/70 my-2">
          <RecipeQRCode value={shareUrl} size={160} />
          <div className="flex items-center gap-1.5 mt-2.5 text-xs text-muted-foreground font-medium text-center">
            <QrCode className="w-3.5 h-3.5 text-accent" />
            <span>Scannez pour ouvrir la recette sur un smartphone</span>
          </div>
        </div>

        {/* Link input with copy button */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Lien public</label>
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={shareUrl}
              className="text-xs h-9 bg-muted/20 border-border/70 font-mono select-all"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <Button
              type="button"
              size="sm"
              onClick={handleCopy}
              className="h-9 px-3 shrink-0 bg-accent text-accent-foreground hover:bg-accent/90 shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1" />
                  Copié
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  Copier
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Actions grid */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          {"share" in navigator && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleNativeShare}
              className="h-9 text-xs font-semibold border-border/80 hover:bg-accent hover:text-accent-foreground"
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
              Envoyer par SMS / WhatsApp
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrintClick}
            className={`h-9 text-xs font-semibold border-border/80 hover:bg-accent hover:text-accent-foreground ${
              !("share" in navigator) ? "col-span-2" : ""
            }`}
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" />
            Imprimer / PDF
          </Button>
        </div>

        <DialogFooter className="pt-2 sm:justify-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs text-muted-foreground w-full"
          >
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
