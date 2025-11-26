import { User, Heart, Settings, Edit, LogOut } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useRecipes } from "@/hooks/useRecipes";
import { useStock } from "@/hooks/useStock";

const menuItems = [
  { icon: Edit, label: "Modifier le profil", path: "/profile/edit" },
  { icon: Heart, label: "Recettes favorites", count: 12 },
  { icon: Settings, label: "Préférences de l'application", path: "/profile/preferences" },
];

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const { recipes } = useRecipes();
  const { stock } = useStock();

  const favoriteCount = recipes.filter(r => r.is_favorited).length;

  return (
    <div className="pb-20 min-h-screen">
      {/* Header */}
      <header className="bg-primary text-primary-foreground pt-8 pb-6 px-6">
        <h1 className="text-2xl font-bold">Profil</h1>
      </header>

      {/* User Info */}
      <section className="px-6 mt-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                {profile?.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} />
                ) : (
                  <AvatarFallback className="bg-accent text-accent-foreground text-xl">
                    {user?.user_metadata?.first_name?.[0] || user?.user_metadata?.last_name?.[0] || user?.email?.[0]?.toUpperCase() || <User className="w-8 h-8" />}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1">
                <h2 className="text-lg font-semibold">
                  {user?.user_metadata?.display_name ||
                    user?.user_metadata?.full_name ||
                    (user?.user_metadata?.first_name || user?.user_metadata?.last_name
                      ? `${user.user_metadata.first_name || ''} ${user.user_metadata.last_name || ''}`.trim()
                      : user?.email || 'Utilisateur invité')}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {user?.email || 'Connectez-vous pour synchroniser vos recettes'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Stats */}
      <section className="px-6 mt-4">
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{recipes.length}</div>
              <div className="text-xs text-muted-foreground mt-1">Recettes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-accent">{favoriteCount}</div>
              <div className="text-xs text-muted-foreground mt-1">Favoris</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-secondary">{stock.length}</div>
              <div className="text-xs text-muted-foreground mt-1">Articles</div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Menu Items */}
      <section className="px-6 mt-6 pb-6">
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
                  {item.count && (
                    <div className="text-sm text-muted-foreground">
                      {item.count}
                    </div>
                  )}
                </button>
                {index < menuItems.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* Sign Out */}
      {user && (
        <section className="px-6 mt-6">
          <Button variant="outline" className="w-full" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Se déconnecter
          </Button>
        </section>
      )}

      <div className="text-center text-xs text-muted-foreground pb-2 mt-6">Crée avec 🤎 par Paul</div>

      {/* App Version */}
      <div className="text-center text-xs text-muted-foreground pb-6">
        À la carte v1.0.0
      </div>
    </div>
  );
};

export default Profile;
