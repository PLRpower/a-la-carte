import { LegalLayout } from "./LegalLayout";
import { ShieldCheck } from "lucide-react";

const CookiePolicy = () => {
  return (
    <LegalLayout
      title="Politique relative aux Cookies & Traceurs"
      subtitle="Transparence sur le stockage local et les traceurs conformément aux directives de la CNIL"
      lastUpdated="27 septembre 2026"
      activeTab="cookies"
    >
      {/* CNIL Assessment Banner */}
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-start gap-3 text-sm">
        <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-emerald-900 dark:text-emerald-300">
            Avis de conformité CNIL : Aucun cookie publicitaire ou traceur intrusif
          </p>
          <p className="text-emerald-800/90 dark:text-emerald-300/80 text-xs leading-relaxed">
            L'application <strong>À la carte</strong> utilise <strong>exclusivement des traceurs et données de stockage local strictement nécessaires</strong> au fonctionnement de l'application (authentification, affichage de l'interface, mode démo). En application de l'article 82 de la loi Informatique et Libertés et des lignes directrices de la CNIL, ces traceurs sont légalement <strong>exemptés du recueil de consentement préalable</strong>.
          </p>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold font-serif text-foreground">1. Qu'est-ce qu'un cookie ou traceur ?</h2>
        <p>
          Un cookie ou traceur est un petit fichier texte ou une clé de stockage local (<code>localStorage</code>) déposé sur votre terminal (ordinateur, smartphone, tablette) lors de la consultation d'un site internet ou de l'utilisation d'une application web. Il permet de mémoriser temporairement des données techniques relatives à votre navigation.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold font-serif text-foreground">2. Traceurs et stockage utilisés sur À la carte</h2>
        <p>
          Voici l'inventaire complet et exhaustif de tous les cookies et clés de stockage local utilisés par notre plateforme :
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse border border-border/70 my-4">
            <thead>
              <tr className="bg-muted/70 text-foreground font-semibold">
                <th className="border border-border/70 p-2.5">Clé / Nom</th>
                <th className="border border-border/70 p-2.5">Type & Support</th>
                <th className="border border-border/70 p-2.5">Finalité</th>
                <th className="border border-border/70 p-2.5">Durée de conservation</th>
                <th className="border border-border/70 p-2.5">Statut CNIL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              <tr>
                <td className="border border-border/70 p-2.5 font-mono">sb-*-auth-token</td>
                <td className="border border-border/70 p-2.5">localStorage (Supabase)</td>
                <td className="border border-border/70 p-2.5">Maintenir la session de connexion sécurisée de l'utilisateur</td>
                <td className="border border-border/70 p-2.5">Durée de la session ou jusqu'à la déconnexion manuelle</td>
                <td className="border border-border/70 p-2.5 text-emerald-600 font-semibold">Strictement nécessaire (Exempté)</td>
              </tr>
              <tr>
                <td className="border border-border/70 p-2.5 font-mono">sidebar:state</td>
                <td className="border border-border/70 p-2.5">Cookie HTTP technique</td>
                <td className="border border-border/70 p-2.5">Mémoriser si le volet de navigation latéral est ouvert ou fermé</td>
                <td className="border border-border/70 p-2.5">7 jours</td>
                <td className="border border-border/70 p-2.5 text-emerald-600 font-semibold">Strictement nécessaire (Exempté)</td>
              </tr>
              <tr>
                <td className="border border-border/70 p-2.5 font-mono">onboardingCompleted</td>
                <td className="border border-border/70 p-2.5">localStorage</td>
                <td className="border border-border/70 p-2.5">Éviter d'afficher à nouveau le tutoriel de bienvenue après sa clôture</td>
                <td className="border border-border/70 p-2.5">Persistant sur le terminal</td>
                <td className="border border-border/70 p-2.5 text-emerald-600 font-semibold">Strictement nécessaire (Exempté)</td>
              </tr>
              <tr>
                <td className="border border-border/70 p-2.5 font-mono">isDemoMode</td>
                <td className="border border-border/70 p-2.5">localStorage</td>
                <td className="border border-border/70 p-2.5">Permettre au visiteur de tester l'application sans compte</td>
                <td className="border border-border/70 p-2.5">Jusqu'à la fin de la visite démo ou inscription</td>
                <td className="border border-border/70 p-2.5 text-emerald-600 font-semibold">Strictement nécessaire (Exempté)</td>
              </tr>
              <tr>
                <td className="border border-border/70 p-2.5 font-mono">cookieConsentAcknowledged</td>
                <td className="border border-border/70 p-2.5">localStorage</td>
                <td className="border border-border/70 p-2.5">Mémoriser que l'utilisateur a pris connaissance de l'information cookies</td>
                <td className="border border-border/70 p-2.5">6 mois (recommandation CNIL)</td>
                <td className="border border-border/70 p-2.5 text-emerald-600 font-semibold">Strictement nécessaire (Exempté)</td>
              </tr>
              <tr>
                <td className="border border-border/70 p-2.5 font-mono">cache_local (journal, courses)</td>
                <td className="border border-border/70 p-2.5">localStorage</td>
                <td className="border border-border/70 p-2.5">Sauvegarder temporairement vos saisies hors-ligne</td>
                <td className="border border-border/70 p-2.5">Jusqu'à synchronisation ou effacement du cache</td>
                <td className="border border-border/70 p-2.5 text-emerald-600 font-semibold">Strictement nécessaire (Exempté)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold font-serif text-foreground">3. Absence totale de cookies publicitaires ou de profilage</h2>
        <p>
          Nous nous engageons solennellement à ne déposer <strong>aucun cookie tiers</strong>, aucun pixel de suivi Facebook, aucun script Google Analytics de profilage, ni aucun système de ciblage publicitaire.
        </p>
        <p>
          Votre navigation culinaire, vos listes de courses et vos recettes restent votre domaine privé exclusif.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold font-serif text-foreground">4. Comment gérer ou supprimer les cookies et données locales ?</h2>
        <p>
          Bien que nos traceurs soient indispensables au fonctionnement de la session, vous pouvez configurer votre navigateur pour bloquer ou supprimer les cookies et le stockage local à tout moment. Veuillez noter que la désactivation du stockage local empêchera la connexion à votre compte personnel.
        </p>
        <ul className="list-disc pl-6 space-y-1.5">
          <li><strong>Google Chrome :</strong> Paramètres &gt; Confidentialité et sécurité &gt; Cookies et données de sites.</li>
          <li><strong>Mozilla Firefox :</strong> Paramètres &gt; Vie privée et sécurité &gt; Cookies et données de sites.</li>
          <li><strong>Apple Safari :</strong> Préférences &gt; Confidentialité &gt; Gérer les données de sites web.</li>
          <li><strong>Microsoft Edge :</strong> Paramètres &gt; Cookies et autorisations de site.</li>
        </ul>
      </section>
    </LegalLayout>
  );
};

export default CookiePolicy;
