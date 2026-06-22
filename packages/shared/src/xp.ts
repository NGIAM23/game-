// Voir docs/22_RECAP_FINAL.md §3 — XP_niveau_N = 100 × N^1.5
export function xpRequiredForLevel(level: number): number {
  return Math.round(100 * Math.pow(level, 1.5));
}

export function levelFromTotalXp(totalXp: number): { level: number; xpIntoLevel: number; xpForNextLevel: number } {
  let level = 1;
  let remaining = totalXp;
  while (remaining >= xpRequiredForLevel(level)) {
    remaining -= xpRequiredForLevel(level);
    level += 1;
  }
  return { level, xpIntoLevel: remaining, xpForNextLevel: xpRequiredForLevel(level) };
}

export interface RankTier {
  name: string;
  minLevel: number;
  maxLevel: number;
}

// 11 tiers, chacun décliné en I-IV (44 paliers visuels)
export const RANK_TIERS: RankTier[] = [
  { name: "Fer", minLevel: 1, maxLevel: 10 },
  { name: "Bronze", minLevel: 11, maxLevel: 25 },
  { name: "Argent", minLevel: 26, maxLevel: 40 },
  { name: "Or", minLevel: 41, maxLevel: 60 },
  { name: "Platine", minLevel: 61, maxLevel: 90 },
  { name: "Diamant", minLevel: 91, maxLevel: 130 },
  { name: "Maître", minLevel: 131, maxLevel: 180 },
  { name: "Grand Maître", minLevel: 181, maxLevel: 260 },
  { name: "Héros", minLevel: 261, maxLevel: 400 },
  { name: "Légende", minLevel: 401, maxLevel: 700 },
  { name: "Mythique", minLevel: 701, maxLevel: Infinity },
];

const SUB_TIERS = ["IV", "III", "II", "I"]; // IV = bas du tier, I = haut du tier

export function tierForLevel(level: number): RankTier {
  return RANK_TIERS.find((t) => level >= t.minLevel && level <= t.maxLevel) ?? RANK_TIERS[RANK_TIERS.length - 1];
}

export function subTierForLevel(level: number, tier: RankTier): string {
  if (tier.maxLevel === Infinity) return "";
  const span = tier.maxLevel - tier.minLevel + 1;
  const step = Math.max(1, Math.floor(span / 4));
  const sub = Math.min(3, Math.floor((level - tier.minLevel) / step));
  return SUB_TIERS[sub];
}

export function rankFromLevel(level: number): string {
  const tier = tierForLevel(level);
  const sub = subTierForLevel(level, tier);
  return sub ? `${tier.name} ${sub}` : tier.name;
}

export const TIER_COLORS: Record<string, string> = {
  Fer: "#6B7280",
  Bronze: "#A05A2C",
  Argent: "#9CA3AF",
  Or: "#E6A700",
  Platine: "#7DD3C0",
  Diamant: "#5BC0EB",
  Maître: "#B388FF",
  "Grand Maître": "#6750E8",
  Héros: "#FF7AB6",
  Légende: "#FFA94D",
  Mythique: "#6750E8",
};

export const TIER_ABBR: Record<string, string> = {
  Fer: "FER",
  Bronze: "BRZ",
  Argent: "ARG",
  Or: "OR",
  Platine: "PLT",
  Diamant: "DMT",
  Maître: "MTR",
  "Grand Maître": "GM",
  Héros: "HER",
  Légende: "LGD",
  Mythique: "MTH",
};
