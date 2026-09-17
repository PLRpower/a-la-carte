import { Home, BookOpen, ShoppingCart, Carrot, User, CalendarDays } from "lucide-react";
import { useLocation } from "react-router-dom";
import { NavLink } from "./NavLink";
import { useQueryClient } from "@tanstack/react-query";

const navItems = [
  { to: "/", icon: Home, label: "Accueil" },
  { to: "/planning", icon: CalendarDays, label: "Planning" },
  { to: "/recipes", icon: BookOpen, label: "Recettes" },
  { to: "/shopping-list", icon: ShoppingCart, label: "Courses" },
  { to: "/stock", icon: Carrot, label: "Stock" },
  { to: "/profile", icon: User, label: "Profil" },
];

export const BottomNav = () => {
  const location = useLocation();
  const queryClient = useQueryClient();

  if (
    location.pathname === "/auth" ||
    location.pathname.startsWith("/shared/") ||
    location.pathname.startsWith("/share/")
  ) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#fff8f6] dark:bg-card border-t border-border z-40 pb-safe print:hidden">
      <div className="flex items-center justify-around h-16 max-w-2xl mx-auto px-2 relative">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex flex-col items-center justify-center flex-1 py-2 px-1 text-muted-foreground transition-colors"
            activeClassName="text-primary"
            onPointerDown={() => {
              // Pre-fetch data for the section the user is about to click
              // PointerDown triggers as soon as the finger touches the screen, 
              // giving a small head start before the navigation click completes.
              if (item.to === "/planning") queryClient.prefetchQuery({ queryKey: ['meal-plans'] });
              if (item.to === "/recipes") queryClient.prefetchQuery({ queryKey: ['recipes'] });
              if (item.to === "/stock") queryClient.prefetchQuery({ queryKey: ['stock'] });
              if (item.to === "/shopping-list") queryClient.prefetchQuery({ queryKey: ['shopping-list'] });
            }}
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-5 h-5 mb-1 ${isActive ? "text-primary" : ""}`} />
                <span className="text-xs font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
