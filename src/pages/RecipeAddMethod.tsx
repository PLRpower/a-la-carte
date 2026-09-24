import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Globe, PenTool, Image as ImageIcon, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SocialImportDialog } from "@/components/recipe/SocialImportDialog";

const RecipeAddMethod = () => {
    const navigate = useNavigate();
    const [showPhotoOptions, setShowPhotoOptions] = useState(false);
    const [showSocialImport, setShowSocialImport] = useState(false);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            navigate("/recipes/add", { state: { file, source: "photo" } });
        }
    };

    return (
        <div className="min-h-screen bg-background pb-20 md:pb-12">
            <input
                type="file"
                ref={cameraInputRef}
                className="hidden"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
            />
            <input
                type="file"
                ref={galleryInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
            />

            <header className="bg-primary text-primary-foreground pt-8 pb-6 px-6 md:px-8 sticky top-0 md:top-16 z-10 md:rounded-2xl md:my-6 shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-primary-foreground hover:text-primary-foreground/80 -ml-2"
                        onClick={() => navigate("/recipes")}
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <h1 className="text-2xl font-bold">Ajouter une recette</h1>
                </div>
            </header>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card
                    className="cursor-pointer hover:bg-accent/5 transition-colors"
                    onClick={() => setShowPhotoOptions(!showPhotoOptions)}
                >
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                                <Camera className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">À partir d'une image</h3>
                                <p className="text-sm text-muted-foreground">Prenez une photo ou importez depuis votre galerie</p>
                            </div>
                        </div>

                        {showPhotoOptions && (
                            <div className="mt-6 flex flex-col sm:flex-row gap-3 pt-4 border-t border-border animate-in fade-in slide-in-from-top-4">
                                <Button
                                    className="flex-1 flex gap-2"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        cameraInputRef.current?.click();
                                    }}
                                >
                                    <Camera className="w-4 h-4" />
                                    Prendre une photo
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1 flex gap-2"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        galleryInputRef.current?.click();
                                    }}
                                >
                                    <ImageIcon className="w-4 h-4" />
                                    Choisir depuis la galerie
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card
                    className="cursor-pointer hover:bg-accent/5 transition-colors"
                    onClick={() => navigate("/recipes/share-instructions")}
                >
                    <CardContent className="flex items-center gap-4 p-6">
                        <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                            <Globe className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Importer du web</h3>
                            <p className="text-sm text-muted-foreground">Copiez le lien d'une recette ou partagez-la</p>
                        </div>
                    </CardContent>
                </Card>

                <Card
                    className="cursor-pointer hover:bg-accent/5 transition-colors"
                    onClick={() => setShowSocialImport(true)}
                >
                    <CardContent className="flex items-center gap-4 p-6">
                        <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                            <Video className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Réseaux sociaux & Vidéos</h3>
                            <p className="text-sm text-muted-foreground">TikTok, Instagram Reels, YouTube Shorts par lien ou texte</p>
                        </div>
                    </CardContent>
                </Card>

                <Card
                    className="cursor-pointer hover:bg-accent/5 transition-colors"
                    onClick={() => navigate("/recipes/add")}
                >
                    <CardContent className="flex items-center gap-4 p-6">
                        <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                            <PenTool className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Créer manuellement</h3>
                            <p className="text-sm text-muted-foreground">Saisissez votre recette étape par étape</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <SocialImportDialog open={showSocialImport} onOpenChange={setShowSocialImport} />
        </div>
    );
};

export default RecipeAddMethod;
