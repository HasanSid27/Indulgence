"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  STORAGE_KEY,
  addEntry,
  buildLines,
  cartCount,
  cartTotal,
  orderMessageFor,
  orderUrlFor,
  parseStored,
  sameEntry,
  serialize,
  setEntryQty,
  type CartLine,
  type Entry,
} from "@/lib/cart";
import { useSiteData } from "./DataProvider";
import type { Product } from "@/lib/types";

export type { CartLine };

interface CartApi {
  lines: CartLine[];
  count: number;
  total: number;
  orderUrl: string;
  orderMessage: string;
  open: boolean;
  setOpen: (v: boolean) => void;
  qtyOf: (slug: string, variantLabel?: string) => number;
  add: (slug: string, variantLabel?: string) => void;
  setQty: (slug: string, variantLabel: string | undefined, qty: number) => void;
  clear: () => void;
}

const Ctx = createContext<CartApi | null>(null);

function readStored(products: Product[]): Entry[] {
  try {
    const { entries, expired } = parseStored(products, localStorage.getItem(STORAGE_KEY), Date.now());
    if (expired) localStorage.removeItem(STORAGE_KEY);
    return entries;
  } catch {
    return [];
  }
}

/** Order list kept in localStorage. No payment — it only builds the WhatsApp message. */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const { products, settings } = useSiteData();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setEntries(readStored(products));
    setHydrated(true);
    // Keep several tabs of the same browser in step instead of overwriting each other.
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY || e.key === null) setEntries(readStored(products));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [products]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      if (entries.length === 0) localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, serialize(entries, Date.now()));
    } catch {}
  }, [entries, hydrated]);

  const add = useCallback((slug: string, variantLabel?: string) => setEntries((es) => addEntry(products, es, slug, variantLabel)), [products]);
  const setQty = useCallback(
    (slug: string, variantLabel: string | undefined, qty: number) => setEntries((es) => setEntryQty(es, slug, variantLabel, qty)),
    [],
  );

  const api = useMemo<CartApi>(() => {
    const lines = buildLines(products, entries);
    return {
      lines,
      count: cartCount(lines),
      total: cartTotal(lines),
      orderUrl: orderUrlFor(settings.whatsappNumber, lines),
      orderMessage: orderMessageFor(lines),
      open,
      setOpen,
      qtyOf: (slug, v) => entries.find((e) => sameEntry(e, slug, v))?.qty ?? 0,
      add,
      setQty,
      clear: () => setEntries([]),
    };
  }, [entries, open, add, setQty, products, settings.whatsappNumber]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
}
