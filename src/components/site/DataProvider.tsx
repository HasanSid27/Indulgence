"use client";

import { createContext, useContext } from "react";
import type { SiteData } from "@/lib/types";

const Ctx = createContext<SiteData | null>(null);

/** Gives client components the site data (menu, settings, texts) that the server read from the spreadsheet. */
export function DataProvider({ data, children }: { data: SiteData; children: React.ReactNode }) {
  return <Ctx.Provider value={data}>{children}</Ctx.Provider>;
}

export function useSiteData(): SiteData {
  const d = useContext(Ctx);
  if (!d) throw new Error("useSiteData must be used within DataProvider");
  return d;
}
