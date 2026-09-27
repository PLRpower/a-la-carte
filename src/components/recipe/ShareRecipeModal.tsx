import { useState, useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RecipeQRCode } from "./RecipeQRCode";
import { Copy, Check, Share2, Printer, QrCode, ExternalLink, Users, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RecipeWithDetails } from "@/types/database";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

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
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isOwner = !!(user && recipe.user_id === user.id);

  const [copied, setCopied] = useState(false);
  const [sharedWithFamily, setSharedWithFamily] = useState(!!recipe.is_shared_with_family);
  const [sharedPublic, setSharedPublic] = useState(!!recipe.is_public);
  const [updatingSharing, setUpdatingSharing] = useState(false);

  useEffect(() => {
    setSharedWithFamily(!!recipe.is_shared_with_family);
    setSharedPublic(!!recipe.is_public);
  }, [recipe.is_shared_with_family, recipe.is_public, open]);

  const handleToggleFamily = async (checked: boolean) => {
    setSharedWithFamily(checked);
    setUpdatingSharing(true);
    try {
      const { error } = await supabase
        .from("recipes")
        .update({ is_shared_with_family: checked })
        .eq("id", recipe.id);
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["recipes"] });
      toast({
        title: checked ? "Partagée avec la famille ! 👨‍👩‍👧‍👦" : "Retirée de la famille 🔒",
        description: checked
          ? "Vos proches peuvent désormais voir cette recette dans leur carnet."
          : "Cette recette n'est plus visible par les membres de votre famille.",
      });
    } catch (err) {
      console.error(err);
      setSharedWithFamily(!checked);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le partage familial.",
        variant: "destructive",
      });
    } finally {
      setUpdatingSharing(false);
    }
  };

  const handleTogglePublic = async (checked: boolean) => {
    setSharedPublic(checked);
    setUpdatingSharing(true);
    try {
      const { error } = await supabase
        .from("recipes")
        .update({ is_public: checked })
        .eq("id", recipe.id);
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["recipes"] });
      toast({
        title: checked ? "Publiée dans Découvrir ! 🌍" : "Passée en privé 🔒",
        description: checked
          ? "Cette recette est maintenant visible par toute la communauté dans l'onglet Découvrir."
          : "Cette recette n'est plus accessible publiquement dans Découvrir.",
      });
    } catch (err) {
      console.error(err);
      setSharedPublic(!checked);
      toast({
        title: "Erreur",
        description: "Impossible de modifier la visibilité publique.",
        variant: "destructive",
      });
    } finally {
      setUpdatingSharing(false);
    }
  };

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

        {/* In-app Sharing Options for Recipe Owner */}
        {isOwner && (
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/80 space-y-3 my-1">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Visibilité dans l'application
            </h4>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <Label htmlFor="modal-share-family" className="text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    Partager avec ma famille
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    Visible par votre foyer dans leur carnet
                  </p>
                </div>
                <Switch
                  id="modal-share-family"
                  checked={sharedWithFamily}
                  disabled={updatingSharing}
                  onCheckedChange={handleToggleFamily}
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-2 border-t border-border/40">
                <div className="space-y-0.5">
                  <Label htmlFor="modal-share-public" className="text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
                    <Globe className="w-3.5 h-3.5 text-sky-500" />
                    Publier dans Découvrir (Public)
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    Visible par toute la communauté
                  </p>
                </div>
                <Switch
                  id="modal-share-public"
                  checked={sharedPublic}
                  disabled={updatingSharing}
                  onCheckedChange={handleTogglePublic}
                />
              </div>
            </div>
          </div>
        )}

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
