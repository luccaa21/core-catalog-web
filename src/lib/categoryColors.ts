const CATEGORY_COLORS: Record<string, string> = {
  CPU: "var(--color-ruler-1)",
  GPU: "var(--color-ruler-2)",
  RAM: "var(--color-ruler-3)",
  Armazenamento: "var(--color-ruler-4)",
};

const FALLBACK_COLORS = [
  "var(--color-ruler-5)",
  "var(--color-ruler-3)",
  "var(--color-ruler-2)",
];

export function getCategoryColor(category: string, index: number) {
  return CATEGORY_COLORS[category] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}
