import { useLocation, useNavigate, Link } from "react-router-dom";
import { Home, BookOpen, ShoppingCart, Carrot, User, CalendarDays, Plus, Users } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { to: "/", icon: Home, label: "Accueil" },
  { to: "/planning", icon: CalendarDays, label: "Planning" },
  { to: "/recipes", icon: BookOpen, label: "Recettes" },
  { to: "/shopping-list", icon: ShoppingCart, label: "Courses" },
  { to: "/stock", icon: Carrot, label: "Stock" },
];

export const DesktopNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
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

  const prefetchFor = (to: string) => {
    if (!user) return;
    if (to === "/planning") queryClient.prefetchQuery({ queryKey: ["meal-plans"] });
    if (to === "/recipes") queryClient.prefetchQuery({ queryKey: ["recipes"] });
    if (to === "/stock") queryClient.prefetchQuery({ queryKey: ["stock"] });
    if (to === "/shopping-list") queryClient.prefetchQuery({ queryKey: ["shopping-list"] });
  };

  const isActive = (to: string) => {
    if (to === "/") return location.pathname === "/";
    return location.pathname.startsWith(to);
  };

  return (
    <nav className="hidden md:block sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/80 print:hidden transition-colors">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 shrink-0 group">
          <img
            src="/logo-transparent.png"
            alt="À la carte"
            className="w-9 h-9 object-contain group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col">
            <span className="font-serif font-bold text-lg text-foreground tracking-tight leading-none">
              À la carte
            </span>
            <span className="text-[10px] text-muted-foreground font-sans">
              Cuisinez, gérez, savourez
            </span>
          </div>
        </Link>

        {/* Navigation links */}
        <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-full border border-border/50">
          {navItems.map((item) => {
            const active = isActive(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onMouseEnter={() => prefetchFor(item.to)}
                onPointerDown={() => prefetchFor(item.to)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  active
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-primary-foreground" : ""}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2.5">
          {user ? (
            <>
              <Button
                size="sm"
                className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs font-semibold h-9 px-3.5 rounded-full shadow-xs gap-1.5"
                onClick={() => navigate("/recipes/new-method")}
              >
                <Plus className="w-4 h-4" />
                <span>Recette</span>
              </Button>

              <Link
                to="/family"
                className={`p-2 rounded-full hover:bg-muted/80 transition-colors text-muted-foreground hover:text-foreground ${
                  location.pathname === "/family" ? "text-primary bg-muted" : ""
                }`}
                title="Ma famille"
              >
                <Users className="w-5 h-5" />
              </Link>

              <Link
                to="/profile"
                className="flex items-center gap-2 p-1 rounded-full hover:bg-muted/80 transition-colors"
                title="Mon profil"
              >
                <Avatar className="w-8 h-8 border border-border">
                  {profile?.avatar_url ? (
                    <AvatarImage src={profile.avatar_url} />
                  ) : (
                    <AvatarFallback className="bg-accent text-accent-foreground text-xs font-bold">
                      {profile?.first_name?.[0] ||
                        profile?.last_name?.[0] ||
                        user?.email?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
                    </AvatarFallback>
                  )}
                </Avatar>
              </Link>
            </>
          ) : (
            <Button
              size="sm"
              className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs font-semibold h-9 px-4 rounded-full shadow-xs"
              onClick={() => navigate("/auth?mode=signup", { state: { isSignup: true } })}
            >
              Créer un compte
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};
