import { LegalLayout } from "./LegalLayout";
import { ShieldCheck, Mail, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <LegalLayout
      title="Politique de Confidentialité"
      subtitle="Conformité au Règlement Général sur la Protection des Données (RGPD - Règlement UE 2016/679) et à la Loi Informatique et Libertés"
      lastUpdated="27 septembre 2026"
      activeTab="privacy"
    >
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3 text-sm">
        <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-foreground">Notre engagement pour votre vie privée</p>
          <p className="text-muted-foreground text-xs mt-0.5 leading-relaxed">
            Nous respectons le principe fondamental de minimisation des données : seules les données strictement indispensables à la fourniture de nos services de cuisine et gestion de stock sont collectées. Vos données ne sont jamais vendues, louées ou cédées à des régies publicitaires.
          </p>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold font-serif text-foreground">1. Responsable du traitement</h2>
        <p>
          Le responsable du traitement des données à caractère personnel collectées sur l'application <strong>À la carte</strong> est l'éditeur du service (ci-après « Nous » ou « l'Éditeur »), joignable à l'adresse suivante :
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Délégué / Référent à la protection des données (DPO) :</strong> Paul [Nom de famille]</li>
          <li><strong>Courriel dédié à l'exercice de vos droits :</strong> <code>contact@alacarte.app</code> (Objet : « Données Personnelles / RGPD »)</li>
          <li><strong>Adresse postale :</strong> [Adresse postale du siège social, France]</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold font-serif text-foreground">2. Données collectées et principe de minimisation</h2>
        <p>
          Conformément à l'article 5.1.c du RGPD, nous ne collectons que les données strictement nécessaires (« minimisation des données ») pour les finalités décrites ci-dessous :
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse border border-border/70 my-4">
            <thead>
              <tr className="bg-muted/70 text-foreground font-semibold">
                <th className="border border-border/70 p-2.5">Catégorie</th>
                <th className="border border-border/70 p-2.5">Données collectées</th>
                <th className="border border-border/70 p-2.5">Finalité</th>
                <th className="border border-border/70 p-2.5">Base légale (RGPD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              <tr>
                <td className="border border-border/70 p-2.5 font-medium">Compte & Authentification</td>
                <td className="border border-border/70 p-2.5">Adresse email, mot de passe haché (bcrypt/argon2), prénom et nom facultatifs</td>
                <td className="border border-border/70 p-2.5">Création et sécurisation de l'accès à l'espace personnel</td>
                <td className="border border-border/70 p-2.5">Exécution du contrat (Art. 6.1.b)</td>
              </tr>
              <tr>
                <td className="border border-border/70 p-2.5 font-medium">Contenu utilisateur</td>
                <td className="border border-border/70 p-2.5">Recettes enregistrées, ingrédients, inventaire du stock, listes de courses, plannings de repas, notes et photos de plats</td>
                <td className="border border-border/70 p-2.5">Fourniture des fonctionnalités centrales de l'application</td>
                <td className="border border-border/70 p-2.5">Exécution du contrat (Art. 6.1.b)</td>
              </tr>
              <tr>
                <td className="border border-border/70 p-2.5 font-medium">Abonnement & Facturation</td>
                <td className="border border-border/70 p-2.5">Identifiant client Stripe, statut de l'abonnement, historique des factures (les coordonnées bancaires complètes sont traitées exclusivement par Stripe et jamais hébergées par À la carte)</td>
                <td className="border border-border/70 p-2.5">Gestion de l'abonnement Premium, facturation et tenue comptable</td>
                <td className="border border-border/70 p-2.5">Exécution du contrat (Art. 6.1.b) et obligation légale comptable (Art. 6.1.c)</td>
              </tr>
              <tr>
                <td className="border border-border/70 p-2.5 font-medium">Partage familial</td>
                <td className="border border-border/70 p-2.5">Adresse email des membres invités pour le partage du foyer culinaire</td>
                <td className="border border-border/70 p-2.5">Permettre la collaboration au sein d'un même foyer</td>
                <td className="border border-border/70 p-2.5">Consentement & Exécution du contrat (Art. 6.1.a & b)</td>
              </tr>
              <tr>
                <td className="border border-border/70 p-2.5 font-medium">Fonctionnalités IA</td>
                <td className="border border-border/70 p-2.5">Texte des requêtes de suggestion de recette ou photos de tickets/recettes numérisées</td>
                <td className="border border-border/70 p-2.5">Génération d'idées de recettes ou extraction textuelle via l'API Gemini</td>
                <td className="border border-border/70 p-2.5">Exécution du contrat (Art. 6.1.b)</td>
              </tr>
              <tr>
                <td className="border border-border/70 p-2.5 font-medium">Avis & Support</td>
                <td className="border border-border/70 p-2.5">Message de retour, note, catégorie de signalement, email facultatif</td>
                <td className="border border-border/70 p-2.5">Correction des anomalies et amélioration continue de l'expérience utilisateur</td>
                <td className="border border-border/70 p-2.5">Intérêt légitime (Art. 6.1.f)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold font-serif text-foreground">3. Sous-traitants et destinataires des données</h2>
        <p>
          Vos données personnelles sont traitées de manière confidentielle et ne sont transmises qu'aux sous-traitants techniques indispensables au fonctionnement du service :
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Supabase Inc. (Base de données et authentification) :</strong> hébergement sécurisé de la base de données PostgreSQL et gestion de l'authentification avec Row Level Security (RLS). Serveurs hébergés au sein de l'Union Européenne (Allemagne / Francfort).
          </li>
          <li>
            <strong>Stripe Payments Europe Ltd (Paiements et abonnements) :</strong> organisme de paiement certifié PCI-DSS Niveau 1 garantissant la sécurité maximale de vos transactions bancaires.
          </li>
          <li>
            <strong>Google Ireland Limited / Google LLC (API Gemini) :</strong> utilisé ponctuellement pour le traitement des prompts d'intelligence artificielle lors des demandes de suggestions de recettes ou numérisation de recettes. Aucune donnée personnelle d'identification (nom, mot de passe) n'est transmise aux modèles d'IA.
          </li>
          <li>
            <strong>Vercel Inc. :</strong> hébergement du frontend et réseau de diffusion de contenu (CDN).
          </li>
        </ul>
        <p>
          En cas de transfert en dehors de l'Espace Économique Européen (EEE), ces transferts sont strictement encadrés par des Clauses Contractuelles Types (CCT) approuvées par la Commission Européenne ou par le Data Privacy Framework (DPF) UE-États-Unis.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold font-serif text-foreground">4. Durées de conservation des données</h2>
        <ul className="list-disc pl-6 space-y-1.5">
          <li><strong>Données du compte et contenus (recettes, stock, courses) :</strong> conservées pendant toute la durée d'activation du compte. En cas d'inactivité continue pendant une durée de 3 ans, le compte et ses données sont définitivement supprimés après avertissement préalable par email.</li>
          <li><strong>Données de facturation et d'abonnement :</strong> conservées pendant 10 ans à compter de la clôture de l'exercice comptable en conformité avec l'article L. 123-22 du Code de commerce.</li>
          <li><strong>Logs techniques de connexion et sécurité :</strong> conservés pour une durée maximale de 1 an conformément aux obligations légales de la LCEN.</li>
          <li><strong>Données en mode démonstration :</strong> stockées exclusivement dans la mémoire locale de votre navigateur (<code>localStorage</code>) et non sur nos serveurs. Vous pouvez les effacer à tout moment en vidant les données de votre navigateur.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold font-serif text-foreground">5. Sécurité de vos données</h2>
        <p>
          Nous mettons en œuvre des mesures techniques et organisationnelles conformes à l'état de l'art pour assurer la confidentialité, l'intégrité et la disponibilité de vos données :
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Chiffrement de toutes les communications en transit via le protocole TLS/HTTPS (SSL).</li>
          <li>Isolation stricte des données entre utilisateurs via les politiques PostgreSQL RLS (Row Level Security).</li>
          <li>Hachage sécurisé des mots de passe sans stockage en clair.</li>
          <li>Paiements délégués à un prestataire tiers audité PCI-DSS (Stripe).</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold font-serif text-foreground">6. Vos droits en vertu du RGPD</h2>
        <p>Conformément aux articles 15 à 22 du RGPD, vous disposez des droits suivants sur vos données :</p>
        <ul className="list-disc pl-6 space-y-1.5">
          <li><strong>Droit d'accès (Art. 15) :</strong> obtenir la confirmation que vos données sont traitées et en obtenir une copie.</li>
          <li><strong>Droit de rectification (Art. 16) :</strong> modifier vos informations inexactes ou incomplètes directement depuis votre page <Link to="/profile/edit" className="text-primary underline">Profil</Link>.</li>
          <li><strong>Droit à l'effacement / Droit à l'oubli (Art. 17) :</strong> demander la suppression définitive de votre compte et de l'ensemble de vos données associées.</li>
          <li><strong>Droit à la limitation du traitement (Art. 18) :</strong> demander le gel temporaire du traitement de vos données dans les cas prévus par la loi.</li>
          <li><strong>Droit à la portabilité (Art. 20) :</strong> recevoir l'ensemble de vos données dans un format structuré, couramment utilisé et lisible par machine (JSON). Vous pouvez exporter vos données directement depuis la section <Link to="/profile" className="text-primary underline">Profil</Link>.</li>
          <li><strong>Droit d'opposition (Art. 21) :</strong> vous opposer à tout moment à certains traitements fondés sur l'intérêt légitime.</li>
          <li><strong>Directives post-mortem (Art. 85 Loi Informatique et Libertés) :</strong> définir des directives relatives à la conservation, à l'effacement et à la communication de vos données après votre décès.</li>
        </ul>

        <div className="bg-muted/40 p-4 rounded-xl border border-border/70 space-y-2 mt-4">
          <p className="font-semibold text-foreground flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" /> Comment exercer vos droits ?
          </p>
          <p className="text-xs text-muted-foreground">
            Pour exercer l'un de ces droits, il vous suffit de nous adresser un courriel à <code>contact@alacarte.app</code> ou d'utiliser le bouton d'export ou de suppression disponible dans votre espace <Link to="/profile" className="text-primary underline">Profil</Link>. Nous nous engageons à répondre à toute demande dans un délai légal maximal d'un (1) mois à compter de sa réception.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold font-serif text-foreground">7. Réclamation auprès de l'autorité de contrôle (CNIL)</h2>
        <p>
          Si vous estimez, après nous avoir contactés, que vos droits sur vos données personnelles ne sont pas respectés, vous disposez du droit d'introduire une réclamation (plainte) auprès de la Commission Nationale de l'Informatique et des Libertés (CNIL) :
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Site web :</strong> <a href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center gap-1">www.cnil.fr <ExternalLink className="w-3 h-3" /></a></li>
          <li><strong>Adresse postale :</strong> CNIL - 3 Place de Fontenoy - TSA 80715 - 75334 PARIS CEDEX 07</li>
          <li><strong>Téléphone :</strong> 01 53 73 22 22</li>
        </ul>
      </section>
    </LegalLayout>
  );
};

export default PrivacyPolicy;
