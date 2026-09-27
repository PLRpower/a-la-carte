import { Home, BookOpen, Carrot, CalendarDays, User } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { to: "/", icon: Home, label: "Accueil" },
  { to: "/planning", icon: CalendarDays, label: "Planning" },
  { to: "/recipes", icon: BookOpen, label: "Recettes" },
  { to: "/stock", icon: Carrot, label: "Stock" },
  { to: "/profile", icon: User, label: "Profil" },
];

export const BottomNav = () => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { profile } = useProfile();

  if (
    location.pathname === "/auth" ||
    location.pathname.startsWith("/shared/") ||
    location.pathname.startsWith("/share/")
  ) {
    return null;
  }

  const isItemActive = (to: string) => {
    if (to === "/") return location.pathname === "/";
    if (to === "/planning") {
      return location.pathname.startsWith("/planning") || location.pathname.startsWith("/meal-planner");
    }
    if (to === "/recipes") {
      return location.pathname.startsWith("/recipes") || location.pathname.startsWith("/recipe");
    }
    if (to === "/stock") {
      return location.pathname.startsWith("/stock") || location.pathname.startsWith("/shopping-list");
    }
    if (to === "/profile") {
      return (
        location.pathname.startsWith("/profile") ||
        location.pathname === "/family" ||
        location.pathname.startsWith("/feedback")
      );
    }
    return location.pathname.startsWith(to);
  };

  const handlePrefetch = (to: string) => {
    if (!user) return;
    if (to === "/planning") queryClient.prefetchQuery({ queryKey: ["meal-plans"] });
    if (to === "/recipes") queryClient.prefetchQuery({ queryKey: ["recipes"] });
    if (to === "/stock") {
      queryClient.prefetchQuery({ queryKey: ["stock"] });
      queryClient.prefetchQuery({ queryKey: ["shopping-list"] });
    }
    if (to === "/profile") {
      queryClient.prefetchQuery({ queryKey: ["profile"] });
    }
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#fff8f6] dark:bg-card border-t border-border z-40 pb-safe print:hidden">
      <div className="flex items-center justify-around h-16 max-w-2xl mx-auto px-2 relative">
        {navItems.map((item) => {
          const active = isItemActive(item.to);
          const Icon = item.icon;

          return (
            <Link
              key={item.to}
              to={item.to}
              onPointerDown={() => handlePrefetch(item.to)}
              className={`flex flex-col items-center justify-center flex-1 py-2 px-1 transition-colors ${
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.to === "/profile" && profile?.avatar_url ? (
                <Avatar className={`w-5 h-5 mb-1 ${active ? "ring-2 ring-primary ring-offset-1" : ""}`}>
                  <AvatarImage src={profile.avatar_url} alt={`Profil de ${profile?.first_name || 'l\'utilisateur'}`} />
                  <AvatarFallback className="text-[9px] font-bold">
                    {profile?.first_name?.[0] || profile?.last_name?.[0] || "P"}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <Icon className={`w-5 h-5 mb-1 ${active ? "text-primary" : ""}`} />
              )}
              <span className={`text-xs ${active ? "font-semibold text-primary" : "font-medium"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
