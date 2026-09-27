import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Lightbulb,
  Bug,
  MessageSquare,
  Star,
  Send,
  CheckCircle2,
  Loader2,
  Info,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type FeedbackCategory = "suggestion" | "bug" | "general";

interface PastFeedback {
  id: string;
  category: FeedbackCategory;
  message: string;
  rating: number | null;
  status: string;
  created_at: string;
}

const CATEGORIES: {
  id: FeedbackCategory;
  label: string;
  icon: typeof Lightbulb;
  desc: string;
  color: string;
  activeColor: string;
}[] = [
  {
    id: "suggestion",
    label: "Suggestion",
    icon: Lightbulb,
    desc: "Idée d'amélioration ou fonctionnalité",
    color: "text-amber-500",
    activeColor: "border-amber-500 bg-amber-500/10",
  },
  {
    id: "bug",
    label: "Problème",
    icon: Bug,
    desc: "Dysfonctionnement ou bug rencontré",
    color: "text-red-500",
    activeColor: "border-red-500 bg-red-500/10",
  },
  {
    id: "general",
    label: "Avis général",
    icon: MessageSquare,
    desc: "Vos impressions sur l'application",
    color: "text-blue-500",
    activeColor: "border-blue-500 bg-blue-500/10",
  },
];

const RATING_LABELS: Record<number, string> = {
  1: "Très décevant",
  2: "Peut mieux faire",
  3: "Moyen",
  4: "Très bien",
  5: "Excellent !",
};

const getPlaceholders = (cat: FeedbackCategory): string => {
  switch (cat) {
    case "bug":
      return "Décrivez ce qui s'est passé, sur quelle page vous étiez et les étapes pour reproduire le problème...";
    case "suggestion":
      return "Expliquez votre idée, le besoin ou la fonctionnalité que vous aimeriez voir dans À la carte...";
    default:
      return "Partagez votre avis, vos questions ou vos remarques...";
  }
};

const Feedback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();

  const initialCat = (searchParams.get("category") as FeedbackCategory) || "suggestion";
  const [category, setCategory] = useState<FeedbackCategory>(
    CATEGORIES.some((c) => c.id === initialCat) ? initialCat : "suggestion"
  );
  const [rating, setRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Past feedbacks for logged-in user
  const [pastFeedbacks, setPastFeedbacks] = useState<PastFeedback[]>([]);

  // Pre-fill email when profile or user loads
  useEffect(() => {
    if (profile?.email) {
      setEmail(profile.email);
    } else if (user?.email) {
      setEmail(user.email);
    }
  }, [profile, user]);

  // Fetch past feedbacks for the user
  const fetchPastFeedbacks = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("feedbacks")
        .select("id, category, message, rating, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      if (!error && data) {
        setPastFeedbacks(data as PastFeedback[]);
      }
    } catch (err) {
      console.warn("Could not load past feedbacks:", err);
    }
  }, [user]);

  useEffect(() => {
    fetchPastFeedbacks();
  }, [fetchPastFeedbacks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || message.trim().length < 5) {
      toast({
        title: "Message trop court",
        description: "Merci de détailler un peu plus votre message (minimum 5 caractères).",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const userName = profile?.first_name || profile?.last_name
      ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
      : user?.user_metadata?.display_name || user?.user_metadata?.full_name || null;

    const technicalMetadata = {
      appVersion: "v1.2.0",
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screen: `${window.innerWidth}x${window.innerHeight}`,
      timestamp: new Date().toISOString(),
    };

    try {
      // 1. Direct insert in Supabase feedbacks table
      const { data: insertedData, error: dbError } = await supabase
        .from("feedbacks")
        .insert({
          user_id: user?.id || null,
          user_email: email.trim() || user?.email || null,
          user_name: userName,
          category,
          rating: rating || null,
          message: message.trim(),
          page_url: window.location.pathname,
          metadata: technicalMetadata,
        })
        .select("id")
        .single();

      if (dbError) {
        console.error("Supabase insert error:", dbError);
        toast({
          title: "Erreur lors de l'envoi",
          description: "Une erreur est survenue. Veuillez réessayer dans un instant.",
          variant: "destructive",
        });
        return;
      }

      // 2. Trigger notification edge function (webhook/email)
      try {
        await supabase.functions.invoke("submit-feedback", {
          body: {
            feedbackId: insertedData?.id,
            category,
            message: message.trim(),
            rating: rating || null,
            userEmail: email.trim() || user?.email || null,
            userName,
            pageUrl: window.location.pathname,
            metadata: technicalMetadata,
          },
        });
      } catch (notifyErr) {
        // Notification is non-blocking since record is already safely saved in DB
        console.warn("Notification dispatch notice:", notifyErr);
      }

      setIsSuccess(true);
      toast({
        title: "Merci pour votre retour !",
        description: "Votre message a bien été pris en compte.",
      });

      // Refresh past feedback list
      fetchPastFeedbacks();
    } catch (err) {
      console.error("Error submitting feedback:", err);
      toast({
        title: "Erreur lors de l'envoi",
        description: "Une erreur est survenue. Veuillez réessayer dans un instant.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    setMessage("");
    setRating(null);
    setHoverRating(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Traité</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">En cours</Badge>;
      default:
        return <Badge variant="secondary">Reçu</Badge>;
    }
  };

  return (
    <div className="pb-24 min-h-screen">
      {/* Header */}
      <header className="bg-primary text-primary-foreground pt-8 pb-6 px-6 md:px-8 md:rounded-2xl md:my-6 shadow-xs">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-white/20 -ml-2"
            onClick={() => navigate(-1)}
            title="Retour"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Avis & suggestions</h1>
            <p className="text-xs text-primary-foreground/80">
              Aidez-nous à faire évoluer À la carte
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 space-y-6">
        {isSuccess ? (
          /* Success Screen */
          <Card className="border-primary/20 shadow-sm animate-in fade-in zoom-in-95 duration-200">
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-bold text-foreground">
                Merci pour votre retour !
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                Votre avis a été transmis avec succès. Chaque message est lu avec attention
                pour améliorer continuellement l'application.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" onClick={handleReset}>
                  Envoyer un autre retour
                </Button>
                <Button
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => navigate("/profile")}
                >
                  Retour au profil
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Feedback Form */
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category selection */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                De quoi s'agit-il ?
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
                        isSelected
                          ? `${cat.activeColor} ring-1 ring-primary/40 shadow-xs font-medium`
                          : "border-border bg-card hover:bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${cat.color}`} />
                        <span className="text-sm text-foreground font-semibold">
                          {cat.label}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground leading-tight">
                        {cat.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Star Rating (Optional) */}
            <Card>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">
                    Votre appréciation générale (optionnelle)
                  </Label>
                  {(hoverRating || rating) && (
                    <span className="text-xs font-medium text-accent">
                      {RATING_LABELS[hoverRating || rating || 0]}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = (hoverRating ?? rating ?? 0) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        className="p-1 rounded-md hover:scale-110 transition-transform focus:outline-hidden"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        onClick={() => setRating(rating === star ? null : star)}
                        title={`${star} étoile${star > 1 ? "s" : ""}`}
                      >
                        <Star
                          className={`w-7 h-7 transition-colors ${
                            isFilled
                              ? "text-amber-400 fill-amber-400"
                              : "text-muted-foreground/30 hover:text-amber-300"
                          }`}
                        />
                      </button>
                    );
                  })}
                  {rating && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground hover:text-foreground ml-2 h-7 px-2"
                      onClick={() => setRating(null)}
                    >
                      Effacer
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Message Textarea */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="feedback-message" className="text-sm font-semibold">
                  Votre message <span className="text-destructive">*</span>
                </Label>
                <span className="text-xs text-muted-foreground">
                  {message.length} caractère{message.length > 1 ? "s" : ""}
                </span>
              </div>
              <Textarea
                id="feedback-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={getPlaceholders(category)}
                rows={5}
                className="resize-none"
                required
              />
            </div>

            {/* Email contact */}
            <div className="space-y-2">
              <Label htmlFor="feedback-email" className="text-sm font-semibold">
                Adresse email pour vous répondre
              </Label>
              <Input
                id="feedback-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre.email@exemple.com"
              />
              <p className="text-[11px] text-muted-foreground">
                Optionnel. Rempli automatiquement si vous êtes connecté.
              </p>
            </div>

            {/* Diagnostic info note */}
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-muted/40 border border-border/50 text-xs text-muted-foreground">
              <Info className="w-4 h-4 shrink-0 text-muted-foreground mt-0.5" />
              <span>
                Pour nous aider à reproduire d'éventuels anomalies, les informations
                techniques (version de l'application, type d'appareil) sont jointes
                automatiquement.
              </span>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={isSubmitting || message.trim().length < 5}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold h-11 shadow-sm gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Envoi en cours...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Envoyer mon retour</span>
                </>
              )}
            </Button>
          </form>
        )}

        {/* User's past feedbacks history */}
        {user && pastFeedbacks.length > 0 && !isSuccess && (
          <div className="pt-6 border-t border-border space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>Vos retours précédents</span>
            </div>
            <div className="space-y-2">
              {pastFeedbacks.map((item) => {
                const catInfo = CATEGORIES.find((c) => c.id === item.category);
                const Icon = catInfo?.icon || MessageSquare;
                const formattedDate = new Date(item.created_at).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });

                return (
                  <Card key={item.id} className="bg-muted/20 border-border/60">
                    <CardContent className="p-3.5 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Icon className={`w-3.5 h-3.5 ${catInfo?.color || "text-foreground"}`} />
                          <span>{catInfo?.label || item.category}</span>
                          {item.rating && (
                            <span className="text-amber-500 font-semibold ml-1">
                              ★ {item.rating}/5
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground text-[11px]">{formattedDate}</span>
                          {getStatusBadge(item.status)}
                        </div>
                      </div>
                      <p className="text-xs text-foreground/80 line-clamp-2 leading-relaxed">
                        {item.message}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feedback;
