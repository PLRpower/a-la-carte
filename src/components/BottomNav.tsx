import { useState } from "react";
import { Home, BookOpen, Plus, Carrot, User } from "lucide-react";
import { NavLink } from "./NavLink";
import { AddRecipeOverlay } from "./AddRecipeOverlay";

const navItems = [
  { to: "/", icon: Home, label: "Accueil" },
  { to: "/recipes", icon: BookOpen, label: "Recettes" },
  { to: "/shopping-list", icon: Carrot, label: "Liste de courses" },
  { to: "/profile", icon: User, label: "Profil" },
];

export const BottomNav = () => {
  const [isAddOverlayOpen, setIsAddOverlayOpen] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 pb-safe">
        <div className="flex items-center justify-around h-16 max-w-2xl mx-auto px-2 relative">
          {navItems.slice(0, 2).map((item) => (
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

          {/* Add Button - Centered */}
          <button
            onClick={() => setIsAddOverlayOpen(true)}
            className="flex flex-col items-center justify-center text-muted-foreground flex-1 py-2 px-1 transition-all hover:scale-105 active:scale-95 -mt-6"
          >
            <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center mb-0.5 shadow-sm text-white">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium">Ajouter</span>
          </button>

          {navItems.slice(2).map((item) => (
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

      <AddRecipeOverlay
        isOpen={isAddOverlayOpen}
        onClose={() => setIsAddOverlayOpen(false)}
      />
    </>
  );
};
