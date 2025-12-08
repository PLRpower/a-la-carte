import { ArrowLeft, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

const RecipeShareInstructions = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background pb-20">
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
                    <h1 className="text-2xl font-bold">Import Web</h1>
                </div>
            </header>

            <div className="px-6 py-8 space-y-6">
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                        <Share2 className="w-10 h-10 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">Comment importer une recette ?</h2>
                    <p className="text-muted-foreground">
                        Vous pouvez importer des recettes directement depuis vos sites de cuisine préférés en utilisant la fonction de partage de votre navigateur.
                    </p>
                </div>

                <div className="space-y-4">
                    <Card>
                        <CardContent className="p-6 flex gap-4 items-start">
                            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 text-accent font-bold">
                                1
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Naviguez vers la recette</h3>
                                <p className="text-sm text-muted-foreground">
                                    Ouvrez votre navigateur et allez sur la page de la recette que vous souhaitez importer.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6 flex gap-4 items-start">
                            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 text-accent font-bold">
                                2
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Partagez la page</h3>
                                <p className="text-sm text-muted-foreground">
                                    Appuyez sur le bouton de partage de votre navigateur (souvent une icône de carré avec une flèche).
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6 flex gap-4 items-start">
                            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 text-accent font-bold">
                                3
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Sélectionnez "A La Carte"</h3>
                                <p className="text-sm text-muted-foreground">
                                    Dans la liste des applications, choisissez "A La Carte". La recette sera automatiquement analysée et importée !
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground text-center">
                    Note : Cette fonctionnalité nécessite que l'application soit installée sur votre appareil.
                </div>
            </div>
        </div>
    );
};

export default RecipeShareInstructions;
