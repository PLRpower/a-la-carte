import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Cookie, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const COOKIE_CONSENT_KEY = "cookieConsentAcknowledged";

export const CookieBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if user hasn't acknowledged yet
    const acknowledged = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!acknowledged) {
      // Small timeout to avoid layout shift on initial load
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcknowledge = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, new Date().toISOString());
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside
      role="region"
      aria-label="Information sur les cookies et la protection des données"
      className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 bg-card/95 backdrop-blur-md border border-border/90 rounded-2xl p-4 shadow-xl text-card-foreground animate-in fade-in slide-in-from-bottom-4 duration-300 print:hidden"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
          <Cookie className="w-5 h-5" aria-hidden="true" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Traceurs essentiels uniquement</h3>
            <button
              onClick={handleAcknowledge}
              className="text-muted-foreground hover:text-foreground p-1 -mr-1 rounded-md"
              aria-label="Fermer l'information sur les cookies"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Nous utilisons uniquement des traceurs strictement nécessaires au fonctionnement de l'application (session, préférences, mode démo). Aucun cookie publicitaire ou de profilage tiers n'est déposé.
          </p>
          <div className="flex items-center justify-between gap-3 pt-1">
            <Link
              to="/cookies"
              className="text-xs text-primary hover:underline font-medium"
            >
              En savoir plus
            </Link>
            <Button
              size="sm"
              onClick={handleAcknowledge}
              className="h-8 text-xs font-semibold px-4 rounded-lg shadow-xs"
            >
              <Check className="w-3.5 h-3.5 mr-1.5" />
              Compris
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
};
