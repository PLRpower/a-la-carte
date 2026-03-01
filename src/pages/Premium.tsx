import { useState, useEffect } from "react";
import { ArrowLeft, Check, Sparkles, Zap, Users, Camera, Globe, ChefHat, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Premium = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { profile, loading, refetch } = useProfile();
    const [isAnnual, setIsAnnual] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const isPremium = profile?.subscription_status === 'active';

    useEffect(() => {
        if (isPremium && !loading) {
            navigate("/profile", { replace: true });
            return;
        }

        if (searchParams.get("canceled")) {
            toast.info("Paiement annulé. Vous n'avez pas été débité.");
            navigate("/premium", { replace: true });
        }
    }, [searchParams, navigate, isPremium, loading]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (isPremium) {
        return null;
    }

    // Prices
    const monthlyPrice = "4,80";
    const annualPrice = "42"; // 42€ per year ~ 3.50€/month
    const equivalentMonthlyPrice = "3,50";

    const handleSubscribe = async () => {
        setIsLoading(true);
        try {
            if (isPremium) {
                // User is already premium, redirect to Stripe Billing Portal to manage subscription
                const { data, error } = await supabase.functions.invoke('create-portal-session', {
                    body: { returnUrl: window.location.origin + '/profile' }
                });

                if (error) {
                    let errMsg = error.message;
                    if (error.context) {
                        try {
                            const bodyText = await error.context.text();
                            const bodyJson = JSON.parse(bodyText);
                            errMsg = bodyJson.error || bodyJson.message || errMsg;
                        } catch (e) {/* intentionally empty */}
                    }
                    throw new Error(errMsg);
                }
                if (data?.url) {
                    window.location.href = data.url;
                }
            } else {
                // User is not premium, redirect to Stripe Checkout
                // NOTE: Replace these with your actual Stripe Price IDs from the dashboard
                const priceId = isAnnual
                    ? import.meta.env.VITE_STRIPE_PRICE_ANNUAL
                    : import.meta.env.VITE_STRIPE_PRICE_MONTHLY;

                if (!priceId) {
                    toast.error("Configuration Stripe manquante. (VITE_STRIPE_PRICE_...)");
                    setIsLoading(false);
                    return;
                }

                const { data, error } = await supabase.functions.invoke('create-checkout-session', {
                    body: {
                        priceId,
                        successUrl: window.location.origin + '/premium/success',
                        cancelUrl: window.location.origin + '/premium?canceled=true',
                        mode: 'subscription'
                    }
                });

                if (error) {
                    let errMsg = error.message;
                    if (error.context) {
                        try {
                            const bodyText = await error.context.text();
                            const bodyJson = JSON.parse(bodyText);
                            errMsg = bodyJson.error || bodyJson.message || errMsg;
                        } catch (e) {
                            console.error("Failed to parse error context", e);
                        }
                    }
                    throw new Error(errMsg);
                }
                if (data?.url) {
                    window.location.href = data.url;
                }
            }
        } catch (error: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
            console.error(error);
            toast.error(error.message || "Une erreur est survenue avec le paiement.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="pb-20 min-h-screen bg-neutral-50 dark:bg-neutral-900">
            <header className="bg-gradient-to-b from-primary to-primary/80 text-primary-foreground pt-8 pb-12 px-6 rounded-b-[2.5rem] relative overflow-hidden shadow-xl">
                {/* Decorative background elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
                    <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-accent/30 blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 -left-12 w-64 h-64 rounded-full bg-white/20 blur-3xl"></div>
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-primary-foreground hover:bg-white/20 -ml-2"
                            onClick={() => navigate(-1)}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Star className="w-6 h-6 fill-accent text-accent" />
                            Abonnement Premium
                        </h1>
                    </div>
                    <p className="text-primary-foreground/90 text-sm leading-relaxed max-w-md">
                        Passez au niveau supérieur avec l'abonnement Premium. Cuisinez sans limites, et libérez toute la puissance de l'application. Partagez vos recettes et votre liste de courses avec vos proches, scannez des recettes par photo en illimité, et bien plus encore.
                    </p>
                </div>
            </header>

            <main className="px-6 -mt-6 relative z-20 space-y-8">

                {/* Toggle Billing */}
                <div className="flex items-center justify-center gap-3 bg-white dark:bg-background p-3 rounded-full shadow-sm mx-auto max-w-sm border">
                    <span className={`text-sm font-medium ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>Mensuel</span>
                    <Switch
                        checked={isAnnual}
                        onCheckedChange={setIsAnnual}
                        className="data-[state=checked]:bg-primary"
                    />
                    <span className={`text-sm font-medium flex items-center gap-1 ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                        Annuel
                        <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-1.5 py-0 text-[10px]">
                            -30%
                        </Badge>
                    </span>
                </div>

                {/* Pricing Cards */}
                <div className="grid gap-6 md:grid-cols-[0.45fr_0.55fr] items-start max-w-2xl mx-auto">

                    {/* Free Plan */}
                    <Card className="border-muted bg-white/50 dark:bg-background/50 relative overflow-hidden">
                        <CardHeader>
                            <CardTitle className="text-xl">Basique</CardTitle>
                            <CardDescription>Pour cuisiner au quotidien.</CardDescription>
                            <div className="mt-4 flex items-baseline text-2xl font-bold text-black dark:text-white">
                                0 €
                                <span className="ml-1 text-base font-medium text-muted-foreground">/ mois</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                <li className="flex gap-3 text-sm">
                                    <Check className="w-5 h-5 shrink-0" />
                                    <span>Recettes, stock et liste de courses illimités</span>
                                </li>
                                <li className="flex gap-3 text-sm text-muted-foreground">
                                    <Sparkles className="w-5 h-5 shrink-0 opacity-50" />
                                    <span>2 Inspirations du Chef par mois</span>
                                </li>
                                <li className="flex gap-3 text-sm text-muted-foreground">
                                    <Camera className="w-5 h-5 shrink-0 opacity-50" />
                                    <span>2 Scans photo de recettes par mois</span>
                                </li>
                                <li className="flex gap-3 text-sm text-muted-foreground">
                                    <Globe className="w-5 h-5 shrink-0 opacity-50" />
                                    <span>2 Imports Web par mois</span>
                                </li>
                                <li className="flex gap-3 text-sm text-muted-foreground opacity-50 line-through">
                                    <Users className="w-5 h-5 shrink-0" />
                                    <span>Pas de partage en famille</span>
                                </li>
                            </ul>
                        </CardContent>
                        <div className="p-6 pt-0 mt-auto">
                            <Button className="w-full" variant="outline" disabled={!isPremium && profile !== null}>
                                {isPremium ? "Passer à l'offre gratuite" : "Votre offre actuelle"}
                            </Button>
                        </div>
                    </Card>

                    {/* Premium Plan */}
                    <Card className="border-accent/20 shadow-2xl relative overflow-hidden ring-1 ring-accent/50 bg-white dark:bg-card transform transition-all hover:scale-[1.02]">
                        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent pointer-events-none" />

                        {/* Best Value Badge */}
                        {isAnnual && (
                            <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-[10px] font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-widest shadow-sm">
                                Le plus populaire
                            </div>
                        )}
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl flex items-center gap-2">
                                    <Star className="w-6 h-6 fill-accent text-accent" />
                                    Premium
                                </CardTitle>
                            </div>
                            <CardDescription className="text-base font-medium text-foreground/70">L'expérience ultime sans aucune limite.</CardDescription>
                            <div className="mt-6 flex flex-col">
                                <div className="flex items-baseline text-3xl font-bold text-black dark:text-white tracking-tight">
                                    {isAnnual ? equivalentMonthlyPrice : monthlyPrice} €
                                    <span className="ml-1 text-base font-medium text-muted-foreground whitespace-nowrap">/ mois</span>
                                </div>
                                {isAnnual && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Facturé {annualPrice} € par an.
                                    </p>
                                )}
                                {!isAnnual && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Facturé {monthlyPrice} € tous les mois.
                                    </p>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <ul className="space-y-4">
                                <li className="flex gap-3 text-sm font-semibold text-foreground italic">
                                    <Sparkles className="w-5 h-5 text-accent shrink-0" />
                                    <span>Toutes les fonctionnalités Basics</span>
                                </li>
                                <li className="flex gap-3 text-sm items-center">
                                    <div className="p-1 rounded-full bg-accent/10 border border-accent/20">
                                        <Users className="w-4 h-4 text-accent shrink-0" />
                                    </div>
                                    <span><strong className="font-bold">Partage en Famille</strong> illimité</span>
                                </li>
                                <li className="flex gap-3 text-sm items-center">
                                    <div className="p-1 rounded-full bg-accent/10 border border-accent/20">
                                        <ChefHat className="w-4 h-4 text-accent shrink-0" />
                                    </div>
                                    <span><strong className="font-bold">Inspiration du Chef IA</strong> illimitée</span>
                                </li>
                                <li className="flex gap-3 text-sm items-center">
                                    <div className="p-1 rounded-full bg-accent/10 border border-accent/20">
                                        <Camera className="w-4 h-4 text-accent shrink-0" />
                                    </div>
                                    <span><strong className="font-bold">Scan photo</strong> illimité</span>
                                </li>
                                <li className="flex gap-3 text-sm items-center">
                                    <div className="p-1 rounded-full bg-accent/10 border border-accent/20">
                                        <Globe className="w-4 h-4 text-accent shrink-0" />
                                    </div>
                                    <span><strong className="font-bold">Import Web</strong> illimité</span>
                                </li>
                                <li className="flex gap-3 text-sm items-center">
                                    <div className="p-1 rounded-full bg-accent/10 border border-accent/20">
                                        <Zap className="w-4 h-4 text-accent shrink-0" />
                                    </div>
                                    <span>Support client dédié</span>
                                </li>
                            </ul>
                        </CardContent>
                        <div className="p-6 pt-2 mt-auto relative z-10">
                            <Button
                                className="w-full text-lg font-bold h-14 shadow-xl bg-accent hover:bg-accent/90 text-accent-foreground border-b-4 border-accent-foreground/20 active:border-b-0 active:translate-y-1 transition-all"
                                onClick={handleSubscribe}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                ) : (
                                    <Zap className="w-5 h-5 mr-2 fill-current" />
                                )}
                                {isPremium ? "Gérer mon abonnement" : "Passer au Premium"}
                            </Button>
                        </div>

                        <div className="absolute -bottom-6 -right-6 opacity-5 pointer-events-none">
                            <Star className="w-32 h-32 fill-primary text-primary" />
                        </div>
                    </Card>

                </div>

                {/* Trust features */}
                <div className="text-center pb-8 border-t pt-8">
                    <p className="text-sm text-muted-foreground mb-4">
                        Paiement sécurisé par <strong>Stripe</strong>. Annulable à tout moment.
                    </p>
                    <div className="flex justify-center flex-wrap gap-4 text-xs font-medium text-muted-foreground/80">
                        <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Sans engagement</span>
                        <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Mises à jour incluses</span>
                        <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Support client</span>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default Premium;
