import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState, lazy, Suspense } from "react";
import { BottomNav } from "./components/BottomNav";
import ScrollToTop from "./components/ScrollToTop";
import { AuthProvider, useAuth } from "./hooks/useAuth";

const Home = lazy(() => import("./pages/Home"));
const Recipes = lazy(() => import("./pages/Recipes"));
const RecipeDetail = lazy(() => import("./pages/RecipeDetail"));
const Stock = lazy(() => import("./pages/Stock"));
const ShoppingList = lazy(() => import("./pages/ShoppingList"));
const Profile = lazy(() => import("./pages/Profile"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Auth = lazy(() => import("./pages/Auth"));
const ProfileEdit = lazy(() => import("./pages/ProfileEdit"));
const Preferences = lazy(() => import("./pages/Preferences"));
const AddIngredient = lazy(() => import("./pages/AddIngredient"));
const EditIngredient = lazy(() => import("./pages/EditIngredient"));
const RecipeAdd = lazy(() => import("./pages/RecipeAdd"));
const RecipeAddMethod = lazy(() => import("./pages/RecipeAddMethod"));
const RecipeEdit = lazy(() => import("./pages/RecipeEdit"));
const RecipeShare = lazy(() => import("./pages/RecipeShare"));
const RecipeShareInstructions = lazy(() => import("./pages/RecipeShareInstructions"));
const FavoriteRecipes = lazy(() => import("./pages/FavoriteRecipes"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/auth" replace />;
};

const App = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const onboardingCompleted = localStorage.getItem("onboardingCompleted");
    if (!onboardingCompleted) {
      setShowOnboarding(true);
    }
  }, []);

  if (showOnboarding) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={
              <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            }>
              <Routes>
                <Route path="*" element={<Onboarding onComplete={() => setShowOnboarding(false)} />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <AuthProvider>
            <div className="max-w-2xl mx-auto bg-background min-h-screen relative">
              <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              }>
                <Routes>
                  <Route path="/auth" element={<Auth />} />
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
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              <BottomNav />
            </div>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
