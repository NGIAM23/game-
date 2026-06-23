import Shell from "@/components/Shell";

export default function CguPage() {
  return (
    <Shell>
      <h1 className="font-heading text-3xl mb-1">Conditions Générales d'Utilisation</h1>
      <p className="font-mono text-xs uppercase tracking-widest opacity-50 mb-6">Dernière mise à jour : juin 2026</p>

      <div className="flex flex-col gap-5 font-body text-sm leading-relaxed">
        <section>
          <h2 className="font-heading text-lg mb-2">1. Objet</h2>
          <p>
            Les présentes conditions générales d'utilisation (CGU) régissent l'accès et l'utilisation de l'application
            Luavio, accessible via le site web et/ou l'application mobile (ci-après « l'Application »). En créant un
            compte, l'utilisateur accepte sans réserve les présentes CGU.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg mb-2">2. Description du service</h2>
          <p>
            Luavio est une application de gamification de tâches personnelles permettant à l'utilisateur de suivre des
            défis quotidiens et hebdomadaires, de gagner de l'expérience (XP) et des Sparks (monnaie virtuelle interne),
            et d'accéder à des fonctionnalités sociales (classements, amis) et cosmétiques.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg mb-2">3. Compte utilisateur</h2>
          <p>
            L'utilisateur s'engage à fournir des informations exactes lors de son inscription et à conserver la
            confidentialité de ses identifiants. Toute activité réalisée depuis son compte est présumée effectuée par
            lui-même.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg mb-2">4. Achats et abonnements</h2>
          <p>
            L'Application propose un abonnement payant (« Luavio+ ») et des packs de monnaie virtuelle (« Sparks »)
            achetables via la plateforme de paiement Stripe. Les Sparks n'ont aucune valeur monétaire réelle, ne sont
            pas remboursables et ne peuvent être échangés contre de l'argent. L'abonnement Luavio+ est facturé
            mensuellement et peut être annulé à tout moment en contactant le support.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg mb-2">5. Vérification des preuves photo</h2>
          <p>
            L'Application propose une vérification optionnelle de certaines tâches par photo, analysée par un service
            d'intelligence artificielle tiers. Cette vérification est fournie à titre indicatif et peut comporter des
            erreurs. L'utilisateur reste seul responsable de la véracité de ses déclarations.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg mb-2">6. Comportement et fonctionnalités sociales</h2>
          <p>
            L'utilisateur s'engage à adopter un comportement respectueux envers les autres utilisateurs, notamment via
            les fonctionnalités de classement et d'amis. Tout abus pourra entraîner la suspension du compte.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg mb-2">7. Responsabilité</h2>
          <p>
            Luavio est un outil de motivation personnelle et ne constitue en aucun cas un avis médical, psychologique
            ou professionnel. L'éditeur ne pourra être tenu responsable des conséquences de l'usage de l'Application.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg mb-2">8. Modification des CGU</h2>
          <p>
            L'éditeur se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés
            de toute modification substantielle.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg mb-2">9. Contact</h2>
          <p>Pour toute question relative aux présentes CGU, contactez le support de l'application.</p>
        </section>
      </div>
    </Shell>
  );
}
