import { Link } from "react-router-dom";
import { ShieldCheck, Heart, Mail, Lock } from "lucide-react";

export const Footer = () => {
  return (
    <footer
      aria-label="Pied de page"
      className="w-full bg-card border-t border-border/80 text-card-foreground mt-auto print:hidden"
    >
      <div className="max-w-7xl mx-auto px-6 py-10 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand info */}
          <div className="space-y-3 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <img
                src="/logo-transparent.png"
                alt="Logo À la carte"
                className="w-8 h-8 object-contain"
                width={32}
                height={32}
              />
              <span className="font-serif font-bold text-lg text-foreground tracking-tight">
                À la carte
              </span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Votre assistant culinaire intelligent : cuisinez selon votre stock, planifiez vos repas et partagez vos recettes au quotidien.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Conforme RGPD & CNIL</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Navigation
            </h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-foreground transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/recipes" className="hover:text-foreground transition-colors">
                  Catalogue de recettes
                </Link>
              </li>
              <li>
                <Link to="/stock" className="hover:text-foreground transition-colors">
                  Gestion du stock
                </Link>
              </li>
              <li>
                <Link to="/shopping-list" className="hover:text-foreground transition-colors">
                  Liste de courses
                </Link>
              </li>
              <li>
                <Link to="/planning" className="hover:text-foreground transition-colors">
                  Planning des repas
                </Link>
              </li>
            </ul>
          </div>

          {/* Conformité & Légal */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Légal & Conformité FR
            </h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link to="/mentions-legales" className="hover:text-foreground transition-colors">
                  Mentions Légales (LCEN)
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-foreground transition-colors">
                  Politique de Confidentialité (RGPD)
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-foreground transition-colors">
                  Conditions Générales (CGU / CGV)
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="hover:text-foreground transition-colors">
                  Cookies & Traceurs (CNIL)
                </Link>
              </li>
              <li>
                <Link to="/refund" className="hover:text-foreground transition-colors">
                  Remboursement & Rétractation (14j)
                </Link>
              </li>
            </ul>
          </div>

          {/* Sécurité & Contact */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Engagements & Contact
            </h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Paiements sécurisés Stripe</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Hébergement UE (Supabase)</span>
              </li>
              <li>
                <Link to="/feedback" className="hover:text-foreground transition-colors">
                  Donner mon avis / Signaler un bug
                </Link>
              </li>
              <li>
                <a
                  href="mailto:contact@alacarte.app"
                  className="hover:text-foreground transition-colors inline-flex items-center gap-1"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>contact@alacarte.app</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border/70 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} À la carte. Tous droits réservés.</p>
          <div className="flex items-center gap-1">
            <span>Développé avec</span>
            <Heart className="w-3.5 h-3.5 text-accent fill-accent" aria-label="amour" />
            <span>en France</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
