import Shell from "@/components/Shell";

export default function ConfidentialitePage() {
  return (
    <Shell>
      <h1 className="font-heading text-3xl mb-1">Politique de confidentialité</h1>
      <p className="font-mono text-xs uppercase tracking-widest opacity-50 mb-6">Dernière mise à jour : juin 2026</p>

      <div className="flex flex-col gap-5 font-body text-sm leading-relaxed">
        <section>
          <h2 className="font-heading text-lg mb-2">1. Données collectées</h2>
          <p>
            luavio collecte les données suivantes : adresse e-mail, pseudo, données de progression (XP, niveau, série de
            jours, tâches complétées), données de paiement (gérées exclusivement par Stripe, luavio ne stocke aucune
            donnée bancaire), et le cas échéant les photos soumises pour la vérification de preuves de tâches.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg mb-2">2. Utilisation des données</h2>
          <p>
            Les données sont utilisées pour fournir le service (suivi de progression, classement, fonctionnalités
            sociales), traiter les paiements, et améliorer l'Application. Les photos de vérification sont transmises de
            manière ponctuelle à un service d'intelligence artificielle tiers (Google Gemini) à des fins d'analyse
            automatique et ne sont pas conservées par luavio au-delà du traitement immédiat.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg mb-2">3. Partage des données</h2>
          <p>
            Les données de paiement sont traitées par Stripe Inc. conformément à sa propre politique de confidentialité.
            Les photos de vérification sont traitées par Google (Gemini API). luavio ne vend ni ne partage les données
            personnelles à des fins publicitaires.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg mb-2">4. Visibilité des données</h2>
          <p>
            Le pseudo, l'avatar, le niveau et la série de jours sont visibles publiquement sur le profil et le
            classement. Les statistiques détaillées par catégorie restent privées.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg mb-2">5. Conservation des données</h2>
          <p>
            Les données sont conservées tant que le compte est actif. L'utilisateur peut demander la suppression de son
            compte et de ses données en contactant le support.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg mb-2">6. Droits de l'utilisateur</h2>
          <p>
            Conformément au RGPD, l'utilisateur dispose d'un droit d'accès, de rectification, de suppression et de
            portabilité de ses données. Pour exercer ces droits, contactez le support de l'application.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg mb-2">7. Sécurité</h2>
          <p>
            Les données sont stockées chez Supabase avec un accès restreint par des règles de sécurité au niveau des
            lignes (Row Level Security). Les secrets de paiement et les clés d'API ne sont jamais exposés côté client.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg mb-2">8. Contact</h2>
          <p>Pour toute question relative à cette politique, contactez le support de l'application.</p>
        </section>
      </div>
    </Shell>
  );
}
