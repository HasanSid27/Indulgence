/** Shapes of everything the site displays. The values come from the spreadsheet (see sheet.ts). */

export interface Variant {
  /** e.g. "300g / 2pc". Omitted when a product has a single, unlabelled price. */
  label?: string;
  price: number;
}

export interface ProductImage {
  src: string;
  width: number;
  height: number;
  alt: string;
  /** A full studio photograph (shown in a rounded frame) as opposed to a transparent cut-out. */
  photo: boolean;
}

export interface Product {
  slug: string;
  name: string;
  category: string;
  /** Key ingredients (brownies are described this way). */
  notes: string[];
  /** A sentence of description (tea cakes, bundt cakes). */
  description?: string;
  variants: Variant[];
  image?: ProductImage;
}

export interface Category {
  id: string;
  name: string;
  /** Shown as a full chapter on the home page. */
  featured: boolean;
}

export interface SiteSettings {
  /** Country code + number, digits only (used for every WhatsApp link). */
  whatsappNumber: string;
  phoneDisplay: string;
  instagramHandle: string;
  instagramUrl: string;
  city: string;
  region: string;
  descriptor: string;
  address: string | null;
  email: string | null;
  /** Where the "Download menu PDF" buttons point. */
  menuPdfUrl: string;
  menuPdfIsExternal: boolean;
}

export interface SiteContent {
  heroTagline: string;
  heroLabelLeft: string;
  heroLabelRight: string;
  introLine1: string;
  introLine2: string;
  introParagraph: string;
  statements: string[];
  purposeLead: string;
  purposeParagraph: string;
  finalHeadline: string;
  finalNote: string;
  menuIntro: string;
  menuPreviewHeading: string;
  menuPreviewText: string;
  footerNote: string;
}

export interface OrderNote {
  title: string;
  lines: string[];
}

export interface SiteData {
  settings: SiteSettings;
  content: SiteContent;
  categories: Category[];
  products: Product[];
  orderNotes: OrderNote[];
  /** Where this data came from. */
  source: "sheet" | "default";
}

/** The raw spreadsheet tabs: rows of text cells, header row first. */
export interface SheetTabs {
  settings?: string[][];
  content?: string[][];
  categories?: string[][];
  products?: string[][];
  ordernotes?: string[][];
}

export interface BuildResult {
  data: SiteData;
  /** Human-readable problems found in the sheet (rows skipped, values replaced…). */
  warnings: string[];
  /** Set when the sheet can't be used at all (e.g. no valid products). */
  fatal?: string;
}
