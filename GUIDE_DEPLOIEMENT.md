# Guide de déploiement - Fonction scrape-recipe

## Prérequis
- Avoir Supabase CLI installé
- Être connecté à votre projet Supabase (`supabase login`)
- Avoir lié votre projet local (`supabase link --project-ref votre-project-ref`)

## Étapes de déploiement

### 1. Vérifier la configuration de la clé API Gemini

Assurez-vous que la variable d'environnement `GEMINI_API_KEY` est configurée dans votre projet Supabase :

```bash
# Lister les secrets existants
supabase secrets list

# Si GEMINI_API_KEY n'existe pas, l'ajouter
supabase secrets set GEMINI_API_KEY=votre_clé_api_gemini
```

### 2. Déployer la fonction scrape-recipe

```bash
# Déployer uniquement la fonction scrape-recipe
supabase functions deploy scrape-recipe

# OU déployer toutes les fonctions
supabase functions deploy
```

### 3. Vérifier le déploiement

```bash
# Lister toutes les fonctions déployées
supabase functions list
```

Vous devriez voir `scrape-recipe` dans la liste avec un statut actif.

### 4. Tester la fonction

Vous pouvez tester la fonction directement depuis la ligne de commande :

```bash
# Tester avec une URL de recette
supabase functions invoke scrape-recipe --data '{"url":"https://www.marmiton.org/recettes/recette_pate-a-crepes_12372.aspx"}'
```

## Test de la fonctionnalité complète

### Sur mobile (recommandé)

1. **Installer l'application en tant que PWA** :
   - Ouvrez votre application dans Chrome/Safari
   - Appuyez sur le menu (⋮) ou le bouton de partage
   - Sélectionnez "Ajouter à l'écran d'accueil"
   - Confirmez l'installation

2. **Tester le partage** :
   - Ouvrez un site de recettes (Marmiton, 750g, etc.)
   - Appuyez sur le bouton "Partager" de votre navigateur
   - Sélectionnez "À la carte" dans la liste
   - Vérifiez que la recette est correctement extraite

3. **Tester la capture photo** :
   - Dans l'application, appuyez sur "+"
   - Sélectionnez "Depuis une photo"
   - Appuyez sur "Prendre une photo"
   - Vérifiez que l'appareil photo s'ouvre directement

### Sur desktop

Le partage web fonctionne également sur desktop si l'application est installée en tant que PWA :
- Chrome : Menu → "Installer À la carte"
- Edge : Menu → "Applications" → "Installer ce site en tant qu'application"

## Dépannage

### La fonction ne se déploie pas
- Vérifiez que vous êtes bien connecté : `supabase login`
- Vérifiez que le projet est bien lié : `supabase link --project-ref votre-project-ref`
- Vérifiez les logs : `supabase functions logs scrape-recipe`

### Le partage web ne fonctionne pas
- Assurez-vous que l'application est installée en tant que PWA
- Vérifiez que vous utilisez HTTPS (requis pour les PWA)
- Vérifiez que le manifest est correctement généré (DevTools → Application → Manifest)

### La capture photo ne s'ouvre pas
- Sur desktop, vérifiez que vous avez une webcam connectée
- Sur mobile, vérifiez que vous avez autorisé l'accès à l'appareil photo
- Certains navigateurs peuvent ne pas supporter l'attribut `capture`

### L'extraction de recette échoue
- Vérifiez que la fonction Edge est bien déployée
- Vérifiez les logs de la fonction : `supabase functions logs scrape-recipe`
- Certains sites peuvent bloquer le scraping ou avoir une structure HTML complexe
- L'IA peut avoir des difficultés avec certains formats de recettes

## Commandes utiles

```bash
# Voir les logs en temps réel
supabase functions logs scrape-recipe --follow

# Supprimer une fonction
supabase functions delete scrape-recipe

# Redéployer après modification
supabase functions deploy scrape-recipe --no-verify-jwt
```
