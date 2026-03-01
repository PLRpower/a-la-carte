import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { lazy, useState, useEffect, useRef, Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";
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

// Page order for slide direction
const routeOrder = ["/", "/recipes", "/shopping-list", "/stock", "/profile"];

export const AnimatedRoutes = () => {
    const location = useLocation();
    const currentIndex = routeOrder.indexOf(location.pathname);
    const prevIndex = useRef(currentIndex);

    // Only slide if moving between main routes (both indices must be valid)
    const isMainRouteTransition = currentIndex !== -1 && prevIndex.current !== -1 && currentIndex !== prevIndex.current;

    // Calculate direction only if it's a main route transition
    const direction = isMainRouteTransition ? (currentIndex > prevIndex.current ? 1 : -1) : 0;

    // Update ref for next render
    useEffect(() => {
        prevIndex.current = currentIndex;
    }, [currentIndex]);

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? '100%' : direction < 0 ? '-100%' : 0,
            zIndex: 1
        }),
        center: {
            x: 0,
            zIndex: 1
        },
        exit: (direction: number) => ({
            x: direction > 0 ? '-100%' : direction < 0 ? '100%' : 0,
            zIndex: 0
        }),
    };

    return (
        <div className="relative w-full overflow-hidden min-h-screen">
            <AnimatePresence mode="popLayout" custom={direction} initial={false}>
                <motion.div
                    key={location.pathname}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: {
                            type: "tween",
                            ease: "easeOut",
                            duration: direction !== 0 ? 0.25 : 0
                        },
                    }}
                    className="w-full"
                >
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
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </Suspense>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
