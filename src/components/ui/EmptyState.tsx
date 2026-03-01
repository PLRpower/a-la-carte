import { LucideIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Action {
    label: string;
    icon: LucideIcon;
    onClick: () => void;
    variant?: "default" | "outline" | "secondary" | "ghost";
}

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actions?: Action[];
    tip?: {
        icon: LucideIcon;
        text: string;
    };
}

export const EmptyState = ({
    icon: Icon,
    title,
    description,
    actions = [],
    tip,
}: EmptyStateProps) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            {/* Animated Icon Container - Apparaît en premier */}
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-accent/20 rounded-full blur-2xl animate-pulse scale-150"></div>
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/30 border border-accent/20 flex items-center justify-center shadow-inner group overflow-hidden">
                    <Icon className="w-10 h-10 text-accent transform transition-transform group-hover:scale-110 group-hover:rotate-6 duration-500" />
                </div>
            </div>

            {/* Text Content - Apparaît en même temps que l'icône */}
            <div className="text-center max-w-sm mb-8">
                <h3 className="text-xl font-bold text-foreground mb-2 leading-tight">
                    {title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                    {description}
                </p>
            </div>

            {/* Quick Actions - Apparaît en même temps que le reste */}
            {actions.length > 0 && (
                <div className="flex flex-wrap gap-3 justify-center mb-8">
                    {actions.map((action, idx) => (
                        <Button
                            key={idx}
                            variant={action.variant || "default"}
                            onClick={action.onClick}
                            className="group px-6 h-11"
                        >
                            <action.icon className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                            {action.label}
                        </Button>
                    ))}
                </div>
            )}

            {/* Pro Tip Card - Slide-in à la fin */}
            {tip && (
                <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-8 duration-700 delay-700 fill-mode-both">
                    <Card className="bg-muted/30 border-dashed border-muted-foreground/30 overflow-hidden relative group hover:bg-muted/40 transition-colors">
                        <div className="absolute -left-1 top-0 bottom-0 w-1 bg-accent/50 group-hover:bg-accent transition-colors"></div>
                        <CardContent className="p-4 flex gap-3 items-start">
                            <div className="p-2 rounded-lg bg-background shadow-sm shrink-0">
                                <tip.icon className="w-4 h-4 text-accent" />
                            </div>
                            <div className="flex-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-accent mb-1 block">Astuce Pro</span>
                                <p className="text-sm text-foreground/80 italic leading-snug">
                                    "{tip.text}"
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};
