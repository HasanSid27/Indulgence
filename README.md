# iNdulgence

Premium small-batch dessert studio website — Next.js 16 (App Router), TypeScript, Tailwind CSS v4, GSAP + ScrollTrigger, Lenis.
Orders are placed on WhatsApp; there is no checkout, login or database.

## Editing prices, products, texts and the menu PDF (no code)

Everything you might want to change lives in **one spreadsheet**: `menu-data/INdulgence-menu-data.xlsx`
(products, prices, sizes, descriptions, categories, WhatsApp number, phone, Instagram, order notes, page headlines, and the link to the menu PDF).

**Connect it once (≈ 5 minutes)**

1. Upload `INdulgence-menu-data.xlsx` to your Google Drive → right-click → **Open with → Google Sheets** (this converts it to a real Google Sheet).
2. **Share → General access → Anyone with the link → Viewer.**
3. Copy the sheet's address (`https://docs.google.com/spreadsheets/d/…/edit`).
4. In **Netlify → Site configuration → Environment variables** add `SHEET_URL` = that address, then redeploy once.
5. Open `https://YOUR-SITE/sheet-check` — it says *Connected and valid*, or lists exactly which row/cell has a problem.

From then on: **edit the sheet, wait ~5 minutes, the live site updates** (no redeploy). The first request after the interval still shows the old page while the new one is prepared; the next shows the new one.

**Menu PDF:** put your Google Drive share link (Anyone with the link → Viewer) in the sheet's *Settings → menu_pdf_url*. Leave it empty to use `public/indulgence-menu.pdf`.

**Safety net:** if the sheet is unreachable, unshared, deleted or damaged, the site keeps serving the last good version (during a build it falls back to the menu built into the code). A broken sheet can never take the website down. Bad rows are skipped and reported on `/sheet-check`.

### The tabs

| Tab | What it controls |
| --- | --- |
| **Settings** | `whatsapp_number` (country code + number), `phone_display`, `instagram_handle`, `city`, `region`, `descriptor`, optional `address` / `email`, `menu_pdf_url` |
| **Content** | headlines and paragraphs (hero tagline, intro, the 2–4 full-screen statements, purpose section, menu intro, last-screen headline, footer note, the standard small note under every product — `product_note`, default “(contains eggs)”, `none` hides it — …) |
| **Categories** | `id`, `name`, `featured_on_home` — featured categories' products become the full-screen chapters on the home page |
| **Products** | `category`, `name`, `ingredients` (separate with `\|`), `description`, `image` (file name), `image_alt`, up to 3 `size_n` / `price_n` pairs, `available` (yes/no hides a product), optional `note` (small line under the description; blank = the standard note, `none` = hide) |
| **OrderNotes** | policy notes under the menu (heading on the first row of a group, blank heading on the rows that follow) |

Rules: prices are whole rupees (`599`, `₹1,299` both fine); a product with several prices needs a label for each size; up to 60 products, 8 categories. Long text is shortened; everything is treated as plain text.

**Photos:** the `image` column holds the file name of a picture in `public/products/` (e.g. `marble-tea-cake.webp`). To use a **new** photo, add the file to `public/products/` and redeploy once (the image sizes are recorded automatically by `scripts/image-manifest.mjs` before every build/dev run); then type its name in the sheet. A product without a photo still works and shows a tidy placeholder.

Renaming a product changes its web address anchor and removes it from visitors' saved order lists — that's expected.

### Environment variables (Netlify)

| Variable | Purpose |
| --- | --- |
| `SHEET_URL` | the Google Sheet address (see above). Unset = use the built-in menu |
| `SHEET_REVALIDATE_SECONDS` | how often the site re-reads the sheet (default 300, minimum 60) |
| `NEXT_PUBLIC_SITE_URL` | the public address of the site (search-engine links, share cards) |

See `.env.example`. Only Google Sheets addresses are accepted for `SHEET_URL`.

## Run locally

```bash
npm install
npm run dev                        # development (set SHEET_URL in .env.local to preview your sheet)
npm run build && npm run start     # production build
```

## How ordering works

* Every product shows an **Order on WhatsApp** button (prefilled message for that product).
* On `/menu` visitors **Add** items to an order list (quantities, sizes), review it in a slide-up panel and send **one** WhatsApp message listing every item with its amount and the total, or copy the text.
* The list lives only in the visitor's own browser (`localStorage`, expires after 24 h, max 20 per item). Nothing is sent to a server, so different visitors/devices can never see or merge each other's orders; each order arrives as its own WhatsApp chat from the customer's number. Prices in the message are always taken from the menu, never from the browser.
* WhatsApp always requires the customer to tap **Send** — a website can't send the message for them.

## Deploy to Netlify

`netlify.toml` is included. Connect the repository (build command `npm run build`; Netlify's Next.js runtime is detected automatically), set the environment variables above. Pages refresh from the sheet in the background (Incremental Static Regeneration).

Security headers (strict Content-Security-Policy, no framing, HTTPS-only, restricted browser permissions) are set in `next.config.ts`.

## Project layout

```
menu-data/          the Excel template for the sheet
src/app             pages (home, /menu, /sheet-check), metadata, sitemap, robots, share image
src/components/site all UI components
src/lib             sheet.ts (parsing + validation), data.ts (fetching + safety net), defaultTabs.ts (built-in menu),
                    cart.ts (order list), whatsapp.ts (links + messages), types.ts, format.ts
scripts/            image-manifest.mjs
public/products     product photography    public/brand  logo + artwork
```

`src/lib/defaultTabs.ts` is the built-in menu, written as the same table rows the sheet contains — it is both the fallback and the source of the Excel template.

Animations are declared with data attributes (`data-fade`, `data-split`, `data-scrub-draw`, …) and driven by `src/components/site/ScrollAnimations.tsx`. All motion is disabled for visitors who prefer reduced motion.
