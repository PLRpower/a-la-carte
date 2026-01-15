import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Globe, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const RecipeAddMethod = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            navigate("/recipes/add", { state: { file, source: "photo" } });
        }
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
            />

            <header className="bg-primary text-primary-foreground pt-8 pb-6 px-6 sticky top-0 z-10">
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

            <div className="p-6 space-y-4">
                <Card
                    className="cursor-pointer hover:bg-accent/5 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <CardContent className="flex items-center gap-4 p-6">
                        <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                            <Camera className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Scanner une photo</h3>
                            <p className="text-sm text-muted-foreground">Prenez en photo une recette d'un livre ou magazine</p>
                        </div>
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
        </div>
    );
};

export default RecipeAddMethod;
