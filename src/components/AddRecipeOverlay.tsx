import { Camera, FileText, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface AddRecipeOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddRecipeOverlay = ({ isOpen, onClose }: AddRecipeOverlayProps) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSelect = (method: "photo" | "manual") => {
    onClose();
    navigate("/add", { state: { method } });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="fixed inset-x-0 bottom-0 max-w-2xl mx-auto animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-background rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between rounded-t-3xl">
            <h2 className="text-xl font-bold">Ajouter une nouvelle recette</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="px-6 py-6">
            <div className="space-y-4">
              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleSelect("photo")}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Camera className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Depuis une photo</h3>
                      <p className="text-sm text-muted-foreground">
                        Téléchargez une photo pour détecter le texte ou l'utiliser comme référence
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleSelect("manual")}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Saisie manuelle</h3>
                      <p className="text-sm text-muted-foreground">
                        Remplissez les détails avec un formulaire structuré
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
