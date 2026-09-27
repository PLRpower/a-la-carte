import { useState } from "react";
import { LegalLayout } from "./LegalLayout";
import { Copy, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const RefundPolicy = () => {
  const [copied, setCopied] = useState(false);

  const withdrawalFormText = `À l'attention de :
Service Client "À la carte"
Email : contact@alacarte.app

Je vous notifie par la présente ma rétractation du contrat portant sur la souscription à l'abonnement "À la carte Premium" ci-dessous :

- Commandé le / Souscrit le : [Date de la commande]
- Nom et Prénom de l'utilisateur : [Votre nom et prénom]
- Adresse email associée au compte : [Votre email]
- Référence de la transaction ou facture (si connue) : [Numéro de facture Stripe]

Date : [Date du jour]
Signature (uniquement en cas de notification par courrier papier) :`;

  const copyForm = () => {
    navigator.clipboard.writeText(withdrawalFormText);
    setCopied(true);
    toast.success("Modèle de formulaire copié dans le presse-papier !");
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <LegalLayout
      title="Politique de Rétractation & Remboursement"
      subtitle="Conformément aux articles L. 221-18 et suivants du Code de la consommation"
      lastUpdated="27 septembre 2026"
      activeTab="refund"
    >
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3 text-sm">
        <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-foreground">Garantie légale de rétractation de 14 jours</p>
          <p className="text-muted-foreground text-xs mt-0.5 leading-relaxed">
            Vous disposez d'un délai légal de quatorze (14) jours francs à compter de votre souscription pour exercer votre droit de rétractation et obtenir le remboursement intégral de votre abonnement sans justification requise.
          </p>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold font-serif text-foreground">1. Droit légal de rétractation</h2>
        <p>
          Conformément aux dispositions de l'article L. 221-18 du Code de la consommation français, tout consommateur souscrivant un abonnement <strong>À la carte Premium</strong> dispose d'un délai de <strong>14 jours calendaires</strong> à compter de la date de la transaction pour exercer son droit de rétractation auprès de l'Éditeur, sans avoir à motiver sa décision ni à payer de pénalités.
        </p>
        <p>
          Lorsque le délai de 14 jours expire un samedi, un dimanche ou un jour férié ou chômé, il est prorogé jusqu'au premier jour ouvrable suivant.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold font-serif text-foreground">2. Modalités d'exercice du droit de rétractation</h2>
        <p>
          Pour exercer votre droit de rétractation dans le délai imparti, vous devez nous notifier votre décision dénuée d'ambiguïté avant l'expiration du délai de 14 jours, par l'un des moyens suivants :
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Par email :</strong> en adressant un message à <code>contact@alacarte.app</code> avec l'objet <em>« Demande de rétractation »</em>, en utilisant de préférence le modèle de formulaire ci-dessous.
          </li>
          <li>
            <strong>Depuis votre espace personnel :</strong> en résiliant l'abonnement depuis la gestion de compte dans les 14 jours et en complétant le formulaire de rétractation par email pour déclencher le remboursement immédiat.
          </li>
        </ul>
      </section>

      {/* Formulaire type légal */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-serif text-foreground">3. Formulaire type de rétractation</h2>
          <Button
            size="sm"
            variant="outline"
            className="text-xs gap-1.5"
            onClick={copyForm}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copié" : "Copier le formulaire"}</span>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          (Veuillez compléter et renvoyer ce formulaire uniquement si vous souhaitez vous rétracter du contrat d'abonnement - Annexe à l'article R. 221-1 du Code de la consommation)
        </p>
        <pre className="bg-muted p-4 rounded-xl text-xs font-mono whitespace-pre-wrap border border-border/80 text-foreground overflow-x-auto">
          {withdrawalFormText}
        </pre>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold font-serif text-foreground">4. Délais et modalités de remboursement</h2>
        <p>
          En cas d'exercice régulier du droit de rétractation, nous nous engageons à vous rembourser la totalité des sommes versées lors de la souscription.
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Délai de remboursement :</strong> le remboursement est effectué au plus tard sous <strong>quatorze (14) jours</strong> calendaires à compter de la date à laquelle nous sommes informés de votre décision de rétractation.</li>
          <li><strong>Moyen de remboursement :</strong> le remboursement est effectué en utilisant le même moyen de paiement que celui utilisé lors de la transaction initiale (recrédit automatique sur la carte bancaire via la passerelle sécurisée Stripe).</li>
          <li><strong>Sans frais :</strong> ce remboursement n'occasionnera aucun frais pour vous.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold font-serif text-foreground">5. Résiliation après l'expiration du délai de rétractation</h2>
        <p>
          Au-delà du délai légal de 14 jours, vous pouvez résilier votre abonnement Premium à tout moment, en toute autonomie et sans préavis :
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>La résiliation interrompt le renouvellement automatique pour la période suivante.</li>
          <li>Vous conservez l'accès à l'ensemble des avantages Premium jusqu'à la fin de la période mensuelle ou annuelle déjà réglée.</li>
          <li>Conformément aux usages du commerce électronique, aucun remboursement au prorata temporis n'est exigible pour la période restante après les 14 premiers jours, sauf geste commercial accordé par notre support en cas de motif légitime avéré (indisponibilité prolongée du service, etc.).</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold font-serif text-foreground">6. Assistance et réclamations</h2>
        <p>
          Notre équipe est à votre disposition pour toute question relative à votre facturation ou pour vous assister dans vos démarches :
        </p>
        <p className="font-medium text-foreground">
          Courriel : <code>contact@alacarte.app</code>
        </p>
      </section>
    </LegalLayout>
  );
};

export default RefundPolicy;
