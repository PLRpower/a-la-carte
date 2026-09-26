import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Sparkles, BookOpen } from "lucide-react";

interface AuthPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

export const AuthPromptDialog = ({
  open,
  onOpenChange,
  title = "Créez votre compte pour continuer",
  description = "Créez un compte gratuit en 10 secondes pour ajouter des recettes à votre carnet personnel, gérer vos ingrédients et planifier vos courses."
}: AuthPromptDialogProps) => {
  const navigate = useNavigate();

  const handleSignup = () => {
    onOpenChange(false);
    navigate("/auth?mode=signup", { state: { isSignup: true } });
  };

  const handleSignin = () => {
    onOpenChange(false);
    navigate("/auth");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center sm:text-left">
          <div className="w-12 h-12 rounded-full bg-accent/15 flex items-center justify-center mb-2 mx-auto sm:mx-0 text-accent">
            <Sparkles className="w-6 h-6" />
          </div>
          <DialogTitle className="text-lg font-bold">{title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground pt-1">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <Button onClick={handleSignup} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
            Créer un compte gratuit
          </Button>
          <Button onClick={handleSignin} variant="outline" className="w-full">
            Déjà inscrit ? Se connecter
          </Button>
        </div>

        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant="ghost"
            className="w-full text-xs text-muted-foreground hover:text-foreground"
            onClick={() => onOpenChange(false)}
          >
            Continuer à explorer en mode démo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
