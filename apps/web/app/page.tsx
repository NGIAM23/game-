import { CATEGORIES } from "@luavio/shared";

const catBg: Record<string, string> = {
  corps: "bg-cat-corps",
  esprit: "bg-cat-esprit",
  social: "bg-cat-social",
  altruisme: "bg-cat-altruisme",
  productivite: "bg-cat-productivite",
  creation: "bg-cat-creation",
  detoxEcran: "bg-cat-detox",
};

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-12 max-w-3xl mx-auto">
      <header className="text-center mb-12">
        <h1 className="font-heading text-5xl text-outline mb-3">luavio</h1>
        <p className="text-lg">Le seul jeu où tu gagnes des niveaux dans la vraie vie, avec preuve.</p>
        <p className="font-heading text-secondary mt-4 text-xl">Devenir meilleur, pour de vrai.</p>
      </header>

      <section className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-12">
        {CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            className={`rounded-sticker border-2 border-outline p-4 text-center text-white font-body shadow-[0_4px_0_0_#1A1A2E] ${catBg[cat.id]}`}
          >
            <div className="text-2xl mb-1">{cat.icon}</div>
            <div className="font-heading text-sm">{cat.label}</div>
          </div>
        ))}
      </section>

      <section className="text-center">
        <button className="font-heading bg-primary border-2 border-outline rounded-sticker px-8 py-4 text-lg shadow-[0_4px_0_0_#1A1A2E] active:translate-y-1 active:shadow-none transition">
          Rejoindre la beta
        </button>
      </section>
    </main>
  );
}
