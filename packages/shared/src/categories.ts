export type CategoryId =
  | "corps"
  | "esprit"
  | "social"
  | "altruisme"
  | "productivite"
  | "creation"
  | "detoxEcran";

export interface Category {
  id: CategoryId;
  label: string;
  icon: string;
}

export const CATEGORIES: Category[] = [
  { id: "corps", label: "Corps", icon: "💪" },
  { id: "esprit", label: "Esprit", icon: "🧠" },
  { id: "social", label: "Social", icon: "❤️" },
  { id: "altruisme", label: "Altruisme", icon: "🤝" },
  { id: "productivite", label: "Productivité", icon: "💼" },
  { id: "creation", label: "Création", icon: "🎨" },
  { id: "detoxEcran", label: "Détox écran", icon: "📵" },
];
