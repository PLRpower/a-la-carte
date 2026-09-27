import { LegalLayout } from "./LegalLayout";

const LegalNotice = () => {
  return (
    <LegalLayout
      title="Mentions Légales"
      subtitle="Conformément à la Loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique (LCEN)"
      lastUpdated="27 septembre 2026"
      activeTab="legal"
    >
      <section className="space-y-3">
        <h2 className="text-xl font-bold font-serif text-foreground">1. Éditeur de l'application</h2>
        <p>
          L'application et le site web <strong>À la carte</strong> (accessible à l'adresse{" "}
          <code>https://alacarte.app</code> ou tout sous-domaine associé) sont édités par :
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Nom / Dénomination sociale :</strong> [Paul / À la carte SAS ou EI - À compléter]</li>
          <li><strong>Forme juridique :</strong> [Entreprise Individuelle / SAS / SARL - À compléter]</li>
          <li><strong>Siège social :</strong> [Adresse postale complète, France - À compléter]</li>
          <li><strong>Numéro d'immatriculation :</strong> [RCS / SIRET - À renseigner, ex: 123 456 789 00012]</li>
          <li><strong>Numéro de TVA intracommunautaire :</strong> [FR XX 123456789 ou « Franchise en base de TVA (art. 293 B du CGI) »]</li>
          <li><strong>Email de contact :</strong> contact@alacarte.app</li>
          <li><strong>Téléphone :</strong> [Numéro de téléphone de contact - À compléter]</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold font-serif text-foreground">2. Directeur de la publication</h2>
        <p>
          Le Directeur de la publication du site et de l'application est :{" "}
          <strong>Paul [Nom de famille - À renseigner]</strong>, en qualité de fondateur / représentant légal.
        </p>
        <p>Contact : <code>contact@alacarte.app</code></p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold font-serif text-foreground">3. Hébergement de l'application</h2>
        <p>L'infrastructure d'hébergement est assurée par :</p>
        <div className="bg-muted/40 p-4 rounded-xl space-y-2 border border-border/60">
          <p className="font-semibold text-foreground">Hébergement Frontend & CDN :</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Prestataire :</strong> Vercel Inc.</li>
            <li><strong>Adresse :</strong> 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis</li>
            <li><strong>Site web :</strong> <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">https://vercel.com</a></li>
          </ul>
        </div>
        <div className="bg-muted/40 p-4 rounded-xl space-y-2 border border-border/60">
          <p className="font-semibold text-foreground">Base de données, Stockage & Authentification :</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Prestataire :</strong> Supabase Inc.</li>
            <li><strong>Adresse :</strong> 970 Toa Payoh North #07-04, Singapour 318992 (Serveurs localisés dans l'Union Européenne - Région Francfort / Paris)</li>
            <li><strong>Site web :</strong> <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">https://supabase.com</a></li>
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold font-serif text-foreground">4. Propriété intellectuelle</h2>
        <p>
          L'ensemble des éléments constituant l'application <strong>À la carte</strong> (textes, graphismes, logiciels, logos, icônes, images, sons, bases de données, code source) est la propriété exclusive de l'Éditeur ou de ses partenaires et est protégé par le droit d'auteur, le droit des marques et le Code de la propriété intellectuelle.
        </p>
        <p>
          Toute reproduction, représentation, modification, diffusion ou exploitation totale ou partielle du contenu, par quelque procédé que ce soit, sans autorisation écrite préalable expresse de l'Éditeur est strictement interdite et constituerait une contrefaçon sanctionnée par les articles L. 335-2 et suivants du Code de la propriété intellectuelle.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold font-serif text-foreground">5. Protection des données personnelles & Cookies</h2>
        <p>
          Pour toute information relative à la collecte, au traitement et à la protection de vos données à caractère personnel dans le cadre du RGPD, ainsi que sur l'utilisation des traceurs, veuillez consulter :
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Notre <a href="/privacy" className="text-primary underline font-medium">Politique de Confidentialité</a></li>
          <li>Notre <a href="/cookies" className="text-primary underline font-medium">Politique relative aux Cookies et Traceurs</a></li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold font-serif text-foreground">6. Litiges et droit applicable</h2>
        <p>
          Les présentes mentions légales sont régies par le droit français. En cas de litige relatif à l'interprétation ou à l'exécution des présentes, et à défaut d'accord amiable, les tribunaux français compétents seront seuls habilités à en connaître.
        </p>
      </section>
    </LegalLayout>
  );
};

export default LegalNotice;
