export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      families: {
        Row: {
          created_at: string | null
          id: string
          name: string
          share_code: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          share_code?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          share_code?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      family_members: {
        Row: {
          created_at: string | null
          family_id: string
          id: string
          role: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          family_id: string
          id?: string
          role?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          family_id?: string
          id?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_members_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          recipe_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          recipe_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          recipe_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredients: {
        Row: {
          category: Database["public"]["Enums"]["ingredient_category"] | null
          created_at: string
          created_by: string | null
          id: string
          image_url: string | null
          name: string
          synonyms: string[] | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["ingredient_category"] | null
          created_at?: string
          created_by?: string | null
          id?: string
          image_url?: string | null
          name: string
          synonyms?: string[] | null
        }
        Update: {
          category?: Database["public"]["Enums"]["ingredient_category"] | null
          created_at?: string
          created_by?: string | null
          id?: string
          image_url?: string | null
          name?: string
          synonyms?: string[] | null
        }
        Relationships: []
      }
      meal_plans: {
        Row: {
          id: string
          user_id: string
          date: string
          slot: string
          recipe_id: string | null
          catalog_recipe_id: string | null
          custom_title: string | null
          servings: number
          notes: string | null
          recipe_snapshot: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          slot: string
          recipe_id?: string | null
          catalog_recipe_id?: string | null
          custom_title?: string | null
          servings?: number
          notes?: string | null
          recipe_snapshot?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          slot?: string
          recipe_id?: string | null
          catalog_recipe_id?: string | null
          custom_title?: string | null
          servings?: number
          notes?: string | null
          recipe_snapshot?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_plans_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          current_period_end: string | null
          first_name: string | null
          id: string
          last_name: string | null
          plan_id: string | null
          share_recipes: boolean | null
          share_shopping_list: boolean | null
          share_stock: boolean | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          current_period_end?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          plan_id?: string | null
          share_recipes?: boolean | null
          share_shopping_list?: boolean | null
          share_stock?: boolean | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          current_period_end?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          plan_id?: string | null
          share_recipes?: boolean | null
          share_shopping_list?: boolean | null
          share_stock?: boolean | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      recipe_ingredients: {
        Row: {
          id: string
          ingredient_id: string | null
          name: string
          quantity: number
          recipe_id: string
          unit: Database["public"]["Enums"]["measurement_unit"]
        }
        Insert: {
          id?: string
          ingredient_id?: string | null
          name: string
          quantity: number
          recipe_id: string
          unit: Database["public"]["Enums"]["measurement_unit"]
        }
        Update: {
          id?: string
          ingredient_id?: string | null
          name?: string
          quantity?: number
          recipe_id?: string
          unit?: Database["public"]["Enums"]["measurement_unit"]
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_photos: {
        Row: {
          created_at: string
          id: string
          recipe_id: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          recipe_id: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          recipe_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_photos_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_user_notes: {
        Row: {
          cooked_count: number
          created_at: string
          id: string
          last_cooked_at: string | null
          notes: string
          recipe_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cooked_count?: number
          created_at?: string
          id?: string
          last_cooked_at?: string | null
          notes?: string
          recipe_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cooked_count?: number
          created_at?: string
          id?: string
          last_cooked_at?: string | null
          notes?: string
          recipe_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recipes: {
        Row: {
          category: Database["public"]["Enums"]["recipe_category"] | null
          cook_time: number | null
          created_at: string
          description: string | null
          difficulty: Database["public"]["Enums"]["recipe_difficulty"] | null
          id: string
          image_url: string | null
          instructions: string | null
          is_public: boolean | null
          prep_time: number | null
          servings: number | null
          source: Database["public"]["Enums"]["recipe_source"] | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["recipe_category"] | null
          cook_time?: number | null
          created_at?: string
          description?: string | null
          difficulty?: Database["public"]["Enums"]["recipe_difficulty"] | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          is_public?: boolean | null
          prep_time?: number | null
          servings?: number | null
          source?: Database["public"]["Enums"]["recipe_source"] | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["recipe_category"] | null
          cook_time?: number | null
          created_at?: string
          description?: string | null
          difficulty?: Database["public"]["Enums"]["recipe_difficulty"] | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          is_public?: boolean | null
          prep_time?: number | null
          servings?: number | null
          source?: Database["public"]["Enums"]["recipe_source"] | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shopping_list: {
        Row: {
          checked: boolean | null
          created_at: string
          id: string
          ingredient_id: string | null
          name: string
          quantity: number | null
          unit: Database["public"]["Enums"]["measurement_unit"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          checked?: boolean | null
          created_at?: string
          id?: string
          ingredient_id?: string | null
          name: string
          quantity?: number | null
          unit?: Database["public"]["Enums"]["measurement_unit"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          checked?: boolean | null
          created_at?: string
          id?: string
          ingredient_id?: string | null
          name?: string
          quantity?: number | null
          unit?: Database["public"]["Enums"]["measurement_unit"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_list_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
        ]
      }
      stock: {
        Row: {
          created_at: string
          expiration_date: string | null
          id: string
          ingredient_id: string
          low_stock: boolean | null
          quantity: number
          unit: Database["public"]["Enums"]["measurement_unit"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expiration_date?: string | null
          id?: string
          ingredient_id: string
          low_stock?: boolean | null
          quantity: number
          unit: Database["public"]["Enums"]["measurement_unit"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expiration_date?: string | null
          id?: string
          ingredient_id?: string
          low_stock?: boolean | null
          quantity?: number
          unit?: Database["public"]["Enums"]["measurement_unit"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_family_member_by_email: {
        Args: { p_email: string; p_family_id: string }
        Returns: undefined
      }
      create_family: { Args: { p_name: string }; Returns: string }
      get_shared_recipe: {
        Args: { p_recipe_id: string }
        Returns: Json
      }
      get_or_create_ingredient: {
        Args: {
          _category?: Database["public"]["Enums"]["ingredient_category"]
          _name: string
        }
        Returns: {
          category: Database["public"]["Enums"]["ingredient_category"] | null
          created_at: string
          created_by: string | null
          id: string
          image_url: string | null
          name: string
          synonyms: string[] | null
        }
        SetofOptions: {
          from: "*"
          to: "ingredients"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_user_admin_family_ids: {
        Args: { user_uuid: string }
        Returns: string[]
      }
      get_user_family_ids: { Args: { user_uuid: string }; Returns: string[] }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_in_same_family: { Args: { target_user_id: string }; Returns: boolean }
      is_shared_with_me: {
        Args: { item_owner_id: string; item_type: string }
        Returns: boolean
      }
      join_family_with_code: {
        Args: { p_share_code: string }
        Returns: undefined
      }
      move_checked_items_to_stock: { Args: never; Returns: undefined }
      search_ingredients_with_synonyms: {
        Args: { _query: string }
        Returns: {
          category: Database["public"]["Enums"]["ingredient_category"] | null
          created_at: string
          created_by: string | null
          id: string
          image_url: string | null
          name: string
          synonyms: string[] | null
        }[]
        SetofOptions: {
          from: "*"
          to: "ingredients"
          isOneToOne: false
          isSetofReturn: true
        }
      }
    }
    Enums: {
      app_role: "admin" | "user"
      ingredient_category:
        | "fruits_legumes"
        | "boucherie"
        | "poissonnerie"
        | "produits_laitiers"
        | "epicerie_sucree"
        | "epicerie_salee"
        | "produits_frais"
        | "produits_surgeles"
        | "boissons"
        | "autre"
      measurement_unit:
        | "g"
        | "kg"
        | "ml"
        | "l"
        | "cuillere_soupe"
        | "cuillere_the"
        | "piece"
      recipe_category:
        | "petit_dejeuner"
        | "dejeuner"
        | "diner"
        | "dessert"
        | "encas"
        | "vegetarien"
        | "vegan"
      recipe_difficulty: "facile" | "moyen" | "difficile"
      recipe_source: "book" | "cooking_class" | "website" | "photo"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      ingredient_category: [
        "fruits_legumes",
        "boucherie",
        "poissonnerie",
        "produits_laitiers",
        "epicerie_sucree",
        "epicerie_salee",
        "produits_frais",
        "produits_surgeles",
        "boissons",
        "autre",
      ],
      measurement_unit: [
        "g",
        "kg",
        "ml",
        "l",
        "cuillere_soupe",
        "cuillere_the",
        "piece",
      ],
      recipe_category: [
        "petit_dejeuner",
        "dejeuner",
        "diner",
        "dessert",
        "encas",
        "vegetarien",
        "vegan",
      ],
      recipe_difficulty: ["facile", "moyen", "difficile"],
      recipe_source: ["book", "cooking_class", "website", "photo"],
    },
  },
} as const
