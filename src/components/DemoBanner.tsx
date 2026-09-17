import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const DemoBanner = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (
    user ||
    location.pathname.startsWith("/shared/") ||
    location.pathname.startsWith("/share/")
  ) {
    return null;
  }

  return (
    <div className="bg-primary/10 border-b border-primary/20 px-4 py-2 text-xs flex items-center justify-between sticky top-0 z-40 backdrop-blur-md print:hidden">
      <div className="flex items-center gap-2 font-medium text-foreground">
        <Sparkles className="w-4 h-4 text-accent shrink-0 animate-pulse" />
        <span className="truncate">
          <strong className="font-semibold">Mode Démo</strong> · 108 recettes publiques en libre accès
        </span>
      </div>
      <Button
        size="sm"
        variant="default"
        className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90 px-3 shrink-0 ml-2 font-medium shadow-sm"
        onClick={() => navigate("/auth", { state: { isSignup: true } })}
      >
        Créer un compte <ArrowRight className="w-3 h-3 ml-1" />
      </Button>
    </div>
  );
};
