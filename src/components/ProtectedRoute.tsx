import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth();
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
        (location.pathname === "/" ||
            location.pathname === "/recipes" ||
            location.pathname.startsWith("/recipe/")) &&
        !location.pathname.startsWith("/recipes/add") &&
        !location.pathname.startsWith("/recipes/edit") &&
        !location.pathname.startsWith("/recipes/new-method") &&
        !location.pathname.startsWith("/recipes/share");

    if (isPublicPath) {
        return <>{children}</>;
    }

    const redirectPath = `/auth?mode=signup${location.pathname !== "/" ? `&redirectTo=${encodeURIComponent(location.pathname + location.search)}` : ""}`;
    return <Navigate to={redirectPath} state={{ isSignup: true }} replace />;
};
