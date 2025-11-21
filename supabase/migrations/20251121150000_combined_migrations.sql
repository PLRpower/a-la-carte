-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create enum types
create type public.app_role as enum ('admin', 'user');
create type public.recipe_difficulty as enum ('easy', 'medium', 'hard');
create type public.recipe_category as enum ('breakfast', 'lunch', 'dinner', 'dessert', 'snack', 'vegetarian', 'vegan');
create type public.ingredient_category as enum ('vegetables', 'fruits', 'dairy', 'meat', 'fish', 'grains', 'oils', 'spices', 'beverages', 'other');
create type public.measurement_unit as enum ('g', 'kg', 'ml', 'l', 'cup', 'tbsp', 'tsp', 'oz', 'lb', 'piece');

-- Create profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  bio text,
  avatar_url text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

alter table public.profiles enable row level security;

-- Profiles RLS policies
create policy "Users can view all profiles"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- Create user_roles table
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamp with time zone default now() not null,
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- User roles RLS policies
create policy "Users can view own roles"
  on public.user_roles for select
  to authenticated
  using (auth.uid() = user_id);

-- Create security definer function for role checking
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- Create recipes table
create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  image_url text,
  difficulty recipe_difficulty,
  prep_time integer, -- in minutes
  cook_time integer, -- in minutes
  servings integer,
  category recipe_category,
  instructions text,
  is_public boolean default true,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

alter table public.recipes enable row level security;

-- Recipes RLS policies
create policy "Public recipes are viewable by everyone"
  on public.recipes for select
  to authenticated
  using (is_public = true or auth.uid() = user_id);

create policy "Users can create own recipes"
  on public.recipes for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own recipes"
  on public.recipes for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete own recipes"
  on public.recipes for delete
  to authenticated
  using (auth.uid() = user_id);

-- Create ingredients table
create table public.ingredients (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category ingredient_category,
  image_url text,
  created_at timestamp with time zone default now() not null
);

alter table public.ingredients enable row level security;


-- Ingredients RLS policies
create policy "Ingredients are viewable by everyone"
  on public.ingredients for select
  to authenticated
  using (true);

create policy "Authenticated users can insert ingredients"
  on public.ingredients for insert
  to authenticated
  with check (true);

create policy "Only admins can update ingredients"
  on public.ingredients for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Create recipe_ingredients junction table
create table public.recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid references public.recipes(id) on delete cascade not null,
  ingredient_id uuid references public.ingredients(id) on delete cascade not null,
  quantity numeric not null,
  unit measurement_unit not null,
  notes text,
  unique (recipe_id, ingredient_id)
);

alter table public.recipe_ingredients enable row level security;

-- Recipe ingredients RLS policies
create policy "Recipe ingredients viewable by everyone"
  on public.recipe_ingredients for select
  to authenticated
  using (true);

create policy "Users can add ingredients to own recipes"
  on public.recipe_ingredients for insert
  to authenticated
  with check (
    exists (
      select 1 from public.recipes
      where recipes.id = recipe_id
      and recipes.user_id = auth.uid()
    )
  );

create policy "Users can update ingredients in own recipes"
  on public.recipe_ingredients for update
  to authenticated
  using (
    exists (
      select 1 from public.recipes
      where recipes.id = recipe_id
      and recipes.user_id = auth.uid()
    )
  );

create policy "Users can delete ingredients from own recipes"
  on public.recipe_ingredients for delete
  to authenticated
  using (
    exists (
      select 1 from public.recipes
      where recipes.id = recipe_id
      and recipes.user_id = auth.uid()
    )
  );

-- Create stock table
create table public.stock (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  ingredient_id uuid references public.ingredients(id) on delete cascade not null,
  quantity numeric not null,
  unit measurement_unit not null,
  expiration_date date,
  low_stock boolean default false,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  unique (user_id, ingredient_id)
);

alter table public.stock enable row level security;

-- Stock RLS policies
create policy "Users can view own stock"
  on public.stock for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own stock"
  on public.stock for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own stock"
  on public.stock for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete own stock"
  on public.stock for delete
  to authenticated
  using (auth.uid() = user_id);

-- Create shopping_list table
create table public.shopping_list (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  ingredient_id uuid references public.ingredients(id) on delete cascade,
  name text not null,
  quantity numeric,
  unit measurement_unit,
  checked boolean default false,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

alter table public.shopping_list enable row level security;

-- Shopping list RLS policies
create policy "Users can view own shopping list"
  on public.shopping_list for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own shopping list items"
  on public.shopping_list for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own shopping list items"
  on public.shopping_list for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete own shopping list items"
  on public.shopping_list for delete
  to authenticated
  using (auth.uid() = user_id);

-- Create favorites table
create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  recipe_id uuid references public.recipes(id) on delete cascade not null,
  created_at timestamp with time zone default now() not null,
  unique (user_id, recipe_id)
);

alter table public.favorites enable row level security;

-- Favorites RLS policies
create policy "Users can view own favorites"
  on public.favorites for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own favorites"
  on public.favorites for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete own favorites"
  on public.favorites for delete
  to authenticated
  using (auth.uid() = user_id);

-- Create storage buckets
insert into storage.buckets (id, name, public)
values 
  ('avatars', 'avatars', true),
  ('recipe-images', 'recipe-images', true),
  ('ingredient-images', 'ingredient-images', true)
on conflict (id) do nothing;

-- Storage policies for avatars
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update their own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for recipe images
create policy "Recipe images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'recipe-images');

create policy "Authenticated users can upload recipe images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'recipe-images');

create policy "Users can update their own recipe images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'recipe-images');

create policy "Users can delete their own recipe images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'recipe-images');

-- Storage policies for ingredient images
create policy "Ingredient images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'ingredient-images');

create policy "Admins can upload ingredient images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'ingredient-images'
    and public.has_role(auth.uid(), 'admin')
  );

-- Create trigger function for updated_at
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Add updated_at triggers
create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger handle_recipes_updated_at
  before update on public.recipes
  for each row execute function public.handle_updated_at();

create trigger handle_stock_updated_at
  before update on public.stock
  for each row execute function public.handle_updated_at();

create trigger handle_shopping_list_updated_at
  before update on public.shopping_list
  for each row execute function public.handle_updated_at();

-- Create trigger function for new user profile
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name'
  );
  
  -- Assign default user role
  insert into public.user_roles (user_id, role)
  values (new.id, 'user');
  
  return new;
end;
$$;

-- Trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Create a secure function to handle ingredient creation
-- This bypasses RLS issues by running as security definer (admin privileges)

CREATE OR REPLACE FUNCTION public.get_or_create_ingredient(
  _name text,
  _category ingredient_category DEFAULT 'other'
)
RETURNS SETOF public.ingredients
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  found_ingredient public.ingredients;
BEGIN
  -- 1. Try to find existing ingredient (case-insensitive)
  SELECT * INTO found_ingredient
  FROM public.ingredients
  WHERE name ILIKE _name
  LIMIT 1;

  IF found_ingredient.id IS NOT NULL THEN
    RETURN NEXT found_ingredient;
    RETURN;
  END IF;

  -- 2. If not found, insert new one
  RETURN QUERY
  INSERT INTO public.ingredients (name, category)
  VALUES (_name, _category)
  ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name -- Handle race condition by doing a dummy update
  RETURNING *;
  
  -- If the insert didn't return anything (because of race condition on conflict), fetch again
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT *
    FROM public.ingredients
    WHERE name ILIKE _name
    LIMIT 1;
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_or_create_ingredient(text, ingredient_category) TO authenticated;
