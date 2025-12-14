# 🚀 Guide de test rapide

## Avant de commencer

Assurez-vous que le serveur de développement est lancé :
```bash
npm run dev
```

L'application devrait être accessible sur http://localhost:8080

## Test 1 : Bouton de capture photo ✅ (Prêt à tester)

### Ce qui a changé
Avant : Un seul bouton "Choisir une photo" qui ouvrait la galerie
Après : Deux boutons côte à côte
- "Prendre une photo" (avec icône caméra) - Ouvre directement l'appareil photo
- "Choisir une photo" (avec icône upload) - Ouvre la galerie

### Comment tester
1. Ouvrez l'application sur http://localhost:8080
2. Connectez-vous (ou créez un compte si nécessaire)
3. Appuyez sur le bouton "+" en bas de l'écran
4. Sélectionnez "Depuis une photo"
5. Vous devriez voir deux boutons :
   - **Sur mobile** : "Prendre une photo" ouvrira directement l'appareil photo
   - **Sur desktop** : "Prendre une photo" ouvrira la webcam (si disponible)
   - "Choisir une photo" ouvrira la galerie/explorateur de fichiers

### Résultat attendu
✅ Deux boutons visibles et fonctionnels
✅ "Prendre une photo" ouvre la caméra/webcam
✅ "Choisir une photo" ouvre la galerie
✅ Les deux options permettent d'ajouter une recette par photo

---

## Test 2 : Partage depuis le web 🔧 (Nécessite déploiement)

### Ce qui a changé
Avant : Impossible de partager une recette depuis un site web vers l'application
Après : L'application apparaît dans le menu de partage du navigateur

### Prérequis
⚠️ Cette fonctionnalité nécessite :
1. Déployer la fonction Edge `scrape-recipe` sur Supabase
2. Installer l'application en tant que PWA

### Déploiement de la fonction Edge

```bash
# 1. Vérifier la configuration de la clé API
supabase secrets list

# 2. Si GEMINI_API_KEY n'existe pas, l'ajouter
supabase secrets set GEMINI_API_KEY=votre_clé_api_gemini

# 3. Déployer la fonction
supabase functions deploy scrape-recipe

# 4. Vérifier le déploiement
supabase functions list
```

### Installation en PWA

#### Sur mobile (Android/iOS)
1. Ouvrez l'application dans Chrome/Safari
2. Appuyez sur le menu (⋮) ou le bouton de partage
3. Sélectionnez "Ajouter à l'écran d'accueil"
4. Confirmez l'installation

#### Sur desktop
**Chrome :**
1. Ouvrez l'application
2. Cliquez sur l'icône d'installation dans la barre d'adresse (ou menu → "Installer À la carte")
3. Confirmez l'installation

**Edge :**
1. Ouvrez l'application
2. Menu → "Applications" → "Installer ce site en tant qu'application"
3. Confirmez l'installation

### Comment tester

1. **Installez l'application en PWA** (voir ci-dessus)
2. **Ouvrez un site de recettes** (exemples) :
   - https://www.marmiton.org/recettes/recette_pate-a-crepes_12372.aspx
   - https://www.750g.com/gateau-au-chocolat-r13589.htm
   - N'importe quelle autre recette en ligne

3. **Partagez la recette** :
   - **Sur mobile** : Appuyez sur le bouton "Partager" du navigateur
   - **Sur desktop** : Clic droit → "Partager" ou icône de partage dans la barre d'adresse

4. **Sélectionnez "À la carte"** dans la liste des applications

5. **Vérifiez l'extraction** :
   - L'application devrait s'ouvrir
   - Un écran de chargement "Extraction de la recette..." devrait apparaître
   - Les informations de la recette devraient être pré-remplies dans le formulaire
   - Vous pouvez modifier les informations si nécessaire
   - Sauvegardez la recette

### Résultat attendu
✅ "À la carte" apparaît dans le menu de partage
✅ L'application s'ouvre automatiquement
✅ La recette est extraite et pré-remplie
✅ Vous pouvez éditer et sauvegarder la recette

---

## Dépannage

### Le bouton "Prendre une photo" ne fonctionne pas
- Sur desktop, vérifiez que vous avez une webcam
- Vérifiez que vous avez autorisé l'accès à la caméra
- Essayez sur un appareil mobile pour de meilleurs résultats

### "À la carte" n'apparaît pas dans le menu de partage
- Vérifiez que l'application est installée en PWA
- Vérifiez que vous utilisez HTTPS (requis pour les PWA)
- Essayez de désinstaller et réinstaller la PWA
- Sur iOS, Safari est requis pour l'installation PWA

### L'extraction de recette échoue
- Vérifiez que la fonction `scrape-recipe` est déployée : `supabase functions list`
- Vérifiez les logs : `supabase functions logs scrape-recipe`
- Certains sites peuvent bloquer le scraping
- L'IA peut avoir des difficultés avec certains formats

### La fonction Edge ne se déploie pas
- Vérifiez que vous êtes connecté : `supabase login`
- Vérifiez que le projet est lié : `supabase link --project-ref votre-ref`
- Vérifiez que la clé API Gemini est configurée

---

## Checklist de test

### Test rapide (sans déploiement)
- [ ] Le serveur dev est lancé
- [ ] Je peux me connecter à l'application
- [ ] Le bouton "+" ouvre l'overlay d'ajout
- [ ] L'option "Depuis une photo" est visible
- [ ] Je vois deux boutons : "Prendre une photo" et "Choisir une photo"
- [ ] "Prendre une photo" ouvre la caméra/webcam
- [ ] "Choisir une photo" ouvre la galerie
- [ ] Je peux ajouter une recette avec les deux méthodes

### Test complet (avec déploiement)
- [ ] La fonction `scrape-recipe` est déployée
- [ ] L'application est installée en PWA
- [ ] "À la carte" apparaît dans le menu de partage
- [ ] Je peux partager une recette depuis Marmiton
- [ ] L'extraction fonctionne correctement
- [ ] Je peux éditer et sauvegarder la recette partagée

---

## Support

Si vous rencontrez des problèmes :

1. **Vérifiez les logs du serveur dev** dans le terminal
2. **Vérifiez la console du navigateur** (F12 → Console)
3. **Vérifiez les logs Supabase** : `supabase functions logs scrape-recipe`
4. **Consultez les fichiers de documentation** :
   - `NOUVELLES_FONCTIONNALITES.md` - Description des fonctionnalités
   - `GUIDE_DEPLOIEMENT.md` - Guide de déploiement détaillé
   - `RESUME_MODIFICATIONS.md` - Résumé technique complet

Bon test ! 🎉
