/** Static, non-content configuration. Content (products, prices, texts, contact details) lives in the spreadsheet. */

export const config = {
  // Set NEXT_PUBLIC_SITE_URL in Netlify once the real domain is connected.
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://indulgence.netlify.app").replace(/\/$/, ""),
  name: "iNdulgence",
  country: "IN",
  /**
   * The Google Sheet that feeds the site. You can paste the sheet's normal share link here, or (better) set the
   * SHEET_URL environment variable in Netlify so no code change is needed. Leave empty to use the built-in menu.
   */
  sheetUrl: process.env.SHEET_URL ?? "",
  /** How often (seconds) the site re-reads the sheet in the background. Minimum 60. */
  revalidateSeconds: Math.min(86400, Math.max(60, Number(process.env.SHEET_REVALIDATE_SECONDS) || 300)),
  /** Used when the sheet has no menu PDF link. */
  bundledMenuPdf: "/indulgence-menu.pdf",
} as const;
