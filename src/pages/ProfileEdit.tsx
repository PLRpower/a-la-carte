import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

const ProfileEdit = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading, updateProfile } = useProfile();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const p = profile as any /* eslint-disable-line @typescript-eslint/no-explicit-any */;
    if (p) {
      setFirstName(p.first_name || "");
      setLastName(p.last_name || "");
      setBio(p.bio || "");
      setAvatarUrl(p.avatar_url || null);
    }
  }, [profile]);

  const handleSave = async () => {
    const { error } = await updateProfile({
      first_name: firstName,
      last_name: lastName,
      bio: bio,
      avatar_url: avatarUrl
    });

    if (error) {
      toast.error("Erreur lors de la mise à jour du profil");
    } else {
      toast.success("Profil mis à jour avec succès !");
      navigate("/profile");
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      setUploading(true);

      // Upload to 'avatars' bucket
      // Note: If 'avatars' bucket doesn't exist, this will fail. 
      // We assume it exists or use a standard one.
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(data.publicUrl);
      toast.success("Image téléchargée !");

    } catch (error: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
      console.error("Error uploading avatar: ", error);
      toast.error("Erreur lors du téléchargement de l'image");
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // We remove the full page loading check to keep the layout visible
  // and use skeletons for fields instead.
  // if (loading) {
  //   return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>;
  // }

  return (
    <div className="pb-20 min-h-screen">
      <header className="bg-primary text-primary-foreground pt-8 pb-6 px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-white/20 -ml-2"
            onClick={() => navigate("/profile")}
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-bold">Modifier le profil</h1>
        </div>
      </header>

      <section className="px-6 mt-6 space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center mb-6">
              <div className="relative group cursor-pointer" onClick={triggerFileInput}>
                <Avatar className="w-24 h-24 border-2 border-background shadow-sm">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} className="object-cover" />
                  ) : (
                    <AvatarFallback className="bg-accent text-accent-foreground text-2xl">
                      {firstName?.[0] || "U"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-8 h-8 text-white" />
                </div>
                <button
                  type="button"
                  className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg transform translate-x-1 translate-y-1"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                </button>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
              />
              <p className="text-xs text-muted-foreground mt-2">Cliquez pour changer la photo</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                {loading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Votre prénom"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                {loading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Votre nom"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                {loading ? (
                  <Skeleton className="h-32 w-full" />
                ) : (
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Parlez-nous de vous..."
                    rows={4}
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} className="w-full" size="lg" disabled={uploading || loading}>
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              TÉLÉCHARGEMENT...
            </>
          ) : (
            "Enregistrer les modifications"
          )}
        </Button>
      </section>
    </div>
  );
};

export default ProfileEdit;
