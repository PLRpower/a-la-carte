import { User, Heart, Settings, Edit, LogOut, Users, Star, Sparkles, FlaskConical, ArrowRight, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useRecipes } from "@/hooks/useRecipes";
import { useStock } from "@/hooks/useStock";
import { isBetaEnvironment, getBetaUrl, getProductionUrl } from "@/utils/environment";

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const { recipes, loading: recipesLoading } = useRecipes();
  const { stock, loading: stockLoading } = useStock();
  const isBeta = isBetaEnvironment();

  const favoriteCount = recipes.filter(r => r.is_favorited).length;

  const menuItems = [
    { icon: Heart, label: "Recettes favorites", path: "/profile/favorites", count: favoriteCount },
    { icon: Users, label: "Ma famille", path: "/family" },
    { icon: Settings, label: "Préférences de l'application", path: "/profile/preferences" },
  ];

  return (
    <div className="pb-20 md:pb-12 min-h-screen">
      {/* Header */}
      <header className="bg-primary text-primary-foreground pt-8 pb-6 px-6 md:px-8 md:rounded-2xl md:my-6 shadow-xs">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Profil</h1>
          <Button
            size="icon"
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => navigate("/profile/edit")}
          >
            <Edit className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto space-y-6">
        {/* User Info */}
        <section className="px-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  {profile?.avatar_url ? (
                    <AvatarImage src={profile.avatar_url} />
                  ) : (
                    <AvatarFallback className="bg-accent text-accent-foreground text-xl">
                      {profile?.first_name?.[0] || profile?.last_name?.[0] || user?.user_metadata?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || <User className="w-8 h-8" />}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">
                    {profile?.first_name || profile?.last_name
                      ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
                      : user?.user_metadata?.display_name ||
                      user?.user_metadata?.full_name ||
                      (user?.user_metadata?.first_name || user?.user_metadata?.last_name
                        ? `${user.user_metadata.first_name || ''} ${user.user_metadata.last_name || ''}`.trim()
                        : user?.email || 'Utilisateur invité')}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {user?.email || 'Connectez-vous pour synchroniser vos recettes'}
                  </p>
                  {profile?.bio && (
                    <p className="text-sm mt-2 text-foreground/80 line-clamp-2 italic">
                      "{profile.bio}"
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Stats */}
        <section className="px-6">
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary flex justify-center items-center min-h-[32px]">
                  {recipesLoading ? <Skeleton className="h-8 w-12" /> : recipes.length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Recettes</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-accent flex justify-center items-center min-h-[32px]">
                  {recipesLoading ? <Skeleton className="h-8 w-12" /> : favoriteCount}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Favoris</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-secondary flex justify-center items-center min-h-[32px]">
                  {stockLoading ? <Skeleton className="h-8 w-12" /> : stock.length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Articles</div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Premium Banner */}
        <section className="px-6">
          <div
            onClick={() => navigate('/premium')}
            className={`rounded-2xl p-6 text-white shadow-lg cursor-pointer transform transition-all active:scale-[0.98] relative overflow-hidden group border border-white/10 ${profile?.subscription_status === 'active'
                ? 'bg-gradient-to-br from-primary to-primary/80'
                : 'bg-gradient-to-br from-accent to-orange-400/90'
              }`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-colors"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-xl flex items-center gap-2 text-white">
                  <Star className="w-5 h-5 fill-white text-white" />
                  {profile?.subscription_status === 'active' ? 'Statut Premium' : 'À la carte Premium'}
                </h3>
                <Sparkles className="w-6 h-6 text-white animate-pulse" />
              </div>
              <p className="text-sm text-white font-medium leading-relaxed max-w-[240px]">
                {profile?.subscription_status === 'active'
                  ? 'Merci de votre soutien ! Gérez votre abonnement en un clic.'
                  : 'Libérez toute la puissance de l\'IA et partagez avec votre famille.'}
              </p>
            </div>
          </div>
        </section>

        {/* Menu Items */}
        <section className="px-6">
          <Card>
            <CardContent className="p-0">
              {menuItems.map((item, index) => (
                <div key={item.label}>
                  <button
                    onClick={() => item.path && navigate(item.path)}
                    className="w-full p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-foreground" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium">{item.label}</div>
                    </div>
                    {item.count !== undefined && (
                      <div className="text-sm text-muted-foreground">
                        {recipesLoading ? <Skeleton className="h-4 w-8" /> : item.count}
                      </div>
                    )}
                  </button>
                  {index < menuItems.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        {/* Beta Program Section */}
        <section className="px-6">
          {isBeta ? (
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0">
                    <FlaskConical className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">Version Bêta active</span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded font-mono font-medium">develop</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Prévisualisation des futures fonctionnalités.
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-amber-500/30 hover:bg-amber-500/10 shrink-0 text-xs"
                  onClick={() => window.location.href = getProductionUrl()}
                >
                  Retour prod
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary flex-shrink-0">
                    <FlaskConical className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Tester la version Bêta</div>
                    <p className="text-xs text-muted-foreground">
                      Accédez aux nouveautés avec votre compte et vos données.
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 text-xs font-medium"
                  onClick={() => window.location.href = getBetaUrl()}
                >
                  Rejoindre
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Sign Out */}
        {user && (
          <section className="px-6">
            <Button variant="outline" className="w-full" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Se déconnecter
            </Button>
          </section>
        )}

        <div className="text-center text-xs text-muted-foreground pb-2 mt-6">Crée avec 🤎 par Paul</div>

        {/* App Version */}
        <div className="text-center text-xs text-muted-foreground pb-6">
          À la carte v1.2.0 {isBeta ? "(Bêta · develop)" : ""}
        </div>
      </div>
    </div>
  );
};

export default Profile;
