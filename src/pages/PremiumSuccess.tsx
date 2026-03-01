import { useEffect } from "react";
import { Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
export default function PremiumSuccess() {
    const navigate = useNavigate();
    const { refetch } = useProfile();

    useEffect(() => {
        // Force refresh to update subscription status
        refetch();
    }, [refetch]);

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex flex-col pt-12 pb-24 px-6 items-center justify-center text-center">
            <div className="flex justify-center mb-8 relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
                <div className="w-24 h-24 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-2xl relative z-10 border-4 border-white dark:border-neutral-800">
                    <Sparkles className="w-12 h-12" />
                </div>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-primary">Merci pour votre soutien !</h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto mb-10 leading-relaxed">
                Vous faites désormais partie de l'expérience <span className="font-semibold text-foreground">À la carte Premium</span>.
                Votre compte a été surclassé avec succès.
            </p>

            <div className="bg-white dark:bg-neutral-800 rounded-3xl p-6 shadow-sm border border-neutral-100 dark:border-neutral-700 w-full max-w-sm mb-10 text-left">
                <h2 className="font-semibold mb-4 text-foreground">Ce qui vient d'être débloqué :</h2>
                <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-neutral-600 dark:text-neutral-300">Génération infinie de recettes par IA</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-neutral-600 dark:text-neutral-300">Partage de votre compte avec toute votre famille</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-neutral-600 dark:text-neutral-300">Import des recettes web et photo illimité</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-neutral-600 dark:text-neutral-300">Soutien direct à un développeur indépendant ❤️</span>
                    </li>
                </ul>
            </div>

            <Button
                onClick={() => navigate('/')}
                className="w-full max-w-sm h-14 text-base font-semibold shadow-xl hover:-translate-y-1 transition-transform"
            >
                Commencer à cuisiner
                <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <Button
                variant="ghost"
                onClick={() => navigate('/profile')}
                className="mt-4 text-muted-foreground w-full max-w-sm"
            >
                Voir mon profil
            </Button>
        </div>
    );
}
