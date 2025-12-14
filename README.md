# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/9dc897a8-7963-42d1-aa2e-967b96626335

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/9dc897a8-7963-42d1-aa2e-967b96626335) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## ✨ Nouvelles fonctionnalités (Décembre 2024)

### 🌐 Partage de recettes depuis le web
Partagez des recettes depuis n'importe quel site web directement vers votre application ! L'IA extrait automatiquement les ingrédients et les instructions.

**⚠️ Important :** Le partage web nécessite :
- ✅ Une URL HTTPS de production (ex: https://votre-app.com)
- ✅ L'application installée en tant que PWA
- ❌ Ne fonctionne PAS avec localhost ou IP locale

**Comment l'utiliser :**
1. Déployez l'application en production (voir section déploiement)
2. Installez l'application en tant que PWA depuis l'URL de production
3. Sur un site de recettes, appuyez sur "Partager"
4. Sélectionnez "À la carte"
5. La recette est automatiquement importée !

### 📸 Capture photo directe
Ajoutez des recettes en prenant une photo directement avec votre appareil photo, sans passer par la galerie.

**Comment l'utiliser :**
1. Appuyez sur "+" pour ajouter une recette
2. Sélectionnez "Depuis une photo"
3. Choisissez "Prendre une photo" pour ouvrir l'appareil photo
4. L'IA scanne et extrait la recette !

**📚 Documentation complète :**
- [**SOLUTION PARTAGE MOBILE**](SOLUTION_PARTAGE_MOBILE.md) - ⚡ Guide rapide si le partage ne fonctionne pas
- [Diagnostic partage](DIAGNOSTIC_PARTAGE.md) - Dépannage complet
- [Guide de test rapide](GUIDE_TEST_RAPIDE.md) - Testez les nouvelles fonctionnalités
- [Guide de déploiement](GUIDE_DEPLOIEMENT.md) - Déployez la fonction Edge
- [Nouvelles fonctionnalités](NOUVELLES_FONCTIONNALITES.md) - Documentation détaillée
- [Résumé des modifications](RESUME_MODIFICATIONS.md) - Détails techniques

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/9dc897a8-7963-42d1-aa2e-967b96626335) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
