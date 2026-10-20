import type { Category, Product } from "./types";

export const formatPrice = (n: number) => `₹${n.toLocaleString("en-IN")}`;
export const lowestPrice = (p: Product) => Math.min(...p.variants.map((v) => v.price));
/** The cheapest variant, and a short bracket label for it: the piece count when there is one ("2pc"), otherwise its size ("1 kg"). */
export function lowestVariantHint(p: Product) {
  const v = p.variants.reduce((a, b) => (b.price < a.price ? b : a));
  const pieces = v.label?.match(/(\d+)\s*pcs?\b/i);
  return pieces ? `${pieces[1]}pc` : v.label ?? "";
}
export const productsIn = (products: Product[], categoryId: string) => products.filter((p) => p.category === categoryId);
export const startingPrice = (products: Product[], categoryId: string) => Math.min(...productsIn(products, categoryId).map(lowestPrice));
export const categoryName = (categories: Category[], id: string) => categories.find((c) => c.id === id)?.name ?? "";

/** "Brownie" → "Brownies", "Bundt Cake" → "Bundt Cakes", "Pastry" → "Pastries". */
export function plural(name: string) {
  const n = name.trim();
  if (!n) return n;
  if (/[^aeiou]y$/i.test(n)) return n.slice(0, -1) + "ies";
  if (/(s|x|z|ch|sh)$/i.test(n)) return /s$/i.test(n) ? n : n + "es";
  return n + "s";
}

/** ["a","b","c"] → "a, b and c". */
export function listJoin(items: string[]) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}
