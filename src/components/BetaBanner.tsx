import { useState, useEffect } from "react";
import { FlaskConical, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isBetaEnvironment, getProductionUrl } from "@/utils/environment";

export const BetaBanner = () => {
  const [isBeta, setIsBeta] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    setIsBeta(isBetaEnvironment());
    setIsDismissed(sessionStorage.getItem("hideBetaBanner") === "true");
  }, []);

  if (!isBeta || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    sessionStorage.setItem("hideBetaBanner", "true");
    setIsDismissed(true);
  };

  const handleGoToProduction = () => {
    window.location.href = getProductionUrl();
  };

  return (
    <div className="bg-amber-500/15 border-b border-amber-500/30 text-amber-950 dark:text-amber-200 px-4 py-1.5 text-xs flex items-center justify-between sticky top-0 z-50 backdrop-blur-md print:hidden">
      <div className="flex items-center gap-2 font-medium truncate">
        <FlaskConical className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 animate-pulse" />
        <span className="truncate">
          <strong className="font-semibold">Version Bêta (develop)</strong> · Données réelles partagées
        </span>
      </div>

      <div className="flex items-center gap-1 shrink-0 ml-2">
        <Button
          size="sm"
          variant="outline"
          className="h-6 text-[11px] px-2 border-amber-500/30 hover:bg-amber-500/20 text-amber-950 dark:text-amber-200"
          onClick={handleGoToProduction}
        >
          Prod <ExternalLink className="w-2.5 h-2.5 ml-1" />
        </Button>
        <button
          onClick={handleDismiss}
          className="text-amber-700 hover:text-amber-950 dark:text-amber-300 dark:hover:text-amber-100 p-1 rounded transition-colors"
          title="Masquer le bandeau pour cette session"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
