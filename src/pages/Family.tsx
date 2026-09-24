import { useState } from "react";
import { useFamily } from "@/hooks/useFamily";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Users, Copy, Plus, ClipboardPaste, User, UserPlus, Trash2, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Switch } from "@/components/ui/switch";

const Family = () => {
    const { user } = useAuth();
    const { profile, updateProfile } = useProfile();
    const navigate = useNavigate();
    const { families, members, loadingFamilies, loadingMembers, createFamily, joinFamily, isCreating, isJoining, addMemberByEmail, isAddingMember, leaveFamily, removeMember, isLeaving, isRemovingMember } = useFamily();

    const [newFamilyName, setNewFamilyName] = useState("");
    const [shareCode, setShareCode] = useState("");
    const [newMemberEmail, setNewMemberEmail] = useState("");

    const handleCreateFamily = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFamilyName.trim()) return;
        createFamily(newFamilyName);
        setNewFamilyName("");
    };

    const handleJoinFamily = (e: React.FormEvent) => {
        e.preventDefault();
        if (!shareCode.trim()) return;
        joinFamily(shareCode);
        setShareCode("");
    };

    const handleAddMember = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMemberEmail.trim() || !currentFamily || !currentFamily.share_code) return;
        addMemberByEmail({ email: newMemberEmail, familyId: currentFamily.id, shareCode: currentFamily.share_code });
        setNewMemberEmail("");
    };

    const copyToClipboard = (code: string | null) => {
        if (!code) return;
        const link = `${window.location.origin}/?family_code=${code}`;
        navigator.clipboard.writeText(link);
        toast.success("Lien d'invitation copié !");
    };

    if (loadingFamilies) {
        return (
            <div className="pb-20 min-h-screen">
                <header className="bg-primary text-primary-foreground pt-8 pb-6 px-6">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/20 -ml-2" onClick={() => navigate(-1)}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <h1 className="text-2xl font-bold">Ma famille</h1>
                    </div>
                </header>
                <div className="p-6 space-y-4">
                    <Skeleton className="h-[200px] w-full rounded-xl" />
                </div>
            </div>
        );
    }

    const userHasFamily = families && families.length > 0;
    const currentFamily = userHasFamily ? families[0] : null;

    return (
        <div className="pb-20 md:pb-12 min-h-screen">
            <header className="bg-primary text-primary-foreground pt-8 pb-6 px-6 md:px-8 md:rounded-2xl md:my-6 shadow-xs">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/20 -ml-2" onClick={() => navigate("/profile")}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-2xl font-bold">Ma famille</h1>
                </div>
            </header>

            <main className="p-6">
                {!userHasFamily ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start max-w-4xl mx-auto">
                        <Card>
                            <CardHeader>
                                <CardTitle>Créer une famille</CardTitle>
                                <CardDescription>
                                    Partagez vos recettes, liste de courses, et votre stock avec votre famille.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleCreateFamily} className="flex gap-2">
                                    <div className="flex-1">
                                        <Label htmlFor="familyName" className="sr-only">Nom de la famille</Label>
                                        <Input
                                            id="familyName"
                                            placeholder="Nom de votre famille"
                                            value={newFamilyName}
                                            onChange={(e) => setNewFamilyName(e.target.value)}
                                            disabled={isCreating}
                                        />
                                    </div>
                                    <Button type="submit" disabled={!newFamilyName.trim() || isCreating}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Créer
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Rejoindre une famille</CardTitle>
                                <CardDescription>
                                    Entrez le code de partage d'une famille existante pour la rejoindre.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleJoinFamily} className="flex gap-2">
                                    <div className="flex-1">
                                        <Label htmlFor="shareCode" className="sr-only">Code de partage</Label>
                                        <Input
                                            id="shareCode"
                                            placeholder="Code de partage à 36 caractères"
                                            value={shareCode}
                                            onChange={(e) => setShareCode(e.target.value)}
                                            disabled={isJoining}
                                        />
                                    </div>
                                    <Button type="submit" variant="secondary" disabled={!shareCode.trim() || isJoining}>
                                        <ClipboardPaste className="w-4 h-4 mr-2" />
                                        Rejoindre
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                        <Card>
                            <CardHeader className="bg-muted/30 pb-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                            <Users className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle>{currentFamily?.name}</CardTitle>
                                            <CardDescription className="mt-1">
                                                Membre depuis {new Date(currentFamily?.created_at || '').toLocaleDateString()}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                                            Code de partage
                                        </Label>
                                        <div className="flex items-center gap-2">
                                            <code className="flex-1 bg-muted px-4 py-2 rounded-lg font-mono text-xs border truncate">
                                                {currentFamily?.share_code ? `${window.location.origin}/?family_code=${currentFamily.share_code}` : 'Générique au chargement...'}
                                            </code>
                                            <Button variant="outline" size="icon" onClick={() => copyToClipboard(currentFamily?.share_code || '')}>
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Partagez ce lien à vos proches pour qu'ils rejoignent votre famille.
                                        </p>
                                    </div>
                                    <Separator />
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                                            Ou ajoutez-les directement par email
                                        </Label>
                                        <form onSubmit={handleAddMember} className="flex gap-2">
                                            <div className="flex-1">
                                                <Label htmlFor="memberEmail" className="sr-only">Email du membre</Label>
                                                <Input
                                                    id="memberEmail"
                                                    type="email"
                                                    placeholder="adresse@email.com"
                                                    value={newMemberEmail}
                                                    onChange={(e) => setNewMemberEmail(e.target.value)}
                                                    disabled={isAddingMember}
                                                />
                                            </div>
                                            <Button type="submit" disabled={!newMemberEmail.trim() || isAddingMember}>
                                                <UserPlus className="w-4 h-4 mr-2" />
                                                Ajouter
                                            </Button>
                                        </form>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Membres de la famille</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {loadingMembers ? (
                                    <div className="p-4 space-y-3">
                                        <Skeleton className="h-12 w-full" />
                                        <Skeleton className="h-12 w-full" />
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {members.map((member) => (
                                            <div key={member.id} className="p-4 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        {member.profile?.avatar_url ? (
                                                            <AvatarImage src={member.profile.avatar_url} />
                                                        ) : (
                                                            <AvatarFallback className="bg-primary/20 text-primary">
                                                                {member.profile?.first_name?.[0] || member.profile?.last_name?.[0] || member.profile?.email?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
                                                            </AvatarFallback>
                                                        )}
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium text-sm">
                                                            {member.profile?.first_name || member.profile?.last_name ? (
                                                                `${member.profile.first_name || ''} ${member.profile.last_name || ''}`.trim()
                                                            ) : member.profile?.email ? (
                                                                member.profile.email
                                                            ) : 'Utilisateur'}
                                                            {member.user_id === user?.id && " (Vous)"}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground capitalize">
                                                            {member.role === 'admin' ? 'Administrateur' : 'Membre'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Allow admin to remove others */}
                                                {(members.find(m => m.user_id === user?.id)?.role === 'admin') && member.user_id !== user?.id && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            if (window.confirm("Voulez-vous vraiment retirer ce membre de la famille ?")) {
                                                                removeMember(member.user_id);
                                                            }
                                                        }}
                                                        disabled={isRemovingMember}
                                                        className="text-destructive hover:bg-destructive/10"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>



                        <div className="lg:col-span-2 pt-4 flex justify-center">
                            <Button
                                variant="destructive"
                                className="w-full sm:w-auto flex items-center gap-2"
                                onClick={() => {
                                    if (window.confirm("Êtes-vous sûr de vouloir quitter cette famille ? Vous perdrez l'accès à ses recettes et son stock.")) {
                                        leaveFamily();
                                    }
                                }}
                                disabled={isLeaving}
                            >
                                <LogOut className="w-4 h-4" />
                                Quitter la famille
                            </Button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Family;
