import { useState } from "react";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

const Preferences = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("en");
  const [weightUnit, setWeightUnit] = useState("grams");
  const [temperatureUnit, setTemperatureUnit] = useState("celsius");
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="pb-20 min-h-screen">
      <header className="bg-primary text-primary-foreground pt-8 pb-6 px-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">App Preferences</h1>
        </div>
      </header>

      <section className="px-6 mt-6 pb-6">
        <Card>
          <CardContent className="p-0">
            {/* Dark Mode */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                <div>
                  <Label htmlFor="darkMode" className="text-base font-medium">
                    Dark Mode
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Switch between light and dark theme
                  </p>
                </div>
              </div>
              <Switch
                id="darkMode"
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>

            <Separator />

            {/* Language */}
            <div className="p-4">
              <Label className="text-base font-medium mb-2 block">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Weight Unit */}
            <div className="p-4">
              <Label className="text-base font-medium mb-2 block">Weight Unit</Label>
              <Select value={weightUnit} onValueChange={setWeightUnit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grams">Grams (g)</SelectItem>
                  <SelectItem value="ounces">Ounces (oz)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Temperature Unit */}
            <div className="p-4">
              <Label className="text-base font-medium mb-2 block">Temperature Unit</Label>
              <Select value={temperatureUnit} onValueChange={setTemperatureUnit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="celsius">Celsius (°C)</SelectItem>
                  <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Notifications */}
            <div className="p-4 flex items-center justify-between">
              <div>
                <Label htmlFor="notifications" className="text-base font-medium">
                  Notifications
                </Label>
                <p className="text-xs text-muted-foreground">
                  Receive updates and reminders
                </p>
              </div>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Preferences;
