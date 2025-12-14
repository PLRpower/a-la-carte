# Nouvelles Fonctionnalités - À la carte

## 1. Partage de recettes depuis des sites web externes

### Description
Votre application "À la carte" apparaît maintenant dans le menu de partage de votre navigateur et d'autres applications. Vous pouvez partager directement une recette depuis n'importe quel site web vers votre application.

### Comment l'utiliser
1. Naviguez vers une page de recette sur n'importe quel site web (par exemple, Marmiton, 750g, etc.)
2. Appuyez sur le bouton "Partager" de votre navigateur
3. Sélectionnez "À la carte" dans la liste des applications
4. L'application va automatiquement extraire les informations de la recette (titre, ingrédients, instructions, etc.)
5. Vérifiez et modifiez les informations si nécessaire
6. Sauvegardez la recette dans votre collection

### Fonctionnement technique
- **Web Share Target API** : Configurée dans le manifest PWA pour recevoir les URLs partagées
- **Route `/recipes/share`** : Gère les URLs partagées
- **Fonction Edge `scrape-recipe`** : Récupère le contenu de la page web et utilise Gemini AI pour extraire les informations de la recette

### Déploiement de la fonction Edge
Pour que cette fonctionnalité fonctionne, vous devez déployer la nouvelle fonction Edge :

```bash
# Déployer la fonction scrape-recipe
supabase functions deploy scrape-recipe

# Ou déployer toutes les fonctions
supabase functions deploy
```

N'oubliez pas de configurer la variable d'environnement `GEMINI_API_KEY` dans votre projet Supabase.

## 2. Capture photo directe pour l'ajout de recettes

### Description
Lors de l'ajout d'une recette par photo, vous avez maintenant deux options :
- **Prendre une photo** : Ouvre directement l'appareil photo de votre appareil
- **Choisir une photo** : Sélectionne une photo depuis votre galerie

### Comment l'utiliser
1. Appuyez sur le bouton "+" pour ajouter une recette
2. Sélectionnez "Depuis une photo"
3. Choisissez l'une des deux options :
   - **Prendre une photo** : L'appareil photo s'ouvre directement (caméra arrière par défaut)
   - **Choisir une photo** : Accédez à votre galerie pour sélectionner une image existante

### Fonctionnement technique
- Utilise l'attribut HTML `capture="environment"` sur l'input file pour ouvrir directement la caméra arrière
- Deux inputs file distincts : un pour la galerie, un pour la capture directe
- Interface utilisateur améliorée avec deux boutons côte à côte

## Notes importantes

### Pour le partage web
- La fonctionnalité de partage web nécessite que l'application soit installée en tant que PWA (Progressive Web App)
- Sur mobile, installez l'application via le menu "Ajouter à l'écran d'accueil" de votre navigateur
- La fonction `scrape-recipe` doit être déployée sur Supabase pour que le scraping fonctionne

### Pour la capture photo
- La capture photo directe fonctionne mieux sur les appareils mobiles
- Sur desktop, cela peut ouvrir une webcam si disponible
- L'attribut `capture="environment"` privilégie la caméra arrière sur mobile

## Fichiers modifiés

1. **vite.config.ts** : Ajout de la configuration `share_target` dans le manifest PWA
2. **src/pages/RecipeShare.tsx** : Nouvelle page pour gérer les URLs partagées
3. **src/App.tsx** : Ajout de la route `/recipes/share`
4. **src/components/AddRecipeOverlay.tsx** : Ajout du bouton de capture photo directe
5. **supabase/functions/scrape-recipe/index.ts** : Nouvelle fonction Edge pour scraper les recettes

## Prochaines étapes

1. Déployez la fonction Edge `scrape-recipe` sur Supabase
2. Testez le partage depuis différents sites de recettes
3. Installez l'application en tant que PWA pour tester le partage web
4. Testez la capture photo sur un appareil mobile
