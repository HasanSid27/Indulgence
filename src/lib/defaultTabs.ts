/**
 * The built-in menu, written as the SAME table rows the spreadsheet contains. It is used
 *  - as the fallback when no sheet is connected (or the sheet can't be read), and
 *  - to generate the Excel template (menu-data/INdulgence-menu-data.xlsx), so the two always agree.
 * Last synced with: INdulgence Menu (final) PDF.
 */
import type { SheetTabs } from "./types";

export const defaultTabs: Required<SheetTabs> = {
  settings: [
    ["key", "value", "notes"],
    ["whatsapp_number", "919214446459", "Country code + number, digits only. Every Order on WhatsApp button uses this."],
    ["phone_display", "+91-9214446459", "How the phone number is shown in the footer and menu."],
    ["instagram_handle", "indulgen_ce", "Without the @."],
    ["city", "Kanpur", "Shown on the first screen and in search results."],
    ["region", "Uttar Pradesh", "Shown in the footer."],
    ["descriptor", "Small-batch dessert studio", "Small label at the top left of the first screen."],
    ["address", "", "Optional. Leave empty to show city and region only."],
    ["email", "", "Optional."],
    ["menu_pdf_url", "", "Your menu PDF. Paste a Google Drive share link (Anyone with the link → Viewer). Leave empty to use the PDF bundled with the website."],
  ],
  content: [
    ["key", "text", "where it appears"],
    ["hero_tagline", "Every bite, made to devour.", "First screen, under the logo."],
    ["hero_label_left", "Menu · Brownies · Cakes", "First screen, bottom left."],
    ["hero_label_right", "Made to order", "First screen, bottom right."],
    ["intro_line_1", "Small batches.", "Second screen, headline line 1."],
    ["intro_line_2", "Serious indulgence.", "Second screen, headline line 2."],
    ["intro_paragraph", "iNdulgence is a small-batch dessert studio, devoted to crafting treats shaped by care, precision, and an unwavering commitment to quality.", "Second screen, paragraph."],
    ["statement_1", "Crafted slowly.", "The two full-screen statements. Add statement_3 / statement_4 rows if you want more (up to 4)."],
    ["statement_2", "Made with intention.", ""],
    ["purpose_lead", "A portion of every order is devoted to nourishing and caring for stray animals.", "Purpose section headline."],
    ["purpose_paragraph", "Inspired by the love our beloved cats, Mylo & Alexa, left behind — and the lesson their tenderness taught us: every life deserves compassion and dignity.", "Purpose section paragraph."],
    ["menu_intro", "Every bite, made to devour. Add your favourites, then send the whole list to us on WhatsApp.", "Top of the menu page."],
    ["menu_preview_heading", "Everything we make.", "Home page, above the three category tiles."],
    ["menu_preview_text", "Brownies, tea cakes and bundt cakes — each with its flavours, sizes and prices.", "Home page, under that heading."],
    ["final_headline", "Indulge with intention.", "Last screen headline."],
    ["final_note", "Freshly prepared to order · 24 hours’ advance notice · 100% payment on confirmation · No COD", "Small line under the last headline."],
    ["footer_note", "A portion of every order nourishes stray animals.", "Footer, bottom right."],
  ],
  categories: [
    ["id", "name", "featured_on_home"],
    ["brownie", "Brownie", "yes"],
    ["tea-cake", "Tea Cake", "no"],
    ["bundt-cake", "Bundt Cake", "no"],
  ],
  products: [
    ["category", "name", "ingredients", "description", "image", "image_alt", "size_1", "price_1", "size_2", "price_2", "size_3", "price_3", "available"],
    ["brownie", "The Original Indulgence", "Brown butter | Brown sugar | Chocolate chunks", "", "original-indulgence-photo.webp", "The Original Indulgence brownie with melted chocolate chunks and a crackled top", "450g / 4pc", "599", "", "", "", "", "yes"],
    ["brownie", "The Biscoff Reverie", "Brown butter | Brown sugar | Biscoff", "", "biscoff-reverie-photo.webp", "The Biscoff Reverie brownie topped with a Lotus Biscoff biscuit over a caramelised Biscoff layer", "300g / 2pc", "549", "600g / 4pc", "949", "", "", "yes"],
    ["brownie", "The Rocher Reserve", "Nutella | Ferrero Rocher | Brown butter", "", "rocher-reserve-photo.webp", "The Rocher Reserve brownie crowned with a Ferrero Rocher over a Nutella layer", "300g / 2pc", "649", "600g / 4pc", "1049", "", "", "yes"],
    ["brownie", "The Nutty Elite", "Pistachio filling | Pistachio | Chocolate chunks", "", "nutty-elite-photo.webp", "The Nutty Elite brownie with a pistachio filling and crushed pistachio on top", "300g / 2pc", "749", "600g / 4pc", "1299", "", "", "yes"],
    ["tea-cake", "Vanilla Tea Cake", "", "Delicately buttery, softly vanilla, effortlessly refined.", "vanilla-tea-cake.webp", "Sliced vanilla tea cake loaf with a golden crust", "", "299", "", "", "", "", "yes"],
    ["tea-cake", "Chocolate Tea Cake", "", "Richly chocolatey, tender, with pockets of indulgent chocolate.", "chocolate-tea-cake.webp", "Sliced chocolate tea cake loaf", "", "399", "", "", "", "", "yes"],
    ["tea-cake", "Marble Tea Cake", "", "A graceful swirl of vanilla and chocolate, with pockets of chocolate throughout.", "marble-tea-cake.webp", "Sliced marble tea cake loaf with chocolate and vanilla swirls", "", "449", "", "", "", "", "yes"],
    ["bundt-cake", "Vanilla Bundt Cake", "", "A delicate vanilla crumb, rich with buttery warmth and a graceful finish.", "vanilla-bundt-cake.webp", "Vanilla bundt cake with a golden crust", "", "699", "", "", "", "", "yes"],
    ["bundt-cake", "Chocolate Bundt Cake", "", "An intensely chocolatey crumb, layered with pockets of Nutella and Chocolate chunks.", "chocolate-bundt-cake.webp", "Chocolate bundt cake", "", "799", "", "", "", "", "yes"],
    ["bundt-cake", "Marble Bundt Cake", "", "Velvety vanilla and rich chocolate, beautifully balanced with swirls of Nutella and Chocolate chunks.", "marble-bundt-cake.webp", "Marble bundt cake with chocolate and vanilla swirls", "", "899", "", "", "", "", "yes"],
  ],
  ordernotes: [
    ["heading", "line"],
    ["Orders", "All orders are freshly prepared and require at least 24 hours’ advance notice."],
    ["", "Orders are subject to availability and are confirmed only once full payment has been received."],
    ["", "For larger or customised orders, additional notice may be required."],
    ["Payment", "100% payment is required at the time of order confirmation."],
    ["", "An order is considered confirmed only after the full payment has been received."],
    ["", "No COD available."],
    ["Brownies", "Brownies are available in boxes of 2 pieces or 4 pieces as per the product description."],
    ["", "Individual brownies are not available for order."],
    ["Delivery & Pickup", "Deliveries are arranged through third-party delivery partners such as Porter or Swiggy."],
    ["", "Delivery charges are calculated based on the distance and mode of transport and are borne by the customer."],
    ["", "Pickup can also be arranged by the customer from the designated pickup location."],
    ["", "Once an order has been handed over to the delivery partner, iNdulgence is not liable for any delays, mishandling, damage, loss, or discrepancies arising during transit. Any delivery-related concerns should be taken up with the respective delivery partner."],
    ["Please note", "All orders are subject to availability."],
    ["", "By placing an order, the customer acknowledges and agrees to the above policies."],
  ],
};
