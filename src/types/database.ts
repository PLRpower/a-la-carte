export type AppRole = 'admin' | 'user';
export type RecipeDifficulty = 'facile' | 'moyen' | 'difficile';
export type RecipeCategory = 'petit_dejeuner' | 'dejeuner' | 'diner' | 'dessert' | 'encas' | 'vegetarien' | 'vegan';
export type RecipeSource = 'book' | 'cooking_class' | 'website' | 'photo';
export type IngredientCategory = 'fruits_legumes' | 'boucherie' | 'poissonnerie' | 'produits_laitiers' | 'epicerie_sucree' | 'epicerie_salee' | 'produits_frais' | 'produits_surgeles' | 'boissons' | 'autre';
export type MeasurementUnit = 'g' | 'kg' | 'ml' | 'l' | 'cuillere_soupe' | 'cuillere_the' | 'piece';

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email?: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;

  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  subscription_status?: string | null;
  plan_id?: string | null;
  current_period_end?: string | null;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface Recipe {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  difficulty: RecipeDifficulty | null;
  prep_time: number | null;
  cook_time: number | null;
  servings: number | null;
  category: RecipeCategory | null;
  tags: string[] | null;
  source: RecipeSource | null;
  instructions: string | null;
  created_at: string;
  updated_at: string;
}

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory | null;
  image_url: string | null;
  synonyms?: string[];
  created_at: string;
}

export interface RecipeIngredient {
  id: string;
  recipe_id: string;
  ingredient_id: string | null;
  quantity: number;
  unit: MeasurementUnit;
  name: string;
}

export interface Stock {
  id: string;
  user_id: string;
  ingredient_id: string;
  quantity: number;
  unit: MeasurementUnit;
  expiration_date: string | null;
  low_stock: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShoppingListItem {
  id: string;
  user_id: string;
  ingredient_id: string | null;
  name: string;
  quantity: number | null;
  unit: MeasurementUnit | null;
  checked: boolean;
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  recipe_id: string;
  created_at: string;
}

// Extended types with relations
export interface RecipeWithDetails extends Recipe {
  profile?: Profile;
  ingredients?: {
    id: string;
    quantity: number;
    unit: MeasurementUnit;
    name: string;
    ingredient: Ingredient;
  }[];
  is_favorited?: boolean;
}

export interface StockWithIngredient extends Stock {
  ingredient: Ingredient;
}

export interface ShoppingListItemWithIngredient extends ShoppingListItem {
  ingredient?: Ingredient;
}

export type MealPlanSlot = 'lunch' | 'dinner';

export interface MealPlanRecipeSnapshot {
  id?: string;
  title: string;
  description?: string | null;
  image_url?: string | null;
  prep_time?: number | null;
  cook_time?: number | null;
  difficulty?: RecipeDifficulty | null;
  category?: RecipeCategory | null;
  tags?: string[] | null;
  instructions?: string | null;
  servings?: number | null;
  ingredients?: Array<{
    name: string;
    quantity: number | null;
    unit: MeasurementUnit | null;
    ingredient_id?: string | null;
    category?: IngredientCategory | null;
  }>;
}

export interface MealPlan {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  slot: MealPlanSlot;
  recipe_id: string | null;
  catalog_recipe_id?: string | null;
  custom_title: string | null;
  servings: number;
  notes?: string | null;
  recipe_snapshot?: MealPlanRecipeSnapshot | null;
  created_at: string;
  updated_at: string;
}

export interface MealPlanWithRecipe extends MealPlan {
  recipe?: RecipeWithDetails | null;
}

export interface BatchCookingTask {
  id: string;
  category: 'prep' | 'oven' | 'stovetop' | 'packaging';
  title: string;
  description: string;
  durationMinutes: number;
  associatedRecipes: string[];
  ingredients?: string[];
  completed?: boolean;
}

export interface BatchCookingSession {
  selectedRecipes: Array<RecipeWithDetails | MealPlanRecipeSnapshot>;
  estimatedTotalMinutes: number;
  savedMinutes: number;
  tasks: BatchCookingTask[];
  storageAdvice: Array<{
    recipeTitle: string;
    shelfLifeDays: number;
    location: 'fridge' | 'freezer';
    containerType: string;
    tip: string;
  }>;
}
