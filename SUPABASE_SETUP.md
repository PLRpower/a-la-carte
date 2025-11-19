# Supabase Backend Integration

## Overview

Your "À la carte" cooking app is now fully integrated with Supabase, providing:
- ✅ User authentication (email/password)
- ✅ Database storage for recipes, ingredients, stock, and shopping lists
- ✅ Real-time synchronization
- ✅ File storage for images (avatars, recipe images, ingredient images)
- ✅ Row-level security (RLS) policies

## Database Schema

### Tables

#### `profiles`
User profile information
- `id` (uuid) - References auth.users
- `first_name` (text)
- `last_name` (text)
- `bio` (text)
- `avatar_url` (text)
- `created_at`, `updated_at` (timestamps)

#### `user_roles`
User role management (admin/user)
- `id` (uuid)
- `user_id` (uuid) - References auth.users
- `role` (enum: 'admin' | 'user')
- `created_at` (timestamp)

#### `recipes`
Recipe information
- `id` (uuid)
- `user_id` (uuid) - Recipe creator
- `title` (text)
- `description` (text)
- `image_url` (text)
- `difficulty` (enum: 'easy' | 'medium' | 'hard')
- `prep_time` (integer, minutes)
- `cook_time` (integer, minutes)
- `servings` (integer)
- `category` (enum: 'breakfast' | 'lunch' | 'dinner' | 'dessert' | 'snack' | 'vegetarian' | 'vegan')
- `instructions` (text)
- `is_public` (boolean)
- `created_at`, `updated_at` (timestamps)

#### `ingredients`
Master ingredient list
- `id` (uuid)
- `name` (text, unique)
- `category` (enum: 'vegetables' | 'fruits' | 'dairy' | 'meat' | 'fish' | 'grains' | 'oils' | 'spices' | 'beverages' | 'other')
- `image_url` (text)
- `created_at` (timestamp)

#### `recipe_ingredients`
Junction table linking recipes to ingredients
- `id` (uuid)
- `recipe_id` (uuid)
- `ingredient_id` (uuid)
- `quantity` (numeric)
- `unit` (enum: 'g' | 'kg' | 'ml' | 'l' | 'cup' | 'tbsp' | 'tsp' | 'oz' | 'lb' | 'piece')
- `notes` (text)

#### `stock`
User's ingredient inventory
- `id` (uuid)
- `user_id` (uuid)
- `ingredient_id` (uuid)
- `quantity` (numeric)
- `unit` (enum)
- `expiration_date` (date)
- `low_stock` (boolean)
- `created_at`, `updated_at` (timestamps)

#### `shopping_list`
User's shopping list
- `id` (uuid)
- `user_id` (uuid)
- `ingredient_id` (uuid, nullable)
- `name` (text)
- `quantity` (numeric, nullable)
- `unit` (enum, nullable)
- `checked` (boolean)
- `created_at`, `updated_at` (timestamps)

#### `favorites`
User's favorite recipes
- `id` (uuid)
- `user_id` (uuid)
- `recipe_id` (uuid)
- `created_at` (timestamp)

### Storage Buckets

#### `avatars`
User profile pictures
- Public read access
- Users can upload/update/delete their own avatars

#### `recipe-images`
Recipe photographs
- Public read access
- Authenticated users can upload
- Users can manage their own images

#### `ingredient-images`
Ingredient images
- Public read access
- Only admins can upload

## Authentication Setup

### Supabase Configuration

The Supabase client is already configured in `src/integrations/supabase/client.ts` with:
- Project URL: `https://iqauznwytxtpslyflmvv.supabase.co`
- Anon key: Already configured
- Auth storage: localStorage
- Session persistence: Enabled
- Auto token refresh: Enabled

### Auth Flow

1. **Sign Up**: Users register with email, password, and optional first/last name
2. **Sign In**: Users log in with email and password
3. **Auto Profile Creation**: When a user signs up, a trigger automatically creates:
   - A profile record in `profiles` table
   - A default 'user' role in `user_roles` table
4. **Session Management**: Sessions are stored in localStorage and auto-refreshed

### Important Settings

⚠️ **For testing**: Disable "Confirm email" in Supabase Dashboard → Authentication → Providers → Email to skip email verification during development.

⚠️ **Site URL Configuration**: 
- Go to Supabase Dashboard → Authentication → URL Configuration
- Set **Site URL** to your app's URL (preview or production)
- Add your app URLs to **Redirect URLs**

## React Hooks

### `useAuth()`
Main authentication hook
```tsx
const { user, session, loading, signUp, signIn, signOut } = useAuth();
```

### `useProfile()`
User profile management
```tsx
const { profile, loading, error, updateProfile, refetch } = useProfile();
```

### `useRecipes(filters?)`
Recipe management with optional filters
```tsx
const { 
  recipes, 
  loading, 
  error, 
  createRecipe, 
  updateRecipe, 
  deleteRecipe,
  toggleFavorite,
  refetch 
} = useRecipes({ category: 'dinner', difficulty: 'easy' });
```

### `useStock()`
Ingredient inventory management
```tsx
const { 
  stock, 
  loading, 
  error, 
  addStock, 
  updateStock, 
  deleteStock,
  refetch 
} = useStock();
```

### `useShoppingList()`
Shopping list management
```tsx
const { 
  items, 
  loading, 
  error, 
  addItem, 
  updateItem, 
  toggleItem,
  deleteItem,
  clearCheckedItems,
  refetch 
} = useShoppingList();
```

### `useIngredients()`
Ingredient database access
```tsx
const { 
  ingredients, 
  loading, 
  error, 
  searchIngredients,
  getOrCreateIngredient,
  refetch 
} = useIngredients();
```

## File Upload

Use the storage utility functions in `src/lib/supabase-storage.ts`:

```tsx
import { uploadFile, deleteFile, getPublicUrl } from '@/lib/supabase-storage';

// Upload a file
const { url, error } = await uploadFile('avatars', file, userId);

// Delete a file
const { error } = await deleteFile('recipe-images', filePath);

// Get public URL
const url = getPublicUrl('avatars', filePath);
```

## Real-Time Features

The app includes real-time subscriptions for:
- **Stock**: Automatically syncs when stock items change
- **Shopping List**: Updates in real-time when items are added/removed/checked

Example from `useStock.ts`:
```tsx
const channel = supabase
  .channel('stock-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'stock',
      filter: `user_id=eq.${user.id}`
    },
    () => {
      fetchStock();
    }
  )
  .subscribe();
```

## Security

### Row Level Security (RLS)

All tables have RLS enabled with policies ensuring:
- Users can only access their own data (stock, shopping list, favorites)
- Users can view all public recipes
- Users can only modify their own recipes
- Profiles are viewable by all authenticated users
- Only admins can manage master ingredient list

### Role-Based Access

The app uses a security definer function `has_role()` to check user permissions without causing RLS recursion issues.

## TypeScript Types

All database types are defined in `src/types/database.ts`:
- Enums: `AppRole`, `RecipeDifficulty`, `RecipeCategory`, `IngredientCategory`, `MeasurementUnit`
- Tables: `Profile`, `Recipe`, `Ingredient`, `Stock`, `ShoppingListItem`, etc.
- Extended types: `RecipeWithDetails`, `StockWithIngredient`, etc.

## Next Steps

1. **Test Authentication**: Sign up and sign in to verify the flow works
2. **Configure Email**: Set up email templates in Supabase Dashboard
3. **Add Sample Data**: Create test recipes and ingredients
4. **Customize RLS**: Adjust policies based on your specific requirements
5. **Set up Production**: Configure production URLs and environment variables

## Useful Links

- [Supabase Dashboard](https://supabase.com/dashboard/project/iqauznwytxtpslyflmvv)
- [Authentication Settings](https://supabase.com/dashboard/project/iqauznwytxtpslyflmvv/auth/providers)
- [Database Tables](https://supabase.com/dashboard/project/iqauznwytxtpslyflmvv/editor)
- [Storage Buckets](https://supabase.com/dashboard/project/iqauznwytxtpslyflmvv/storage/buckets)
- [API Logs](https://supabase.com/dashboard/project/iqauznwytxtpslyflmvv/logs/explorer)
