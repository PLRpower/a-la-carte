import { useState, useEffect, useCallback } from "react";
import { ChefHat, Package, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";

const slides = [
  {
    icon: ChefHat,
    title: "Découvrez et cuisinez de délicieuses recettes",
    description: "Ajoutez simplement vos recettes préférées et cuisinez en toute simplicité.",
  },
  {
    icon: Package,
    title: "Gérez vos ingrédients facilement",
    description: "Suivez votre stock et ne manquez jamais d'ingrédient.",
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
  const [emblaRef, emblaApi] = useEmblaCarousel();
  const navigate = useNavigate();

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentSlide(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      emblaApi?.scrollNext();
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
    navigate("/auth", { state: { isSignup: true } });
  };

  const scrollTo = (index: number) => {
    emblaApi?.scrollTo(index);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-6 bg-background">
      <div className="w-full flex justify-end">
        {currentSlide < slides.length - 1 && (
          <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground">
            Passer
          </Button>
        )}
      </div>

      {/* Carousel Viewport */}
      <div className="flex-1 w-full max-w-md overflow-hidden flex flex-col justify-center" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((slide, index) => {
            const Icon = slide.icon;
            return (
              <div key={index} className="flex-[0_0_100%] min-w-0 flex flex-col items-center justify-center text-center px-4 h-full">
                <div className="w-32 h-32 mb-8 rounded-full bg-accent/10 flex items-center justify-center">
                  <Icon className="w-16 h-16 text-accent" />
                </div>
                <h1 className="text-2xl font-bold mb-3 text-foreground">{slide.title}</h1>
                <p className="text-muted-foreground text-base">{slide.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-full max-w-md space-y-4 mt-8">
        <div className="flex justify-center gap-2 mb-4">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`h-2 rounded-full transition-all ${index === currentSlide ? "w-8 bg-accent" : "w-2 bg-muted"
                }`}
              aria-label={`Aller à la diapositive ${index + 1}`}
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
