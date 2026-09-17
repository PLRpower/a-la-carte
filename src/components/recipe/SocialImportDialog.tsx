import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Share2,
  Video,
  Sparkles,
  Loader2,
  Link as LinkIcon,
  FileText,
  X,
  Youtube,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SocialImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SocialImportDialog = ({ open, onOpenChange }: SocialImportDialogProps) => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"url" | "text">("url");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleExtract = async () => {
    if (activeTab === "url" && !url.trim()) {
      toast.error("Veuillez saisir le lien d'une vidéo");
      return;
    }

    if (activeTab === "text" && !text.trim()) {
      toast.error("Veuillez coller la description ou la transcription");
      return;
    }

    setLoading(true);
    try {
      const payload: { url?: string; text?: string } = {};
      if (activeTab === "url") {
        payload.url = url.trim();
      } else {
        payload.text = text.trim();
      }

      console.log("Calling scrape-recipe with:", payload);
      const { data, error } = await supabase.functions.invoke("scrape-recipe", {
        body: payload,
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (!data?.recipe) throw new Error("Aucune donnée de recette retournée par l'IA");

      toast.success("Recette extraite avec succès !");
      onOpenChange(false);

      // Navigate to RecipeAdd with prefilled recipe data
      navigate("/recipes/add", {
        state: {
          prefilledRecipe: data.recipe,
          source: "website",
        },
      });
    } catch (err) {
      console.error("Social import error:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Impossible d'extraire la recette. Vous pouvez coller le texte directement."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden sm:rounded-2xl flex flex-col">
        <DialogHeader className="p-4 pb-3 bg-primary text-primary-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              <DialogTitle className="text-lg font-semibold">
                Import Réseaux Sociaux & Vidéos
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

        <div className="p-5 space-y-4">
          {/* Supported platform badges */}
          <div className="flex items-center justify-center gap-2 py-1">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-black text-white flex items-center gap-1">
              <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .57.04.84.11V9.33a6.33 6.33 0 0 0-.84-.06 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.5a8.28 8.28 0 0 0 5.25 1.83V6.89a4.83 4.83 0 0 1-1.48-.2z" />
              </svg>
              TikTok
            </span>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white flex items-center gap-1">
              <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              Instagram Reels
            </span>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-600 text-white flex items-center gap-1">
              <Youtube className="w-3 h-3" />
              Shorts
            </span>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as "url" | "text")}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="url" className="text-xs gap-1.5">
                <LinkIcon className="w-3.5 h-3.5" />
                Lien de la vidéo
              </TabsTrigger>
              <TabsTrigger value="text" className="text-xs gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Description / Texte
              </TabsTrigger>
            </TabsList>

            <TabsContent value="url" className="space-y-3 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="social-url" className="text-xs font-medium">
                  Collez le lien de la vidéo
                </Label>
                <Input
                  id="social-url"
                  placeholder="https://www.tiktok.com/@... ou https://www.instagram.com/reel/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={loading}
                  className="text-sm"
                />
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                L'IA analyse automatiquement les métadonnées et la description de la vidéo pour en
                extraire les ingrédients et les étapes de préparation.
              </p>
            </TabsContent>

            <TabsContent value="text" className="space-y-3 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="social-text" className="text-xs font-medium">
                  Collez la légende ou la transcription
                </Label>
                <Textarea
                  id="social-text"
                  placeholder="Copiez-collez ici le texte sous la vidéo (ingrédients, instructions, hashtags)..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={4}
                  disabled={loading}
                  className="text-sm resize-none"
                />
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Idéal si Instagram ou TikTok protège la vidéo : copiez le texte sous le post et
                l'IA structure tout instantanément.
              </p>
            </TabsContent>
          </Tabs>

          <Button
            onClick={handleExtract}
            disabled={loading}
            className="w-full h-11 gap-2 font-semibold text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyse de la recette par l'IA...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Extraire la recette
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
