/**
 * Pure order-list logic (no React, no browser APIs) so it can be tested exhaustively.
 * The order list never leaves the visitor's browser; it only builds a WhatsApp message.
 * Every function takes the current product list (from the spreadsheet) so prices always come from the menu.
 */
import { cartOrderMessage, cartOrderUrl, type OrderLine } from "./whatsapp";
import type { Product } from "./types";

export interface Entry {
  slug: string;
  variantLabel?: string;
  qty: number;
}

export interface CartLine {
  product: Product;
  variantLabel?: string;
  price: number;
  qty: number;
}

export const STORAGE_KEY = "indulgence-order-list";
export const MAX_QTY = 20;
export const MAX_LINES = 30;
/** A list left on a shared device clears itself after a day. */
export const TTL_MS = 24 * 60 * 60 * 1000;

export const sameEntry = (e: Entry, slug: string, v?: string) => e.slug === slug && e.variantLabel === v;

/** Resolve a (slug, variant label) pair against the real menu; undefined when it doesn't exist. */
export function resolve(products: Product[], slug: unknown, variantLabel: unknown) {
  if (typeof slug !== "string") return undefined;
  const product = products.find((p) => p.slug === slug);
  if (!product) return undefined;
  const label = typeof variantLabel === "string" ? variantLabel : undefined;
  const variant = product.variants.find((v) => v.label === label);
  return variant ? { product, variant } : undefined;
}

/** Quantities must be whole numbers ≥ 1; anything else is rejected. Capped at MAX_QTY. */
export function cleanQty(q: unknown): number | undefined {
  if (typeof q !== "number" || !Number.isInteger(q) || q < 1) return undefined;
  return Math.min(q, MAX_QTY);
}

/**
 * Anything read back from storage is untrusted (it can be edited in devtools or written by another
 * script). Rebuild every entry from known product data and drop the rest.
 */
export function sanitize(products: Product[], input: unknown): Entry[] {
  if (!Array.isArray(input)) return [];
  const out: Entry[] = [];
  for (const raw of input.slice(0, MAX_LINES * 2)) {
    if (!raw || typeof raw !== "object") continue;
    const { slug, variantLabel, qty } = raw as Record<string, unknown>;
    const q = cleanQty(qty);
    const hit = resolve(products, slug, variantLabel);
    if (q === undefined || !hit) continue;
    if (out.some((e) => sameEntry(e, hit.product.slug, hit.variant.label))) continue;
    out.push({ slug: hit.product.slug, variantLabel: hit.variant.label, qty: q });
    if (out.length >= MAX_LINES) break;
  }
  return out;
}

/** Parse the stored JSON; returns [] for missing, malformed, wrong-shaped or expired data. */
export function parseStored(products: Product[], raw: string | null, now: number): { entries: Entry[]; expired: boolean } {
  if (!raw) return { entries: [], expired: false };
  try {
    const data = JSON.parse(raw) as { t?: unknown; entries?: unknown } | null;
    if (!data || typeof data !== "object" || typeof data.t !== "number" || !Number.isFinite(data.t)) return { entries: [], expired: true };
    if (now - data.t > TTL_MS) return { entries: [], expired: true };
    return { entries: sanitize(products, data.entries), expired: false };
  } catch {
    return { entries: [], expired: true };
  }
}

export const serialize = (entries: Entry[], now: number) => JSON.stringify({ t: now, entries });

/** Add one of an item. Unknown items are ignored; the quantity stops at MAX_QTY. */
export function addEntry(products: Product[], entries: Entry[], slug: string, variantLabel?: string): Entry[] {
  const hit = resolve(products, slug, variantLabel);
  if (!hit) return entries;
  if (entries.some((e) => sameEntry(e, slug, hit.variant.label))) {
    return entries.map((e) => (sameEntry(e, slug, hit.variant.label) ? { ...e, qty: Math.min(e.qty + 1, MAX_QTY) } : e));
  }
  if (entries.length >= MAX_LINES) return entries;
  return [...entries, { slug, variantLabel: hit.variant.label, qty: 1 }];
}

/** Set an exact quantity. ≤ 0 (or anything that isn't a finite number) removes the line. */
export function setEntryQty(entries: Entry[], slug: string, variantLabel: string | undefined, qty: number): Entry[] {
  const q = typeof qty === "number" && Number.isFinite(qty) ? Math.floor(qty) : 0;
  return entries.flatMap((e) => (sameEntry(e, slug, variantLabel) ? (q <= 0 ? [] : [{ ...e, qty: Math.min(q, MAX_QTY) }]) : [e]));
}

/** Entries → display lines. Prices always come from the menu data, never from the stored entry. */
export function buildLines(products: Product[], entries: Entry[]): CartLine[] {
  return entries.flatMap((e) => {
    const hit = resolve(products, e.slug, e.variantLabel);
    return hit ? [{ product: hit.product, variantLabel: hit.variant.label, price: hit.variant.price, qty: e.qty }] : [];
  });
}

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.qty, 0);
export const cartTotal = (lines: CartLine[]) => lines.reduce((n, l) => n + l.price * l.qty, 0);

export function orderLines(lines: CartLine[]): OrderLine[] {
  return lines.map((l) => ({ name: l.product.name, variantLabel: l.variantLabel, qty: l.qty, amount: l.price * l.qty }));
}

export const orderUrlFor = (number: string, lines: CartLine[]) => cartOrderUrl(number, orderLines(lines));

/** The plain message text (for the "Copy order" button). */
export const orderMessageFor = (lines: CartLine[]) => cartOrderMessage(orderLines(lines));
