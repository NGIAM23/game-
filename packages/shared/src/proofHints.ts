import type { CategoryId } from "./categories";

// Hint par tâche : ce qu'il faut prendre en photo pour que ce soit crédible et vérifiable par l'IA en un coup d'œil.
export const TASK_PROOF_HINTS: Record<string, string> = {
  // corps
  "sport-20min": "Photo de toi en train de t'entraîner, ou capture d'écran d'une appli de sport (montre, Strava...) montrant la séance.",
  "10k-pas": "Capture d'écran du compteur de pas de ton téléphone ou de ta montre, qui affiche le total du jour.",
  "8h-sommeil": "Capture d'écran de ton suivi de sommeil (téléphone, montre connectée) montrant la durée.",
  "etirements-10min": "Photo ou vidéo courte de toi en train de t'étirer.",
  escaliers: "Photo prise dans les escaliers que tu viens de monter.",
  "marche-15min": "Capture d'écran d'un trajet/itinéraire (appli de marche ou carte) ou photo prise en extérieur pendant la marche.",
  "boire-2l-eau": "Photo de ta bouteille/gourde graduée vide, ou capture d'écran d'une appli de suivi d'hydratation.",
  "petit-dej-equilibre": "Photo de ton petit-déjeuner sur la table.",

  // esprit
  "lire-30min": "Photo du livre ouvert avec ta main ou ton marque-page, ou capture d'écran du temps de lecture d'une appli (Kindle...).",
  "mediter-10min": "Capture d'écran d'une appli de méditation montrant la session terminée (durée).",
  "podcast-educatif": "Capture d'écran de l'appli podcast montrant l'épisode et la progression.",
  "apprendre-mot-langue": "Capture d'écran de l'appli d'apprentissage de langue (Duolingo...) montrant la leçon faite.",
  "journal-intime": "Photo de la page de ton journal écrite (le contenu peut être flouté).",
  "sans-notif-1h": "Capture d'écran du mode \"Ne pas déranger\"/Focus activé avec l'heure visible.",

  // social
  "appeler-famille": "Capture d'écran de l'appel (durée, contact) dans ton journal d'appels.",
  "voir-ami": "Photo de toi avec ton ami(e).",
  "complimenter-inconnu": "Photo du lieu où ça s'est passé (selfie ou décor), prise juste après.",
  "aider-collegue": "Photo du contexte (lieu de travail/étude) au moment de l'aide.",
  "message-vieil-ami": "Capture d'écran de la conversation envoyée (le message peut être flouté).",
  "sourire-inconnus": "Selfie souriant pris dans la rue, juste après.",

  // altruisme
  "ramasser-dechet": "Photo du déchet ramassé dans ta main ou dans la poubelle.",
  "don-asso": "Capture d'écran de la confirmation/reçu du don (montant, asso visibles).",
  "ceder-place": "Photo du lieu (transport, file...) où tu as cédé ta place.",
  "tri-dechets": "Photo des déchets triés dans les bonnes poubelles/bacs.",
  "benevolat-1h": "Photo de toi sur le lieu de bénévolat, ou capture d'écran de la confirmation de l'association.",

  // productivité
  "boite-mail-zero": "Capture d'écran de ta boîte mail affichant 0 message non lu.",
  "menage-chambre": "Photo de ta chambre rangée.",
  "planifier-semaine": "Photo ou capture d'écran de ton planning de la semaine rempli.",
  "tache-en-retard": "Capture d'écran de la tâche marquée \"terminée\" dans ton appli de gestion de tâches, ou photo du résultat concret.",
  "bureau-range": "Photo de ton bureau/espace de travail rangé.",

  // création
  dessiner: "Photo de ton dessin/peinture terminé(e).",
  "ecrire-500-mots": "Capture d'écran du compteur de mots de ton texte (≥500 mots visibles).",
  "photo-creative": "La photo créative elle-même, prise en extérieur.",
  "musique-10min": "Vidéo courte ou photo de toi avec ton instrument en train de jouer.",
  "recette-maison": "Photo du plat fait maison.",

  // détox écran — le cas qui doit être 100% clair : c'est un screenshot du temps d'écran natif, pas une photo random
  "limite-ecran": "Capture d'écran du temps d'écran natif de ton téléphone (réglages > temps d'écran sur iPhone, ou Bien-être numérique sur Android) montrant un total sous 2h aujourd'hui.",
  "pas-de-reseaux": "Capture d'écran du temps d'écran natif de ton téléphone montrant 0 minute sur les réseaux sociaux aujourd'hui.",
  "sans-tel-repas": "Photo de ta table de repas avec le téléphone visiblement loin/rangé (pas sur la table).",
  "telephone-loin-nuit": "Photo de ton téléphone posé hors de la chambre (dans une autre pièce) le soir.",

  // hebdo (weekly)
  "hebdo-sport-3x": "3 photos ou captures d'écran de suivi sportif, une par séance faite cette semaine.",
  "hebdo-lecture-livre": "Photo du livre ouvert au chapitre fini, ou capture d'écran de la progression de lecture.",
  "hebdo-appel-famille": "Capture d'écran de l'appel passé cette semaine dans ton journal d'appels.",
  "hebdo-benevolat": "Photo du lieu de bénévolat ou capture d'écran de la confirmation de l'association.",
  "hebdo-rangement": "Photo de la pièce/espace rangé après le grand rangement.",
  "hebdo-projet-creatif": "Photo de l'avancement de ton projet créatif cette semaine.",
  "hebdo-jeune-numerique": "Capture d'écran du temps d'écran natif montrant 0 minute sur les réseaux sociaux pour la journée complète.",
};

// Fallback générique par catégorie si une tâche n'a pas (encore) de hint dédié.
export const CATEGORY_PROOF_HINTS: Record<CategoryId, string> = {
  corps: "Une photo de toi en action, ou une capture d'écran d'une appli de suivi (sport, sommeil, pas...) qui prouve l'activité.",
  esprit: "Une photo de l'activité (livre, journal...) ou une capture d'écran d'une appli qui montre que tu l'as faite.",
  social: "Une photo avec la personne concernée, ou une capture d'écran de l'échange/appel.",
  altruisme: "Une photo de l'action ou de son résultat (déchet ramassé, confirmation de don...).",
  productivite: "Une photo ou capture d'écran qui montre le résultat concret (bureau rangé, boîte mail vide...).",
  creation: "Une photo de ce que tu as créé (dessin, plat, texte...).",
  detoxEcran: "Une capture d'écran du temps d'écran natif de ton téléphone (réglages > temps d'écran), pas une simple photo.",
};

export function getProofHint(taskId: string, category: CategoryId): string {
  return TASK_PROOF_HINTS[taskId] ?? CATEGORY_PROOF_HINTS[category];
}
