import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RotateCcw, ExternalLink, ShieldAlert, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { isBetaEnvironment, getProductionUrl } from "@/utils/environment";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, showDetails: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught application error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  private handleGoToProduction = () => {
    const prodUrl = getProductionUrl();
    window.location.href = prodUrl;
  };

  public render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const isBeta = isBetaEnvironment();

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-border/60 shadow-lg">
          <CardContent className="p-6 text-center space-y-5">
            <div className="w-14 h-14 mx-auto rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-bold tracking-tight">Oups, une erreur est survenue</h1>
              <p className="text-sm text-muted-foreground">
                L'application a rencontré un problème inattendu lors de l'affichage.
              </p>
            </div>

            {/* Avertissement spécial Bêta */}
            {isBeta && (
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-4 text-left space-y-2 text-xs">
                <div className="flex items-center gap-2 font-semibold text-amber-700 dark:text-amber-300">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Version Bêta (Preview) active</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Vous testez actuellement la version de prévisualisation (branche develop). Ce bug n'existe probablement pas sur la version stable.
                </p>
                <Button
                  onClick={this.handleGoToProduction}
                  className="w-full mt-2 bg-primary text-primary-foreground hover:bg-primary/90 h-9 font-medium"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Revenir à la version stable (Production)
                </Button>
              </div>
            )}

            {/* Actions standards */}
            <div className="space-y-2 pt-2">
              <Button
                variant={isBeta ? "outline" : "default"}
                onClick={this.handleReload}
                className="w-full"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Recharger l'application
              </Button>

              <Button
                variant="ghost"
                onClick={this.handleGoHome}
                className="w-full text-muted-foreground"
              >
                <Home className="w-4 h-4 mr-2" />
                Retour à l'accueil
              </Button>
            </div>

            {/* Détails techniques escamotables */}
            {this.state.error && (
              <div className="pt-2 text-left">
                <button
                  type="button"
                  onClick={() => this.setState(s => ({ showDetails: !s.showDetails }))}
                  className="text-[11px] text-muted-foreground hover:text-foreground underline"
                >
                  {this.state.showDetails ? "Masquer les détails techniques" : "Afficher les détails techniques"}
                </button>
                {this.state.showDetails && (
                  <pre className="mt-2 p-3 rounded bg-muted text-[11px] text-foreground font-mono overflow-x-auto whitespace-pre-wrap max-h-40 border border-border/50">
                    {this.state.error.message}
                    {this.state.error.stack ? `\n\n${this.state.error.stack}` : ""}
                  </pre>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }
}
