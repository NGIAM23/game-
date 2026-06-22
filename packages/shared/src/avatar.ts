// Avatars cartoon DiceBear "Avataaars" (gratuit, illimité, cf docs/22_RECAP_FINAL.md §14).
const DICEBEAR_BASE = "https://api.dicebear.com/9.x/avataaars/svg";

export function avatarUrl(seed: string): string {
  return `${DICEBEAR_BASE}?seed=${encodeURIComponent(seed)}&backgroundType=solid&backgroundColor=ffd43b`;
}

export function randomAvatarSeed(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function isSunday(date: Date = new Date()): boolean {
  return date.getDay() === 0;
}
