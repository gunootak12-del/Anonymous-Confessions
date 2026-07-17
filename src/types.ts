export interface Comment {
  id: string;
  text: string;
  alias: string;
  createdAt: number; // millisecond timestamp
}

export interface Confession {
  id: string;
  text: string;
  alias: string;
  theme: string;
  tag: string;
  createdAt: any; // Firestore Timestamp
  likes: number;
  hugs: number;
  meToos: number;
  comments?: Comment[];
}

export interface CardTheme {
  id: string;
  name: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  accentClass: string;
  badgeClass: string;
  description: string;
}

export const CARD_THEMES: Record<string, CardTheme> = {
  midnight: {
    id: "midnight",
    name: "Midnight Whispers",
    bgClass: "bg-slate-950 text-slate-100",
    textClass: "text-slate-100",
    borderClass: "border-slate-800/80",
    accentClass: "text-indigo-400 hover:bg-indigo-950/40 border-indigo-900/50",
    badgeClass: "bg-indigo-950 text-indigo-300 border-indigo-800/40",
    description: "Deep, mysterious indigo of late night secrets",
  },
  sunset: {
    id: "sunset",
    name: "Sunset Melancholy",
    bgClass: "bg-amber-950 text-orange-50",
    textClass: "text-orange-50",
    borderClass: "border-orange-900/60",
    accentClass: "text-amber-400 hover:bg-amber-950/40 border-amber-900/50",
    badgeClass: "bg-amber-900/60 text-amber-200 border-amber-800/40",
    description: "Warm, fading glow of shared nostalgia",
  },
  emerald: {
    id: "emerald",
    name: "Forest Solitude",
    bgClass: "bg-emerald-950 text-emerald-50",
    textClass: "text-emerald-50",
    borderClass: "border-emerald-900/60",
    accentClass: "text-emerald-400 hover:bg-emerald-950/40 border-emerald-900/50",
    badgeClass: "bg-emerald-950 text-emerald-200 border-emerald-900/40",
    description: "Quiet sanctuary of a hidden clearing",
  },
  sakura: {
    id: "sakura",
    name: "Sakura Breeze",
    bgClass: "bg-rose-950 text-rose-50",
    textClass: "text-rose-50",
    borderClass: "border-rose-900/40",
    accentClass: "text-rose-400 hover:bg-rose-950/40 border-rose-900/50",
    badgeClass: "bg-rose-950 text-rose-200 border-rose-900/30",
    description: "Gentle pink of unspoken crushes and hope",
  },
  lavender: {
    id: "lavender",
    name: "Lavender Fog",
    bgClass: "bg-violet-950 text-violet-50",
    textClass: "text-violet-50",
    borderClass: "border-violet-900/40",
    accentClass: "text-violet-400 hover:bg-violet-950/40 border-violet-900/50",
    badgeClass: "bg-violet-950 text-violet-200 border-violet-900/30",
    description: "Ethereal purple of hazy memories and dreams",
  },
  ink: {
    id: "ink",
    name: "Ink & Slate",
    bgClass: "bg-zinc-900 text-zinc-100",
    textClass: "text-zinc-100",
    borderClass: "border-zinc-800",
    accentClass: "text-zinc-400 hover:bg-zinc-800/40 border-zinc-700/50",
    badgeClass: "bg-zinc-850 text-zinc-300 border-zinc-800",
    description: "Minimalist dark slate of deep contemplation",
  },
  editorial: {
    id: "editorial",
    name: "Minimalist Cream",
    bgClass: "bg-stone-50 text-stone-900",
    textClass: "text-stone-900",
    borderClass: "border-stone-200",
    accentClass: "text-stone-600 hover:bg-stone-200/50 border-stone-300",
    badgeClass: "bg-stone-200 text-stone-700 border-stone-300/65",
    description: "Elegant black ink on vintage cream paper",
  }
};

export const CONFESSION_TAGS = [
  { id: "all", name: "All Confessions", icon: "🌌" },
  { id: "crush", name: "Crush & Love", icon: "💖" },
  { id: "regret", name: "Regret & Remorse", icon: "🌧️" },
  { id: "unsent", name: "Unsent Letters", icon: "✉️" },
  { id: "gratitude", name: "Gratitude & Warmth", icon: "☀️" },
  { id: "secrets", name: "Secrets & Fears", icon: "🤫" },
  { id: "funny", name: "Funny & Random", icon: "🎈" },
];

export const ANONYMOUS_ADJECTIVES = [
  "silent", "distant", "floating", "quiet", "dreamy", "muffled", "lost", "hidden",
  "fading", "glowing", "secret", "shimmering", "soft", "mystic", "wandering", "waiting",
  "gentle", "veiled", "whispering", "starlit", "hazy", "solitary", "cozy", "pensive"
];

export const ANONYMOUS_NOUNS = [
  "echo", "drifter", "breeze", "shadow", "spark", "ripple", "whisper", "cloud",
  "tide", "petal", "feather", "stardust", "meteor", "anchor", "lighthouse", "lantern",
  "compass", "haven", "cove", "mirage", "horizon", "frequency", "canvas", "journal"
];

export function generateAnonymousAlias(): string {
  const adj = ANONYMOUS_ADJECTIVES[Math.floor(Math.random() * ANONYMOUS_ADJECTIVES.length)];
  const noun = ANONYMOUS_NOUNS[Math.floor(Math.random() * ANONYMOUS_NOUNS.length)];
  return `${adj}_${noun}`;
}
