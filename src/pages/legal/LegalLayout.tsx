import { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Printer, Shield, FileText, Cookie, RotateCcw, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LegalLayoutProps {
  title: string;
  subtitle?: string;
  lastUpdated: string;
  children: ReactNode;
  activeTab: "privacy" | "terms" | "cookies" | "refund" | "legal";
}

export const LegalLayout = ({
  title,
  subtitle,
  lastUpdated,
  children,
  activeTab,
}: LegalLayoutProps) => {
  const navigate = useNavigate();

  const navLinks = [
    { id: "legal", label: "Mentions Légales", path: "/mentions-legales", icon: Building2 },
    { id: "privacy", label: "Confidentialité (RGPD)", path: "/privacy", icon: Shield },
    { id: "terms", label: "Conditions (CGU/CGV)", path: "/terms", icon: FileText },
    { id: "cookies", label: "Cookies & Traceurs", path: "/cookies", icon: Cookie },
    { id: "refund", label: "Remboursement & Rétractation", path: "/refund", icon: RotateCcw },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-16 print:pb-0">
      {/* Header */}
      <header className="bg-primary text-primary-foreground pt-8 pb-8 px-6 md:px-8 md:my-6 md:rounded-2xl shadow-xs print:hidden">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-white/20 -ml-2"
              onClick={() => navigate(-1)}
              aria-label="Retour à la page précédente"
              title="Retour"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="text-xs uppercase tracking-wider opacity-80 font-semibold mb-1">
                Conformité & Juridique
              </div>
              <h1 className="text-2xl md:text-3xl font-bold font-serif">{title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-foreground hover:bg-white/20 text-xs gap-1.5 hidden sm:flex"
              onClick={() => window.print()}
              aria-label="Imprimer le document juridique"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Subnav tabs */}
      <nav
        aria-label="Navigation des pages légales"
        className="max-w-4xl mx-auto px-6 mb-8 print:hidden"
      >
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-border/70">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;
            return (
              <Link
                key={link.id}
                to={link.path}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 print:px-0">
        <article className="bg-card text-card-foreground border border-border/70 rounded-2xl p-6 sm:p-10 shadow-xs print:border-none print:shadow-none print:p-0">
          <div className="border-b border-border/70 pb-6 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-primary">À la carte · Plateforme web & mobile</p>
              {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
            </div>
            <div className="text-xs text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full w-fit">
              Dernière mise à jour : {lastUpdated}
            </div>
          </div>

          <div className="prose prose-neutral dark:prose-invert max-w-none text-foreground space-y-6 text-sm leading-relaxed">
            {children}
          </div>
        </article>
      </main>
    </div>
  );
};
