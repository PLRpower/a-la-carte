# 🔍 Diagnostic - Partage Web ne fonctionne pas

## Problème
Le partage web ne s'affiche pas sur mobile même après réinstallation de la PWA.

## Solutions appliquées

### 1. ✅ Correction de la configuration du manifest

**Changements apportés dans `vite.config.ts` :**
- ✅ Ajout de `scope: '/'` - Définit la portée de l'application
- ✅ Ajout de `categories: ['food', 'lifestyle', 'utilities']` - Aide le système à catégoriser l'app
- ✅ Configuration `share_target` maintenue avec les bons paramètres

### 2. 🔄 Étapes de déploiement OBLIGATOIRES

Pour que les changements soient pris en compte, vous DEVEZ :

#### A. Reconstruire l'application

```bash
# Arrêter le serveur dev (Ctrl+C)
# Puis reconstruire
npm run build
```

OU si vous utilisez le mode dev, redémarrez le serveur :

```bash
# Arrêter le serveur (Ctrl+C)
npm run dev
```

#### B. Déployer sur votre serveur de production

Si vous testez en production (pas en localhost), vous devez déployer la nouvelle version :

```bash
# Exemple avec Lovable
# Allez sur https://lovable.dev et cliquez sur "Publish"

# OU si vous utilisez un autre service
npm run build
# Puis déployez le dossier dist/
```

#### C. Désinstaller complètement l'ancienne PWA

**Sur Android (Chrome) :**
1. Allez dans Paramètres → Applications
2. Trouvez "À la carte"
3. Appuyez sur "Désinstaller"
4. OU : Maintenez l'icône de l'app → "Désinstaller"

**Sur iOS (Safari) :**
1. Maintenez l'icône de l'app sur l'écran d'accueil
2. Appuyez sur "Supprimer l'app"
3. Confirmez

#### D. Vider le cache du navigateur

**Chrome Android :**
1. Ouvrez Chrome
2. Menu (⋮) → Paramètres → Confidentialité et sécurité
3. Effacer les données de navigation
4. Cochez "Images et fichiers en cache"
5. Effacer

**Safari iOS :**
1. Paramètres → Safari
2. Effacer historique et données de sites web

#### E. Réinstaller la PWA

1. Ouvrez votre application dans le navigateur (URL de production, PAS localhost)
2. Attendez quelques secondes que le nouveau manifest se charge
3. Menu → "Ajouter à l'écran d'accueil"
4. Confirmez l'installation

### 3. 🧪 Vérification du manifest

Avant de réinstaller, vérifiez que le nouveau manifest est bien généré :

**Sur Chrome Android :**
1. Ouvrez votre app dans Chrome
2. Menu (⋮) → Plus d'outils → Outils de développement
3. Onglet "Application"
4. Section "Manifest"
5. Vérifiez que `share_target` est présent avec :
   ```json
   {
     "action": "/recipes/share",
     "method": "GET",
     "params": {
       "title": "title",
       "text": "text",
       "url": "url"
     }
   }
   ```

**Sur Desktop Chrome (pour vérifier avant de tester sur mobile) :**
1. Ouvrez http://localhost:8080 (après redémarrage du serveur)
2. F12 → Application → Manifest
3. Vérifiez la présence de `share_target`

### 4. ⚠️ Points importants

#### Le partage web NE FONCTIONNE PAS avec localhost sur mobile
- ❌ `http://localhost:8080` - Ne fonctionnera PAS pour le partage
- ❌ `http://192.168.x.x:8080` - Ne fonctionnera PAS pour le partage
- ✅ `https://votre-domaine.com` - Fonctionnera

**Pourquoi ?**
Le Web Share Target API nécessite :
- ✅ HTTPS (sauf pour localhost sur desktop)
- ✅ Une PWA installée
- ✅ Un domaine public (pas une IP locale)

#### Solution pour tester en développement

**Option 1 : Utiliser ngrok (recommandé)**
```bash
# Installer ngrok
npm install -g ngrok

# Lancer votre serveur dev
npm run dev

# Dans un autre terminal, créer un tunnel HTTPS
ngrok http 8080

# Utilisez l'URL HTTPS fournie (ex: https://abc123.ngrok.io)
```

**Option 2 : Déployer sur Lovable/Vercel/Netlify**
- Déployez votre application
- Installez la PWA depuis l'URL de production
- Testez le partage

### 5. 🔍 Diagnostic supplémentaire

Si le partage ne fonctionne toujours pas après toutes ces étapes :

#### Vérifier les logs du navigateur
1. Ouvrez l'app dans Chrome
2. Menu → Plus d'outils → Outils de développement
3. Onglet "Console"
4. Essayez de partager une page
5. Regardez s'il y a des erreurs

#### Vérifier que la route existe
1. Ouvrez l'app
2. Allez manuellement sur `/recipes/share?url=https://example.com&title=Test`
3. Vérifiez que la page se charge (même si elle échoue à scraper, elle doit au moins s'afficher)

#### Vérifier la fonction Edge
```bash
# Vérifier que la fonction est déployée
supabase functions list

# Devrait afficher "scrape-recipe" avec un statut actif
```

### 6. 📱 Test final

Une fois tout configuré :

1. **Déployez en production** (Lovable, Vercel, etc.)
2. **Sur mobile, ouvrez l'URL de production** dans Chrome/Safari
3. **Installez la PWA** depuis le menu
4. **Ouvrez un site de recettes** (ex: Marmiton)
5. **Appuyez sur Partager**
6. **"À la carte" devrait apparaître dans la liste**

### 7. 🆘 Si ça ne fonctionne toujours pas

Vérifiez la compatibilité de votre appareil :

**Android :**
- ✅ Chrome 71+ (fonctionne)
- ✅ Edge 79+ (fonctionne)
- ❌ Firefox (ne supporte pas Web Share Target)
- ❌ Samsung Internet (support limité)

**iOS :**
- ⚠️ Safari 15.4+ (support partiel)
- Le Web Share Target est moins bien supporté sur iOS

**Alternative pour iOS :**
Utilisez le bouton "Depuis un site web" dans l'app, qui permet de coller une URL manuellement.

## Checklist de dépannage

- [ ] J'ai reconstruit l'application (`npm run build` ou redémarré `npm run dev`)
- [ ] J'ai déployé la nouvelle version en production
- [ ] J'ai complètement désinstallé l'ancienne PWA
- [ ] J'ai vidé le cache du navigateur
- [ ] J'ai réinstallé la PWA depuis l'URL de production (HTTPS)
- [ ] J'ai vérifié le manifest dans les DevTools (présence de `share_target`)
- [ ] J'utilise Chrome sur Android (meilleure compatibilité)
- [ ] J'ai déployé la fonction Edge `scrape-recipe`
- [ ] J'ai testé la route `/recipes/share` manuellement

## Contact

Si le problème persiste après toutes ces étapes, partagez :
1. La capture d'écran du manifest dans les DevTools
2. Les logs de la console
3. Votre système d'exploitation et navigateur
4. L'URL de votre application en production
