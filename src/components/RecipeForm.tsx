import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Camera, Upload } from "lucide-react";

export interface RecipeFormData {
    title: string;
    description: string;
    ingredients: string;
    steps: string;
    difficulty: string;
    prepTime: string;
    cookTime: string;
    servings: string;
    category: string;
    imageFile: File | null;
    imageUrl?: string | null;
    source?: string;
}

interface RecipeFormProps {
    initialData?: Partial<RecipeFormData>;
    onSubmit: (data: RecipeFormData) => Promise<void>;
    onCancel: () => void;
    isSubmitting: boolean;
    submitLabel?: string;
}

export const RecipeForm = ({
    initialData,
    onSubmit,
    onCancel,
    isSubmitting,
    submitLabel = "Sauvegarder la recette"
}: RecipeFormProps) => {
    const [title, setTitle] = useState(initialData?.title || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [ingredients, setIngredients] = useState(initialData?.ingredients || "");
    const [steps, setSteps] = useState(initialData?.steps || "");
    const [difficulty, setDifficulty] = useState(initialData?.difficulty || "");
    const [prepTime, setPrepTime] = useState(initialData?.prepTime || "");
    const [cookTime, setCookTime] = useState(initialData?.cookTime || "");
    const [servings, setServings] = useState(initialData?.servings || "");
    const [category, setCategory] = useState(initialData?.category || "");
    const [source, setSource] = useState(initialData?.source || "");
    const [imageFile, setImageFile] = useState<File | null>(initialData?.imageFile || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Update state when initialData changes (important for AI import)
    useEffect(() => {
        if (initialData) {
            if (initialData.title) setTitle(initialData.title);
            if (initialData.description) setDescription(initialData.description);
            if (initialData.ingredients) setIngredients(initialData.ingredients);
            if (initialData.steps) setSteps(initialData.steps);
            if (initialData.difficulty) setDifficulty(initialData.difficulty);
            if (initialData.prepTime) setPrepTime(initialData.prepTime);
            if (initialData.cookTime) setCookTime(initialData.cookTime);
            if (initialData.servings) setServings(initialData.servings);
            if (initialData.category) setCategory(initialData.category);
            if (initialData.source) setSource(initialData.source);
            if (initialData.imageFile) setImageFile(initialData.imageFile);
        }
    }, [initialData]);

    const handleSubmit = () => {
        onSubmit({
            title,
            description,
            ingredients,
            steps,
            difficulty,
            prepTime,
            cookTime,
            servings,
            category,
            source,
            imageFile,
            imageUrl: initialData?.imageUrl
        });
    };

    return (
        <div className="space-y-4">
            <div>
                <Label htmlFor="title">Titre de la recette *</Label>
                <Input
                    id="title"
                    placeholder="Entrez le nom de la recette"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1.5"
                />
            </div>

            <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    placeholder="Brève description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="mt-1.5"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="difficulty">Difficulté *</Label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                        <SelectTrigger className="mt-1.5">
                            <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="facile">Facile</SelectItem>
                            <SelectItem value="moyen">Moyen</SelectItem>
                            <SelectItem value="difficile">Difficile</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="category">Catégorie</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="mt-1.5">
                                <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="petit_dejeuner">Petit-déjeuner</SelectItem>
                                <SelectItem value="dejeuner">Déjeuner</SelectItem>
                                <SelectItem value="diner">Dîner</SelectItem>
                                <SelectItem value="dessert">Dessert</SelectItem>
                                <SelectItem value="encas">En-cas</SelectItem>
                                <SelectItem value="vegetarien">Végétarien</SelectItem>
                                <SelectItem value="vegan">Végétalien</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="source">Source</Label>
                        <Select value={source} onValueChange={setSource}>
                            <SelectTrigger className="mt-1.5">
                                <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="book">Livre de recette</SelectItem>
                                <SelectItem value="cooking_class">Cours de cuisine</SelectItem>
                                <SelectItem value="website">Site internet</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div>
                    <Label htmlFor="prepTime">Prép (min)</Label>
                    <Input
                        id="prepTime"
                        type="number"
                        placeholder="15"
                        value={prepTime}
                        onChange={(e) => setPrepTime(e.target.value)}
                        className="mt-1.5"
                    />
                </div>

                <div>
                    <Label htmlFor="cookTime">Cuisson (min)</Label>
                    <Input
                        id="cookTime"
                        type="number"
                        placeholder="30"
                        value={cookTime}
                        onChange={(e) => setCookTime(e.target.value)}
                        className="mt-1.5"
                    />
                </div>

                <div>
                    <Label htmlFor="servings">Portions</Label>
                    <Input
                        id="servings"
                        type="number"
                        placeholder="4"
                        value={servings}
                        onChange={(e) => setServings(e.target.value)}
                        className="mt-1.5"
                    />
                </div>
            </div>

            <div>
                <Label htmlFor="ingredients">Ingrédients *</Label>
                <Textarea
                    id="ingredients"
                    placeholder="1 tasse de farine&#10;2 oeufs&#10;100 g de sucre"
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                    rows={6}
                    className="mt-1.5"
                />
                <p className="text-xs text-muted-foreground mt-1">
                    Entrez chaque ingrédient sur une nouvelle ligne (ex: "2 tasses de farine")
                </p>
            </div>

            <div>
                <Label htmlFor="steps">Étapes de préparation *</Label>
                <Textarea
                    id="steps"
                    placeholder="1. Première étape&#10;2. Deuxième étape&#10;3. Troisième étape"
                    value={steps}
                    onChange={(e) => setSteps(e.target.value)}
                    rows={8}
                    className="mt-1.5"
                />
            </div>

            <div>
                <Label htmlFor="photo">Photo de la recette</Label>
                <div className="flex flex-col gap-3 mt-1.5">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setImageFile(file);
                        }}
                    />
                    <input
                        id="form-camera-input"
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setImageFile(file);
                        }}
                    />

                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => document.getElementById('form-camera-input')?.click()}
                    >
                        <Camera className="w-4 h-4 mr-2" />
                        Prendre une photo
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload className="w-4 h-4 mr-2" />
                        Choisir une photo
                    </Button>
                </div>
                {imageFile && (
                    <p className="text-xs text-muted-foreground mt-1">
                        {imageFile.name}
                    </p>
                )}
            </div>

            <div className="pt-4 space-y-3">
                <Button
                    onClick={handleSubmit}
                    className="w-full"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Sauvegarde..." : submitLabel}
                </Button>
                <Button
                    variant="ghost"
                    onClick={onCancel}
                    className="w-full"
                    disabled={isSubmitting}
                >
                    Annuler
                </Button>
            </div>
        </div>
    );
};
