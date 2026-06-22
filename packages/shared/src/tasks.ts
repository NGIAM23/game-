import type { CategoryId } from "./categories";

export interface Task {
  id: string;
  category: CategoryId;
  label: string;
  baseXp: number;
}

// Sous-ensemble du pool décrit dans docs/11_taches_safe.md, pour le mock V1.
export const TASK_POOL: Task[] = [
  { id: "sport-20min", category: "corps", label: "Séance sport ≥20 min", baseXp: 30 },
  { id: "10k-pas", category: "corps", label: "10 000 pas", baseXp: 25 },
  { id: "8h-sommeil", category: "corps", label: "8h de sommeil", baseXp: 20 },
  { id: "lire-30min", category: "esprit", label: "Lire 30 min", baseXp: 25 },
  { id: "mediter-10min", category: "esprit", label: "Méditer 10 min", baseXp: 20 },
  { id: "appeler-famille", category: "social", label: "Appeler la famille", baseXp: 20 },
  { id: "voir-ami", category: "social", label: "Voir un ami IRL", baseXp: 30 },
  { id: "ramasser-dechet", category: "altruisme", label: "Ramasser un déchet", baseXp: 15 },
  { id: "don-asso", category: "altruisme", label: "Don ≥5€ à une asso vérifiée", baseXp: 40 },
  { id: "boite-mail-zero", category: "productivite", label: "Boîte mail à zéro", baseXp: 20 },
  { id: "menage-chambre", category: "productivite", label: "Ménage chambre", baseXp: 20 },
  { id: "dessiner", category: "creation", label: "Dessiner / peindre", baseXp: 25 },
  { id: "ecrire-500-mots", category: "creation", label: "Écrire 500 mots", baseXp: 25 },
  { id: "limite-ecran", category: "detoxEcran", label: "Limite écran <2h", baseXp: 30 },
  { id: "pas-de-reseaux", category: "detoxEcran", label: "Pas de réseaux sociaux 1 jour", baseXp: 35 },
];

// Tâches détox écran = XP ×3 à ×5 (signature du jeu, voir RECAP_FINAL §3)
export const DETOX_XP_MULTIPLIER = 3;

export function xpForTask(task: Task): number {
  return task.category === "detoxEcran" ? task.baseXp * DETOX_XP_MULTIPLIER : task.baseXp;
}
