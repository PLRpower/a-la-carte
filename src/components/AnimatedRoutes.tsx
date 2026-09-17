import { Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ProtectedRoute } from "./ProtectedRoute";

const Home = lazy(() => import("../pages/Home"));
const Recipes = lazy(() => import("../pages/Recipes"));
const RecipeDetail = lazy(() => import("../pages/RecipeDetail"));
const Stock = lazy(() => import("../pages/Stock"));
const ShoppingList = lazy(() => import("../pages/ShoppingList"));
const Profile = lazy(() => import("../pages/Profile"));
const Auth = lazy(() => import("../pages/Auth"));
const ProfileEdit = lazy(() => import("../pages/ProfileEdit"));
const Preferences = lazy(() => import("../pages/Preferences"));
const AddIngredient = lazy(() => import("../pages/AddIngredient"));
const EditIngredient = lazy(() => import("../pages/EditIngredient"));
const RecipeAdd = lazy(() => import("../pages/RecipeAdd"));
const RecipeAddMethod = lazy(() => import("../pages/RecipeAddMethod"));
const RecipeEdit = lazy(() => import("../pages/RecipeEdit"));
const RecipeShare = lazy(() => import("../pages/RecipeShare"));
const RecipeShareInstructions = lazy(() => import("../pages/RecipeShareInstructions"));
const FavoriteRecipes = lazy(() => import("../pages/FavoriteRecipes"));
const Premium = lazy(() => import("../pages/Premium"));
const PremiumSuccess = lazy(() => import("../pages/PremiumSuccess"));
const NotFound = lazy(() => import("../pages/NotFound"));
const Family = lazy(() => import("../pages/Family"));
const UpdatePassword = lazy(() => import("../pages/UpdatePassword"));
const MealPlanner = lazy(() => import("../pages/MealPlanner"));
const SharedRecipe = lazy(() => import("../pages/SharedRecipe"));

export const AnimatedRoutes = () => {
    const location = useLocation();

    return (
        <div className="w-full min-h-screen">
            <Suspense fallback={null}>
                <Routes location={location}>
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/update-password" element={<UpdatePassword />} />
                    <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                    <Route path="/recipes" element={<ProtectedRoute><Recipes /></ProtectedRoute>} />
                    <Route path="/recipe/:id" element={<ProtectedRoute><RecipeDetail /></ProtectedRoute>} />
                    <Route path="/stock" element={<ProtectedRoute><Stock /></ProtectedRoute>} />
                    <Route path="/stock/add" element={<ProtectedRoute><AddIngredient /></ProtectedRoute>} />
                    <Route path="/stock/edit/:id" element={<ProtectedRoute><EditIngredient /></ProtectedRoute>} />
                    <Route path="/shopping-list" element={<ProtectedRoute><ShoppingList /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/profile/edit" element={<ProtectedRoute><ProfileEdit /></ProtectedRoute>} />
                    <Route path="/profile/preferences" element={<ProtectedRoute><Preferences /></ProtectedRoute>} />
                    <Route path="/recipes/add" element={<ProtectedRoute><RecipeAdd /></ProtectedRoute>} />
                    <Route path="/recipes/new-method" element={<ProtectedRoute><RecipeAddMethod /></ProtectedRoute>} />
                    <Route path="/recipes/edit/:id" element={<ProtectedRoute><RecipeEdit /></ProtectedRoute>} />
                    <Route path="/recipes/share" element={<ProtectedRoute><RecipeShare /></ProtectedRoute>} />
                    <Route path="/recipes/share-instructions" element={<ProtectedRoute><RecipeShareInstructions /></ProtectedRoute>} />
                    <Route path="/profile/favorites" element={<ProtectedRoute><FavoriteRecipes /></ProtectedRoute>} />
                    <Route path="/premium" element={<ProtectedRoute><Premium /></ProtectedRoute>} />
                    <Route path="/premium/success" element={<ProtectedRoute><PremiumSuccess /></ProtectedRoute>} />
                    <Route path="/family" element={<ProtectedRoute><Family /></ProtectedRoute>} />
                    <Route path="/planning" element={<ProtectedRoute><MealPlanner /></ProtectedRoute>} />
                    <Route path="/meal-planner" element={<ProtectedRoute><MealPlanner /></ProtectedRoute>} />
                    <Route path="/shared/recipe/:id" element={<SharedRecipe />} />
                    <Route path="/share/recipe/:id" element={<SharedRecipe />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Suspense>
        </div>
    );
};
