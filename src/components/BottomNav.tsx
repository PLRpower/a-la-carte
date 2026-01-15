import { Home, BookOpen, ShoppingCart, Carrot, User } from "lucide-react";
import { useLocation } from "react-router-dom";
import { NavLink } from "./NavLink";

const navItems = [
  { to: "/", icon: Home, label: "Accueil" },
  { to: "/recipes", icon: BookOpen, label: "Recettes" },
  { to: "/shopping-list", icon: ShoppingCart, label: "Courses" },
  { to: "/stock", icon: Carrot, label: "Ingrédients" },
  { to: "/profile", icon: User, label: "Profil" },
];

export const BottomNav = () => {
  const location = useLocation();

  if (location.pathname === "/auth") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#fff8f6] dark:bg-card border-t border-border z-40 pb-safe">
      <div className="flex items-center justify-around h-16 max-w-2xl mx-auto px-2 relative">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex flex-col items-center justify-center flex-1 py-2 px-1 text-muted-foreground transition-colors"
            activeClassName="text-primary"
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
