# Optimisations Supabase & Performance

Pour maximiser les performances de votre application (PWA/Mobile), voici les actions recommandées sur votre projet Supabase et votre application.

## 1. Stockage & Images (Storage)

### Compression à l'upload (Déjà implémenté dans le code)
Nous avons mis en place une compression automatique des images côté client (sur le téléphone de l'utilisateur) avant même l'envoi vers Supabase.
- **Gain** : Réduit la taille des fichiers de 70-90% sans perte visible.
- **Avantage** : Uploads plus rapides, économie de stockage, affichage plus fluide.

### Actions requises sur le tableau de bord Supabase :

1.  **Activer le CDN (Content Delivery Network)** :
    *   Supabase utilise Cloudflare par défaut, mais assurez-vous que votre projet est bien configuré pour servir les assets via le CDN global.

2.  **Policies de Cache (Cache-Control)** :
    *   Nous avons configuré le code pour demander un cache de **1 an** (`cacheControl: '31536000'`) pour les uploads.
    *   Assurez-vous que vos buckets (`recipe-images`, `avatars`) sont "Public" (ce qui est probablement déjà le cas).

3.  **Image Transformations (Optionnel - Plan Pro)** :
    *   Si vous avez un plan Pro, vous pouvez utiliser l'URL de transformation pour redimensionner les images à la volée.
    *   *Exemple* : `.../image.jpg?width=500&quality=80`
    *   Si vous restez sur le plan gratuit, notre compression côté client est la meilleure alternative gratuite.

## 2. Base de Données (Database)

### Indexes
Pour accélérer les chargements de listes (Recettes, Ingrédients), assurez-vous d'avoir des indexes sur les colonnes souvent filtrées.
Exécutez ce SQL dans l'éditeur SQL de Supabase pour vérifier/ajouter des indexes pertinents :

```sql
-- Index pour les recherches de recettes par utilisateur
CREATE INDEX IF NOT EXISTS recipes_user_id_idx ON recipes(user_id);

-- Index pour le tri par date (pour afficher les plus récentes rapidement)
CREATE INDEX IF NOT EXISTS recipes_created_at_idx ON recipes(created_at DESC);

-- Index pour la liste de courses et le stock
CREATE INDEX IF NOT EXISTS shopping_list_user_id_idx ON shopping_list(user_id);
CREATE INDEX IF NOT EXISTS stock_user_id_idx ON stock(user_id);
```

## 3. PWA & Caching (Modifié dans `vite.config.ts`)

Nous avons optimisé la configuration de la PWA :
-   **Images Supabase** : Mises en cache pendant **30 jours** (stratégie `StaleWhileRevalidate`). L'app affiche l'image en cache immédiatement tout en vérifiant en arrière-plan s'il y a une nouvelle version.
-   **Polices Google** : Mises en cache pendant **1 an**.
-   **Lazy Loading** : L'application ne charge désormais que le strict nécessaire au démarrage. Les autres pages sont chargées "à la demande", ce qui accélère l'ouverture initiale de l'app.

## 4. Préchargement (Preloading)

Si vous avez une image "Hero" (image principale) sur la page d'accueil qui est toujours la même, ajoutez ceci dans `index.html` dans le `<head>` :

```html
<link rel="preload" as="image" href="/path/to/hero-image.jpg">
```

(Pour les images dynamiques de recettes, le cache "StaleWhileRevalidate" configuré s'en charge automatiquement après le premier affichage).
