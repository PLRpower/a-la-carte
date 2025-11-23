import { useState } from "react";
import { ChefHat, Package, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const slides = [
  {
    icon: ChefHat,
    title: "Découvrez et cuisinez de délicieuses recettes",
    description: "Parcourez des centaines de recettes et trouvez votre prochain plat préféré.",
  },
  {
    icon: Package,
    title: "Gérez vos ingrédients facilement",
    description: "Suivez votre garde-manger et ne manquez jamais d'ingrédient.",
  },
  {
    icon: User,
    title: "Personnalisez votre expérience culinaire",
    description: "Sauvegardez vos favoris, ajustez les portions et cuisinez à votre façon.",
  },
];

interface OnboardingProps {
  onComplete?: () => void;
}

const Onboarding = ({ onComplete }: OnboardingProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    handleGetStarted();
  };

  const handleGetStarted = () => {
    localStorage.setItem("onboardingCompleted", "true");
    if (onComplete) {
      onComplete();
    }
    navigate("/auth");
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-6 bg-background">
      <div className="w-full flex justify-end">
        {currentSlide < slides.length - 1 && (
          <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground">
            Passer
          </Button>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md">
        <div className="w-32 h-32 mb-8 rounded-full bg-accent/10 flex items-center justify-center">
          <Icon className="w-16 h-16 text-accent" />
        </div>
        <h1 className="text-2xl font-bold mb-3 text-foreground">{slide.title}</h1>
        <p className="text-muted-foreground text-base">{slide.description}</p>
      </div>

      <div className="w-full max-w-md space-y-4">
        <div className="flex justify-center gap-2 mb-4">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${index === currentSlide ? "w-8 bg-accent" : "w-2 bg-muted"
                }`}
            />
          ))}
        </div>
        <Button onClick={handleNext} className="w-full" size="lg">
          {currentSlide === slides.length - 1 ? "Commencer" : "Suivant"}
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;
