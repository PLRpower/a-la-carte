import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Home from "./pages/Home";
import Recipes from "./pages/Recipes";
import RecipeDetail from "./pages/RecipeDetail";
import Stock from "./pages/Stock";
import ShoppingList from "./pages/ShoppingList";
import Profile from "./pages/Profile";
import Onboarding from "./pages/Onboarding";
import Auth from "./pages/Auth";
import ProfileEdit from "./pages/ProfileEdit";
import Preferences from "./pages/Preferences";
import AddIngredient from "./pages/AddIngredient";
import EditIngredient from "./pages/EditIngredient";
import NotFound from "./pages/NotFound";
import { BottomNav } from "./components/BottomNav";
import { AuthProvider, useAuth } from "./hooks/useAuth";

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
            <Routes>
              <Route path="*" element={<Onboarding onComplete={() => setShowOnboarding(false)} />} />
            </Routes>
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
          <AuthProvider>
            <div className="max-w-2xl mx-auto bg-background min-h-screen relative">
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
                <Route path="*" element={<NotFound />} />
              </Routes>
              <BottomNav />
            </div>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
