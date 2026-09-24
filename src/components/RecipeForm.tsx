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
import { Camera, Upload, X, Image as ImageIcon, ChevronsUpDown, Check } from "lucide-react";
import { MultiSelect } from "./ui/multi-select";

const CATEGORY_OPTIONS = [
    { value: 'petit_dejeuner', label: 'Petit-déjeuner' },
    { value: 'dejeuner', label: 'Déjeuner' },
    { value: 'diner', label: 'Dîner' },
    { value: 'dessert', label: 'Dessert' },
    { value: 'encas', label: 'En-cas' },
    { value: 'vegetarien', label: 'Végétarien' },
    { value: 'vegan', label: 'Végétalien' }
];

export interface RecipeFormData {
    title: string;
    description: string;
    ingredients: string;
    steps: string;
    difficulty: string;
    prepTime: string;
    cookTime: string;
    servings: string;
    tags: string[];
    category?: string;
    imageFile: File | null;
    imageFiles?: File[];
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
    const [tags, setTags] = useState<string[]>(initialData?.tags || []);
    const [source, setSource] = useState(initialData?.source || "");

    // Manage multiple files
    const [imageFiles, setImageFiles] = useState<File[]>(
        initialData?.imageFiles || (initialData?.imageFile ? [initialData.imageFile] : [])
    );
    // Manage existing image URL (legacy/single) - TODO: Expand for multiple existing URLs
    const [imageUrl, setImageUrl] = useState<string | null>(initialData?.imageUrl || null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Update state when initialData changes
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
            if (initialData.tags) setTags(initialData.tags);
            // Backward compatibility
            if (initialData.category && (!initialData.tags || initialData.tags.length === 0)) {
                setTags([initialData.category]);
            }
            if (initialData.source) setSource(initialData.source);

            const newFiles = initialData.imageFiles || (initialData.imageFile ? [initialData.imageFile] : []);
            if (newFiles.length > 0) setImageFiles(newFiles);

            if (initialData.imageUrl) setImageUrl(initialData.imageUrl);
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
            tags,
            // maintain category for backward compatibility, ensure it's null if no tags
            category: tags[0] || undefined,
            source,
            imageFile: imageFiles[0] || null, // Backwards compatibility
            imageFiles: imageFiles,
            imageUrl: imageUrl
        });
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            setImageFiles(prev => [...prev, ...newFiles]);
        }
    };

    const removeFile = (index: number) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = () => {
        setImageUrl(null);
    };

    return (
        <div className="space-y-6">
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

                <div>
                    <Label className="mb-2 block">Tags / Catégories</Label>
                    <MultiSelect
                        options={CATEGORY_OPTIONS}
                        selected={tags}
                        onChange={setTags}
                        placeholder="Choisir des catégories..."
                    />
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
                            <SelectItem value="photo">Photo / Scan</SelectItem>
                        </SelectContent>
                    </Select>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div>
                    <Label htmlFor="ingredients">Ingrédients *</Label>
                    <Textarea
                        id="ingredients"
                        placeholder="1 tasse de farine&#10;2 oeufs&#10;100 g de sucre"
                        value={ingredients}
                        onChange={(e) => setIngredients(e.target.value)}
                        rows={8}
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
            </div>

            {/* Photos Section */}
            <div>
                <Label htmlFor="photo" className="mb-2 block">Photos de la recette</Label>

                {/* Image Previews */}
                {(imageUrl || imageFiles.length > 0) && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {imageUrl && (
                            <div className="relative aspect-square rounded-lg overflow-hidden border bg-muted">
                                <img src={imageUrl} alt="Existing" className="w-full h-full object-cover" />
                                <button
                                    onClick={removeExistingImage}
                                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        {imageFiles.map((file, idx) => (
                            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border bg-muted group">
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt={`Preview ${idx}`}
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    onClick={() => removeFile(idx)}
                                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <div className="absolute bottom-0 text-[10px] bg-black/60 text-white w-full px-2 py-1 truncate">
                                    {file.name}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex flex-col gap-3">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleFileSelect}
                    />
                    <input
                        id="form-camera-input"
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={handleFileSelect}
                    />

                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => document.getElementById('form-camera-input')?.click()}
                        >
                            <Camera className="w-4 h-4 mr-2" />
                            Prendre photo
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            Choisir photos
                        </Button>
                    </div>
                </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row-reverse gap-3">
                <Button
                    onClick={handleSubmit}
                    className="w-full sm:w-auto sm:min-w-[200px]"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Sauvegarde..." : submitLabel}
                </Button>
                <Button
                    variant="ghost"
                    onClick={onCancel}
                    className="w-full sm:w-auto"
                    disabled={isSubmitting}
                >
                    Annuler
                </Button>
            </div>
        </div>
    );
};
