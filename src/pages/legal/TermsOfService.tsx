import { LegalLayout } from "./LegalLayout";
import { Link } from "react-router-dom";

const TermsOfService = () => {
  return (
    <LegalLayout
      title="Conditions Générales d'Utilisation et de Vente (CGU / CGV)"
      subtitle="Applicables aux utilisateurs et abonnés de la plateforme À la carte"
      lastUpdated="27 septembre 2026"
      activeTab="terms"
    >
      <div className="bg-muted/50 border border-border/70 rounded-xl p-4 text-xs text-muted-foreground space-y-1">
        <p className="font-semibold text-foreground">Préambule</p>
        <p>
          Les présentes Conditions Générales d'Utilisation et de Vente (ci-après les « CGU/CGV ») régissent l'accès et l'utilisation de l'application et du site <strong>À la carte</strong> ainsi que la souscription à l'abonnement payant <strong>À la carte Premium</strong>.
        </p>
        <p>
          Toute inscription ou souscription implique l'acceptation pleine, entière et sans réserve des présentes conditions par l'utilisateur (ci-après le « Client » ou « l'Utilisateur »).
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold font-serif text-foreground">Article 1 - Identification de l'Éditeur et Vendeur</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Dénomination :</strong> [À la carte / Paul - À compléter]</li>
          <li><strong>Forme juridique :</strong> [Entreprise Individuelle / SAS / SARL - À compléter]</li>
          <li><strong>Siège social :</strong> [Adresse complète, France - À compléter]</li>
          <li><strong>Numéro SIRET / RCS :</strong> [À compléter]</li>
          <li><strong>Contact :</strong> <code>contact@alacarte.app</code></li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold font-serif text-foreground">Article 2 - Description des Services</h2>
        <p>
          <strong>À la carte</strong> est un assistant culinaire intelligent permettant aux particuliers :
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>D'enregistrer et organiser leurs recettes de cuisine personnelles ;</li>
          <li>De consulter un catalogue public de plus de 100 recettes du quotidien ;</li>
          <li>De gérer l'inventaire des ingrédients de leur cuisine (stock, placard, frigo, congélateur) ;</li>
          <li>De générer et synchroniser des listes de courses collaboratives ;</li>
          <li>De planifier des repas et de partager leur carnet au sein d'un groupe familial ;</li>
          <li>D'utiliser des fonctionnalités d'assistance par Intelligence Artificielle (suggestions de recettes, numérisation d'ingrédients ou de tickets).</li>
        </ul>
        <p>
          Le service est proposé sous deux formules : une version <strong>Gratuite</strong> (avec limites d'usage) et une formule par abonnement payant <strong>À la carte Premium</strong> (fonctionnalités avancées et sans limitation).
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold font-serif text-foreground">Article 3 - Accès au Service & Création de Compte</h2>
        <p>
          L'accès complet aux fonctionnalités de sauvegarde et synchronisation nécessite la création d'un compte personnel. L'Utilisateur s'engage à fournir des informations exactes et à préserver la stricte confidentialité de ses identifiants de connexion.
        </p>
        <p>
          Un mode « Démonstration » est proposé aux visiteurs non connectés pour découvrir les fonctionnalités dans la mémoire locale de leur navigateur.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold font-serif text-foreground">Article 4 - Prix et Modalités de Paiement de l'Abonnement Premium</h2>
        <p>
          Les tarifs applicables sont ceux en vigueur au jour de la souscription, affichés sur la page <Link to="/premium" className="text-primary underline">À la carte Premium</Link> :
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Abonnement Mensuel :</strong> 4,80 € TTC par mois, prélevé mensuellement ;</li>
          <li><strong>Abonnement Annuel :</strong> 42,00 € TTC par an (soit environ 3,50 € TTC par mois), prélevé annuellement.</li>
        </ul>
        <p>
          Les prix sont indiqués en <strong>Euros (€) Toutes Taxes Comprises (TTC)</strong>. L'Éditeur se réserve le droit de modifier ses prix pour l'avenir ; toute modification tarifaire sera notifiée au Client au moins 30 jours avant son entrée en vigueur.
        </p>
        <p>
          Le paiement s'effectue en ligne par carte bancaire via le prestataire sécurisé <strong>Stripe</strong>. Les transactions bénéficient du protocole de chiffrement SSL/TLS et du respect des normes PCI-DSS.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold font-serif text-foreground">Article 5 - Durée, Reconduction et Résiliation</h2>
        <p>
          L'abonnement prend effet dès validation du paiement pour la durée choisie (1 mois ou 1 an).
        </p>
        <p>
          <strong>Reconduction tacite :</strong> L'abonnement est renouvelé automatiquement à son échéance pour des périodes successives de même durée, sauf résiliation par l'Utilisateur avant la date d'échéance.
        </p>
        <p>
          <strong>Résiliation sans engagement :</strong> Le Client peut résilier son abonnement à tout moment, en un clic et sans motif, depuis son espace personnel (<Link to="/profile" className="text-primary underline">Profil</Link> &gt; Statut Premium &gt; Portail Stripe). La résiliation prend effet à l'issue de la période d'abonnement en cours déjà réglée. Aucun frais de résiliation n'est appliqué.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold font-serif text-foreground">Article 6 - Droit de Rétractation légal (Code de la consommation)</h2>
        <p>
          Conformément à l'article L. 221-18 du Code de la consommation, le Client consommateur dispose d'un délai légal de <strong>quatorze (14) jours calendaires</strong> à compter de la souscription pour exercer son droit de rétractation sans avoir à motiver sa décision ni à supporter de pénalités.
        </p>
        <p>
          Pour exercer ce droit ou consulter les conditions de remboursement et le formulaire type légal, le Client est invité à consulter notre page dédiée :{" "}
          <Link to="/refund" className="text-primary underline font-medium">Politique de Rétractation et Remboursement</Link>.
        </p>
        <p>
          Le remboursement intégral des sommes versées interviendra dans un délai maximum de quatorze (14) jours à compter de la réception de la notification de rétractation, en utilisant le même moyen de paiement que celui utilisé lors de la transaction initiale (crédit sur la carte bancaire via Stripe).
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold font-serif text-foreground">Article 7 - Garanties légales de conformité</h2>
        <p>
          Conformément aux articles L. 224-25-12 et suivants du Code de la consommation, le Client consommateur bénéficie de la <strong>garantie légale de conformité</strong> pour les contenus et services numériques. L'Éditeur s'engage à fournir un service conforme aux stipulations contractuelles et à fournir les mises à jour nécessaires au maintien de la conformité du service pendant toute la durée de la fourniture.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold font-serif text-foreground">Article 8 - Propriété intellectuelle et Règles d'utilisation</h2>
        <p>
          L'Utilisateur conserve l'entière propriété des recettes, photos et contenus qu'il ajoute personnellement sur la plateforme. Il concède à l'Éditeur une licence gratuite, non exclusive et mondiale pour la seule exécution technique des services (affichage, synchronisation, sauvegarde, partage familial souhaité).
        </p>
        <p>
          L'Utilisateur s'engage à ne pas diffuser de contenus illicites, haineux, diffamatoires ou portant atteinte aux droits de tiers. Tout usage automatisé abusif (scraping non autorisé, attaques DDoS) entraînera la suspension immédiate du compte.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold font-serif text-foreground">Article 9 - Responsabilité & Disponibilité du service</h2>
        <p>
          L'Éditeur s'efforce d'assurer une disponibilité du service 24h/24 et 7j/7, sous réserve des périodes de maintenance technique ou de cas de force majeure. L'Éditeur est tenu à une obligation de moyens.
        </p>
        <p>
          Les suggestions de recettes générées par Intelligence Artificielle (IA) sont fournies à titre indicatif. L'Utilisateur demeure seul responsable de la vérification des ingrédients, des allergènes et de la bonne cuisson des denrées consommées.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold font-serif text-foreground">Article 10 - Médiation de la consommation</h2>
        <p>
          Conformément aux articles L. 612-1 et suivants du Code de la consommation, en cas de litige non résolu par une réclamation préalable écrite auprès de notre service client (<code>contact@alacarte.app</code>), le Client consommateur a le droit de recourir gratuitement à un médiateur de la consommation :
        </p>
        <div className="bg-muted/40 p-4 rounded-xl space-y-1.5 border border-border/70 text-xs">
          <p className="font-semibold text-foreground">Médiateur de la consommation désigné :</p>
          <p><strong>Centre de Médiation et d'Arbitrage de Paris (CMAP)</strong> / ou CNPM Médiation Consommation</p>
          <p>Site web : <a href="https://www.cmap.fr" target="_blank" rel="noopener noreferrer" className="text-primary underline">https://www.cmap.fr</a> ou <a href="https://www.cnpm-mediation-consommation.eu" target="_blank" rel="noopener noreferrer" className="text-primary underline">https://www.cnpm-mediation-consommation.eu</a></p>
          <p>
            Plateforme Européenne de Règlement en Ligne des Litiges (RLL) :{" "}
            <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-primary underline">https://ec.europa.eu/consumers/odr</a>
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold font-serif text-foreground">Article 11 - Droit applicable et Juridiction compétente</h2>
        <p>
          Les présentes CGU/CGV sont soumises exclusivement au <strong>droit français</strong>. Tout litige relatif à leur validité, leur interprétation ou leur exécution sera soumis aux tribunaux français territorialement compétents en application des règles du Code de procédure civile et du Code de la consommation.
        </p>
      </section>
    </LegalLayout>
  );
};

export default TermsOfService;
