/**
 * Pure (no network, no React) parsing and validation of the spreadsheet tabs.
 * Everything that comes from the sheet is treated as untrusted text: it is trimmed, length-limited,
 * type-checked and rebuilt into the shapes in types.ts. Bad rows are skipped (and reported) rather than
 * breaking the site. Prices are only accepted as whole rupee amounts.
 */
import type { BuildResult, Category, OrderNote, Product, ProductImage, SheetTabs, SiteContent, SiteData, SiteSettings, Variant } from "./types";

export type ImageManifest = Record<string, { width: number; height: number; alpha: boolean }>;

/** Safety limits. */
export const LIMITS = { products: 60, categories: 8, noteGroups: 8, noteLines: 10, sizes: 3, ingredients: 8 } as const;

// ---------------------------------------------------------------------------------------------- CSV
/** RFC 4180 CSV parser (quoted fields, escaped quotes, newlines inside quotes, CRLF, BOM). */
export function parseCsv(input: string): string[][] {
  const text = input.charCodeAt(0) === 0xfeff ? input.slice(1) : input;
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      }
      field += c; i++; continue;
    }
    if (c === '"' && field === "") { inQuotes = true; i++; continue; }
    if (c === ",") { row.push(field); field = ""; i++; continue; }
    if (c === "\r") { i++; continue; }
    if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; i++; continue; }
    field += c; i++;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows;
}

// ------------------------------------------------------------------------------------------ helpers
const norm = (s: string) => s.toLowerCase().trim().replace(/[\s\-]+/g, "_");

/** Control characters and invisible separators (zero-width, line/paragraph separators, BOM). Built from a string so the source stays plain ASCII. */
const CONTROL_CHARS = new RegExp("[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F\\u200B-\\u200F\\u2028\\u2029\\uFEFF]", "g");

/** Trim, drop control characters, collapse whitespace, limit length. */
export function clean(input: unknown, max: number, multiline = false): string {
  let s = typeof input === "string" ? input : "";
  s = s.replace(/\r\n?/g, "\n").replace(CONTROL_CHARS, "");
  s = multiline ? s.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n") : s.replace(/\s+/g, " ");
  s = s.trim();
  return s.length > max ? s.slice(0, max).trimEnd() : s;
}

const COMBINING_MARKS = new RegExp("[\\u0300-\\u036f]", "g");

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(COMBINING_MARKS, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

const YES = new Set(["yes", "y", "true", "1", "on", "show", "available", "✓", "x"]);
const NO = new Set(["no", "n", "false", "0", "off", "hide", "hidden", "sold out", "soldout", "unavailable"]);
const truthy = (s: string, whenBlank: boolean) => {
  const v = s.trim().toLowerCase();
  if (v === "") return whenBlank;
  if (YES.has(v)) return true;
  if (NO.has(v)) return false;
  return whenBlank;
};

/** Whole-rupee price from cells like "599", "₹1,299", "Rs. 449", "1299.00". Anything else → undefined. */
export function parsePrice(raw: unknown): number | undefined {
  if (typeof raw !== "string") return undefined;
  if (/\d\s+\d/.test(raw.trim())) return undefined; // "5 6" is ambiguous, not 56
  const s = raw.replace(/[₹,\s]|rs\.?|inr/gi, "");
  if (!/^\d{1,7}(\.0+)?$/.test(s)) return undefined;
  const n = Number(s);
  return n >= 1 && n <= 100000 ? n : undefined;
}

/** Digits only, with country code. A bare 10-digit Indian mobile number gets 91 in front. */
export function normalizeWhatsapp(raw: string): { value?: string; note?: string } {
  const digits = raw.replace(/[^\d]/g, "").replace(/^0+/, "");
  if (digits.length === 10 && /^[6-9]/.test(digits)) return { value: "91" + digits, note: "added country code 91" };
  if (digits.length >= 11 && digits.length <= 15) return { value: digits };
  return {};
}

export function normalizeInstagram(raw: string): string | undefined {
  let s = raw.trim().replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/[/?#].*$/, "").replace(/^@/, "");
  return /^[A-Za-z0-9._]{1,30}$/.test(s) ? s : undefined;
}

/** Turn a Google Drive "share" link into a direct download link; accept any other https URL or a /path. */
export function normalizePdfUrl(raw: string, fallback: string): { url: string; external: boolean; note?: string } {
  const s = raw.trim();
  if (!s) return { url: fallback, external: false };
  if (/^\/(?!\/)[A-Za-z0-9._~\-\/%]+$/.test(s)) return { url: s, external: false };
  let u: URL;
  try { u = new URL(s); } catch { return { url: fallback, external: false, note: "menu_pdf_url isn't a valid link" }; }
  if (u.protocol !== "https:") return { url: fallback, external: false, note: "menu_pdf_url must start with https://" };
  u.username = ""; u.password = "";
  if (/(^|\.)drive\.google\.com$/.test(u.hostname)) {
    const id = u.pathname.match(/\/file\/d\/([A-Za-z0-9_-]{10,})/)?.[1] ?? u.searchParams.get("id") ?? undefined;
    if (id && /^[A-Za-z0-9_-]{10,}$/.test(id)) return { url: `https://drive.google.com/uc?export=download&id=${id}`, external: true };
  }
  return { url: u.toString(), external: true };
}

const EMAIL = /^[^\s@<>"']{1,64}@[^\s@<>"']{1,190}\.[A-Za-z]{2,}$/;

// --------------------------------------------------------------------------------------- table utils
function keyValues(rows: string[][] | undefined, keyHeader: string, valueHeaders: string[]): Map<string, string> | undefined {
  if (!rows || rows.length === 0) return undefined;
  const head = rows[0].map(norm);
  const ki = head.indexOf(keyHeader);
  const vi = valueHeaders.map((h) => head.indexOf(h)).find((i) => i >= 0) ?? -1;
  if (ki < 0 || vi < 0) return undefined;
  const map = new Map<string, string>();
  for (const r of rows.slice(1)) {
    const k = norm(r[ki] ?? "");
    if (k && !map.has(k)) map.set(k, r[vi] ?? "");
  }
  return map;
}

function objects(rows: string[][] | undefined, required: string[]): { head: string[]; list: Record<string, string>[] } | undefined {
  if (!rows || rows.length === 0) return undefined;
  const head = rows[0].map(norm);
  if (!required.every((h) => head.includes(h))) return undefined;
  const list = rows.slice(1).filter((r) => r.some((c) => (c ?? "").trim() !== "")).map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ""])));
  return { head, list };
}

// ------------------------------------------------------------------------------------------- builder
const BASE_SETTINGS: SiteSettings = {
  whatsappNumber: "", phoneDisplay: "", instagramHandle: "", instagramUrl: "", city: "", region: "", descriptor: "",
  address: null, email: null, menuPdfUrl: "/indulgence-menu.pdf", menuPdfIsExternal: false,
};
const BASE_CONTENT: SiteContent = {
  heroTagline: "", heroLabelLeft: "", heroLabelRight: "", introLine1: "", introLine2: "", introParagraph: "", statements: [], purposeLead: "", purposeParagraph: "",
  finalHeadline: "", finalNote: "", menuIntro: "", menuPreviewHeading: "", menuPreviewText: "", footerNote: "",
};

/**
 * Build the site data from sheet tabs. `fallback` supplies the value for anything the sheet leaves blank or
 * gets wrong (use the built-in data); pass undefined only when building that built-in data itself.
 */
export function buildSiteData(tabs: SheetTabs, manifest: ImageManifest, fallback?: SiteData, bundledPdf = "/indulgence-menu.pdf"): BuildResult {
  const warnings: string[] = [];
  const warn = (m: string) => warnings.length < 200 && warnings.push(m);
  const fbS = fallback?.settings ?? { ...BASE_SETTINGS, menuPdfUrl: bundledPdf };
  const fbC = fallback?.content ?? BASE_CONTENT;

  // ---- Settings
  const settings: SiteSettings = { ...fbS };
  const st = keyValues(tabs.settings, "key", ["value"]);
  if (tabs.settings && !st) warn("Settings tab: header row must contain 'key' and 'value' — using the built-in settings.");
  if (st) {
    const get = (k: string) => st.get(k) ?? "";
    const wa = get("whatsapp_number").trim();
    if (wa) {
      const n = normalizeWhatsapp(wa);
      if (n.value) { settings.whatsappNumber = n.value; if (n.note) warn(`Settings › whatsapp_number: ${n.note}.`); }
      else warn(`Settings › whatsapp_number "${clean(wa, 30)}" isn't valid (use country code + number, e.g. 919214446459) — kept the previous number.`);
    }
    const phone = clean(get("phone_display"), 30); if (phone) settings.phoneDisplay = phone;
    const ig = get("instagram_handle").trim();
    if (ig) { const h = normalizeInstagram(ig); if (h) { settings.instagramHandle = h; settings.instagramUrl = `https://instagram.com/${h}`; } else warn(`Settings › instagram_handle "${clean(ig, 40)}" isn't valid — kept the previous one.`); }
    const city = clean(get("city"), 40); if (city) settings.city = city;
    const region = clean(get("region"), 40); if (region) settings.region = region;
    const desc = clean(get("descriptor"), 60); if (desc) settings.descriptor = desc;
    if (st.has("address")) settings.address = clean(get("address"), 200) || null;
    if (st.has("email")) { const e = get("email").trim(); if (!e) settings.email = null; else if (EMAIL.test(e)) settings.email = e; else warn(`Settings › email "${clean(e, 40)}" isn't valid — ignored.`); }
    if (st.has("menu_pdf_url")) { const p = normalizePdfUrl(get("menu_pdf_url"), bundledPdf); settings.menuPdfUrl = p.url; settings.menuPdfIsExternal = p.external; if (p.note) warn(`Settings › ${p.note} — using the bundled PDF.`); }
  }
  if (!settings.phoneDisplay && settings.whatsappNumber) settings.phoneDisplay = "+" + settings.whatsappNumber;
  if (!settings.instagramUrl && settings.instagramHandle) settings.instagramUrl = `https://instagram.com/${settings.instagramHandle}`;

  // ---- Content
  const content: SiteContent = { ...fbC, statements: [...fbC.statements] };
  const ct = keyValues(tabs.content, "key", ["text", "value"]);
  if (tabs.content && !ct) warn("Content tab: header row must contain 'key' and 'text' — using the built-in texts.");
  if (ct) {
    const put = (key: string, field: Exclude<keyof SiteContent, "statements">, max: number) => { const v = clean(ct.get(key) ?? "", max); if (v) content[field] = v as never; };
    put("hero_tagline", "heroTagline", 120); put("hero_label_left", "heroLabelLeft", 60); put("hero_label_right", "heroLabelRight", 60); put("intro_line_1", "introLine1", 60); put("intro_line_2", "introLine2", 60);
    put("intro_paragraph", "introParagraph", 400); put("purpose_lead", "purposeLead", 220); put("purpose_paragraph", "purposeParagraph", 500);
    put("menu_intro", "menuIntro", 200); put("menu_preview_heading", "menuPreviewHeading", 80); put("menu_preview_text", "menuPreviewText", 200); put("final_headline", "finalHeadline", 80); put("final_note", "finalNote", 200); put("footer_note", "footerNote", 120);
    const stm = [1, 2, 3, 4].map((n) => clean(ct.get(`statement_${n}`) ?? "", 60)).filter(Boolean);
    if (stm.length) content.statements = stm;
  }

  // ---- Categories
  const catTab = objects(tabs.categories, ["id", "name"]);
  if (tabs.categories && !catTab) warn("Categories tab: header row must contain 'id' and 'name' — categories will be taken from the Products tab instead.");
  const categories: Category[] = [];
  const catIds = new Map<string, Category>(); // id and lowercase name → category
  const addCategory = (id: string, name: string, featured: boolean) => {
    if (!id || !name || catIds.has(id) || categories.length >= LIMITS.categories) return undefined;
    const c: Category = { id, name, featured }; categories.push(c); catIds.set(id, c); catIds.set("name:" + name.toLowerCase(), c); return c;
  };
  if (catTab) catTab.list.forEach((r, i) => { const name = clean(r.name, 40); const id = slugify(r.id || name); if (!addCategory(id, name, truthy(r.featured_on_home ?? r.featured ?? "", false))) warn(`Categories row ${i + 2}: skipped (missing/duplicate id or name).`); });

  // ---- Products
  const prodTab = objects(tabs.products, ["name", "category"]);
  const products: Product[] = [];
  const usedSlugs = new Set<string>();
  let limitWarned = false;
  if (!prodTab) warn("Products tab: header row must contain 'name' and 'category'.");
  else {
    prodTab.list.forEach((r, idx) => {
      const row = idx + 2; const label = `Products row ${row}`;
      if (products.length >= LIMITS.products) { if (!limitWarned) { limitWarned = true; warn(`Products: only the first ${LIMITS.products} products are used.`); } return; }
      const name = clean(r.name, 80); if (!name) { warn(`${label}: no name — skipped.`); return; }
      if (!truthy(r.available ?? "", true)) return; // hidden on purpose
      const catRaw = clean(r.category, 40); let cat = catIds.get(slugify(catRaw)) ?? catIds.get("name:" + catRaw.toLowerCase());
      if (!cat && !catTab) cat = addCategory(slugify(catRaw), catRaw, false); // no Categories tab: derive from products
      if (!cat) { warn(`${label} (${name}): category "${catRaw}" isn't in the Categories tab — skipped.`); return; }
      // sizes + prices
      const pairs: Variant[] = [];
      for (let n = 1; n <= LIMITS.sizes; n++) {
        const lab = clean(r[`size_${n}`], 30); const priceRaw = (r[`price_${n}`] ?? "").trim();
        if (!priceRaw) { if (lab) warn(`${label} (${name}): size_${n} "${lab}" has no price — ignored.`); continue; }
        const price = parsePrice(priceRaw);
        if (price === undefined) { warn(`${label} (${name}): price_${n} "${clean(priceRaw, 20)}" isn't a whole rupee amount — ignored.`); continue; }
        pairs.push(lab ? { label: lab, price } : { price });
      }
      let variants = pairs;
      if (pairs.length > 1) { const labelled = pairs.filter((p) => p.label); if (labelled.length !== pairs.length) warn(`${label} (${name}): when a product has several prices every size needs a label — unlabelled prices ignored.`); variants = labelled; }
      const seen = new Set<string>(); variants = variants.filter((v) => (seen.has(v.label ?? "") ? false : (seen.add(v.label ?? ""), true)));
      if (!variants.length) { warn(`${label} (${name}): no valid price — skipped.`); return; }
      // text
      const ingRaw = clean(r.ingredients, 300); const parts = ingRaw ? (ingRaw.includes("|") ? ingRaw.split("|") : ingRaw.split(",")) : [];
      const notes = parts.map((p) => clean(p, 40)).filter(Boolean).slice(0, LIMITS.ingredients);
      const description = clean(r.description, 300) || undefined;
      // image
      let image: ProductImage | undefined;
      const file = (r.image ?? "").trim();
      if (file) {
        const info = /^[A-Za-z0-9._-]{1,100}$/.test(file) ? manifest[file] : undefined;
        if (info) image = { src: `/products/${file}`, width: info.width, height: info.height, alt: clean(r.image_alt, 160) || name, photo: !info.alpha };
        else warn(`${label} (${name}): image "${clean(file, 50)}" wasn't found in public/products — shown without a photo.`);
      }
      let slug = slugify(name) || `product-${row}`; if (usedSlugs.has(slug)) { let k = 2; while (usedSlugs.has(`${slug}-${k}`)) k++; slug = `${slug}-${k}`; }
      usedSlugs.add(slug);
      products.push({ slug, name, category: cat.id, notes, ...(description ? { description } : {}), variants, ...(image ? { image } : {}) });
    });
  }
  const finalProducts = products;

  // ---- finish categories: drop empty ones; make sure something is featured on the home page
  const usedCats = categories.filter((c) => finalProducts.some((p) => p.category === c.id));
  for (const c of categories) if (!usedCats.includes(c) && catTab) warn(`Categories: "${c.name}" has no products — hidden.`);
  if (usedCats.length && !usedCats.some((c) => c.featured)) usedCats[0].featured = true;

  // ---- Order notes
  let orderNotes: OrderNote[] = fallback?.orderNotes ?? [];
  const noteTab = objects(tabs.ordernotes, ["heading", "line"]);
  if (tabs.ordernotes && !noteTab) warn("OrderNotes tab: header row must contain 'heading' and 'line' — using the built-in notes.");
  if (noteTab) {
    const groups: OrderNote[] = [];
    for (const r of noteTab.list) {
      const h = clean(r.heading, 60); const line = clean(r.line, 600);
      if (h) { if (groups.length >= LIMITS.noteGroups) break; groups.push({ title: h, lines: [] }); }
      if (line && groups.length) { const g = groups[groups.length - 1]; if (g.lines.length < LIMITS.noteLines) g.lines.push(line); }
    }
    const good = groups.filter((g) => g.lines.length);
    if (good.length) orderNotes = good; else warn("OrderNotes tab has no usable rows — using the built-in notes.");
  }

  const data: SiteData = { settings, content, categories: usedCats, products: finalProducts, orderNotes, source: "sheet" };
  if (!finalProducts.length) return { data, warnings, fatal: "The Products tab has no valid products." };
  if (!settings.whatsappNumber) return { data, warnings, fatal: "No valid WhatsApp number in Settings." };
  return { data, warnings };
}
