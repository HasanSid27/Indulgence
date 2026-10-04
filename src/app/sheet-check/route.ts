/**
 * /sheet-check — tells the site owner whether the spreadsheet is connected and valid, row by row.
 * Always reads the sheet fresh (never cached). Reveals nothing that isn't already public on the site
 * (counts, product names, and warnings about the owner's own rows); the sheet link itself is never echoed.
 */
import { config } from "@/lib/config";
import { loadFromSheet } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const r = await loadFromSheet({ cache: "no-store" });
  const body = {
    sheetConfigured: r.sheetConfigured,
    status: !r.sheetConfigured ? "No sheet connected — the site is using its built-in menu." : r.error ? "PROBLEM — the site is NOT using your sheet (see error)." : r.warnings.length ? "Connected, with warnings (see warnings)." : "Connected and valid.",
    error: r.error ?? null,
    warnings: r.warnings,
    refreshEverySeconds: config.revalidateSeconds,
    summary: r.error || !r.sheetConfigured ? null : {
      products: r.data.products.length,
      categories: r.data.categories.map((c) => ({ name: c.name, featuredOnHome: c.featured, products: r.data.products.filter((p) => p.category === c.id).length })),
      whatsappNumber: r.data.settings.whatsappNumber,
      menuPdf: r.data.settings.menuPdfUrl.startsWith("/") ? "bundled with the website" : "external link",
      productsWithoutPhoto: r.data.products.filter((p) => !p.image).map((p) => p.name),
    },
  };
  return new Response(JSON.stringify(body, null, 2), { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex, nofollow" } });
}
