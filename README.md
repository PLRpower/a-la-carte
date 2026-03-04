# À la carte - App

Une application complète et collaborative de gestion de cuisine (Recettes, Stock, Liste de courses) orientée "Famille".

## Informations clés
- **Production (Vercel) :** [https://a-la-carte-app.vercel.app/](https://a-la-carte-app.vercel.app/)
- **Code source (GitHub) :** [https://github.com/PLRpower/a-la-carte-app](https://github.com/PLRpower/a-la-carte-app)
- **Stack Technologique :** React, TypeScript, Vite, Tailwind CSS (shadcn/ui), Supabase (Base de données PostgreSQL + Auth + Edge Functions)
- **Outils externes (MCP) supportés :** `Stripe` pour les paiements, `Supabase` pour la gestion de la BDD.

---

## 🤖 Guide Développeur / IA 

Ce README est spécialement conçu pour accélérer la compréhension de l'architecture technique de **À la carte**.

### 1. Architecture du Partage Familial (Le Cœur de l'application)
L'application ne repose plus sur des partages de données individuels ou publics, mais sur une logique de **"Famille" (P2P global au sein d'un groupe privé)**.
- **Tables SQL associées :** `families` et `family_members`. 
- **Sécurité (Row Level Security) :** Tout le système d'autorisation de Supabase pour les tables `recipes`, `stock` et `shopping_list` s'appuie sur une fonction PL/pgSQL nommée `public.is_shared_with_me(item_owner_id)`.
- **Règle d'or :** Si deux utilisateurs appartiennent à la même famille (sont dans la table `family_members` pour le même `family_id`), ils ont **Plein Accès Mutuel** aux recettes, au stock et aux listes de l'autre (SELECT, UPDATE, DELETE). Il n'y a **pas** de variables "toggles" (boutons on/off) dans les profils ; le partage est total par défaut.

### 2. Gestion de la Base de Données (Supabase CLI)
Le dossier `supabase/` à la racine contient la "Source de vérité" du backend :
- **Migrations :** Dans `supabase/migrations/`. La structure de départ est `20251124160000_init_schema.sql`. Toute modification de la structure de données DOIT faire l'objet d'un nouveau fichier de migration.
- **Déploiement DB :** Exécuter `npx supabase db push` pour mettre à jour la BDD distante.
- **Colonne supprimée :** La variable `is_public` dans la table `recipes` est obsolète et supprimée, tout comme les paramètres utilisateurs de type `share_recipes`, `share_stock`, etc.

### 3. Edge Functions (Deno)
Le backend "serveless" se trouve dans `supabase/functions/` (exécuté sur Deno, d'où les imports via `https://` locaux qui peuvent froisser l'analyseur de Webstorm, mais qui sont corrects) :
- `create-checkout-session` & `create-portal-session` & `stripe-webhook` : Gestion de l'abonnement Premium via Stripe (paiement CB, portail client, webhooks d'événement d'abonnement).
- `suggest-recipe` : Intégration d'une IA (Gemini) qui utilise le stock de l'utilisateur pour générer une recette structurée en JSON.
- `invite-family` : Route dédiée à la gestion des invitations email à une Famille.

### 4. Spécificités Frontend (React / Vite)
- **Conventions UI :** Les composants réutilisables sont dans `src/components/ui` (shadcn). Le reste de la logique applicative par vue métier se trouve dans `src/pages`. 
- **Requêtes BDD :** L'app utilise le client TS de Supabase (`@/integrations/supabase/client`). Le cache et les re-fetchs sont gérés par `@tanstack/react-query` dans les hooks dédiés (par exemple `useProfile.ts`, `useFamily.ts`).
- **Formulaire & Parsing :** La conversion des textes bruts d'ingrédients (ex: "3 cuillères de sucre") en données structurées est centralisée dans `src/lib/ingredient-parser.ts` et `src/lib/recipe-helpers.ts`. 
- **Performance :** L'application a été nettoyée d'animations lourdes entre les pages (Framer Motion supprimé du Router) pour privilégier la rapidité brute du SPA React.

### 5. Type Safety (TypeScript)
- Les types de données de la Base (générés) se trouvent dans `src/types/database.ts`. S'assurer de toujours répercuter les modifications de structure (ex: suppressions de colonnes dans les migrations Supabase) dans ces types côté front !