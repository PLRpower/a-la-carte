export type AppRole = 'admin' | 'user';
export type RecipeDifficulty = 'easy' | 'medium' | 'hard';
export type RecipeCategory = 'breakfast' | 'lunch' | 'dinner' | 'dessert' | 'snack' | 'vegetarian' | 'vegan';
export type IngredientCategory = 'vegetables' | 'fruits' | 'dairy' | 'meat' | 'fish' | 'grains' | 'oils' | 'spices' | 'beverages' | 'other';
export type MeasurementUnit = 'g' | 'kg' | 'ml' | 'l' | 'cup' | 'tbsp' | 'tsp' | 'oz' | 'lb' | 'piece';

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
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
  instructions: string | null;
  is_public: boolean;
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
  ingredient_id: string;
  quantity: number;
  unit: MeasurementUnit;
  notes: string | null;
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
    notes: string | null;
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
