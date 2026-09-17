// Auto-generated Catalog Recipes (108 recipes)
import { RecipeCategory, RecipeDifficulty, MeasurementUnit, IngredientCategory } from "@/types/database";

export interface CatalogIngredient {
  id?: string;
  name: string;
  quantity: number;
  unit: MeasurementUnit;
  category?: IngredientCategory;
}

export interface CatalogRecipe {
  id: string;
  title: string;
  description: string;
  image_url: string;
  difficulty: RecipeDifficulty;
  prep_time: number;
  cook_time: number;
  servings: number;
  category: RecipeCategory;
  tags: string[];
  source: "website";
  instructions: string;
  is_public: boolean;
  ingredients: CatalogIngredient[];
}

export const CATALOG_RECIPES: CatalogRecipe[] = [
  {
    "id": "pates-carbonara",
    "title": "Pâtes Carbonara Traditionnelles",
    "description": "La véritable recette romaine sans crème : guanciale croustillant, jaunes d'œufs, pecorino et poivre noir concassé.",
    "image_url": "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 10,
    "cook_time": 10,
    "servings": 4,
    "category": "dejeuner",
    "tags": [
      "rapide",
      "etudiant",
      "famille"
    ],
    "source": "website",
    "instructions": "1. Cuisez les spaghetti al dente dans de l'eau bouillante salée.\n2. Faites dorer la pancetta ou guanciale en dés dans une poêle sans matière grasse.\n3. Dans un bol, fouettez les jaunes d'œufs avec le pecorino râpé et du poivre noir.\n4. Égouttez les pâtes en gardant un peu d'eau de cuisson.\n5. Hors du feu, mélangez pâtes, lardons et crème d'œufs avec un filet d'eau de cuisson pour obtenir une texture crémeuse.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-pates-carbonara-0",
        "name": "Spaghetti",
        "quantity": 400,
        "unit": "g",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-pates-carbonara-1",
        "name": "Pancetta ou Guanciale",
        "quantity": 150,
        "unit": "g",
        "category": "boucherie"
      },
      {
        "id": "ing-pates-carbonara-2",
        "name": "Jaunes d'œufs",
        "quantity": 4,
        "unit": "piece",
        "category": "produits_frais"
      },
      {
        "id": "ing-pates-carbonara-3",
        "name": "Pecorino ou Parmesan",
        "quantity": 70,
        "unit": "g",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-pates-carbonara-4",
        "name": "Poivre noir",
        "quantity": 1,
        "unit": "cuillere_the",
        "category": "epicerie_salee"
      }
    ]
  },
  {
    "id": "wrap-poulet-avocat",
    "title": "Wrap Poulet, Avocat & Fromage Frais",
    "description": "Frais, croquant et prêt en 10 minutes chrono ! Idéal pour un déjeuner express.",
    "image_url": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 10,
    "cook_time": 15,
    "servings": 2,
    "category": "dejeuner",
    "tags": [
      "rapide",
      "etudiant"
    ],
    "source": "website",
    "instructions": "1. Tartinez les galettes de blé de fromage frais.\n2. Disposez les feuilles de salade, le poulet émincé et les lamelles d'avocat.\n3. Arrosez d'un filet de jus de citron, salez et poivrez.\n4. Roulez les wraps bien serrés et coupez-les en biseau.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-wrap-poulet-avocat-0",
        "name": "Galettes tortillas de blé",
        "quantity": 2,
        "unit": "piece",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-wrap-poulet-avocat-1",
        "name": "Blancs de poulet cuits",
        "quantity": 150,
        "unit": "g",
        "category": "boucherie"
      },
      {
        "id": "ing-wrap-poulet-avocat-2",
        "name": "Avocat",
        "quantity": 1,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-wrap-poulet-avocat-3",
        "name": "Fromage frais à tartiner",
        "quantity": 60,
        "unit": "g",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-wrap-poulet-avocat-4",
        "name": "Salade verte",
        "quantity": 4,
        "unit": "piece",
        "category": "fruits_legumes"
      }
    ]
  },
  {
    "id": "omelette-fromage-herbes",
    "title": "Omelette Roulée au Fromage & Fines Herbes",
    "description": "Baveuse à cœur et dorée à l'extérieur, prête en 7 minutes.",
    "image_url": "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 3,
    "cook_time": 5,
    "servings": 1,
    "category": "dejeuner",
    "tags": [
      "rapide",
      "etudiant",
      "vegetarien"
    ],
    "source": "website",
    "instructions": "1. Battez les œufs avec la ciboulette ciselée, sel et poivre.\n2. Faites fondre le beurre dans une poêle chaude.\n3. Versez les œufs battus et ramenez les bords vers le centre.\n4. Ajoutez le fromage râpé au centre et roulez délicatement.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-omelette-fromage-herbes-0",
        "name": "Œufs frais",
        "quantity": 3,
        "unit": "piece",
        "category": "produits_frais"
      },
      {
        "id": "ing-omelette-fromage-herbes-1",
        "name": "Comté ou Emmental râpé",
        "quantity": 40,
        "unit": "g",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-omelette-fromage-herbes-2",
        "name": "Beurre",
        "quantity": 15,
        "unit": "g",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-omelette-fromage-herbes-3",
        "name": "Ciboulette fraîche",
        "quantity": 1,
        "unit": "cuillere_soupe",
        "category": "fruits_legumes"
      }
    ]
  },
  {
    "id": "riz-saute-legumes-oeuf",
    "title": "Riz Sauté aux Petits Légumes & Œuf (Fried Rice)",
    "description": "Le plat anti-gaspi étudiant par excellence pour sublimer un reste de riz en 10 minutes.",
    "image_url": "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 5,
    "cook_time": 10,
    "servings": 2,
    "category": "dejeuner",
    "tags": [
      "rapide",
      "etudiant",
      "vegetarien"
    ],
    "source": "website",
    "instructions": "1. Faites sauter carottes râpées, oignon et petits pois dans l'huile chaude.\n2. Poussez sur le côté, cassez les œufs et brouillez-les.\n3. Ajoutez le riz cuit froid et mélangez à feu vif.\n4. Arrosez de sauce soja et huile de sésame.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-riz-saute-legumes-oeuf-0",
        "name": "Riz cuit",
        "quantity": 300,
        "unit": "g",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-riz-saute-legumes-oeuf-1",
        "name": "Œufs",
        "quantity": 2,
        "unit": "piece",
        "category": "produits_frais"
      },
      {
        "id": "ing-riz-saute-legumes-oeuf-2",
        "name": "Petits pois",
        "quantity": 80,
        "unit": "g",
        "category": "produits_surgeles"
      },
      {
        "id": "ing-riz-saute-legumes-oeuf-3",
        "name": "Carotte râpée",
        "quantity": 1,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-riz-saute-legumes-oeuf-4",
        "name": "Sauce soja",
        "quantity": 2,
        "unit": "cuillere_soupe",
        "category": "epicerie_salee"
      }
    ]
  },
  {
    "id": "croque-monsieur-dore",
    "title": "Croque-Monsieur Doré au Four",
    "description": "Béchamel onctueuse, jambon blanc et emmental gratiné croustillant.",
    "image_url": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 8,
    "cook_time": 10,
    "servings": 2,
    "category": "dejeuner",
    "tags": [
      "rapide",
      "etudiant",
      "famille"
    ],
    "source": "website",
    "instructions": "1. Tartinez le pain de mie d'une fine couche de béchamel.\n2. Déposez le jambon et le fromage râpé, refermez les sandwichs.\n3. Nappez le dessus de béchamel et de fromage.\n4. Gratinez 10 minutes au four à 200°C.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-croque-monsieur-dore-0",
        "name": "Pain de mie",
        "quantity": 4,
        "unit": "piece",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-croque-monsieur-dore-1",
        "name": "Jambon blanc",
        "quantity": 2,
        "unit": "piece",
        "category": "boucherie"
      },
      {
        "id": "ing-croque-monsieur-dore-2",
        "name": "Emmental râpé",
        "quantity": 100,
        "unit": "g",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-croque-monsieur-dore-3",
        "name": "Sauce béchamel",
        "quantity": 100,
        "unit": "ml",
        "category": "produits_laitiers"
      }
    ]
  },
  {
    "id": "pates-pesto-pignons",
    "title": "Pâtes au Pesto Frais & Pignons Toastés",
    "description": "Saveurs intenses de basilic frais, parmesan, huile d'olive vierge et pignons de pin.",
    "image_url": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 8,
    "cook_time": 10,
    "servings": 4,
    "category": "dejeuner",
    "tags": [
      "rapide",
      "vegetarien",
      "etudiant"
    ],
    "source": "website",
    "instructions": "1. Cuisez les pennes al dente.\n2. Mixez basilic, ail, parmesan, pignons dorés et huile d'olive.\n3. Égouttez les pâtes et mélangez immédiatement au pesto avec un peu d'eau de cuisson.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-pates-pesto-pignons-0",
        "name": "Penne",
        "quantity": 400,
        "unit": "g",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-pates-pesto-pignons-1",
        "name": "Basilic frais",
        "quantity": 1,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-pates-pesto-pignons-2",
        "name": "Parmesan râpé",
        "quantity": 60,
        "unit": "g",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-pates-pesto-pignons-3",
        "name": "Pignons de pin",
        "quantity": 30,
        "unit": "g",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-pates-pesto-pignons-4",
        "name": "Huile d'olive",
        "quantity": 70,
        "unit": "ml",
        "category": "epicerie_salee"
      }
    ]
  },
  {
    "id": "salade-cesar-poulet",
    "title": "Salade César au Poulet Doré",
    "description": "Romaine croquante, poulet poêlé croustillant, croûtons dorés et sauce César maison.",
    "image_url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 10,
    "cook_time": 6,
    "servings": 2,
    "category": "dejeuner",
    "tags": [
      "rapide",
      "etudiant"
    ],
    "source": "website",
    "instructions": "1. Faites dorer le poulet émincé à la poêle avec du sel et du poivre.\n2. Dorez les cubes de pain de mie dans la même poêle.\n3. Dressez la salade avec le poulet tiède, les croûtons, la sauce et le parmesan.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-salade-cesar-poulet-0",
        "name": "Filet de poulet",
        "quantity": 250,
        "unit": "g",
        "category": "boucherie"
      },
      {
        "id": "ing-salade-cesar-poulet-1",
        "name": "Salade romaine",
        "quantity": 1,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-salade-cesar-poulet-2",
        "name": "Pain de mie",
        "quantity": 60,
        "unit": "g",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-salade-cesar-poulet-3",
        "name": "Copeaux de parmesan",
        "quantity": 40,
        "unit": "g",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-salade-cesar-poulet-4",
        "name": "Sauce César",
        "quantity": 3,
        "unit": "cuillere_soupe",
        "category": "epicerie_salee"
      }
    ]
  },
  {
    "id": "pates-thon-tomates",
    "title": "Pâtes au Thon & Coulis de Tomates",
    "description": "Le plat sauveur prêt en 12 minutes avec les basiques du placard.",
    "image_url": "https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 4,
    "cook_time": 10,
    "servings": 2,
    "category": "dejeuner",
    "tags": [
      "rapide",
      "etudiant"
    ],
    "source": "website",
    "instructions": "1. Faites cuire les spaghettis à l'eau bouillante salée.\n2. Réchauffez le thon égoutté avec le coulis de tomates, l'ail et un filet d'huile 5 min.\n3. Égouttez les pâtes et enrobez-les de sauce au thon.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-pates-thon-tomates-0",
        "name": "Spaghetti",
        "quantity": 200,
        "unit": "g",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-pates-thon-tomates-1",
        "name": "Thon en boîte",
        "quantity": 140,
        "unit": "g",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-pates-thon-tomates-2",
        "name": "Coulis de tomates",
        "quantity": 250,
        "unit": "ml",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-pates-thon-tomates-3",
        "name": "Huile d'olive",
        "quantity": 1,
        "unit": "cuillere_soupe",
        "category": "epicerie_salee"
      }
    ]
  },
  {
    "id": "poelee-gnocchis-epinards",
    "title": "Poêlée de Gnocchis aux Épinards & Ricotta",
    "description": "Gnocchis poêlés bien croustillants, tombée d'épinards frais et cuillères de ricotta fondante.",
    "image_url": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 5,
    "cook_time": 8,
    "servings": 2,
    "category": "dejeuner",
    "tags": [
      "rapide",
      "vegetarien",
      "etudiant"
    ],
    "source": "website",
    "instructions": "1. Faites dorer les gnocchis au beurre 6 min en les remuant.\n2. Incorporez les jeunes pousses d'épinards qui réduisent en 1 min.\n3. Ajoutez la ricotta, salez, poivrez et servez.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-poelee-gnocchis-epinards-0",
        "name": "Gnocchis à poêler",
        "quantity": 350,
        "unit": "g",
        "category": "produits_frais"
      },
      {
        "id": "ing-poelee-gnocchis-epinards-1",
        "name": "Pousses d'épinards",
        "quantity": 120,
        "unit": "g",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-poelee-gnocchis-epinards-2",
        "name": "Ricotta",
        "quantity": 80,
        "unit": "g",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-poelee-gnocchis-epinards-3",
        "name": "Beurre",
        "quantity": 15,
        "unit": "g",
        "category": "produits_laitiers"
      }
    ]
  },
  {
    "id": "salade-grecque-feta",
    "title": "Salade Grecque Fraîche au Concombre & Féta",
    "description": "Tomates mûres, concombre croquant, olives Kalamata et bloc de féta sous un filet d'huile d'olive.",
    "image_url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 10,
    "cook_time": 15,
    "servings": 2,
    "category": "dejeuner",
    "tags": [
      "rapide",
      "vegetarien",
      "etudiant"
    ],
    "source": "website",
    "instructions": "1. Coupez tomates et concombre en dés.\n2. Émincez l'oignon rouge et rassemblez le tout avec les olives dans un bol.\n3. Déposez la féta, arrosez d'huile d'olive et saupoudrez d'origan.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-salade-grecque-feta-0",
        "name": "Tomates",
        "quantity": 3,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-salade-grecque-feta-1",
        "name": "Concombre",
        "quantity": 1,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-salade-grecque-feta-2",
        "name": "Féta AOP",
        "quantity": 150,
        "unit": "g",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-salade-grecque-feta-3",
        "name": "Olives noires",
        "quantity": 50,
        "unit": "g",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-salade-grecque-feta-4",
        "name": "Huile d'olive",
        "quantity": 3,
        "unit": "cuillere_soupe",
        "category": "epicerie_salee"
      }
    ]
  },
  {
    "id": "croque-madame-oeuf",
    "title": "Croque-Madame à l'Œuf au Plat Coulant",
    "description": "Le croque-monsieur de bistrot surmonté d'un bel œuf au plat au jaune baveux.",
    "image_url": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 8,
    "cook_time": 10,
    "servings": 2,
    "category": "dejeuner",
    "tags": [
      "rapide",
      "etudiant"
    ],
    "source": "website",
    "instructions": "1. Assemblez le croque avec pain de mie, jambon, fromage et béchamel.\n2. Faites dorer au four 8 min.\n3. Cuisez deux œufs au plat et glissez-en un sur chaque croque chaud.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-croque-madame-oeuf-0",
        "name": "Pain de mie",
        "quantity": 4,
        "unit": "piece",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-croque-madame-oeuf-1",
        "name": "Jambon blanc",
        "quantity": 2,
        "unit": "piece",
        "category": "boucherie"
      },
      {
        "id": "ing-croque-madame-oeuf-2",
        "name": "Emmental râpé",
        "quantity": 80,
        "unit": "g",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-croque-madame-oeuf-3",
        "name": "Œufs",
        "quantity": 2,
        "unit": "piece",
        "category": "produits_frais"
      }
    ]
  },
  {
    "id": "pates-cacio-pepe",
    "title": "Pâtes Cacio e Pepe Authentiques",
    "description": "Le secret romain : spaghettis al dente, pecorino râpé fin et poivre noir torréfié.",
    "image_url": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 4,
    "cook_time": 10,
    "servings": 2,
    "category": "dejeuner",
    "tags": [
      "rapide",
      "etudiant",
      "vegetarien"
    ],
    "source": "website",
    "instructions": "1. Cuisez les spaghettis al dente.\n2. Torréfiez le poivre concassé à sec dans une poêle.\n3. Mélangez pecorino et eau de cuisson pour créer une émulsion onctueuse hors du feu.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-pates-cacio-pepe-0",
        "name": "Spaghetti",
        "quantity": 250,
        "unit": "g",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-pates-cacio-pepe-1",
        "name": "Pecorino Romano",
        "quantity": 90,
        "unit": "g",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-pates-cacio-pepe-2",
        "name": "Poivre noir concassé",
        "quantity": 2,
        "unit": "cuillere_the",
        "category": "epicerie_salee"
      }
    ]
  },
  {
    "id": "tartine-chevre-miel",
    "title": "Tartine Chaude Chèvre & Miel aux Noix",
    "description": "Pain de campagne croustillant, rondelles de chèvre fondu, filet de miel et éclats de noix.",
    "image_url": "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 5,
    "cook_time": 8,
    "servings": 2,
    "category": "dejeuner",
    "tags": [
      "rapide",
      "etudiant",
      "vegetarien"
    ],
    "source": "website",
    "instructions": "1. Déposez des rondelles de chèvre sur le pain de campagne.\n2. Nappez d'un filet de miel et parsemez de cerneaux de noix concassés.\n3. Passez 8 minutes au four sous le grill à 200°C.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-tartine-chevre-miel-0",
        "name": "Pain de campagne",
        "quantity": 2,
        "unit": "piece",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-tartine-chevre-miel-1",
        "name": "Bûche de chèvre",
        "quantity": 120,
        "unit": "g",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-tartine-chevre-miel-2",
        "name": "Miel d'acacia",
        "quantity": 2,
        "unit": "cuillere_soupe",
        "category": "epicerie_sucree"
      },
      {
        "id": "ing-tartine-chevre-miel-3",
        "name": "Noix",
        "quantity": 20,
        "unit": "g",
        "category": "epicerie_salee"
      }
    ]
  },
  {
    "id": "one-pot-pasta-tomates",
    "title": "One Pot Pasta Express Tomates Cerises & Basilic",
    "description": "Zéro vaisselle : pâtes, tomates, ail et basilic cuisent ensemble dans la même casserole en 11 min.",
    "image_url": "https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 5,
    "cook_time": 11,
    "servings": 2,
    "category": "diner",
    "tags": [
      "rapide",
      "etudiant",
      "vegetarien"
    ],
    "source": "website",
    "instructions": "1. Réunissez tous les ingrédients dans une grande casserole.\n2. Versez 550ml d'eau bouillante et portez à feu vif.\n3. Laissez cuire 11 minutes en remuant régulièrement jusqu'à absorption.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-one-pot-pasta-tomates-0",
        "name": "Linguines",
        "quantity": 200,
        "unit": "g",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-one-pot-pasta-tomates-1",
        "name": "Tomates cerises",
        "quantity": 200,
        "unit": "g",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-one-pot-pasta-tomates-2",
        "name": "Ail",
        "quantity": 1,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-one-pot-pasta-tomates-3",
        "name": "Basilic frais",
        "quantity": 1,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-one-pot-pasta-tomates-4",
        "name": "Huile d'olive",
        "quantity": 2,
        "unit": "cuillere_soupe",
        "category": "epicerie_salee"
      }
    ]
  },
  {
    "id": "riz-cantonnais-jambon",
    "title": "Riz Cantonnais Express au Jambon & Petits Pois",
    "description": "Riz sauté minute avec dés de jambon, petits pois doux et œufs brouillés.",
    "image_url": "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 6,
    "cook_time": 8,
    "servings": 2,
    "category": "dejeuner",
    "tags": [
      "rapide",
      "etudiant",
      "famille"
    ],
    "source": "website",
    "instructions": "1. Faites revenir le jambon en dés et les petits pois dans l'huile chaude.\n2. Brouillez les œufs dans un coin de la poêle.\n3. Incorporez le riz cuit et la sauce soja, faites sauter 3 min à feu vif.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-riz-cantonnais-jambon-0",
        "name": "Riz cuit",
        "quantity": 250,
        "unit": "g",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-riz-cantonnais-jambon-1",
        "name": "Dés de jambon",
        "quantity": 100,
        "unit": "g",
        "category": "boucherie"
      },
      {
        "id": "ing-riz-cantonnais-jambon-2",
        "name": "Petits pois",
        "quantity": 70,
        "unit": "g",
        "category": "produits_surgeles"
      },
      {
        "id": "ing-riz-cantonnais-jambon-3",
        "name": "Œufs",
        "quantity": 2,
        "unit": "piece",
        "category": "produits_frais"
      },
      {
        "id": "ing-riz-cantonnais-jambon-4",
        "name": "Sauce soja",
        "quantity": 2,
        "unit": "cuillere_soupe",
        "category": "epicerie_salee"
      }
    ]
  },
  {
    "id": "shakshuka-oeufs-feta",
    "title": "Shakshuka aux Œufs, Poivrons & Féta",
    "description": "Des œufs pochés dans une sauce tomate mijotée aux poivrons et cumin, saupoudrée de féta.",
    "image_url": "https://images.unsplash.com/photo-1590412200988-a436970781fa?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 10,
    "cook_time": 12,
    "servings": 2,
    "category": "dejeuner",
    "tags": [
      "rapide",
      "vegetarien",
      "etudiant"
    ],
    "source": "website",
    "instructions": "1. Faites revenir poivrons et oignons dans l'huile d'olive.\n2. Ajoutez les tomates pelées, le cumin et laissez compoter 7 min.\n3. Creusez des nids, cassez-y les œufs et couvrez 4 min.\n4. Émiettez la féta par-dessus.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-shakshuka-oeufs-feta-0",
        "name": "Œufs",
        "quantity": 4,
        "unit": "piece",
        "category": "produits_frais"
      },
      {
        "id": "ing-shakshuka-oeufs-feta-1",
        "name": "Tomates pelées",
        "quantity": 400,
        "unit": "g",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-shakshuka-oeufs-feta-2",
        "name": "Poivron rouge",
        "quantity": 1,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-shakshuka-oeufs-feta-3",
        "name": "Féta",
        "quantity": 80,
        "unit": "g",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-shakshuka-oeufs-feta-4",
        "name": "Cumin",
        "quantity": 1,
        "unit": "cuillere_the",
        "category": "epicerie_salee"
      }
    ]
  },
  {
    "id": "tartine-avocat-oeuf-mollet",
    "title": "Tartine d'Avocat & Œuf Mollet Coulant",
    "description": "Pain au levain toasté, écrasé d'avocat au citron et œuf mollet crémeux.",
    "image_url": "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 5,
    "cook_time": 6,
    "servings": 1,
    "category": "petit_dejeuner",
    "tags": [
      "rapide",
      "etudiant",
      "vegetarien",
      "petit_dejeuner"
    ],
    "source": "website",
    "instructions": "1. Faites cuire l'œuf mollet 6 minutes dans l'eau bouillante puis écalez-le.\n2. Écrasez l'avocat avec jus de citron, sel et poivre.\n3. Tartinez le pain grillé, déposez l'œuf fendu et parsemez de graines de sésame.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-tartine-avocat-oeuf-mollet-0",
        "name": "Tranche de pain de campagne",
        "quantity": 1,
        "unit": "piece",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-tartine-avocat-oeuf-mollet-1",
        "name": "Avocat",
        "quantity": 0.5,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-tartine-avocat-oeuf-mollet-2",
        "name": "Œuf",
        "quantity": 1,
        "unit": "piece",
        "category": "produits_frais"
      },
      {
        "id": "ing-tartine-avocat-oeuf-mollet-3",
        "name": "Citron",
        "quantity": 0.5,
        "unit": "piece",
        "category": "fruits_legumes"
      }
    ]
  },
  {
    "id": "saumon-four-brocolis",
    "title": "Saumon Rôti au Four & Brocolis au Citron",
    "description": "Pavé de saumon fondant et fleurettes de brocoli rôtis sur une seule plaque au four en 15 minutes.",
    "image_url": "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 5,
    "cook_time": 15,
    "servings": 2,
    "category": "diner",
    "tags": [
      "rapide"
    ],
    "source": "website",
    "instructions": "1. Préchauffez le four à 200°C.\n2. Déposez les bouquets de brocolis et les pavés de saumon sur une plaque.\n3. Arrosez d'huile d'olive, de jus de citron, de sel et d'aneth.\n4. Enfournez 15 minutes.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-saumon-four-brocolis-0",
        "name": "Pavés de saumon frais",
        "quantity": 2,
        "unit": "piece",
        "category": "poissonnerie"
      },
      {
        "id": "ing-saumon-four-brocolis-1",
        "name": "Brocoli",
        "quantity": 1,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-saumon-four-brocolis-2",
        "name": "Citron",
        "quantity": 1,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-saumon-four-brocolis-3",
        "name": "Huile d'olive",
        "quantity": 2,
        "unit": "cuillere_soupe",
        "category": "epicerie_salee"
      }
    ]
  },
  {
    "id": "quesadilla-fromage-haricots",
    "title": "Quesadilla Gourmande Haricots Rouges & Cheddar",
    "description": "Galette de blé pliée et dorée à la poêle avec cœur fondant de haricots épicés et cheddar.",
    "image_url": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 5,
    "cook_time": 6,
    "servings": 2,
    "category": "dejeuner",
    "tags": [
      "rapide",
      "etudiant",
      "vegetarien"
    ],
    "source": "website",
    "instructions": "1. Écrasez les haricots rouges avec du cumin et un peu de sel.\n2. Garnissez la moitié de la tortilla avec les haricots et le cheddar râpé.\n3. Repliez et faites dorer 3 min de chaque côté dans une poêle chaude.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-quesadilla-fromage-haricots-0",
        "name": "Tortillas de blé",
        "quantity": 2,
        "unit": "piece",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-quesadilla-fromage-haricots-1",
        "name": "Haricots rouges en boîte",
        "quantity": 150,
        "unit": "g",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-quesadilla-fromage-haricots-2",
        "name": "Cheddar râpé",
        "quantity": 80,
        "unit": "g",
        "category": "produits_laitiers"
      }
    ]
  },
  {
    "id": "pasta-al-limone",
    "title": "Pâtes au Citron & Parmesan (Pasta al Limone)",
    "description": "Une sauce ultra soyeuse et fraîche au zeste de citron jaune, beurre et parmesan râpé.",
    "image_url": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 5,
    "cook_time": 10,
    "servings": 2,
    "category": "dejeuner",
    "tags": [
      "rapide",
      "etudiant",
      "vegetarien"
    ],
    "source": "website",
    "instructions": "1. Cuisez les spaghettis dans l'eau bouillante salée.\n2. Faites fondre le beurre avec le zeste et jus de citron dans une poêle.\n3. Versez les pâtes et le parmesan avec un peu d'eau de cuisson et remuez vivement.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-pasta-al-limone-0",
        "name": "Spaghetti",
        "quantity": 200,
        "unit": "g",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-pasta-al-limone-1",
        "name": "Citron jaune bio",
        "quantity": 1,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-pasta-al-limone-2",
        "name": "Beurre",
        "quantity": 30,
        "unit": "g",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-pasta-al-limone-3",
        "name": "Parmesan râpé",
        "quantity": 50,
        "unit": "g",
        "category": "produits_laitiers"
      }
    ]
  },
  {
    "id": "quiche-lorraine",
    "title": "Quiche Lorraine Traditionnelle",
    "description": "Pâte brisée croustillante, lardons fumés et appareil crémeux parfumé à la muscade.",
    "image_url": "https://images.unsplash.com/photo-1547496502-affa22d38842?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 15,
    "cook_time": 35,
    "servings": 6,
    "category": "diner",
    "tags": [
      "famille",
      "batch_cooking"
    ],
    "source": "website",
    "instructions": "1. Foncez un moule avec la pâte et piquez le fond.\n2. Dorez les lardons 5 min et égouttez l'excès de gras.\n3. Battez les œufs avec la crème, le lait, sel, poivre et muscade.\n4. Versez sur la pâte garnie de lardons et cuisez 35 min à 180°C.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-quiche-lorraine-0",
        "name": "Pâte brisée",
        "quantity": 1,
        "unit": "piece",
        "category": "produits_frais"
      },
      {
        "id": "ing-quiche-lorraine-1",
        "name": "Lardons fumés",
        "quantity": 200,
        "unit": "g",
        "category": "boucherie"
      },
      {
        "id": "ing-quiche-lorraine-2",
        "name": "Œufs",
        "quantity": 3,
        "unit": "piece",
        "category": "produits_frais"
      },
      {
        "id": "ing-quiche-lorraine-3",
        "name": "Crème fraîche",
        "quantity": 200,
        "unit": "ml",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-quiche-lorraine-4",
        "name": "Lait",
        "quantity": 100,
        "unit": "ml",
        "category": "produits_laitiers"
      }
    ]
  },
  {
    "id": "gratin-dauphinois",
    "title": "Gratin Dauphinois Fondant",
    "description": "Lamelles de pommes de terre confites au four dans la crème infusée à l'ail et muscade.",
    "image_url": "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 20,
    "cook_time": 50,
    "servings": 6,
    "category": "diner",
    "tags": [
      "famille",
      "batch_cooking",
      "vegetarien"
    ],
    "source": "website",
    "instructions": "1. Épluchez et coupez les pommes de terre en fines rondelles.\n2. Frottez le plat à gratin avec de l'ail et beurrez-le.\n3. Faites chauffer crème et lait avec ail, sel, poivre et muscade.\n4. Disposez les pommes de terre, couvrez de crème chaude et enfournez 50 min à 160°C.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-gratin-dauphinois-0",
        "name": "Pommes de terre",
        "quantity": 1200,
        "unit": "g",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-gratin-dauphinois-1",
        "name": "Crème liquide",
        "quantity": 300,
        "unit": "ml",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-gratin-dauphinois-2",
        "name": "Lait",
        "quantity": 300,
        "unit": "ml",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-gratin-dauphinois-3",
        "name": "Gousse d'ail",
        "quantity": 2,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-gratin-dauphinois-4",
        "name": "Beurre",
        "quantity": 20,
        "unit": "g",
        "category": "produits_laitiers"
      }
    ]
  },
  {
    "id": "poulet-roti-dimanche",
    "title": "Poulet Rôti au Thym & Pommes de Terre",
    "description": "Peau dorée et croustillante, chair juteuse et pommes de terre confites au jus.",
    "image_url": "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 15,
    "cook_time": 60,
    "servings": 4,
    "category": "dejeuner",
    "tags": [
      "famille"
    ],
    "source": "website",
    "instructions": "1. Préchauffez le four à 200°C.\n2. Badigeonnez le poulet de beurre pommade, salez et poivrez, parsemez de thym.\n3. Disposez les pommes de terre coupées autour du poulet.\n4. Enfournez 60 minutes en arrosant régulièrement de son jus.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-poulet-roti-dimanche-0",
        "name": "Poulet entier",
        "quantity": 1,
        "unit": "piece",
        "category": "boucherie"
      },
      {
        "id": "ing-poulet-roti-dimanche-1",
        "name": "Pommes de terre",
        "quantity": 800,
        "unit": "g",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-poulet-roti-dimanche-2",
        "name": "Beurre",
        "quantity": 40,
        "unit": "g",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-poulet-roti-dimanche-3",
        "name": "Thym",
        "quantity": 2,
        "unit": "cuillere_soupe",
        "category": "epicerie_salee"
      }
    ]
  },
  {
    "id": "hachis-parmentier-maison",
    "title": "Hachis Parmentier au Bœuf Mijoté",
    "description": "Bœuf mijoté aux oignons sous une purée maison onctueuse dorée au four.",
    "image_url": "https://images.unsplash.com/photo-1584947920409-5a1e8093d9ce?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 25,
    "cook_time": 30,
    "servings": 6,
    "category": "diner",
    "tags": [
      "famille",
      "batch_cooking"
    ],
    "source": "website",
    "instructions": "1. Faites cuire les pommes de terre à l'eau et préparez une purée avec lait et beurre.\n2. Faites revenir le bœuf haché avec oignon, ail et persil.\n3. Déposez la viande au fond du plat, recouvrez de purée et enfournez 25 min à 190°C.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-hachis-parmentier-maison-0",
        "name": "Pommes de terre",
        "quantity": 1000,
        "unit": "g",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-hachis-parmentier-maison-1",
        "name": "Bœuf haché",
        "quantity": 500,
        "unit": "g",
        "category": "boucherie"
      },
      {
        "id": "ing-hachis-parmentier-maison-2",
        "name": "Lait",
        "quantity": 150,
        "unit": "ml",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-hachis-parmentier-maison-3",
        "name": "Beurre",
        "quantity": 40,
        "unit": "g",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-hachis-parmentier-maison-4",
        "name": "Oignon",
        "quantity": 1,
        "unit": "piece",
        "category": "fruits_legumes"
      }
    ]
  },
  {
    "id": "lasagnes-bolognaise-maison",
    "title": "Lasagnes Bolognaises Maison Gratinées",
    "description": "Pâtes fondantes, sauce bolognaise mijotée, béchamel crémeuse et mozzarella dorée.",
    "image_url": "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=800&q=80",
    "difficulty": "moyen",
    "prep_time": 25,
    "cook_time": 35,
    "servings": 6,
    "category": "diner",
    "tags": [
      "famille",
      "batch_cooking"
    ],
    "source": "website",
    "instructions": "1. Dans un plat, alternez couches de lasagnes, sauce bolognaise et béchamel.\n2. Terminez par une couche de béchamel et parsemez de mozzarella.\n3. Enfournez 35 minutes à 180°C jusqu'à gratinage parfait.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-lasagnes-bolognaise-maison-0",
        "name": "Plaques de lasagnes",
        "quantity": 12,
        "unit": "piece",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-lasagnes-bolognaise-maison-1",
        "name": "Sauce bolognaise",
        "quantity": 700,
        "unit": "g",
        "category": "boucherie"
      },
      {
        "id": "ing-lasagnes-bolognaise-maison-2",
        "name": "Sauce béchamel",
        "quantity": 500,
        "unit": "ml",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-lasagnes-bolognaise-maison-3",
        "name": "Mozzarella râpée",
        "quantity": 150,
        "unit": "g",
        "category": "produits_laitiers"
      }
    ]
  },
  {
    "id": "chili-con-carne-convivial",
    "title": "Chili Con Carne Convivial",
    "description": "Bœuf haché, haricots rouges, maïs doux et épices tex-mex mijotés à cœur.",
    "image_url": "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 15,
    "cook_time": 35,
    "servings": 6,
    "category": "diner",
    "tags": [
      "famille",
      "batch_cooking"
    ],
    "source": "website",
    "instructions": "1. Faites dorer oignon, ail et viande hachée dans une cocotte.\n2. Ajoutez les épices chili, les tomates concassées et les haricots rouges égouttés.\n3. Laissez mijoter à feu doux 30 minutes et servez avec du riz.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-chili-con-carne-convivial-0",
        "name": "Bœuf haché",
        "quantity": 500,
        "unit": "g",
        "category": "boucherie"
      },
      {
        "id": "ing-chili-con-carne-convivial-1",
        "name": "Haricots rouges en boîte",
        "quantity": 500,
        "unit": "g",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-chili-con-carne-convivial-2",
        "name": "Tomates concassées",
        "quantity": 800,
        "unit": "g",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-chili-con-carne-convivial-3",
        "name": "Maïs",
        "quantity": 150,
        "unit": "g",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-chili-con-carne-convivial-4",
        "name": "Épices chili",
        "quantity": 2,
        "unit": "cuillere_soupe",
        "category": "epicerie_salee"
      }
    ]
  },
  {
    "id": "boeuf-bourguignon-tradition",
    "title": "Bœuf Bourguignon Traditionnel",
    "description": "Morceaux de bœuf fondants mijotés au vin rouge avec carottes, lardons et champignons.",
    "image_url": "https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&w=800&q=80",
    "difficulty": "moyen",
    "prep_time": 30,
    "cook_time": 90,
    "servings": 6,
    "category": "diner",
    "tags": [
      "famille",
      "batch_cooking"
    ],
    "source": "website",
    "instructions": "1. Faites dorer la viande et les lardons dans une cocotte.\n2. Saupoudrez d'une cuillère de farine, mélangez et mouillez au vin rouge et bouillon.\n3. Ajoutez carottes, ail, bouquet garni et laissez mijoter à feu très doux 1h30.\n4. Ajoutez les champignons poêlés 15 min avant la fin.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-boeuf-bourguignon-tradition-0",
        "name": "Bœuf pour bourguignon (paleron)",
        "quantity": 800,
        "unit": "g",
        "category": "boucherie"
      },
      {
        "id": "ing-boeuf-bourguignon-tradition-1",
        "name": "Carottes",
        "quantity": 4,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-boeuf-bourguignon-tradition-2",
        "name": "Lardons",
        "quantity": 150,
        "unit": "g",
        "category": "boucherie"
      },
      {
        "id": "ing-boeuf-bourguignon-tradition-3",
        "name": "Champignons",
        "quantity": 250,
        "unit": "g",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-boeuf-bourguignon-tradition-4",
        "name": "Vin rouge",
        "quantity": 500,
        "unit": "ml",
        "category": "boissons"
      }
    ]
  },
  {
    "id": "blanquette-de-veau",
    "title": "Blanquette de Veau à l'Ancienne",
    "description": "Morceaux de veau fondants dans une sauce blanche veloutée à la crème et au citron.",
    "image_url": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    "difficulty": "moyen",
    "prep_time": 25,
    "cook_time": 60,
    "servings": 6,
    "category": "diner",
    "tags": [
      "famille",
      "batch_cooking"
    ],
    "source": "website",
    "instructions": "1. Pochez la viande avec carottes, oignon piqué de clous de girofle et bouquet garni 50 min.\n2. Préparez un roux blanc avec beurre et farine, mouillez avec le bouillon de cuisson.\n3. Liez la sauce avec crème et jaune d'œuf, versez sur la viande et servez avec du riz.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-blanquette-de-veau-0",
        "name": "Veau en morceaux",
        "quantity": 800,
        "unit": "g",
        "category": "boucherie"
      },
      {
        "id": "ing-blanquette-de-veau-1",
        "name": "Carottes",
        "quantity": 3,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-blanquette-de-veau-2",
        "name": "Crème fraîche",
        "quantity": 150,
        "unit": "ml",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-blanquette-de-veau-3",
        "name": "Beurre",
        "quantity": 30,
        "unit": "g",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-blanquette-de-veau-4",
        "name": "Farine",
        "quantity": 30,
        "unit": "g",
        "category": "epicerie_sucree"
      }
    ]
  },
  {
    "id": "tartiflette-savoyarde",
    "title": "Tartiflette Savoyarde au Vrai Reblochon",
    "description": "Pommes de terre fondantes, lardons fumés, oignons et demi-reblochon gratiné.",
    "image_url": "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 20,
    "cook_time": 25,
    "servings": 4,
    "category": "diner",
    "tags": [
      "famille"
    ],
    "source": "website",
    "instructions": "1. Cuisez les pommes de terre à l'eau 20 min puis coupez-les en rondelles.\n2. Faites dorer lardons et oignons émincés.\n3. Disposez pommes de terre et lardons dans un plat, posez le reblochon coupé en deux sur le dessus et gratinez 20 min à 200°C.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-tartiflette-savoyarde-0",
        "name": "Pommes de terre",
        "quantity": 1000,
        "unit": "g",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-tartiflette-savoyarde-1",
        "name": "Reblochon",
        "quantity": 1,
        "unit": "piece",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-tartiflette-savoyarde-2",
        "name": "Lardons",
        "quantity": 200,
        "unit": "g",
        "category": "boucherie"
      },
      {
        "id": "ing-tartiflette-savoyarde-3",
        "name": "Oignons",
        "quantity": 2,
        "unit": "piece",
        "category": "fruits_legumes"
      }
    ]
  },
  {
    "id": "poulet-tikka-masala",
    "title": "Poulet Tikka Masala Onctueux",
    "description": "Blancs de poulet marinés et dorés dans une sauce tomate veloutée au garam masala et crème.",
    "image_url": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 20,
    "cook_time": 20,
    "servings": 4,
    "category": "diner",
    "tags": [
      "famille",
      "batch_cooking"
    ],
    "source": "website",
    "instructions": "1. Marinez le poulet dans le yaourt et épices, puis faites-le dorer à la poêle.\n2. Faites suer oignon, ail et gingembre, ajoutez le coulis de tomate et laissez mijoter 15 min.\n3. Incorporez la crème et le poulet, servez bien chaud avec du riz.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-poulet-tikka-masala-0",
        "name": "Blancs de poulet",
        "quantity": 500,
        "unit": "g",
        "category": "boucherie"
      },
      {
        "id": "ing-poulet-tikka-masala-1",
        "name": "Coulis de tomates",
        "quantity": 400,
        "unit": "ml",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-poulet-tikka-masala-2",
        "name": "Crème fraîche",
        "quantity": 150,
        "unit": "ml",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-poulet-tikka-masala-3",
        "name": "Garam masala",
        "quantity": 2,
        "unit": "cuillere_soupe",
        "category": "epicerie_salee"
      }
    ]
  },
  {
    "id": "fajitas-poulet-poivrons",
    "title": "Fajitas de Poulet aux Poivrons Épicés",
    "description": "Lanières de poulet et poivrons colorés sautés aux épices mexicaines.",
    "image_url": "https://images.unsplash.com/photo-1534352956036-cd81e27dd615?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 15,
    "cook_time": 12,
    "servings": 4,
    "category": "diner",
    "tags": [
      "famille",
      "rapide"
    ],
    "source": "website",
    "instructions": "1. Coupez poulet et poivrons en lanières.\n2. Saisissez le poulet avec les épices fajitas dans l'huile chaude.\n3. Ajoutez les poivrons et oignons, cuisez 8 min et garnissez des tortillas chaudes.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-fajitas-poulet-poivrons-0",
        "name": "Blancs de poulet",
        "quantity": 400,
        "unit": "g",
        "category": "boucherie"
      },
      {
        "id": "ing-fajitas-poulet-poivrons-1",
        "name": "Poivrons tricolores",
        "quantity": 3,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-fajitas-poulet-poivrons-2",
        "name": "Tortillas",
        "quantity": 6,
        "unit": "piece",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-fajitas-poulet-poivrons-3",
        "name": "Épices fajitas",
        "quantity": 2,
        "unit": "cuillere_soupe",
        "category": "epicerie_salee"
      }
    ]
  },
  {
    "id": "burger-maison-cheddar",
    "title": "Burger Maison au Cheddar Affiné & Oignons",
    "description": "Pain brioché toasté, steak pur bœuf juteux, compotée d'oignons et cheddar fondu.",
    "image_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 15,
    "cook_time": 12,
    "servings": 2,
    "category": "diner",
    "tags": [
      "famille",
      "etudiant"
    ],
    "source": "website",
    "instructions": "1. Caramélisez les oignons émincés dans une poêle avec un filet de vinaigre.\n2. Cuisez les steaks à la poêle et faites fondre le cheddar par-dessus.\n3. Toastez les pains et montez avec sauce, salade, steak et oignons.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-burger-maison-cheddar-0",
        "name": "Pains burgers briochés",
        "quantity": 2,
        "unit": "piece",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-burger-maison-cheddar-1",
        "name": "Steaks de bœuf",
        "quantity": 2,
        "unit": "piece",
        "category": "boucherie"
      },
      {
        "id": "ing-burger-maison-cheddar-2",
        "name": "Tranches de cheddar",
        "quantity": 4,
        "unit": "piece",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-burger-maison-cheddar-3",
        "name": "Oignons",
        "quantity": 2,
        "unit": "piece",
        "category": "fruits_legumes"
      }
    ]
  },
  {
    "id": "boulettes-boeuf-sauce-tomate",
    "title": "Boulettes de Bœuf Moelleuses Sauce Tomate",
    "description": "Boulettes parfumées au parmesan et persil mijotées dans un coulis de tomate maison.",
    "image_url": "https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 20,
    "cook_time": 20,
    "servings": 4,
    "category": "diner",
    "tags": [
      "famille",
      "batch_cooking"
    ],
    "source": "website",
    "instructions": "1. Malaxez la viande hachée avec l'œuf, parmesan, chapelure et persil.\n2. Façonnez des boulettes et dorez-les dans l'huile d'olive 5 min.\n3. Versez le coulis de tomate et laissez mijoter 15 min à couvert.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-boulettes-boeuf-sauce-tomate-0",
        "name": "Bœuf haché",
        "quantity": 450,
        "unit": "g",
        "category": "boucherie"
      },
      {
        "id": "ing-boulettes-boeuf-sauce-tomate-1",
        "name": "Coulis de tomates",
        "quantity": 500,
        "unit": "ml",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-boulettes-boeuf-sauce-tomate-2",
        "name": "Parmesan râpé",
        "quantity": 40,
        "unit": "g",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-boulettes-boeuf-sauce-tomate-3",
        "name": "Œuf",
        "quantity": 1,
        "unit": "piece",
        "category": "produits_frais"
      }
    ]
  },
  {
    "id": "curry-japonais-poulet",
    "title": "Curry Japonais Réconfortant Poulet & Légumes",
    "description": "Sauce curry japonaise brune et onctueuse avec pommes de terre et carottes fondantes.",
    "image_url": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 15,
    "cook_time": 30,
    "servings": 4,
    "category": "diner",
    "tags": [
      "famille",
      "batch_cooking"
    ],
    "source": "website",
    "instructions": "1. Saisissez poulet en morceaux, oignon, carottes et pommes de terre.\n2. Couvrez d'eau et laissez mijoter 20 min jusqu'à tendreté des légumes.\n3. Incorporez les tablettes de roux de curry japonais, remuez pour épaissir et servez avec du riz.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-curry-japonais-poulet-0",
        "name": "Blancs de poulet",
        "quantity": 400,
        "unit": "g",
        "category": "boucherie"
      },
      {
        "id": "ing-curry-japonais-poulet-1",
        "name": "Carottes",
        "quantity": 2,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-curry-japonais-poulet-2",
        "name": "Pommes de terre",
        "quantity": 3,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-curry-japonais-poulet-3",
        "name": "Roux de curry japonais",
        "quantity": 90,
        "unit": "g",
        "category": "epicerie_salee"
      }
    ]
  },
  {
    "id": "cake-sale-jambon-olives",
    "title": "Cake Salé Jambon, Olives Vertes & Emmental",
    "description": "Le cake moelleux incontournable pour le pique-nique et les dîners légers.",
    "image_url": "https://images.unsplash.com/photo-1547496502-affa22d38842?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 15,
    "cook_time": 40,
    "servings": 6,
    "category": "dejeuner",
    "tags": [
      "famille",
      "batch_cooking"
    ],
    "source": "website",
    "instructions": "1. Fouettez œufs, farine, levure, lait tiède et huile.\n2. Incorporez dés de jambon, olives dénoyautées et fromage râpé.\n3. Versez dans un moule à cake et enfournez 40 min à 180°C.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-cake-sale-jambon-olives-0",
        "name": "Farine",
        "quantity": 200,
        "unit": "g",
        "category": "epicerie_sucree"
      },
      {
        "id": "ing-cake-sale-jambon-olives-1",
        "name": "Œufs",
        "quantity": 3,
        "unit": "piece",
        "category": "produits_frais"
      },
      {
        "id": "ing-cake-sale-jambon-olives-2",
        "name": "Dés de jambon",
        "quantity": 150,
        "unit": "g",
        "category": "boucherie"
      },
      {
        "id": "ing-cake-sale-jambon-olives-3",
        "name": "Olives vertes",
        "quantity": 80,
        "unit": "g",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-cake-sale-jambon-olives-4",
        "name": "Emmental râpé",
        "quantity": 100,
        "unit": "g",
        "category": "produits_laitiers"
      }
    ]
  },
  {
    "id": "gratin-chou-fleur-bechamel",
    "title": "Gratin de Chou-Fleur à la Béchamel",
    "description": "Sommités de chou-fleur tendres nappées d'une béchamel onctueuse et gratinées au fromage.",
    "image_url": "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 15,
    "cook_time": 25,
    "servings": 4,
    "category": "diner",
    "tags": [
      "famille",
      "vegetarien"
    ],
    "source": "website",
    "instructions": "1. Cuisez les fleurettes de chou-fleur 10 min à la vapeur.\n2. Préparez une béchamel maison au beurre, farine, lait et muscade.\n3. Disposez le chou-fleur dans un plat, nappez de béchamel, saupoudrez de fromage et gratinez 15 min à 200°C.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-gratin-chou-fleur-bechamel-0",
        "name": "Chou-fleur",
        "quantity": 1,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-gratin-chou-fleur-bechamel-1",
        "name": "Lait",
        "quantity": 400,
        "unit": "ml",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-gratin-chou-fleur-bechamel-2",
        "name": "Beurre",
        "quantity": 30,
        "unit": "g",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-gratin-chou-fleur-bechamel-3",
        "name": "Farine",
        "quantity": 30,
        "unit": "g",
        "category": "epicerie_sucree"
      },
      {
        "id": "ing-gratin-chou-fleur-bechamel-4",
        "name": "Fromage râpé",
        "quantity": 80,
        "unit": "g",
        "category": "produits_laitiers"
      }
    ]
  },
  {
    "id": "cordon-bleu-maison",
    "title": "Cordon Bleu Maison Pané au Comté",
    "description": "Escalope tendre garnie de jambon blanc et vrai comté fondant, panure dorée et croustillante.",
    "image_url": "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 15,
    "cook_time": 12,
    "servings": 2,
    "category": "dejeuner",
    "tags": [
      "famille"
    ],
    "source": "website",
    "instructions": "1. Aplatissez les escalopes, déposez une demi-tranche de jambon et une belle tranche de comté.\n2. Repliez en portefeuille et passez successivement dans la farine, l'œuf battu et la chapelure.\n3. Cuisez 6 min de chaque côté à feu doux dans du beurre moussant.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-cordon-bleu-maison-0",
        "name": "Escalopes de dinde ou poulet",
        "quantity": 2,
        "unit": "piece",
        "category": "boucherie"
      },
      {
        "id": "ing-cordon-bleu-maison-1",
        "name": "Jambon blanc",
        "quantity": 1,
        "unit": "piece",
        "category": "boucherie"
      },
      {
        "id": "ing-cordon-bleu-maison-2",
        "name": "Comté",
        "quantity": 60,
        "unit": "g",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-cordon-bleu-maison-3",
        "name": "Chapelure",
        "quantity": 60,
        "unit": "g",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-cordon-bleu-maison-4",
        "name": "Œuf",
        "quantity": 1,
        "unit": "piece",
        "category": "produits_frais"
      }
    ]
  },
  {
    "id": "gratin-penne-poulet-mozzarella",
    "title": "Gratin de Penne au Poulet & Mozzarella",
    "description": "Pennes enrobées de sauce tomate mijotée, morceaux de poulet rôti et mozzarella fondante.",
    "image_url": "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 15,
    "cook_time": 20,
    "servings": 4,
    "category": "diner",
    "tags": [
      "famille"
    ],
    "source": "website",
    "instructions": "1. Cuisez les pennes al dente.\n2. Faites dorer le poulet en dés avec oignon et coulis de tomate.\n3. Mélangez pâtes et sauce, versez dans un plat, recouvrez de mozzarella et gratinez 20 min à 190°C.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-gratin-penne-poulet-mozzarella-0",
        "name": "Penne",
        "quantity": 350,
        "unit": "g",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-gratin-penne-poulet-mozzarella-1",
        "name": "Blancs de poulet",
        "quantity": 300,
        "unit": "g",
        "category": "boucherie"
      },
      {
        "id": "ing-gratin-penne-poulet-mozzarella-2",
        "name": "Coulis de tomates",
        "quantity": 400,
        "unit": "ml",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-gratin-penne-poulet-mozzarella-3",
        "name": "Mozzarella",
        "quantity": 150,
        "unit": "g",
        "category": "produits_laitiers"
      }
    ]
  },
  {
    "id": "salade-piemontaise",
    "title": "Salade Piémontaise Traditionnelle",
    "description": "Pommes de terre vapeur, dés de jambon, œufs durs, tomates et cornichons liés à la mayonnaise.",
    "image_url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 20,
    "cook_time": 15,
    "servings": 4,
    "category": "dejeuner",
    "tags": [
      "famille",
      "batch_cooking"
    ],
    "source": "website",
    "instructions": "1. Cuisez les pommes de terre à l'eau, épluchez et coupez en dés.\n2. Cuisez les œufs durs 9 min et écalez-les.\n3. Réunissez pommes de terre, œufs en quartiers, dés de jambon, tomates et cornichons avec la mayonnaise.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-salade-piemontaise-0",
        "name": "Pommes de terre",
        "quantity": 500,
        "unit": "g",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-salade-piemontaise-1",
        "name": "Œufs",
        "quantity": 3,
        "unit": "piece",
        "category": "produits_frais"
      },
      {
        "id": "ing-salade-piemontaise-2",
        "name": "Dés de jambon",
        "quantity": 150,
        "unit": "g",
        "category": "boucherie"
      },
      {
        "id": "ing-salade-piemontaise-3",
        "name": "Tomates",
        "quantity": 2,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-salade-piemontaise-4",
        "name": "Mayonnaise",
        "quantity": 3,
        "unit": "cuillere_soupe",
        "category": "epicerie_salee"
      }
    ]
  },
  {
    "id": "minestrone-legumes-pates",
    "title": "Minestrone Gourmand aux Légumes & Pâtes",
    "description": "Grande soupe complète italienne aux carottes, haricots blancs, courgettes et coquillettes.",
    "image_url": "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 15,
    "cook_time": 25,
    "servings": 4,
    "category": "diner",
    "tags": [
      "famille",
      "vegetarien",
      "batch_cooking"
    ],
    "source": "website",
    "instructions": "1. Faites revenir oignon, carottes et courgettes en dés dans l'huile d'olive.\n2. Ajoutez tomates concassées, haricots blancs et 800ml de bouillon.\n3. Cuisez 15 min puis jetez les petites pâtes et laissez cuire 8 min de plus.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-minestrone-legumes-pates-0",
        "name": "Carottes",
        "quantity": 2,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-minestrone-legumes-pates-1",
        "name": "Courgette",
        "quantity": 1,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-minestrone-legumes-pates-2",
        "name": "Haricots blancs en boîte",
        "quantity": 250,
        "unit": "g",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-minestrone-legumes-pates-3",
        "name": "Coquillettes",
        "quantity": 100,
        "unit": "g",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-minestrone-legumes-pates-4",
        "name": "Tomates concassées",
        "quantity": 400,
        "unit": "g",
        "category": "epicerie_salee"
      }
    ]
  },
  {
    "id": "curry-legumes-pois-chiches",
    "title": "Curry de Légumes & Pois Chiches au Lait de Coco",
    "description": "Patates douces, épinards fondants et pois chiches mijotés dans un curry doux au lait de coco.",
    "image_url": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 15,
    "cook_time": 25,
    "servings": 4,
    "category": "diner",
    "tags": [
      "vegetarien",
      "batch_cooking",
      "famille"
    ],
    "source": "website",
    "instructions": "1. Coupez les patates douces en dés. Émincez oignon et ail.\n2. Faites revenir l'oignon et le curry dans l'huile d'olive 2 min.\n3. Ajoutez patates douces, pois chiches égouttés, tomates concassées et lait de coco.\n4. Couvrez et laissez mijoter 20 min à feu moyen. Incorporez les épinards en fin de cuisson.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-curry-legumes-pois-chiches-0",
        "name": "Patates douces",
        "quantity": 2,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-curry-legumes-pois-chiches-1",
        "name": "Pois chiches en boîte",
        "quantity": 400,
        "unit": "g",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-curry-legumes-pois-chiches-2",
        "name": "Lait de coco",
        "quantity": 400,
        "unit": "ml",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-curry-legumes-pois-chiches-3",
        "name": "Tomates concassées",
        "quantity": 400,
        "unit": "g",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-curry-legumes-pois-chiches-4",
        "name": "Pousses d'épinards",
        "quantity": 150,
        "unit": "g",
        "category": "fruits_legumes"
      }
    ]
  },
  {
    "id": "dahl-lentilles-corail",
    "title": "Dahl de Lentilles Corail au Lait de Coco",
    "description": "Recette indienne économique et parfumée : lentilles corail fondantes aux épices douces.",
    "image_url": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 10,
    "cook_time": 20,
    "servings": 4,
    "category": "diner",
    "tags": [
      "vegetarien",
      "etudiant",
      "batch_cooking",
      "rapide"
    ],
    "source": "website",
    "instructions": "1. Rincez les lentilles corail.\n2. Faites suer oignon, ail et gingembre avec curcuma et cumin.\n3. Ajoutez les lentilles, le coulis de tomate, le lait de coco et 200ml d'eau.\n4. Laissez mijoter à feu doux 20 min en remuant régulièrement.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-dahl-lentilles-corail-0",
        "name": "Lentilles corail",
        "quantity": 250,
        "unit": "g",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-dahl-lentilles-corail-1",
        "name": "Lait de coco",
        "quantity": 200,
        "unit": "ml",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-dahl-lentilles-corail-2",
        "name": "Coulis de tomate",
        "quantity": 200,
        "unit": "ml",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-dahl-lentilles-corail-3",
        "name": "Oignon",
        "quantity": 1,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-dahl-lentilles-corail-4",
        "name": "Curcuma & Cumin",
        "quantity": 2,
        "unit": "cuillere_the",
        "category": "epicerie_salee"
      }
    ]
  },
  {
    "id": "ratatouille-provencale",
    "title": "Ratatouille Provençale Traditionnelle",
    "description": "Courgettes, aubergines, poivrons et tomates confits à l'huile d'olive et herbes de Provence.",
    "image_url": "https://images.unsplash.com/photo-1572453800999-e8d2d1589b7c?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 20,
    "cook_time": 40,
    "servings": 4,
    "category": "diner",
    "tags": [
      "vegetarien",
      "batch_cooking",
      "famille"
    ],
    "source": "website",
    "instructions": "1. Faites revenir séparément aubergines et courgettes en dés dans l'huile d'olive.\n2. Faites suer oignons et poivrons avec l'ail, ajoutez les tomates et réunissez tous les légumes.\n3. Laissez mijoter 35 min à couvert à feu doux.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-ratatouille-provencale-0",
        "name": "Courgettes",
        "quantity": 2,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-ratatouille-provencale-1",
        "name": "Aubergines",
        "quantity": 1,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-ratatouille-provencale-2",
        "name": "Poivrons rouges et jaunes",
        "quantity": 2,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-ratatouille-provencale-3",
        "name": "Tomates",
        "quantity": 4,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-ratatouille-provencale-4",
        "name": "Huile d'olive",
        "quantity": 4,
        "unit": "cuillere_soupe",
        "category": "epicerie_salee"
      }
    ]
  },
  {
    "id": "falafels-croustillants-tahini",
    "title": "Falafels Croustillants & Sauce Tahini",
    "description": "Boulettes de pois chiches crus aux herbes fraîches et épices, croustillantes dehors et moelleuses dedans.",
    "image_url": "https://images.unsplash.com/photo-1593001874117-c99c800e3eb7?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 20,
    "cook_time": 15,
    "servings": 4,
    "category": "dejeuner",
    "tags": [
      "vegetarien"
    ],
    "source": "website",
    "instructions": "1. Mixez les pois chiches réhydratés avec oignon, ail, coriandre, persil, cumin et sel.\n2. Façonnez de petites boules aplaties.\n3. Faites dorer 4 min de chaque côté dans une poêle avec de l'huile bien chaude. Servez avec sauce au yaourt et tahini.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-falafels-croustillants-tahini-0",
        "name": "Pois chiches secs trempés 24h",
        "quantity": 250,
        "unit": "g",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-falafels-croustillants-tahini-1",
        "name": "Persil plat",
        "quantity": 1,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-falafels-croustillants-tahini-2",
        "name": "Coriandre fraîche",
        "quantity": 1,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-falafels-croustillants-tahini-3",
        "name": "Gousses d'ail",
        "quantity": 2,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-falafels-croustillants-tahini-4",
        "name": "Cumin moulu",
        "quantity": 1,
        "unit": "cuillere_soupe",
        "category": "epicerie_salee"
      }
    ]
  },
  {
    "id": "curry-thai-vert-tofu",
    "title": "Curry Thaï Vert au Tofu & Lait de Coco",
    "description": "Saveurs parfumées de citronnelle, basilic thaï, dés de tofu doré et légumes croquants.",
    "image_url": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 15,
    "cook_time": 15,
    "servings": 4,
    "category": "diner",
    "tags": [
      "vegetarien",
      "rapide"
    ],
    "source": "website",
    "instructions": "1. Faites dorer les dés de tofu dans un filet d'huile jusqu'à ce qu'ils soient croustillants.\n2. Faites chauffer la pâte de curry vert 1 min, ajoutez le lait de coco et les courgettes en demi-lunes.\n3. Laissez frémir 10 min, rajoutez le tofu et parsemez de basilic frais.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-curry-thai-vert-tofu-0",
        "name": "Tofu ferme",
        "quantity": 300,
        "unit": "g",
        "category": "produits_frais"
      },
      {
        "id": "ing-curry-thai-vert-tofu-1",
        "name": "Lait de coco",
        "quantity": 400,
        "unit": "ml",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-curry-thai-vert-tofu-2",
        "name": "Pâte de curry vert",
        "quantity": 2,
        "unit": "cuillere_soupe",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-curry-thai-vert-tofu-3",
        "name": "Courgette",
        "quantity": 1,
        "unit": "piece",
        "category": "fruits_legumes"
      }
    ]
  },
  {
    "id": "salade-quinoa-grenade-avocat",
    "title": "Salade de Quinoa, Avocat & Grenade",
    "description": "Fraîcheur vitaminée : graines de quinoa assaisonnées au citron, grains de grenade croquants et avocat fondant.",
    "image_url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 15,
    "cook_time": 12,
    "servings": 4,
    "category": "dejeuner",
    "tags": [
      "vegetarien",
      "batch_cooking"
    ],
    "source": "website",
    "instructions": "1. Rincez et cuisez le quinoa 12 min à l'eau bouillante salée, laissez refroidir.\n2. Égrainez la grenade et coupez l'avocat en dés.\n3. Mélangez quinoa, grenade, avocat, menthe ciselée, huile d'olive et jus de citron.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-salade-quinoa-grenade-avocat-0",
        "name": "Quinoa",
        "quantity": 200,
        "unit": "g",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-salade-quinoa-grenade-avocat-1",
        "name": "Grenade",
        "quantity": 1,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-salade-quinoa-grenade-avocat-2",
        "name": "Avocat",
        "quantity": 1,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-salade-quinoa-grenade-avocat-3",
        "name": "Menthe fraîche",
        "quantity": 0.5,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-salade-quinoa-grenade-avocat-4",
        "name": "Huile d'olive",
        "quantity": 3,
        "unit": "cuillere_soupe",
        "category": "epicerie_salee"
      }
    ]
  },
  {
    "id": "frittata-legumes-feta",
    "title": "Frittata aux Légumes du Soleil & Féta",
    "description": "Épaisse omelette au four garnie de courgettes, tomates cerises et féta fondante.",
    "image_url": "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 10,
    "cook_time": 20,
    "servings": 4,
    "category": "diner",
    "tags": [
      "vegetarien",
      "batch_cooking"
    ],
    "source": "website",
    "instructions": "1. Faites poêler les dés de courgette et tomates cerises 5 min.\n2. Battez 6 œufs avec sel, poivre et herbes.\n3. Versez sur les légumes dans une poêle allant au four ou un plat, émiettez la féta et cuisez 20 min à 180°C.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-frittata-legumes-feta-0",
        "name": "Œufs",
        "quantity": 6,
        "unit": "piece",
        "category": "produits_frais"
      },
      {
        "id": "ing-frittata-legumes-feta-1",
        "name": "Courgette",
        "quantity": 1,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-frittata-legumes-feta-2",
        "name": "Tomates cerises",
        "quantity": 150,
        "unit": "g",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-frittata-legumes-feta-3",
        "name": "Féta",
        "quantity": 80,
        "unit": "g",
        "category": "produits_laitiers"
      }
    ]
  },
  {
    "id": "tacos-vegetariens-haricots",
    "title": "Tacos Végétariens aux Haricots Noirs & Guacamole",
    "description": "Tortillas garnies d'une purée de haricots noirs au cumin, maïs doux, avocat et coriandre.",
    "image_url": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 12,
    "cook_time": 8,
    "servings": 2,
    "category": "diner",
    "tags": [
      "rapide",
      "vegetarien",
      "etudiant"
    ],
    "source": "website",
    "instructions": "1. Réchauffez les haricots noirs avec cumin et sel en les écrasant à la fourchette.\n2. Tiédissez les tortillas.\n3. Garnissez avec les haricots, le maïs égoutté, des tranches d'avocat et un trait de jus de citron vert.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-tacos-vegetariens-haricots-0",
        "name": "Tortillas",
        "quantity": 4,
        "unit": "piece",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-tacos-vegetariens-haricots-1",
        "name": "Haricots noirs en boîte",
        "quantity": 250,
        "unit": "g",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-tacos-vegetariens-haricots-2",
        "name": "Avocat",
        "quantity": 1,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-tacos-vegetariens-haricots-3",
        "name": "Maïs",
        "quantity": 80,
        "unit": "g",
        "category": "epicerie_salee"
      }
    ]
  },
  {
    "id": "salade-lentilles-echalotes",
    "title": "Salade de Lentilles du Puy aux Échalotes",
    "description": "Lentilles vertes assaisonnées d'une vinaigrette moutardée, de fines échalotes et carottes croquantes.",
    "image_url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 10,
    "cook_time": 25,
    "servings": 4,
    "category": "dejeuner",
    "tags": [
      "vegetarien",
      "batch_cooking",
      "etudiant"
    ],
    "source": "website",
    "instructions": "1. Cuisez les lentilles à l'eau 25 min.\n2. Égouttez et mélangez tiède avec huile d'olive, vinaigre de cidre, moutarde et échalotes ciselées.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-salade-lentilles-echalotes-0",
        "name": "Lentilles vertes du Puy",
        "quantity": 250,
        "unit": "g",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-salade-lentilles-echalotes-1",
        "name": "Échalotes",
        "quantity": 2,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-salade-lentilles-echalotes-2",
        "name": "Moutarde à l'ancienne",
        "quantity": 1,
        "unit": "cuillere_soupe",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-salade-lentilles-echalotes-3",
        "name": "Huile d'olive",
        "quantity": 3,
        "unit": "cuillere_soupe",
        "category": "epicerie_salee"
      }
    ]
  },
  {
    "id": "veloute-courge-butternut",
    "title": "Velouté de Courge Butternut & Graines de Courge",
    "description": "Soupe veloutée et douce à la courge butternut rôtie et crème liquide, saupoudrée de graines dorées.",
    "image_url": "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 15,
    "cook_time": 25,
    "servings": 4,
    "category": "diner",
    "tags": [
      "vegetarien",
      "batch_cooking",
      "rapide"
    ],
    "source": "website",
    "instructions": "1. Faites suer l'oignon, ajoutez les cubes de butternut et le bouillon.\n2. Laissez cuire 25 min jusqu'à ce que la courge soit tendre.\n3. Mixez avec la crème liquide et servez avec des graines de courge torréfiées.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-veloute-courge-butternut-0",
        "name": "Courge butternut",
        "quantity": 1,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-veloute-courge-butternut-1",
        "name": "Bouillon de légumes",
        "quantity": 750,
        "unit": "ml",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-veloute-courge-butternut-2",
        "name": "Crème liquide",
        "quantity": 100,
        "unit": "ml",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-veloute-courge-butternut-3",
        "name": "Graines de courge",
        "quantity": 20,
        "unit": "g",
        "category": "epicerie_salee"
      }
    ]
  },
  {
    "id": "risotto-champignons-parmesan",
    "title": "Risotto aux Champignons & Parmesan",
    "description": "Riz arborio crémeux nappé de champignons poêlés à l'ail et généreux parmesan.",
    "image_url": "https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=800&q=80",
    "difficulty": "moyen",
    "prep_time": 15,
    "cook_time": 25,
    "servings": 4,
    "category": "diner",
    "tags": [
      "vegetarien",
      "famille"
    ],
    "source": "website",
    "instructions": "1. Dorez les champignons émincés au beurre et réservez.\n2. Nacre le riz dans un peu de beurre avec l'échalote, versez le bouillon chaud louche après louche.\n3. Liez au beurre et parmesan en incorporant les champignons.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-risotto-champignons-parmesan-0",
        "name": "Riz arborio",
        "quantity": 300,
        "unit": "g",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-risotto-champignons-parmesan-1",
        "name": "Champignons de Paris",
        "quantity": 250,
        "unit": "g",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-risotto-champignons-parmesan-2",
        "name": "Bouillon de légumes",
        "quantity": 1,
        "unit": "l",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-risotto-champignons-parmesan-3",
        "name": "Parmesan râpé",
        "quantity": 60,
        "unit": "g",
        "category": "produits_laitiers"
      }
    ]
  },
  {
    "id": "taboule-libanais-menthe",
    "title": "Taboulé Libanais Traditionnel Persil & Menthe",
    "description": "Salade ultra fraîche riche en persil plat, menthe fraîche, tomates et jus de citron pressé.",
    "image_url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 20,
    "cook_time": 15,
    "servings": 4,
    "category": "dejeuner",
    "tags": [
      "vegetarien",
      "batch_cooking",
      "rapide"
    ],
    "source": "website",
    "instructions": "1. Faites gonfler le boulgour fin dans de l'eau tiède citronnée.\n2. Hachez finement persil et menthe au couteau.\n3. Mélangez avec les tomates en dés minuscules, l'huile d'olive et le jus de citron.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-taboule-libanais-menthe-0",
        "name": "Persil plat",
        "quantity": 3,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-taboule-libanais-menthe-1",
        "name": "Menthe fraîche",
        "quantity": 1,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-taboule-libanais-menthe-2",
        "name": "Tomates",
        "quantity": 3,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-taboule-libanais-menthe-3",
        "name": "Boulgour fin",
        "quantity": 50,
        "unit": "g",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-taboule-libanais-menthe-4",
        "name": "Huile d'olive",
        "quantity": 50,
        "unit": "ml",
        "category": "epicerie_salee"
      }
    ]
  },
  {
    "id": "galettes-avoine-legumes",
    "title": "Galettes Végétales aux Flocons d'Avoine & Légumes",
    "description": "Galettes dorées à la poêle, riches en protéines végétales et en fibres.",
    "image_url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 15,
    "cook_time": 10,
    "servings": 4,
    "category": "diner",
    "tags": [
      "vegetarien",
      "batch_cooking",
      "etudiant"
    ],
    "source": "website",
    "instructions": "1. Mélangez flocons d'avoine, carotte râpée, œuf, fromage râpé et herbes.\n2. Formez des galettes à la main.\n3. Poêlez 4 min de chaque côté dans un filet d'huile chaude.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-galettes-avoine-legumes-0",
        "name": "Flocons d'avoine",
        "quantity": 150,
        "unit": "g",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-galettes-avoine-legumes-1",
        "name": "Carotte râpée",
        "quantity": 1,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-galettes-avoine-legumes-2",
        "name": "Œuf",
        "quantity": 1,
        "unit": "piece",
        "category": "produits_frais"
      },
      {
        "id": "ing-galettes-avoine-legumes-3",
        "name": "Emmental râpé",
        "quantity": 50,
        "unit": "g",
        "category": "produits_laitiers"
      }
    ]
  },
  {
    "id": "gaspacho-andalou-frais",
    "title": "Gaspacho Andalou Frais à la Tomate",
    "description": "Soupe froide espagnole de tomates mûres, concombre et poivron mixés à l'huile d'olive.",
    "image_url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 10,
    "cook_time": 15,
    "servings": 4,
    "category": "dejeuner",
    "tags": [
      "rapide",
      "vegetarien",
      "batch_cooking"
    ],
    "source": "website",
    "instructions": "1. Mixez les tomates mûres avec le concombre épluché, le demi-poivron, l'ail et l'huile d'olive.\n2. Assaisonnez de sel, poivre et filet de vinaigre de xérès.\n3. Réservez 2 heures au frais avant de servir bien glacé.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-gaspacho-andalou-frais-0",
        "name": "Tomates mûres",
        "quantity": 6,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-gaspacho-andalou-frais-1",
        "name": "Concombre",
        "quantity": 0.5,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-gaspacho-andalou-frais-2",
        "name": "Poivron rouge",
        "quantity": 0.5,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-gaspacho-andalou-frais-3",
        "name": "Huile d'olive",
        "quantity": 40,
        "unit": "ml",
        "category": "epicerie_salee"
      }
    ]
  },
  {
    "id": "veloute-courgettes-vache-qui-rit",
    "title": "Velouté de Courgettes à la Vache qui rit",
    "description": "Soupe onctueuse et douce, adorée des enfants comme des grands.",
    "image_url": "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 10,
    "cook_time": 15,
    "servings": 4,
    "category": "diner",
    "tags": [
      "rapide",
      "vegetarien",
      "famille"
    ],
    "source": "website",
    "instructions": "1. Coupez les courgettes en rondelles et cuisez 15 min dans du bouillon de légumes.\n2. Ajoutez les portions de fromage fondu.\n3. Mixez finement jusqu'à consistance soyeuse.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-veloute-courgettes-vache-qui-rit-0",
        "name": "Courgettes",
        "quantity": 3,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-veloute-courgettes-vache-qui-rit-1",
        "name": "Portions de fromage fondu",
        "quantity": 4,
        "unit": "piece",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-veloute-courgettes-vache-qui-rit-2",
        "name": "Bouillon de légumes",
        "quantity": 500,
        "unit": "ml",
        "category": "epicerie_salee"
      }
    ]
  },
  {
    "id": "salade-pois-chiches-menthe",
    "title": "Salade de Pois Chiches, Concombre & Menthe",
    "description": "Salade fraîche et rassasiante assaisonnée de jus de citron et d'huile d'olive.",
    "image_url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 8,
    "cook_time": 15,
    "servings": 2,
    "category": "dejeuner",
    "tags": [
      "rapide",
      "vegetarien",
      "etudiant"
    ],
    "source": "website",
    "instructions": "1. Rincez et égouttez les pois chiches.\n2. Mélangez avec les dés de concombre, la menthe ciselée, l'huile d'olive et le citron.\n3. Salez et poivrez.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-salade-pois-chiches-menthe-0",
        "name": "Pois chiches en boîte",
        "quantity": 250,
        "unit": "g",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-salade-pois-chiches-menthe-1",
        "name": "Concombre",
        "quantity": 1,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-salade-pois-chiches-menthe-2",
        "name": "Menthe fraîche",
        "quantity": 0.5,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-salade-pois-chiches-menthe-3",
        "name": "Citron",
        "quantity": 1,
        "unit": "piece",
        "category": "fruits_legumes"
      }
    ]
  },
  {
    "id": "tortilla-espagnole-pommes-terre",
    "title": "Tortilla Espagnole aux Pommes de Terre",
    "description": "Omelette épaisse traditionnelle aux pommes de terre confites et oignons fondants.",
    "image_url": "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 15,
    "cook_time": 15,
    "servings": 4,
    "category": "diner",
    "tags": [
      "etudiant",
      "vegetarien",
      "batch_cooking"
    ],
    "source": "website",
    "instructions": "1. Faites confire doucement les rondelles de pommes de terre et l'oignon dans l'huile d'olive.\n2. Battez les œufs dans un saladier et incorporez les pommes de terre égouttées.\n3. Versez dans la poêle, cuisez 6 min, retournez avec une assiette et cuisez 4 min de plus.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-tortilla-espagnole-pommes-terre-0",
        "name": "Pommes de terre",
        "quantity": 500,
        "unit": "g",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-tortilla-espagnole-pommes-terre-1",
        "name": "Œufs",
        "quantity": 5,
        "unit": "piece",
        "category": "produits_frais"
      },
      {
        "id": "ing-tortilla-espagnole-pommes-terre-2",
        "name": "Oignon",
        "quantity": 1,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-tortilla-espagnole-pommes-terre-3",
        "name": "Huile d'olive",
        "quantity": 4,
        "unit": "cuillere_soupe",
        "category": "epicerie_salee"
      }
    ]
  },
  {
    "id": "shakshuka-verte-epinards",
    "title": "Shakshuka Verte aux Épinards & Ricotta",
    "description": "Œufs pochés sur un lit de pousses d'épinards tombées à l'ail avec cuillères de ricotta fraîche.",
    "image_url": "https://images.unsplash.com/photo-1590412200988-a436970781fa?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 10,
    "cook_time": 10,
    "servings": 2,
    "category": "dejeuner",
    "tags": [
      "rapide",
      "vegetarien"
    ],
    "source": "website",
    "instructions": "1. Faites tomber les épinards avec l'ail dans l'huile d'olive 3 min.\n2. Creusez des nids et cassez-y les œufs.\n3. Déposez des cuillerées de ricotta, couvrez et laissez cuire 5 min jusqu'à blancs pris.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-shakshuka-verte-epinards-0",
        "name": "Pousses d'épinards",
        "quantity": 250,
        "unit": "g",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-shakshuka-verte-epinards-1",
        "name": "Œufs",
        "quantity": 4,
        "unit": "piece",
        "category": "produits_frais"
      },
      {
        "id": "ing-shakshuka-verte-epinards-2",
        "name": "Ricotta",
        "quantity": 80,
        "unit": "g",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-shakshuka-verte-epinards-3",
        "name": "Ail",
        "quantity": 1,
        "unit": "piece",
        "category": "fruits_legumes"
      }
    ]
  },
  {
    "id": "tarte-fine-tomates-moutarde",
    "title": "Tarte Fine aux Tomates & Moutarde à l'Ancienne",
    "description": "Pâte feuilletée croustillante tapissée de moutarde et garnie de rondelles de tomates au thym.",
    "image_url": "https://images.unsplash.com/photo-1547496502-affa22d38842?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 10,
    "cook_time": 25,
    "servings": 4,
    "category": "diner",
    "tags": [
      "vegetarien",
      "rapide",
      "famille"
    ],
    "source": "website",
    "instructions": "1. Étalez la pâte feuilletée et tartinez-la de moutarde à l'ancienne.\n2. Disposez les rondelles de tomates en les chevauchant légèrement.\n3. Arrosez d'huile d'olive, parsemez d'herbes et cuisez 25 min à 200°C.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-tarte-fine-tomates-moutarde-0",
        "name": "Pâte feuilletée",
        "quantity": 1,
        "unit": "piece",
        "category": "produits_frais"
      },
      {
        "id": "ing-tarte-fine-tomates-moutarde-1",
        "name": "Tomates fermes",
        "quantity": 4,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-tarte-fine-tomates-moutarde-2",
        "name": "Moutarde à l'ancienne",
        "quantity": 2,
        "unit": "cuillere_soupe",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-tarte-fine-tomates-moutarde-3",
        "name": "Thym",
        "quantity": 1,
        "unit": "cuillere_the",
        "category": "epicerie_salee"
      }
    ]
  },
  {
    "id": "couscous-express-legumes",
    "title": "Couscous Express aux Légumes & Pois Chiches",
    "description": "Semoule légère, bouillon parfumé aux épices douces, courgettes, carottes et pois chiches.",
    "image_url": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 15,
    "cook_time": 25,
    "servings": 4,
    "category": "diner",
    "tags": [
      "vegetarien",
      "famille",
      "batch_cooking"
    ],
    "source": "website",
    "instructions": "1. Faites revenir oignon et carottes dans l'huile avec les épices à couscous.\n2. Ajoutez courgettes, coulis de tomate, pois chiches et 600ml de bouillon.\n3. Laissez mijoter 20 min. Versez de l'eau bouillante sur la semoule, couvrez 5 min et égrenez au beurre.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-couscous-express-legumes-0",
        "name": "Graine de couscous moyenne",
        "quantity": 250,
        "unit": "g",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-couscous-express-legumes-1",
        "name": "Courgettes",
        "quantity": 2,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-couscous-express-legumes-2",
        "name": "Carottes",
        "quantity": 3,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-couscous-express-legumes-3",
        "name": "Pois chiches en boîte",
        "quantity": 250,
        "unit": "g",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-couscous-express-legumes-4",
        "name": "Épices ras-el-hanout",
        "quantity": 1,
        "unit": "cuillere_soupe",
        "category": "epicerie_salee"
      }
    ]
  },
  {
    "id": "fondant-chocolat-coeur-coulant",
    "title": "Fondant au Chocolat Cœur Coulant",
    "description": "Le gâteau décadent au chocolat noir avec un cœur fondant irrésistible.",
    "image_url": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 10,
    "cook_time": 10,
    "servings": 4,
    "category": "dessert",
    "tags": [
      "dessert",
      "rapide",
      "famille"
    ],
    "source": "website",
    "instructions": "1. Faites fondre chocolat et beurre au bain-marie.\n2. Fouettez les œufs avec le sucre, ajoutez le chocolat fondu puis la farine tamisée.\n3. Versez dans 4 ramequins beurrés et enfournez 10 min pile à 200°C.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-fondant-chocolat-coeur-coulant-0",
        "name": "Chocolat noir",
        "quantity": 150,
        "unit": "g",
        "category": "epicerie_sucree"
      },
      {
        "id": "ing-fondant-chocolat-coeur-coulant-1",
        "name": "Beurre",
        "quantity": 100,
        "unit": "g",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-fondant-chocolat-coeur-coulant-2",
        "name": "Œufs",
        "quantity": 3,
        "unit": "piece",
        "category": "produits_frais"
      },
      {
        "id": "ing-fondant-chocolat-coeur-coulant-3",
        "name": "Sucre",
        "quantity": 60,
        "unit": "g",
        "category": "epicerie_sucree"
      },
      {
        "id": "ing-fondant-chocolat-coeur-coulant-4",
        "name": "Farine",
        "quantity": 40,
        "unit": "g",
        "category": "epicerie_sucree"
      }
    ]
  },
  {
    "id": "crepes-sucrees-moelleuses",
    "title": "Crêpes Moelleuses & Légères",
    "description": "La pâte à crêpes inratable, fine et dorée pour le goûter ou la Chandeleur.",
    "image_url": "https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 10,
    "cook_time": 15,
    "servings": 6,
    "category": "dessert",
    "tags": [
      "dessert",
      "famille",
      "etudiant"
    ],
    "source": "website",
    "instructions": "1. Mettez la farine dans un saladier, creusez un puits et ajoutez les œufs.\n2. Fouettez en versant progressivement le lait pour éviter les grumeaux.\n3. Ajoutez le beurre fondu et le sucre vanillé.\n4. Cuisez dans une poêle beurrée bien chaude 1 min par face.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-crepes-sucrees-moelleuses-0",
        "name": "Farine",
        "quantity": 250,
        "unit": "g",
        "category": "epicerie_sucree"
      },
      {
        "id": "ing-crepes-sucrees-moelleuses-1",
        "name": "Lait",
        "quantity": 500,
        "unit": "ml",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-crepes-sucrees-moelleuses-2",
        "name": "Œufs",
        "quantity": 4,
        "unit": "piece",
        "category": "produits_frais"
      },
      {
        "id": "ing-crepes-sucrees-moelleuses-3",
        "name": "Beurre fondu",
        "quantity": 40,
        "unit": "g",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-crepes-sucrees-moelleuses-4",
        "name": "Sucre vanillé",
        "quantity": 1,
        "unit": "piece",
        "category": "epicerie_sucree"
      }
    ]
  },
  {
    "id": "pancakes-fluffy-dimanche",
    "title": "Pancakes Moelleux & Fluffy du Dimanche",
    "description": "Épais, gonflés et légers comme des nuages, à arroser de sirop d'érable.",
    "image_url": "https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 10,
    "cook_time": 10,
    "servings": 4,
    "category": "petit_dejeuner",
    "tags": [
      "petit_dejeuner",
      "rapide",
      "famille"
    ],
    "source": "website",
    "instructions": "1. Mélangez farine, levure, sucre et une pincée de sel.\n2. Incorporez le lait, les jaunes d'œufs et le beurre fondu.\n3. Montez les blancs en neige et incorporez-les délicatement.\n4. Cuisez des louches de pâte dans une poêle beurrée 2 min par face.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-pancakes-fluffy-dimanche-0",
        "name": "Farine",
        "quantity": 200,
        "unit": "g",
        "category": "epicerie_sucree"
      },
      {
        "id": "ing-pancakes-fluffy-dimanche-1",
        "name": "Lait",
        "quantity": 250,
        "unit": "ml",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-pancakes-fluffy-dimanche-2",
        "name": "Œufs",
        "quantity": 2,
        "unit": "piece",
        "category": "produits_frais"
      },
      {
        "id": "ing-pancakes-fluffy-dimanche-3",
        "name": "Levure chimique",
        "quantity": 1,
        "unit": "piece",
        "category": "epicerie_sucree"
      },
      {
        "id": "ing-pancakes-fluffy-dimanche-4",
        "name": "Beurre fondu",
        "quantity": 30,
        "unit": "g",
        "category": "produits_laitiers"
      }
    ]
  },
  {
    "id": "crumble-pommes-cannelle",
    "title": "Crumble Rustique Pommes & Cannelle",
    "description": "Pommes compotées fondantes sous une pâte sablée croustillante au beurre.",
    "image_url": "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 15,
    "cook_time": 30,
    "servings": 4,
    "category": "dessert",
    "tags": [
      "dessert",
      "rapide",
      "famille"
    ],
    "source": "website",
    "instructions": "1. Épluchez et coupez les pommes en dés, disposez-les dans un plat beurré avec la cannelle.\n2. Du bout des doigts, sablez la farine, le sucre roux et le beurre froid en dés.\n3. Répartissez la pâte sur les pommes et cuisez 30 min à 180°C.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-crumble-pommes-cannelle-0",
        "name": "Pommes",
        "quantity": 4,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-crumble-pommes-cannelle-1",
        "name": "Farine",
        "quantity": 120,
        "unit": "g",
        "category": "epicerie_sucree"
      },
      {
        "id": "ing-crumble-pommes-cannelle-2",
        "name": "Beurre froid",
        "quantity": 80,
        "unit": "g",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-crumble-pommes-cannelle-3",
        "name": "Sucre roux",
        "quantity": 80,
        "unit": "g",
        "category": "epicerie_sucree"
      },
      {
        "id": "ing-crumble-pommes-cannelle-4",
        "name": "Cannelle",
        "quantity": 1,
        "unit": "cuillere_the",
        "category": "epicerie_sucree"
      }
    ]
  },
  {
    "id": "banana-bread-chocolat",
    "title": "Banana Bread Moelleux aux Pépites de Chocolat",
    "description": "La meilleure recette pour utiliser les bananes mûres : gâteau ultra moelleux et pépites fondantes.",
    "image_url": "https://images.unsplash.com/photo-1586040140372-0420463c0b05?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 15,
    "cook_time": 45,
    "servings": 8,
    "category": "dessert",
    "tags": [
      "dessert",
      "batch_cooking",
      "famille"
    ],
    "source": "website",
    "instructions": "1. Écrasez 3 bananes mûres à la fourchette.\n2. Ajoutez le beurre fondu, le sucre et les œufs battus.\n3. Incorporez la farine, la levure et les pépites de chocolat.\n4. Versez dans un moule à cake et enfournez 45 min à 180°C.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-banana-bread-chocolat-0",
        "name": "Bananes mûres",
        "quantity": 3,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-banana-bread-chocolat-1",
        "name": "Farine",
        "quantity": 200,
        "unit": "g",
        "category": "epicerie_sucree"
      },
      {
        "id": "ing-banana-bread-chocolat-2",
        "name": "Beurre fondu",
        "quantity": 80,
        "unit": "g",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-banana-bread-chocolat-3",
        "name": "Pépites de chocolat",
        "quantity": 100,
        "unit": "g",
        "category": "epicerie_sucree"
      },
      {
        "id": "ing-banana-bread-chocolat-4",
        "name": "Œufs",
        "quantity": 2,
        "unit": "piece",
        "category": "produits_frais"
      }
    ]
  },
  {
    "id": "mousse-chocolat-aerienne",
    "title": "Mousse au Chocolat Noire Aérienne",
    "description": "Seulement du vrai chocolat noir et des blancs montés en neige ferme pour une texture mousseuse.",
    "image_url": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 15,
    "cook_time": 15,
    "servings": 4,
    "category": "dessert",
    "tags": [
      "dessert",
      "famille"
    ],
    "source": "website",
    "instructions": "1. Faites fondre le chocolat avec une noisette de beurre au bain-marie.\n2. Séparez les blancs des jaunes d'œufs. Incorporez les jaunes dans le chocolat tiédi.\n3. Montez les blancs en neige très ferme avec une pincée de sel.\n4. Incorporez délicatement à la spatule et réservez 4 heures au frais.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-mousse-chocolat-aerienne-0",
        "name": "Chocolat noir à pâtisser",
        "quantity": 200,
        "unit": "g",
        "category": "epicerie_sucree"
      },
      {
        "id": "ing-mousse-chocolat-aerienne-1",
        "name": "Œufs",
        "quantity": 6,
        "unit": "piece",
        "category": "produits_frais"
      },
      {
        "id": "ing-mousse-chocolat-aerienne-2",
        "name": "Beurre",
        "quantity": 20,
        "unit": "g",
        "category": "produits_laitiers"
      }
    ]
  },
  {
    "id": "tiramisu-traditionnel-italien",
    "title": "Tiramisu Italien Traditionnel au Café",
    "description": "Biscuits cuillère imbibés d'expresso corsé sous une crème au mascarpone aérienne et cacao amer.",
    "image_url": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 20,
    "cook_time": 15,
    "servings": 6,
    "category": "dessert",
    "tags": [
      "dessert",
      "famille",
      "batch_cooking"
    ],
    "source": "website",
    "instructions": "1. Fouettez les jaunes d'œufs avec le sucre jusqu'à blanchiment, puis incorporez le mascarpone.\n2. Montez les blancs en neige et incorporez-les délicatement.\n3. Trempez rapidement les biscuits dans le café refroidi et tapissez le fond d'un plat.\n4. Recouvrez de crème, répétez l'opération et réservez au frais 6h avant de saupoudrer de cacao.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-tiramisu-traditionnel-italien-0",
        "name": "Mascarpone",
        "quantity": 250,
        "unit": "g",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-tiramisu-traditionnel-italien-1",
        "name": "Biscuits cuillère",
        "quantity": 24,
        "unit": "piece",
        "category": "epicerie_sucree"
      },
      {
        "id": "ing-tiramisu-traditionnel-italien-2",
        "name": "Café expresso fort",
        "quantity": 200,
        "unit": "ml",
        "category": "boissons"
      },
      {
        "id": "ing-tiramisu-traditionnel-italien-3",
        "name": "Œufs",
        "quantity": 3,
        "unit": "piece",
        "category": "produits_frais"
      },
      {
        "id": "ing-tiramisu-traditionnel-italien-4",
        "name": "Sucre",
        "quantity": 80,
        "unit": "g",
        "category": "epicerie_sucree"
      }
    ]
  },
  {
    "id": "clafoutis-moelleux-cerises",
    "title": "Clafoutis Moelleux aux Cerises",
    "description": "Le flan aux cerises traditionnel, doré au four et fondant en bouche.",
    "image_url": "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 15,
    "cook_time": 35,
    "servings": 6,
    "category": "dessert",
    "tags": [
      "dessert",
      "famille"
    ],
    "source": "website",
    "instructions": "1. Préchauffez le four à 180°C et beurrez un plat à gratin.\n2. Battez les œufs avec le sucre, ajoutez farine, lait, beurre fondu et extrait de vanille.\n3. Déposez les cerises au fond du plat, versez la pâte et cuisez 35 min jusqu'à belle dorure.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-clafoutis-moelleux-cerises-0",
        "name": "Cerises fraîches",
        "quantity": 500,
        "unit": "g",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-clafoutis-moelleux-cerises-1",
        "name": "Farine",
        "quantity": 100,
        "unit": "g",
        "category": "epicerie_sucree"
      },
      {
        "id": "ing-clafoutis-moelleux-cerises-2",
        "name": "Lait",
        "quantity": 300,
        "unit": "ml",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-clafoutis-moelleux-cerises-3",
        "name": "Œufs",
        "quantity": 4,
        "unit": "piece",
        "category": "produits_frais"
      },
      {
        "id": "ing-clafoutis-moelleux-cerises-4",
        "name": "Sucre",
        "quantity": 80,
        "unit": "g",
        "category": "epicerie_sucree"
      }
    ]
  },
  {
    "id": "muffins-moelleux-myrtilles",
    "title": "Muffins Moelleux aux Myrtilles Fraîches",
    "description": "Petits gâteaux individuels très gonflés, dorés et débordants de baies juteuses.",
    "image_url": "https://images.unsplash.com/photo-1586040140372-0420463c0b05?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 15,
    "cook_time": 20,
    "servings": 6,
    "category": "dessert",
    "tags": [
      "dessert",
      "encas",
      "famille"
    ],
    "source": "website",
    "instructions": "1. Mélangez farine, levure et sucre dans un bol.\n2. Dans un autre, fouettez lait, œuf et beurre fondu.\n3. Réunissez les deux préparations sans trop travailler la pâte, incorporez délicatement les myrtilles.\n4. Remplissez des moules à muffins et cuisez 20 min à 190°C.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-muffins-moelleux-myrtilles-0",
        "name": "Myrtilles fraîches",
        "quantity": 150,
        "unit": "g",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-muffins-moelleux-myrtilles-1",
        "name": "Farine",
        "quantity": 200,
        "unit": "g",
        "category": "epicerie_sucree"
      },
      {
        "id": "ing-muffins-moelleux-myrtilles-2",
        "name": "Beurre fondu",
        "quantity": 70,
        "unit": "g",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-muffins-moelleux-myrtilles-3",
        "name": "Lait",
        "quantity": 120,
        "unit": "ml",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-muffins-moelleux-myrtilles-4",
        "name": "Sucre",
        "quantity": 80,
        "unit": "g",
        "category": "epicerie_sucree"
      }
    ]
  },
  {
    "id": "pain-perdu-cannelle",
    "title": "Pain Perdu Moelleux à la Cannelle",
    "description": "Tranches de brioche ou pain rassis trempées dans un bain de lait vanillé et dorées au beurre moussant.",
    "image_url": "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 5,
    "cook_time": 6,
    "servings": 2,
    "category": "petit_dejeuner",
    "tags": [
      "dessert",
      "rapide",
      "etudiant"
    ],
    "source": "website",
    "instructions": "1. Fouettez œuf, lait, sucre et cannelle dans une assiette creuse.\n2. Imbibez généreusement les tranches de pain des deux côtés.\n3. Faites dorer dans une poêle avec du beurre moussant 3 min par face jusqu'à coloration dorée.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-pain-perdu-cannelle-0",
        "name": "Tranches de brioche ou pain rassis",
        "quantity": 4,
        "unit": "piece",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-pain-perdu-cannelle-1",
        "name": "Lait",
        "quantity": 150,
        "unit": "ml",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-pain-perdu-cannelle-2",
        "name": "Œuf",
        "quantity": 1,
        "unit": "piece",
        "category": "produits_frais"
      },
      {
        "id": "ing-pain-perdu-cannelle-3",
        "name": "Beurre",
        "quantity": 20,
        "unit": "g",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-pain-perdu-cannelle-4",
        "name": "Sucre roux",
        "quantity": 2,
        "unit": "cuillere_soupe",
        "category": "epicerie_sucree"
      }
    ]
  },
  {
    "id": "flan-patissier-vanille",
    "title": "Flan Pâtissier Traditionnel à la Vanille",
    "description": "Flan épais et crémeux infusé à la gousse de vanille sur une pâte brisée croustillante.",
    "image_url": "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 15,
    "cook_time": 40,
    "servings": 8,
    "category": "dessert",
    "tags": [
      "dessert",
      "famille"
    ],
    "source": "website",
    "instructions": "1. Chauffez le lait avec la vanille.\n2. Fouettez les œufs, le sucre et la fécule de maïs (Maïzena).\n3. Versez le lait chaud en remuant et épaississez à feu doux.\n4. Versez sur la pâte dans un moule à bords hauts et cuisez 40 min à 180°C.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-flan-patissier-vanille-0",
        "name": "Pâte brisée",
        "quantity": 1,
        "unit": "piece",
        "category": "produits_frais"
      },
      {
        "id": "ing-flan-patissier-vanille-1",
        "name": "Lait entier",
        "quantity": 800,
        "unit": "ml",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-flan-patissier-vanille-2",
        "name": "Œufs",
        "quantity": 4,
        "unit": "piece",
        "category": "produits_frais"
      },
      {
        "id": "ing-flan-patissier-vanille-3",
        "name": "Fécule de maïs",
        "quantity": 80,
        "unit": "g",
        "category": "epicerie_sucree"
      },
      {
        "id": "ing-flan-patissier-vanille-4",
        "name": "Sucre",
        "quantity": 120,
        "unit": "g",
        "category": "epicerie_sucree"
      }
    ]
  },
  {
    "id": "madeleines-zeste-citron",
    "title": "Madeleines Pur Beurre au Zeste de Citron",
    "description": "Madeleines dorées avec la fameuse bosse bombée et un parfum délicat d'agrumes.",
    "image_url": "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 15,
    "cook_time": 10,
    "servings": 6,
    "category": "dessert",
    "tags": [
      "dessert",
      "encas"
    ],
    "source": "website",
    "instructions": "1. Battez œufs et sucre jusqu'à ce que le mélange blanchisse.\n2. Incorporez la farine tamisée, la levure, le zeste de citron et le beurre fondu tiède.\n3. Laissez reposer la pâte 1h au frais (choc thermique essentiel pour la bosse !).\n4. Remplissez les alvéoles et cuisez 10 min à 200°C.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-madeleines-zeste-citron-0",
        "name": "Farine",
        "quantity": 150,
        "unit": "g",
        "category": "epicerie_sucree"
      },
      {
        "id": "ing-madeleines-zeste-citron-1",
        "name": "Beurre fondu",
        "quantity": 125,
        "unit": "g",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-madeleines-zeste-citron-2",
        "name": "Sucre",
        "quantity": 120,
        "unit": "g",
        "category": "epicerie_sucree"
      },
      {
        "id": "ing-madeleines-zeste-citron-3",
        "name": "Œufs",
        "quantity": 3,
        "unit": "piece",
        "category": "produits_frais"
      },
      {
        "id": "ing-madeleines-zeste-citron-4",
        "name": "Zeste de citron bio",
        "quantity": 1,
        "unit": "piece",
        "category": "fruits_legumes"
      }
    ]
  },
  {
    "id": "cookies-pepites-chocolat",
    "title": "Cookies Moelleux aux Pépites de Chocolat",
    "description": "Croustillants sur les bords et bien fondants au centre avec généreuses pépites de chocolat noir.",
    "image_url": "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 15,
    "cook_time": 10,
    "servings": 6,
    "category": "dessert",
    "tags": [
      "dessert",
      "rapide",
      "famille"
    ],
    "source": "website",
    "instructions": "1. Battez le beurre pommade avec les sucres (blanc et roux).\n2. Ajoutez l'œuf, puis la farine et la levure.\n3. Incorporez les pépites de chocolat et formez des boules de pâte espacées sur une plaque.\n4. Cuisez 10 min à 180°C et laissez tiédir.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-cookies-pepites-chocolat-0",
        "name": "Farine",
        "quantity": 180,
        "unit": "g",
        "category": "epicerie_sucree"
      },
      {
        "id": "ing-cookies-pepites-chocolat-1",
        "name": "Beurre doux pommade",
        "quantity": 100,
        "unit": "g",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-cookies-pepites-chocolat-2",
        "name": "Pépites de chocolat noir",
        "quantity": 120,
        "unit": "g",
        "category": "epicerie_sucree"
      },
      {
        "id": "ing-cookies-pepites-chocolat-3",
        "name": "Sucre roux",
        "quantity": 80,
        "unit": "g",
        "category": "epicerie_sucree"
      },
      {
        "id": "ing-cookies-pepites-chocolat-4",
        "name": "Œuf",
        "quantity": 1,
        "unit": "piece",
        "category": "produits_frais"
      }
    ]
  },
  {
    "id": "granola-maison-noix-miel",
    "title": "Granola Maison Croustillant aux Noix & Miel",
    "description": "Flocons d'avoine, amandes et graines dorés au four au miel et huile de coco.",
    "image_url": "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 10,
    "cook_time": 25,
    "servings": 8,
    "category": "petit_dejeuner",
    "tags": [
      "petit_dejeuner",
      "batch_cooking"
    ],
    "source": "website",
    "instructions": "1. Mélangez flocons d'avoine, noix concassées et graines dans un saladier.\n2. Chauffez légèrement miel et huile de coco, versez sur les céréales et enrobez bien.\n3. Étalez sur une plaque et cuisez 25 min à 150°C en remuant à mi-cuisson jusqu'à croustillant.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-granola-maison-noix-miel-0",
        "name": "Flocons d'avoine",
        "quantity": 300,
        "unit": "g",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-granola-maison-noix-miel-1",
        "name": "Noix ou amandes",
        "quantity": 100,
        "unit": "g",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-granola-maison-noix-miel-2",
        "name": "Miel",
        "quantity": 80,
        "unit": "g",
        "category": "epicerie_sucree"
      },
      {
        "id": "ing-granola-maison-noix-miel-3",
        "name": "Huile de coco",
        "quantity": 40,
        "unit": "ml",
        "category": "epicerie_salee"
      }
    ]
  },
  {
    "id": "smoothie-bowl-fruits-rouges",
    "title": "Smoothie Bowl Énergétique Banane & Fruits Rouges",
    "description": "Fruits mixés bien épais et frais garnis de rondelles de banane, graines de chia et granola.",
    "image_url": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 5,
    "cook_time": 15,
    "servings": 1,
    "category": "petit_dejeuner",
    "tags": [
      "petit_dejeuner",
      "rapide"
    ],
    "source": "website",
    "instructions": "1. Mixez les fruits rouges surgelés avec la banane et un filet de lait végétal jusqu'à consistance de crème glacée.\n2. Versez dans un bol et décorez avec du granola croustillant et des graines.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-smoothie-bowl-fruits-rouges-0",
        "name": "Fruits rouges surgelés",
        "quantity": 150,
        "unit": "g",
        "category": "produits_surgeles"
      },
      {
        "id": "ing-smoothie-bowl-fruits-rouges-1",
        "name": "Banane",
        "quantity": 1,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-smoothie-bowl-fruits-rouges-2",
        "name": "Lait d'amande",
        "quantity": 60,
        "unit": "ml",
        "category": "boissons"
      },
      {
        "id": "ing-smoothie-bowl-fruits-rouges-3",
        "name": "Granola",
        "quantity": 30,
        "unit": "g",
        "category": "epicerie_sucree"
      }
    ]
  },
  {
    "id": "gaufres-legeres-croustillantes",
    "title": "Gaufres Légères & Croustillantes Maison",
    "description": "Gaufres dorées au fer, croustillantes à l'extérieur et moelleuses au centre.",
    "image_url": "https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 15,
    "cook_time": 15,
    "servings": 6,
    "category": "dessert",
    "tags": [
      "dessert",
      "famille"
    ],
    "source": "website",
    "instructions": "1. Mélangez farine, sucre, jaunes d'œufs, lait et beurre fondu.\n2. Montez les blancs en neige ferme et incorporez délicatement à la pâte.\n3. Cuisez dans le gaufrier préchauffé et huilé 3 à 4 min par fournée.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-gaufres-legeres-croustillantes-0",
        "name": "Farine",
        "quantity": 250,
        "unit": "g",
        "category": "epicerie_sucree"
      },
      {
        "id": "ing-gaufres-legeres-croustillantes-1",
        "name": "Lait",
        "quantity": 350,
        "unit": "ml",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-gaufres-legeres-croustillantes-2",
        "name": "Beurre fondu",
        "quantity": 75,
        "unit": "g",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-gaufres-legeres-croustillantes-3",
        "name": "Œufs",
        "quantity": 3,
        "unit": "piece",
        "category": "produits_frais"
      },
      {
        "id": "ing-gaufres-legeres-croustillantes-4",
        "name": "Sucre",
        "quantity": 50,
        "unit": "g",
        "category": "epicerie_sucree"
      }
    ]
  },
  {
    "id": "brownie-fondant-noix-pecan",
    "title": "Brownie Américain Fondant aux Noix de Pécan",
    "description": "Carrés de chocolat ultra fondants avec le croquant torréfié des noix de pécan.",
    "image_url": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 15,
    "cook_time": 22,
    "servings": 8,
    "category": "dessert",
    "tags": [
      "dessert",
      "famille"
    ],
    "source": "website",
    "instructions": "1. Faites fondre chocolat et beurre.\n2. Fouettez les œufs avec le sucre, ajoutez le chocolat fondu puis la farine et les noix de pécan.\n3. Versez dans un moule carré et cuisez 22 min à 170°C. Laissez refroidir avant de découper.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-brownie-fondant-noix-pecan-0",
        "name": "Chocolat noir",
        "quantity": 200,
        "unit": "g",
        "category": "epicerie_sucree"
      },
      {
        "id": "ing-brownie-fondant-noix-pecan-1",
        "name": "Beurre",
        "quantity": 120,
        "unit": "g",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-brownie-fondant-noix-pecan-2",
        "name": "Œufs",
        "quantity": 3,
        "unit": "piece",
        "category": "produits_frais"
      },
      {
        "id": "ing-brownie-fondant-noix-pecan-3",
        "name": "Farine",
        "quantity": 70,
        "unit": "g",
        "category": "epicerie_sucree"
      },
      {
        "id": "ing-brownie-fondant-noix-pecan-4",
        "name": "Noix de pécan",
        "quantity": 80,
        "unit": "g",
        "category": "epicerie_salee"
      }
    ]
  },
  {
    "id": "riz-au-lait-vanille",
    "title": "Riz au Lait Crémeux à la Vanille Bourbon",
    "description": "Riz rond cuit doucement dans le lait entier sucré et parfumé à la gousse de vanille.",
    "image_url": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 10,
    "cook_time": 35,
    "servings": 4,
    "category": "dessert",
    "tags": [
      "dessert",
      "famille",
      "batch_cooking"
    ],
    "source": "website",
    "instructions": "1. Blanchissez le riz rond 2 min dans l'eau bouillante puis égouttez.\n2. Faites chauffer le lait avec le sucre et la gousse de vanille fendue.\n3. Ajoutez le riz et laissez cuire à feu très doux 35 min en remuant souvent. Laissez tiédir.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-riz-au-lait-vanille-0",
        "name": "Riz rond pour dessert",
        "quantity": 150,
        "unit": "g",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-riz-au-lait-vanille-1",
        "name": "Lait entier",
        "quantity": 800,
        "unit": "ml",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-riz-au-lait-vanille-2",
        "name": "Sucre",
        "quantity": 70,
        "unit": "g",
        "category": "epicerie_sucree"
      },
      {
        "id": "ing-riz-au-lait-vanille-3",
        "name": "Gousse de vanille",
        "quantity": 1,
        "unit": "piece",
        "category": "epicerie_sucree"
      }
    ]
  },
  {
    "id": "sables-bretons-pur-beurre",
    "title": "Sablés Bretons Pur Beurre Dorés",
    "description": "Biscuits friables et fondants au bon goût de beurre demi-sel breton.",
    "image_url": "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 15,
    "cook_time": 15,
    "servings": 6,
    "category": "dessert",
    "tags": [
      "dessert",
      "encas"
    ],
    "source": "website",
    "instructions": "1. Fouettez les jaunes avec le sucre. Ajoutez le beurre demi-sel pommade.\n2. Incorporez farine et levure pour former une pâte homogène.\n3. Étalez sur 5mm, découpez des ronds et cuisez dans des cercles 15 min à 170°C.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-sables-bretons-pur-beurre-0",
        "name": "Farine",
        "quantity": 150,
        "unit": "g",
        "category": "epicerie_sucree"
      },
      {
        "id": "ing-sables-bretons-pur-beurre-1",
        "name": "Beurre demi-sel",
        "quantity": 100,
        "unit": "g",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-sables-bretons-pur-beurre-2",
        "name": "Jaunes d'œufs",
        "quantity": 2,
        "unit": "piece",
        "category": "produits_frais"
      },
      {
        "id": "ing-sables-bretons-pur-beurre-3",
        "name": "Sucre",
        "quantity": 80,
        "unit": "g",
        "category": "epicerie_sucree"
      }
    ]
  },
  {
    "id": "compote-pommes-poires-vanille",
    "title": "Compote Maison Pommes Poires Vanillée",
    "description": "Fruits mijotés doucement sans sucre ajouté avec une gousse de vanille.",
    "image_url": "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 15,
    "cook_time": 20,
    "servings": 4,
    "category": "dessert",
    "tags": [
      "dessert",
      "batch_cooking",
      "famille"
    ],
    "source": "website",
    "instructions": "1. Épluchez et coupez pommes et poires en morceaux.\n2. Mettez dans une casserole avec 2 cuillères d'eau et la gousse de vanille fendue.\n3. Couvrez et cuisez à feu doux 20 min. Écrasez à la fourchette ou mixez selon préférence.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-compote-pommes-poires-vanille-0",
        "name": "Pommes",
        "quantity": 3,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-compote-pommes-poires-vanille-1",
        "name": "Poires",
        "quantity": 3,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-compote-pommes-poires-vanille-2",
        "name": "Gousse de vanille",
        "quantity": 1,
        "unit": "piece",
        "category": "epicerie_sucree"
      }
    ]
  },
  {
    "id": "poke-bowl-saumon-avocat",
    "title": "Poké Bowl Frais Saumon, Avocat & Edamames",
    "description": "Riz vinaigré, dés de saumon mariné soja-sésame, avocat crémeux et edamames.",
    "image_url": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 15,
    "cook_time": 10,
    "servings": 2,
    "category": "dejeuner",
    "tags": [
      "rapide"
    ],
    "source": "website",
    "instructions": "1. Cuisez le riz rond et assaisonnez d'un filet de vinaigre de riz.\n2. Coupez le saumon en dés et marinez 10 min dans sauce soja et huile de sésame.\n3. Disposez le riz dans des bols et garnissez de saumon, avocat, concombre et edamames.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-poke-bowl-saumon-avocat-0",
        "name": "Pavé de saumon frais",
        "quantity": 250,
        "unit": "g",
        "category": "poissonnerie"
      },
      {
        "id": "ing-poke-bowl-saumon-avocat-1",
        "name": "Riz rond japonais",
        "quantity": 180,
        "unit": "g",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-poke-bowl-saumon-avocat-2",
        "name": "Avocat",
        "quantity": 1,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-poke-bowl-saumon-avocat-3",
        "name": "Sauce soja",
        "quantity": 2,
        "unit": "cuillere_soupe",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-poke-bowl-saumon-avocat-4",
        "name": "Huile de sésame",
        "quantity": 1,
        "unit": "cuillere_soupe",
        "category": "epicerie_salee"
      }
    ]
  },
  {
    "id": "cabillaud-papillote-legumes",
    "title": "Filet de Cabillaud en Papillote aux Tomates Cerises",
    "description": "Poisson blanc moelleux cuit dans sa vapeur avec tomates cerises, courgettes et huile d'olive.",
    "image_url": "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 10,
    "cook_time": 15,
    "servings": 2,
    "category": "diner",
    "tags": [
      "rapide",
      "famille"
    ],
    "source": "website",
    "instructions": "1. Déposez chaque filet de cabillaud sur une feuille de papier cuisson.\n2. Ajoutez rondelles de courgettes fines, tomates cerises coupées en deux et herbes.\n3. Arrosez d'huile d'olive et de citron, fermez hermétiquement et cuisez 15 min à 190°C.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-cabillaud-papillote-legumes-0",
        "name": "Dos de cabillaud",
        "quantity": 2,
        "unit": "piece",
        "category": "poissonnerie"
      },
      {
        "id": "ing-cabillaud-papillote-legumes-1",
        "name": "Tomates cerises",
        "quantity": 150,
        "unit": "g",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-cabillaud-papillote-legumes-2",
        "name": "Courgette",
        "quantity": 0.5,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-cabillaud-papillote-legumes-3",
        "name": "Huile d'olive",
        "quantity": 2,
        "unit": "cuillere_soupe",
        "category": "epicerie_salee"
      }
    ]
  },
  {
    "id": "pates-saumon-creme-aneth",
    "title": "Tagliatelles au Saumon Frais & Crème d'Aneth",
    "description": "Tagliatelles fraîches enrobées d'une sauce crémeuse au saumon et jus de citron.",
    "image_url": "https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 10,
    "cook_time": 10,
    "servings": 2,
    "category": "dejeuner",
    "tags": [
      "rapide",
      "famille"
    ],
    "source": "website",
    "instructions": "1. Cuisez les tagliatelles fraîches 3 à 4 min.\n2. Poêlez le saumon coupé en dés 3 min avec une noisette de beurre.\n3. Versez la crème liquide, l'aneth et un trait de citron, portez à frémissement 2 min et mélangez aux pâtes.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-pates-saumon-creme-aneth-0",
        "name": "Tagliatelles fraîches",
        "quantity": 250,
        "unit": "g",
        "category": "produits_frais"
      },
      {
        "id": "ing-pates-saumon-creme-aneth-1",
        "name": "Pavé de saumon frais",
        "quantity": 200,
        "unit": "g",
        "category": "poissonnerie"
      },
      {
        "id": "ing-pates-saumon-creme-aneth-2",
        "name": "Crème liquide",
        "quantity": 150,
        "unit": "ml",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-pates-saumon-creme-aneth-3",
        "name": "Aneth",
        "quantity": 1,
        "unit": "cuillere_soupe",
        "category": "fruits_legumes"
      }
    ]
  },
  {
    "id": "wok-crevettes-ail-soja",
    "title": "Wok de Crevettes Sautées à l'Ail & Gingembre",
    "description": "Crevettes sautées à feu très vif avec ail émincé, gingembre et légumes croquants.",
    "image_url": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 10,
    "cook_time": 8,
    "servings": 2,
    "category": "dejeuner",
    "tags": [
      "rapide",
      "famille"
    ],
    "source": "website",
    "instructions": "1. Chauffez le wok avec de l'huile neutre.\n2. Saisissez les crevettes décortiquées 2 min avec l'ail et le gingembre râpé.\n3. Ajoutez les légumes émincés, la sauce soja et faites sauter 4 min à feu vif.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-wok-crevettes-ail-soja-0",
        "name": "Crevettes roses décortiquées",
        "quantity": 300,
        "unit": "g",
        "category": "poissonnerie"
      },
      {
        "id": "ing-wok-crevettes-ail-soja-1",
        "name": "Gousses d'ail",
        "quantity": 2,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-wok-crevettes-ail-soja-2",
        "name": "Gingembre frais râpé",
        "quantity": 1,
        "unit": "cuillere_the",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-wok-crevettes-ail-soja-3",
        "name": "Sauce soja",
        "quantity": 2,
        "unit": "cuillere_soupe",
        "category": "epicerie_salee"
      }
    ]
  },
  {
    "id": "brandade-morue-maison",
    "title": "Brandade Parmentière de Morue Gratinée",
    "description": "Émulsion fondante de cabillaud à l'huile d'olive et ail sous une purée de pommes de terre dorée.",
    "image_url": "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 20,
    "cook_time": 25,
    "servings": 4,
    "category": "diner",
    "tags": [
      "famille",
      "batch_cooking"
    ],
    "source": "website",
    "instructions": "1. Pochez le poisson 8 min à l'eau frémissante et écrasez-le à la fourchette avec ail et huile d'olive.\n2. Préparez une purée de pommes de terre onctueuse.\n3. Mélangez purée et poisson effiloché, versez dans un plat et gratinez 20 min à 200°C.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-brandade-morue-maison-0",
        "name": "Cabillaud ou morue dessalée",
        "quantity": 400,
        "unit": "g",
        "category": "poissonnerie"
      },
      {
        "id": "ing-brandade-morue-maison-1",
        "name": "Pommes de terre",
        "quantity": 600,
        "unit": "g",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-brandade-morue-maison-2",
        "name": "Lait",
        "quantity": 100,
        "unit": "ml",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-brandade-morue-maison-3",
        "name": "Huile d'olive",
        "quantity": 50,
        "unit": "ml",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-brandade-morue-maison-4",
        "name": "Gousse d'ail",
        "quantity": 2,
        "unit": "piece",
        "category": "fruits_legumes"
      }
    ]
  },
  {
    "id": "flammekueche-alsacienne",
    "title": "Flammekueche Alsacienne Traditionnelle",
    "description": "Tarte flambée très fine garnie de crème épaisse, oignons fondants et lardons fumés.",
    "image_url": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 15,
    "cook_time": 10,
    "servings": 4,
    "category": "diner",
    "tags": [
      "famille",
      "rapide"
    ],
    "source": "website",
    "instructions": "1. Étalez la pâte très finement sur une plaque de cuisson.\n2. Mélangez crème fraîche et fromage blanc avec muscade, sel et poivre, étalez sur la pâte.\n3. Parsemez d'oignons émincés très fins et de lardons.\n4. Cuisez à four très chaud (240°C) 10 à 12 min jusqu'à bords bien croustillants.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-flammekueche-alsacienne-0",
        "name": "Pâte à flammekueche ou pizza très fine",
        "quantity": 1,
        "unit": "piece",
        "category": "produits_frais"
      },
      {
        "id": "ing-flammekueche-alsacienne-1",
        "name": "Crème fraîche épaisse",
        "quantity": 100,
        "unit": "g",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-flammekueche-alsacienne-2",
        "name": "Fromage blanc",
        "quantity": 100,
        "unit": "g",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-flammekueche-alsacienne-3",
        "name": "Lardons fumés",
        "quantity": 150,
        "unit": "g",
        "category": "boucherie"
      },
      {
        "id": "ing-flammekueche-alsacienne-4",
        "name": "Oignons",
        "quantity": 2,
        "unit": "piece",
        "category": "fruits_legumes"
      }
    ]
  },
  {
    "id": "mac-and-cheese-cheddar",
    "title": "Gratin de Macaronis au Cheddar (Mac & Cheese)",
    "description": "Macaronis enrobés d'une sauce fromage ultra crémeuse et gratinés à la chapelure dorée.",
    "image_url": "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 10,
    "cook_time": 20,
    "servings": 4,
    "category": "diner",
    "tags": [
      "famille"
    ],
    "source": "website",
    "instructions": "1. Cuisez les macaronis al dente.\n2. Réalisez une béchamel légère et faites-y fondre le cheddar râpé hors du feu.\n3. Mélangez les macaronis à la sauce fromage, versez dans un plat et gratinez 15 min au four.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-mac-and-cheese-cheddar-0",
        "name": "Macaronis",
        "quantity": 300,
        "unit": "g",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-mac-and-cheese-cheddar-1",
        "name": "Cheddar râpé",
        "quantity": 150,
        "unit": "g",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-mac-and-cheese-cheddar-2",
        "name": "Lait",
        "quantity": 300,
        "unit": "ml",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-mac-and-cheese-cheddar-3",
        "name": "Beurre",
        "quantity": 25,
        "unit": "g",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-mac-and-cheese-cheddar-4",
        "name": "Farine",
        "quantity": 25,
        "unit": "g",
        "category": "epicerie_sucree"
      }
    ]
  },
  {
    "id": "salade-cobb-americaine",
    "title": "Salade Cobb Gourmande au Poulet & Roquefort",
    "description": "Grand classique complet : poulet rôti, bacon croustillant, avocat, œufs durs, tomates et fromage bleu.",
    "image_url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 15,
    "cook_time": 8,
    "servings": 2,
    "category": "dejeuner",
    "tags": [
      "famille",
      "rapide"
    ],
    "source": "website",
    "instructions": "1. Faites dorer poulet et bacon à la poêle.\n2. Cuisez les œufs durs 9 min.\n3. Dressez les ingrédients en rangées colorées sur un lit de salade verte et arrosez de vinaigrette.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-salade-cobb-americaine-0",
        "name": "Blanc de poulet",
        "quantity": 200,
        "unit": "g",
        "category": "boucherie"
      },
      {
        "id": "ing-salade-cobb-americaine-1",
        "name": "Bacon",
        "quantity": 4,
        "unit": "piece",
        "category": "boucherie"
      },
      {
        "id": "ing-salade-cobb-americaine-2",
        "name": "Avocat",
        "quantity": 1,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-salade-cobb-americaine-3",
        "name": "Œufs",
        "quantity": 2,
        "unit": "piece",
        "category": "produits_frais"
      },
      {
        "id": "ing-salade-cobb-americaine-4",
        "name": "Fromage bleu ou Roquefort",
        "quantity": 50,
        "unit": "g",
        "category": "produits_laitiers"
      }
    ]
  },
  {
    "id": "soupe-oignon-gratinee",
    "title": "Soupe à l'Oignon Gratinée à l'Ancienne",
    "description": "Oignons fondants caramélisés, bouillon riche et tranches de baguette garnies d'emmental gratiné.",
    "image_url": "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 15,
    "cook_time": 35,
    "servings": 4,
    "category": "diner",
    "tags": [
      "etudiant",
      "batch_cooking"
    ],
    "source": "website",
    "instructions": "1. Faites confire doucement les oignons émincés dans le beurre 25 min jusqu'à belle couleur caramel.\n2. Saupoudrez d'une cuillère de farine, mouillez avec 1L de bouillon et mijotez 15 min.\n3. Versez dans des bols, posez les tranches de pain frottées d'ail, recouvrez d'emmental et gratinez au four.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-soupe-oignon-gratinee-0",
        "name": "Oignons jaunes",
        "quantity": 5,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-soupe-oignon-gratinee-1",
        "name": "Bouillon de bœuf ou légumes",
        "quantity": 1,
        "unit": "l",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-soupe-oignon-gratinee-2",
        "name": "Baguette de pain",
        "quantity": 0.5,
        "unit": "piece",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-soupe-oignon-gratinee-3",
        "name": "Emmental râpé",
        "quantity": 100,
        "unit": "g",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-soupe-oignon-gratinee-4",
        "name": "Beurre",
        "quantity": 30,
        "unit": "g",
        "category": "produits_laitiers"
      }
    ]
  },
  {
    "id": "guacamole-maison-tortillas",
    "title": "Guacamole Authentique & Tortilla Chips",
    "description": "Avocats écrasés à la fourchette avec jus de citron vert, tomate en dés, oignon rouge et coriandre.",
    "image_url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 10,
    "cook_time": 15,
    "servings": 4,
    "category": "encas",
    "tags": [
      "rapide",
      "vegetarien",
      "etudiant"
    ],
    "source": "website",
    "instructions": "1. Écrasez les avocats mûrs à la fourchette en gardant de la texture.\n2. Incorporez le jus de citron vert, les dés de tomate épépinée, l'oignon rouge et la coriandre ciselée.\n3. Salez, ajoutez une pointe de piment et servez avec des chips de maïs.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-guacamole-maison-tortillas-0",
        "name": "Avocats bien mûrs",
        "quantity": 2,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-guacamole-maison-tortillas-1",
        "name": "Citron vert",
        "quantity": 1,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-guacamole-maison-tortillas-2",
        "name": "Tomate",
        "quantity": 1,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-guacamole-maison-tortillas-3",
        "name": "Oignon rouge",
        "quantity": 0.5,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-guacamole-maison-tortillas-4",
        "name": "Chips de maïs (Tortillas)",
        "quantity": 150,
        "unit": "g",
        "category": "epicerie_salee"
      }
    ]
  },
  {
    "id": "bruschetta-tomate-mozza",
    "title": "Bruschetta Italienne Tomate & Mozzarella",
    "description": "Tranches de pain de campagne toastées frottées à l'ail, dés de tomates au basilic et mozzarella di bufala.",
    "image_url": "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 10,
    "cook_time": 5,
    "servings": 2,
    "category": "dejeuner",
    "tags": [
      "rapide",
      "vegetarien",
      "etudiant"
    ],
    "source": "website",
    "instructions": "1. Toastez les tranches de pain et frottez-les immédiatement avec la gousse d'ail.\n2. Mélangez tomates en dés, huile d'olive, sel et basilic.\n3. Répartissez sur le pain avec des morceaux de mozzarella et passez 3 min sous le grill.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-bruschetta-tomate-mozza-0",
        "name": "Pain de campagne",
        "quantity": 4,
        "unit": "piece",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-bruschetta-tomate-mozza-1",
        "name": "Tomates",
        "quantity": 3,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-bruschetta-tomate-mozza-2",
        "name": "Mozzarella",
        "quantity": 1,
        "unit": "piece",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-bruschetta-tomate-mozza-3",
        "name": "Ail",
        "quantity": 1,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-bruschetta-tomate-mozza-4",
        "name": "Huile d'olive",
        "quantity": 2,
        "unit": "cuillere_soupe",
        "category": "epicerie_salee"
      }
    ]
  },
  {
    "id": "wok-nouilles-sautees-legumes",
    "title": "Wok de Nouilles Sautées aux Légumes Croquants",
    "description": "Nouilles sautées minute avec julienne de carottes, chou chinois, champignons et sauce soja sésame.",
    "image_url": "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 10,
    "cook_time": 7,
    "servings": 2,
    "category": "dejeuner",
    "tags": [
      "rapide",
      "etudiant",
      "vegetarien"
    ],
    "source": "website",
    "instructions": "1. Cuisez les nouilles 3 min et égouttez-les.\n2. Faites sauter les légumes émincés au wok dans l'huile bien chaude 4 min.\n3. Incorporez les nouilles, la sauce soja et l'huile de sésame en remuant à feu vif.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-wok-nouilles-sautees-legumes-0",
        "name": "Nouilles de blé ou aux œufs",
        "quantity": 180,
        "unit": "g",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-wok-nouilles-sautees-legumes-1",
        "name": "Carottes",
        "quantity": 2,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-wok-nouilles-sautees-legumes-2",
        "name": "Champignons",
        "quantity": 100,
        "unit": "g",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-wok-nouilles-sautees-legumes-3",
        "name": "Sauce soja",
        "quantity": 3,
        "unit": "cuillere_soupe",
        "category": "epicerie_salee"
      }
    ]
  },
  {
    "id": "salade-nicoise-thon-oeuf",
    "title": "Salade Niçoise Complète au Thon & Œufs",
    "description": "Haricots verts croquants, thon au naturel, tomates, pommes de terre et quartiers d'œufs durs.",
    "image_url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 15,
    "cook_time": 10,
    "servings": 2,
    "category": "dejeuner",
    "tags": [
      "rapide",
      "etudiant"
    ],
    "source": "website",
    "instructions": "1. Faites cuire les haricots verts et les pommes de terre à la vapeur.\n2. Cuisez les œufs 9 min et écalez-les.\n3. Dressez dans des assiettes avec thon émietté, tomates en quartiers et olives, nappez de vinaigrette.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-salade-nicoise-thon-oeuf-0",
        "name": "Thon en boîte",
        "quantity": 140,
        "unit": "g",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-salade-nicoise-thon-oeuf-1",
        "name": "Œufs",
        "quantity": 2,
        "unit": "piece",
        "category": "produits_frais"
      },
      {
        "id": "ing-salade-nicoise-thon-oeuf-2",
        "name": "Haricots verts",
        "quantity": 150,
        "unit": "g",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-salade-nicoise-thon-oeuf-3",
        "name": "Tomates",
        "quantity": 2,
        "unit": "piece",
        "category": "fruits_legumes"
      }
    ]
  },
  {
    "id": "poelee-paysanne-lardons",
    "title": "Poêlée Paysanne Pommes de Terre, Lardons & Persil",
    "description": "Dés de pommes de terre rissolés au beurre, lardons fumés croustillants et persil frais.",
    "image_url": "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 10,
    "cook_time": 15,
    "servings": 2,
    "category": "diner",
    "tags": [
      "rapide",
      "etudiant"
    ],
    "source": "website",
    "instructions": "1. Coupez les pommes de terre précuites en dés.\n2. Faites dorer les lardons 3 min, ajoutez les pommes de terre et faites rissoler 10 min.\n3. Parsemez de persil ciselé et poivrez bien.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-poelee-paysanne-lardons-0",
        "name": "Pommes de terre",
        "quantity": 400,
        "unit": "g",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-poelee-paysanne-lardons-1",
        "name": "Lardons fumés",
        "quantity": 120,
        "unit": "g",
        "category": "boucherie"
      },
      {
        "id": "ing-poelee-paysanne-lardons-2",
        "name": "Beurre",
        "quantity": 15,
        "unit": "g",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-poelee-paysanne-lardons-3",
        "name": "Persil",
        "quantity": 1,
        "unit": "cuillere_soupe",
        "category": "fruits_legumes"
      }
    ]
  },
  {
    "id": "pates-arrabbiata-piment",
    "title": "Pâtes all'Arrabbiata Pimentées & Pecorino",
    "description": "Sauce tomate veloutée relevée d'ail et piment doux pour réveiller les penne al dente.",
    "image_url": "https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 5,
    "cook_time": 10,
    "servings": 2,
    "category": "dejeuner",
    "tags": [
      "rapide",
      "etudiant",
      "vegetarien"
    ],
    "source": "website",
    "instructions": "1. Cuisez les pennes al dente.\n2. Faites chauffer huile d'olive, ail émincé et piment 2 min sans brûler.\n3. Ajoutez le coulis de tomate, laissez mijoter 8 min et enrobez les pâtes.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-pates-arrabbiata-piment-0",
        "name": "Penne",
        "quantity": 200,
        "unit": "g",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-pates-arrabbiata-piment-1",
        "name": "Coulis de tomates",
        "quantity": 300,
        "unit": "ml",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-pates-arrabbiata-piment-2",
        "name": "Gousse d'ail",
        "quantity": 2,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-pates-arrabbiata-piment-3",
        "name": "Piment doux ou fort",
        "quantity": 1,
        "unit": "cuillere_the",
        "category": "epicerie_salee"
      }
    ]
  },
  {
    "id": "salade-pates-mediterranee",
    "title": "Salade de Pâtes Méditerranéenne à la Mozzarella",
    "description": "Pâtes courtes, billes de mozzarella, tomates cerises, olives noires et pesto léger.",
    "image_url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 10,
    "cook_time": 8,
    "servings": 4,
    "category": "dejeuner",
    "tags": [
      "rapide",
      "etudiant",
      "batch_cooking",
      "vegetarien"
    ],
    "source": "website",
    "instructions": "1. Cuisez les pâtes al dente, rincez-les à l'eau froide et égouttez.\n2. Ajoutez tomates cerises coupées en deux, billes de mozzarella et olives.\n3. Assaisonnez d'une cuillère de pesto et d'un filet d'huile d'olive.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-salade-pates-mediterranee-0",
        "name": "Fusilli ou Farfalle",
        "quantity": 250,
        "unit": "g",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-salade-pates-mediterranee-1",
        "name": "Billes de mozzarella",
        "quantity": 150,
        "unit": "g",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-salade-pates-mediterranee-2",
        "name": "Tomates cerises",
        "quantity": 150,
        "unit": "g",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-salade-pates-mediterranee-3",
        "name": "Olives noires",
        "quantity": 40,
        "unit": "g",
        "category": "epicerie_salee"
      }
    ]
  },
  {
    "id": "veloute-poireaux-pommes-terre",
    "title": "Velouté Traditionnel Poireaux & Pommes de Terre",
    "description": "La soupe douce et réconfortante de l'hiver, économique et nutritive.",
    "image_url": "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 15,
    "cook_time": 25,
    "servings": 4,
    "category": "diner",
    "tags": [
      "famille",
      "vegetarien",
      "batch_cooking"
    ],
    "source": "website",
    "instructions": "1. Émincez les blancs de poireaux et faites-les suer 5 min au beurre.\n2. Ajoutez les pommes de terre en dés et 800ml d'eau ou bouillon.\n3. Laissez cuire 20 min puis mixez finement. Ajoutez une touche de crème.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-veloute-poireaux-pommes-terre-0",
        "name": "Poireaux",
        "quantity": 3,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-veloute-poireaux-pommes-terre-1",
        "name": "Pommes de terre",
        "quantity": 400,
        "unit": "g",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-veloute-poireaux-pommes-terre-2",
        "name": "Beurre",
        "quantity": 20,
        "unit": "g",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-veloute-poireaux-pommes-terre-3",
        "name": "Crème liquide",
        "quantity": 50,
        "unit": "ml",
        "category": "produits_laitiers"
      }
    ]
  },
  {
    "id": "mug-cake-chocolat-express",
    "title": "Mug Cake Chocolat Express au Micro-Ondes",
    "description": "Un gâteau individuel fondant au chocolat prêt en 2 minutes montre en main !",
    "image_url": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 2,
    "cook_time": 1,
    "servings": 1,
    "category": "dessert",
    "tags": [
      "rapide",
      "etudiant",
      "dessert"
    ],
    "source": "website",
    "instructions": "1. Faites fondre le chocolat et le beurre directement dans le mug au micro-ondes (30 sec).\n2. Ajoutez sucre, œuf et farine, fouettez à la fourchette.\n3. Cuisez 50 secondes au micro-ondes à 800W. Dégustez tiède !",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-mug-cake-chocolat-express-0",
        "name": "Chocolat noir",
        "quantity": 40,
        "unit": "g",
        "category": "epicerie_sucree"
      },
      {
        "id": "ing-mug-cake-chocolat-express-1",
        "name": "Beurre",
        "quantity": 25,
        "unit": "g",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-mug-cake-chocolat-express-2",
        "name": "Farine",
        "quantity": 20,
        "unit": "g",
        "category": "epicerie_sucree"
      },
      {
        "id": "ing-mug-cake-chocolat-express-3",
        "name": "Sucre",
        "quantity": 15,
        "unit": "g",
        "category": "epicerie_sucree"
      },
      {
        "id": "ing-mug-cake-chocolat-express-4",
        "name": "Œuf",
        "quantity": 1,
        "unit": "piece",
        "category": "produits_frais"
      }
    ]
  },
  {
    "id": "porridge-avoine-pommes-miel",
    "title": "Porridge d'Avoine aux Pommes & Miel",
    "description": "Flocons d'avoine cuits dans du lait chaud surmontés de dés de pommes caramélisées.",
    "image_url": "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 5,
    "cook_time": 7,
    "servings": 1,
    "category": "petit_dejeuner",
    "tags": [
      "petit_dejeuner",
      "rapide",
      "etudiant"
    ],
    "source": "website",
    "instructions": "1. Faites cuire les flocons d'avoine dans le lait à feu doux 5 min en remuant jusqu'à épaississement.\n2. Dorez les morceaux de pomme 3 min à la poêle avec une noisette de beurre.\n3. Versez le porridge dans un bol, disposez les pommes et nappez de miel.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-porridge-avoine-pommes-miel-0",
        "name": "Flocons d'avoine",
        "quantity": 50,
        "unit": "g",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-porridge-avoine-pommes-miel-1",
        "name": "Lait ou boisson végétale",
        "quantity": 200,
        "unit": "ml",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-porridge-avoine-pommes-miel-2",
        "name": "Pomme",
        "quantity": 1,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-porridge-avoine-pommes-miel-3",
        "name": "Miel",
        "quantity": 1,
        "unit": "cuillere_soupe",
        "category": "epicerie_sucree"
      }
    ]
  },
  {
    "id": "soupe-miso-tofu-wakame",
    "title": "Soupe Miso Traditionnelle au Tofu & Wakame",
    "description": "Bouillon japonais chaud et apaisant avec pâte miso fermentée, algues et dés de tofu soyeux.",
    "image_url": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 5,
    "cook_time": 5,
    "servings": 2,
    "category": "diner",
    "tags": [
      "rapide",
      "vegetarien",
      "etudiant"
    ],
    "source": "website",
    "instructions": "1. Faites frémir 500ml d'eau avec le bouillon dashi.\n2. Ajoutez les dés de tofu et laissez chauffer 2 min.\n3. Délayez la pâte miso dans une louche de bouillon tiédi et incorporez hors du feu. Parsemez de ciboule.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-soupe-miso-tofu-wakame-0",
        "name": "Pâte miso",
        "quantity": 2,
        "unit": "cuillere_soupe",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-soupe-miso-tofu-wakame-1",
        "name": "Tofu soyeux ou ferme",
        "quantity": 100,
        "unit": "g",
        "category": "produits_frais"
      },
      {
        "id": "ing-soupe-miso-tofu-wakame-2",
        "name": "Ciboulette ou ciboule",
        "quantity": 1,
        "unit": "cuillere_soupe",
        "category": "fruits_legumes"
      }
    ]
  },
  {
    "id": "omelette-champignons-persil",
    "title": "Omelette Baveuse aux Champignons Poêlés",
    "description": "Champignons dorés au beurre et persil frais enveloppés dans une belle omelette baveuse.",
    "image_url": "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 5,
    "cook_time": 6,
    "servings": 1,
    "category": "dejeuner",
    "tags": [
      "rapide",
      "etudiant",
      "vegetarien"
    ],
    "source": "website",
    "instructions": "1. Poêlez les champignons émincés au beurre avec le persil 4 min.\n2. Versez les œufs battus salés et poivrés par-dessus.\n3. Ramenez les bords et repliez en chausson moelleux.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-omelette-champignons-persil-0",
        "name": "Œufs",
        "quantity": 3,
        "unit": "piece",
        "category": "produits_frais"
      },
      {
        "id": "ing-omelette-champignons-persil-1",
        "name": "Champignons de Paris",
        "quantity": 100,
        "unit": "g",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-omelette-champignons-persil-2",
        "name": "Beurre",
        "quantity": 15,
        "unit": "g",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-omelette-champignons-persil-3",
        "name": "Persil",
        "quantity": 1,
        "unit": "cuillere_soupe",
        "category": "fruits_legumes"
      }
    ]
  },
  {
    "id": "toast-ricotta-tomates-roties",
    "title": "Toast Croustillant Ricotta & Tomates Rôties",
    "description": "Pain toasté nappé de ricotta fraîche et surmonté de tomates cerises compotées à l'huile d'olive.",
    "image_url": "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 5,
    "cook_time": 10,
    "servings": 2,
    "category": "dejeuner",
    "tags": [
      "rapide",
      "vegetarien",
      "etudiant"
    ],
    "source": "website",
    "instructions": "1. Faites rôtir les tomates cerises avec un filet d'huile d'olive à la poêle 8 min jusqu'à ce qu'elles éclatent.\n2. Tartinez le pain grillé de ricotta assaisonnée de sel et poivre.\n3. Déposez les tomates confites chaudes et une feuille de basilic.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-toast-ricotta-tomates-roties-0",
        "name": "Pain de campagne",
        "quantity": 2,
        "unit": "piece",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-toast-ricotta-tomates-roties-1",
        "name": "Ricotta",
        "quantity": 100,
        "unit": "g",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-toast-ricotta-tomates-roties-2",
        "name": "Tomates cerises",
        "quantity": 150,
        "unit": "g",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-toast-ricotta-tomates-roties-3",
        "name": "Huile d'olive",
        "quantity": 1,
        "unit": "cuillere_soupe",
        "category": "epicerie_salee"
      }
    ]
  },
  {
    "id": "salade-carottes-rapees-agrumes",
    "title": "Salade de Carottes Râpées aux Agrumes & Cumin",
    "description": "Carottes fraîches assaisonnées d'un filet de jus d'orange, citron, huile d'olive et cumin doux.",
    "image_url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 10,
    "cook_time": 15,
    "servings": 2,
    "category": "dejeuner",
    "tags": [
      "rapide",
      "etudiant",
      "vegetarien"
    ],
    "source": "website",
    "instructions": "1. Râpez les carottes épluchées.\n2. Préparez la vinaigrette avec jus d'orange, jus de citron, huile d'olive, cumin et sel.\n3. Arrosez les carottes et mélangez bien avant de servir bien frais.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-salade-carottes-rapees-agrumes-0",
        "name": "Carottes",
        "quantity": 3,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-salade-carottes-rapees-agrumes-1",
        "name": "Orange",
        "quantity": 0.5,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-salade-carottes-rapees-agrumes-2",
        "name": "Citron",
        "quantity": 0.5,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-salade-carottes-rapees-agrumes-3",
        "name": "Huile d'olive",
        "quantity": 2,
        "unit": "cuillere_soupe",
        "category": "epicerie_salee"
      }
    ]
  },
  {
    "id": "rouleaux-printemps-legumes",
    "title": "Rouleaux de Printemps Frais aux Légumes Croquants",
    "description": "Feuilles de riz garnies de vermicelles de riz, carottes râpées, concombre, menthe et sauce cacahuète.",
    "image_url": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 15,
    "cook_time": 15,
    "servings": 2,
    "category": "dejeuner",
    "tags": [
      "rapide",
      "vegetarien"
    ],
    "source": "website",
    "instructions": "1. Trempez une feuille de riz dans l'eau tiède 15 sec.\n2. Déposez au centre vermicelles cuits, bâtonnets de carottes et concombre, et feuilles de menthe.\n3. Rabattez les côtés et roulez fermement. Dégustez avec sauce soja ou cacahuète.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-rouleaux-printemps-legumes-0",
        "name": "Galettes de riz",
        "quantity": 4,
        "unit": "piece",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-rouleaux-printemps-legumes-1",
        "name": "Vermicelles de riz",
        "quantity": 60,
        "unit": "g",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-rouleaux-printemps-legumes-2",
        "name": "Carotte",
        "quantity": 1,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-rouleaux-printemps-legumes-3",
        "name": "Concombre",
        "quantity": 0.5,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-rouleaux-printemps-legumes-4",
        "name": "Menthe fraîche",
        "quantity": 0.5,
        "unit": "piece",
        "category": "fruits_legumes"
      }
    ]
  },
  {
    "id": "poivrons-farcis-quinoa-chevre",
    "title": "Poivrons Farcis au Quinoa & Chèvre Fondant",
    "description": "Poivrons rôtis au four garnis de quinoa parfumé aux herbes et cœur de chèvre crémeux.",
    "image_url": "https://images.unsplash.com/photo-1572453800999-e8d2d1589b7c?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 15,
    "cook_time": 30,
    "servings": 4,
    "category": "diner",
    "tags": [
      "vegetarien",
      "famille"
    ],
    "source": "website",
    "instructions": "1. Coupez les poivrons en deux et évidez-les.\n2. Mélangez le quinoa cuit avec tomates séchées, oignon et herbes.\n3. Remplissez les demi-poivrons, déposez un morceau de chèvre sur chacun et cuisez 30 min à 190°C.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-poivrons-farcis-quinoa-chevre-0",
        "name": "Poivrons rouges ou jaunes",
        "quantity": 2,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-poivrons-farcis-quinoa-chevre-1",
        "name": "Quinoa cuit",
        "quantity": 200,
        "unit": "g",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-poivrons-farcis-quinoa-chevre-2",
        "name": "Bûche de chèvre",
        "quantity": 100,
        "unit": "g",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-poivrons-farcis-quinoa-chevre-3",
        "name": "Huile d'olive",
        "quantity": 2,
        "unit": "cuillere_soupe",
        "category": "epicerie_salee"
      }
    ]
  },
  {
    "id": "roti-porc-pruneaux",
    "title": "Rôti de Porc Moelleux aux Pruneaux",
    "description": "Viande fondante cuite au four avec pruneaux moelleux et jus réduit au romarin.",
    "image_url": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 15,
    "cook_time": 50,
    "servings": 6,
    "category": "diner",
    "tags": [
      "famille",
      "batch_cooking"
    ],
    "source": "website",
    "instructions": "1. Frottez le rôti d'huile, sel, poivre et romarin.\n2. Disposez-le dans un plat avec les pruneaux et un verre d'eau.\n3. Cuisez 50 min à 180°C en arrosant du jus de cuisson régulièrement.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-roti-porc-pruneaux-0",
        "name": "Rôti de porc",
        "quantity": 800,
        "unit": "g",
        "category": "boucherie"
      },
      {
        "id": "ing-roti-porc-pruneaux-1",
        "name": "Pruneaux dénoyautés",
        "quantity": 150,
        "unit": "g",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-roti-porc-pruneaux-2",
        "name": "Beurre",
        "quantity": 20,
        "unit": "g",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-roti-porc-pruneaux-3",
        "name": "Romarin",
        "quantity": 1,
        "unit": "cuillere_the",
        "category": "epicerie_salee"
      }
    ]
  },
  {
    "id": "crumble-sale-courgettes-parmesan",
    "title": "Crumble Salé Courgettes & Parmesan",
    "description": "Courgettes fondantes à l'ail sous une croûte sablée croustillante au parmesan et beurre.",
    "image_url": "https://images.unsplash.com/photo-1547496502-affa22d38842?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 15,
    "cook_time": 25,
    "servings": 4,
    "category": "diner",
    "tags": [
      "vegetarien",
      "famille"
    ],
    "source": "website",
    "instructions": "1. Faites sauter les courgettes en dés avec l'ail 8 min à la poêle.\n2. Préparez la pâte à crumble en sablant farine, beurre froid et parmesan râpé.\n3. Déposez les courgettes dans un plat, recouvrez de pâte et cuisez 25 min à 180°C.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-crumble-sale-courgettes-parmesan-0",
        "name": "Courgettes",
        "quantity": 3,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-crumble-sale-courgettes-parmesan-1",
        "name": "Farine",
        "quantity": 100,
        "unit": "g",
        "category": "epicerie_sucree"
      },
      {
        "id": "ing-crumble-sale-courgettes-parmesan-2",
        "name": "Parmesan râpé",
        "quantity": 60,
        "unit": "g",
        "category": "produits_laitiers"
      },
      {
        "id": "ing-crumble-sale-courgettes-parmesan-3",
        "name": "Beurre froid",
        "quantity": 60,
        "unit": "g",
        "category": "produits_laitiers"
      }
    ]
  },
  {
    "id": "chia-pudding-coco-mangue",
    "title": "Chia Pudding au Lait de Coco & Purée de Mangue",
    "description": "Graines de chia gonflées toute la nuit dans le lait de coco, surmontées de purée de mangue fraîche.",
    "image_url": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
    "difficulty": "facile",
    "prep_time": 5,
    "cook_time": 15,
    "servings": 2,
    "category": "petit_dejeuner",
    "tags": [
      "petit_dejeuner",
      "batch_cooking",
      "rapide"
    ],
    "source": "website",
    "instructions": "1. Mélangez les graines de chia avec le lait de coco et le miel.\n2. Laissez reposer au réfrigérateur au moins 4 heures (ou toute la nuit).\n3. Mixez la mangue en coulis et versez sur le pudding avant de déguster.",
    "is_public": true,
    "ingredients": [
      {
        "id": "ing-chia-pudding-coco-mangue-0",
        "name": "Graines de chia",
        "quantity": 40,
        "unit": "g",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-chia-pudding-coco-mangue-1",
        "name": "Lait de coco",
        "quantity": 200,
        "unit": "ml",
        "category": "epicerie_salee"
      },
      {
        "id": "ing-chia-pudding-coco-mangue-2",
        "name": "Mangue mûre",
        "quantity": 1,
        "unit": "piece",
        "category": "fruits_legumes"
      },
      {
        "id": "ing-chia-pudding-coco-mangue-3",
        "name": "Miel",
        "quantity": 1,
        "unit": "cuillere_soupe",
        "category": "epicerie_sucree"
      }
    ]
  }
];
