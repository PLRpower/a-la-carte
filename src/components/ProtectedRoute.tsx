import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, loading, isDemo } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (user) {
        return <>{children}</>;
    }

    // Public / Demo accessible routes: Home, Recipes catalog, Recipe details
    const isPublicPath =
        location.pathname === "/" ||
        location.pathname.startsWith("/recipes") ||
        location.pathname.startsWith("/recipe/");

    if (isDemo || isPublicPath) {
        // Disallow private creation/editing routes in demo mode
        const isRestrictedPath =
            location.pathname.startsWith("/recipes/add") ||
            location.pathname.startsWith("/recipes/edit") ||
            location.pathname.startsWith("/recipes/new-method") ||
            location.pathname.startsWith("/recipes/share");

        if (!isRestrictedPath) {
            return <>{children}</>;
        }
    }

    return <Navigate to={`/auth${location.search}`} replace />;
};
