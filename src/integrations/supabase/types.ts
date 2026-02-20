export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      families: {
        Row: {
          created_at: string
          id: string
          name: string
          share_code: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          share_code?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          share_code?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      family_members: {
        Row: {
          created_at: string
          family_id: string
          id: string
          role: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          family_id: string
          id?: string
          role?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
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
        Relationships: [
          {
            foreignKeyName: "recipes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      create_family: {
        Args: {
          p_name: string
        }
        Returns: string
      }
      join_family_with_code: {
        Args: {
          p_share_code: string
        }
        Returns: undefined
      }
      add_family_member_by_email: {
        Args: {
          p_email: string
          p_family_id: string
        }
        Returns: undefined
      }
      is_in_same_family: {
        Args: {
          target_user_id: string
        }
        Returns: boolean
      }
      match_ingredient: {
        Args: {
          _name: string
        }
        Returns: {
          id: string
          name: string
          category: Database["public"]["Enums"]["ingredient_category"]
          image_url: string | null
          synonyms: string[] | null
        }[]
      }
      search_ingredients_with_synonyms: {
        Args: {
          _query: string
        }
        Returns: {
          id: string
          name: string
          category: Database["public"]["Enums"]["ingredient_category"]
          image_url: string | null
          synonyms: string[] | null
        }[]
      }
      get_or_create_ingredient: {
        Args: {
          _name: string
          _category: string
        }
        Returns: {
          id: string
          name: string
          category: Database["public"]["Enums"]["ingredient_category"] | null
          image_url: string | null
          synonyms: string[] | null
          created_at: string
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

type PublicSchema = Database["public"]

export type Tables<
  PublicTableNameOrOptions extends
  | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
    Database[PublicTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
    Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
    PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
    PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
  | keyof PublicSchema["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
  | keyof PublicSchema["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  PublicSchemaNameOrOptions extends
  | keyof Database
  | { schema: keyof Database },
  EnumName extends PublicSchemaNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicSchemaNameOrOptions["schema"]]["Enums"]
  : never = never,
> = PublicSchemaNameOrOptions extends { schema: keyof Database }
  ? Database[PublicSchemaNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicSchemaNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicSchemaNameOrOptions]
  : never

export type CompositeTypes<
  PublicSchemaNameOrOptions extends
  | keyof Database
  | { schema: keyof Database },
  CompositeTypeName extends PublicSchemaNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof Database[PublicSchemaNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicSchemaNameOrOptions extends { schema: keyof Database }
  ? Database[PublicSchemaNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicSchemaNameOrOptions extends keyof PublicSchema["CompositeTypes"]
  ? PublicSchema["CompositeTypes"][PublicSchemaNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      ingredient_category: [
        "vegetables",
        "fruits",
        "dairy",
        "meat",
        "fish",
        "grains",
        "oils",
        "spices",
        "beverages",
        "other",
      ],
      measurement_unit: [
        "g",
        "kg",
        "ml",
        "l",
        "cup",
        "tbsp",
        "tsp",
        "oz",
        "lb",
        "piece",
      ],
      recipe_category: [
        "breakfast",
        "lunch",
        "dinner",
        "dessert",
        "snack",
        "vegetarian",
        "vegan",
      ],
      recipe_difficulty: ["easy", "medium", "hard"],
    },
  },
} as const
