import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState, Suspense, lazy } from "react";
import { BottomNav } from "./components/BottomNav";
import { DesktopNav } from "./components/DesktopNav";
import ScrollToTop from "./components/ScrollToTop";
import { AuthProvider } from "./hooks/useAuth";
import { AnimatedRoutes } from "./components/AnimatedRoutes";
import { DataPrefetcher } from "./components/DataPrefetcher";
import { ErrorBoundary } from "./components/ErrorBoundary";

const Onboarding = lazy(() => import("./pages/Onboarding"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes (plus long pour éviter les refetchs inutiles)
      gcTime: 1000 * 60 * 60 * 24, // 24 heures de cache en mémoire
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

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
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ScrollToTop />
            <AuthProvider>
              <DataPrefetcher />
              <div className="w-full bg-background min-h-screen relative overflow-x-hidden flex flex-col">
                <DesktopNav />
                <div className="flex-1 w-full max-w-7xl mx-auto pb-safe">
                  <Suspense fallback={
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                  }>
                    <AnimatedRoutes />
                  </Suspense>
                </div>
                <BottomNav />
              </div>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
