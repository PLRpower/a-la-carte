import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

const Auth = () => {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(!location.state?.isSignup);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!isLogin && password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    if (!isLogin && password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Email ou mot de passe invalide");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Bon retour !");
          navigate("/");
        }
      } else {
        const { error } = await signUp(email, password, firstName, lastName);
        if (error) {
          if (error.message.includes("User already registered")) {
            toast.error("Cet email est déjà enregistré");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Compte créé avec succès ! Veuillez vérifier votre email pour confirmer.");
        }
      }
    } catch (error) {
      toast.error("Une erreur inattendue s'est produite");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-serif mb-2">À la carte</CardTitle>
          <CardDescription>
            {isLogin ? "Bon retour ! Connectez-vous pour continuer." : "Créez votre compte pour commencer."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            )}
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isLogin ? "Connexion..." : "Création du compte..."}
                </>
              ) : (
                <>{isLogin ? "Se connecter" : "Créer un compte"}</>
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-accent hover:underline"
            >
              {isLogin ? "Pas de compte ? Inscrivez-vous" : "Déjà un compte ? Connectez-vous"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
