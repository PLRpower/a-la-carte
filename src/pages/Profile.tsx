import { User, Heart, ChefHat, Bell, Settings, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const menuItems = [
  { icon: Heart, label: "Favorite Recipes", count: 12 },
  { icon: ChefHat, label: "My Recipes", count: 5 },
  { icon: Bell, label: "Notifications", hasToggle: true },
  { icon: Settings, label: "App Preferences" },
  { icon: Info, label: "About & Help" },
];

const Profile = () => {
  return (
    <div className="pb-20 min-h-screen">
      {/* Header */}
      <header className="bg-primary text-primary-foreground pt-8 pb-6 px-6">
        <h1 className="text-2xl font-bold">Profile</h1>
      </header>

      {/* User Info */}
      <section className="px-6 mt-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-accent text-accent-foreground text-xl">
                  <User className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-lg font-semibold">Guest User</h2>
                <p className="text-sm text-muted-foreground">
                  Sign in to sync your recipes
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
              <div className="text-2xl font-bold text-primary">17</div>
              <div className="text-xs text-muted-foreground mt-1">Recipes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-accent">12</div>
              <div className="text-xs text-muted-foreground mt-1">Favorites</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-secondary">42</div>
              <div className="text-xs text-muted-foreground mt-1">Items</div>
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
                <button className="w-full p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors">
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

      {/* App Version */}
      <div className="text-center text-xs text-muted-foreground pb-6">
        À la carte v1.0.0
      </div>
    </div>
  );
};

export default Profile;
