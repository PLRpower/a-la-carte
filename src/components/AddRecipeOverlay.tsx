import { useState, useRef } from "react";
import { Camera, FileText, X, ArrowLeft, Upload, Share2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface AddRecipeOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddRecipeOverlay = ({ isOpen, onClose }: AddRecipeOverlayProps) => {
  const [method, setMethod] = useState<"photo" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleClose = () => {
    setMethod(null);
    onClose();
  };

  const handleImageUpload = (file: File) => {
    // Navigate to the add page with the file for AI processing
    handleClose();
    navigate("/recipes/add", { state: { file } });
  };

  const handleManualSelect = () => {
    // Navigate to the add page for manual entry
    handleClose();
    navigate("/recipes/add");
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in"
      onClick={handleClose}
    >
      <div
        className="fixed inset-x-0 bottom-0 max-w-2xl mx-auto animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-background rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
            <div className="flex items-center gap-2">
              {method && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMethod(null)}
                  className="mr-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}
              <h2 className="text-xl font-bold">
                {method === "photo" ? "Scanner une recette" : "Ajouter une nouvelle recette"}
              </h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="px-6 py-6 pb-10">
            {!method && (
              <div className="space-y-4">
                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setMethod("photo")}
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
                  onClick={() => {
                    handleClose();
                    navigate("/recipes/share-instructions");
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                        <Share2 className="w-6 h-6 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Depuis un site web</h3>
                        <p className="text-sm text-muted-foreground">
                          Importez automatiquement une recette en la partageant depuis votre navigateur
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={handleManualSelect}
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
            )}

            {method === "photo" && (
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="w-20 h-20 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
                      <Camera className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold mb-2">Télécharger une photo de recette</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      L'IA va scanner et extraire les détails de la recette
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                    />
                    <Button
                      className="w-full"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choisir une photo
                    </Button>
                  </CardContent>
                </Card>
                <p className="text-xs text-muted-foreground text-center">
                  Nous utiliserons l'IA pour détecter et extraire les informations de la recette à partir de votre image
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
