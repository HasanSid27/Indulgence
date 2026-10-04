/**
 * Server-side data source. Reads the Google Sheet (if one is configured) and falls back to the built-in menu.
 *
 *  • The sheet is read with `fetch` + `next.revalidate`, so pages are regenerated in the background every few
 *    minutes — editing the sheet updates the live site without a redeploy.
 *  • Safety net: if the sheet can't be read (offline, unshared, deleted…) the site keeps serving the last good
 *    version. During a build, or in development, the built-in menu is used instead so nothing ever breaks.
 *  • Only Google Sheets links are accepted (the sheet id is extracted and our own request URLs are built), so a
 *    mistyped or malicious value can't make the server fetch arbitrary addresses.
 */
import { cache } from "react";
import { config } from "./config";
import { defaultData, imageManifest } from "./defaults";
import { buildSiteData, parseCsv } from "./sheet";
import type { SheetTabs, SiteData } from "./types";

export const TAB_NAMES = { settings: "Settings", content: "Content", categories: "Categories", products: "Products", ordernotes: "OrderNotes" } as const;
type TabKey = keyof typeof TAB_NAMES;

/** Accepts a normal Google Sheets link (…/spreadsheets/d/<id>/edit…) or the bare id. */
export function sheetIdFrom(input: string): string | null {
  const s = input.trim();
  const m = s.match(/^https:\/\/docs\.google\.com\/spreadsheets\/d\/([A-Za-z0-9_-]{20,})(?:[/?#]|$)/);
  if (m) return m[1];
  return /^[A-Za-z0-9_-]{25,}$/.test(s) ? s : null;
}

function tabUrl(id: string, tab: string) {
  // SHEET_CSV_BASE exists only so the connection can be tested against a local stand-in; never set it in production.
  const base = process.env.SHEET_CSV_BASE || `https://docs.google.com/spreadsheets/d/${id}/gviz/tq`;
  return `${base}?tqx=out:csv&headers=1&sheet=${encodeURIComponent(tab)}`;
}

async function fetchTab(id: string, key: TabKey, init: RequestInit & { next?: { revalidate: number } }): Promise<string[][]> {
  const res = await fetch(tabUrl(id, TAB_NAMES[key]), { ...init, headers: { accept: "text/csv" }, signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`${TAB_NAMES[key]}: HTTP ${res.status}`);
  const text = await res.text();
  if (text.length > 2_000_000) throw new Error(`${TAB_NAMES[key]}: sheet is unexpectedly large`);
  if (/^\s*</.test(text)) throw new Error(`${TAB_NAMES[key]}: got a web page instead of data — is the sheet shared as "Anyone with the link → Viewer", and is it a Google Sheet (not an uploaded .xlsx)?`);
  return parseCsv(text);
}

export interface LoadResult {
  data: SiteData;
  warnings: string[];
  /** Why the sheet wasn't used (when it wasn't). */
  error?: string;
  sheetConfigured: boolean;
}

/** Fetch + validate. `init` controls caching (ISR for pages; no-store for the checker). */
export async function loadFromSheet(init: RequestInit & { next?: { revalidate: number } }): Promise<LoadResult> {
  const id = sheetIdFrom(config.sheetUrl);
  if (!config.sheetUrl) return { data: defaultData, warnings: [], sheetConfigured: false };
  if (!id) return { data: defaultData, warnings: [], error: "SHEET_URL isn't a Google Sheets link (expected https://docs.google.com/spreadsheets/d/…).", sheetConfigured: true };
  const tabs: SheetTabs = {};
  const missing: string[] = [];
  await Promise.all(
    (Object.keys(TAB_NAMES) as TabKey[]).map(async (k) => {
      try { tabs[k] = await fetchTab(id, k, init); } catch (e) {
        const err = e as Error;
        const msg = err.name === "TimeoutError" || err.name === "AbortError" ? "timed out after 10 seconds" : err.message;
        missing.push(msg.startsWith(TAB_NAMES[k]) ? msg : `${TAB_NAMES[k]}: ${msg}`);
      }
    }),
  );
  if (!tabs.products) return { data: defaultData, warnings: missing, error: `Could not read the Products tab (${missing.find((m) => m.startsWith("Products")) ?? "unknown error"}).`, sheetConfigured: true };
  const built = buildSiteData(tabs, imageManifest, defaultData, config.bundledMenuPdf);
  const warnings = [...missing.filter((m) => !m.startsWith("Products")).map((m) => `Optional tab not read — using built-in values (${m})`), ...built.warnings];
  if (built.fatal) return { data: defaultData, warnings, error: built.fatal, sheetConfigured: true };
  return { data: built.data, warnings, sheetConfigured: true };
}

const isBuildPhase = () => process.env.NEXT_PHASE === "phase-production-build";

/** The data every page renders from. Memoised per request. */
export const getSiteData = cache(async (): Promise<SiteData> => {
  const r = await loadFromSheet({ next: { revalidate: config.revalidateSeconds } });
  if (!r.error) return r.data;
  const msg = `[iNdulgence] Spreadsheet not used: ${r.error}`;
  if (isBuildPhase() || process.env.NODE_ENV !== "production") { console.warn(msg + " — using the built-in menu."); return defaultData; }
  // At runtime in production: failing the refresh makes Next.js keep serving the previous (good) page.
  throw new Error(msg);
});
