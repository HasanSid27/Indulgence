import type { Metadata, Viewport } from "next";
import { League_Spartan, Inter, Poppins } from "next/font/google";
import "./globals.css";
import { config } from "@/lib/config";
import { getSiteData } from "@/lib/data";
import { listJoin, plural } from "@/lib/format";
import { DataProvider } from "@/components/site/DataProvider";
import SmoothScrollProvider from "@/components/site/SmoothScrollProvider";
import { PageTransitionProvider } from "@/components/site/PageTransition";
import ScrollAnimations from "@/components/site/ScrollAnimations";
import Header from "@/components/site/Header";
import Loader from "@/components/site/Loader";
import Cursor from "@/components/site/Cursor";
import { CartProvider } from "@/components/site/CartProvider";
import CartBar from "@/components/site/CartBar";

const display = League_Spartan({ variable: "--font-display", subsets: ["latin"], weight: ["500", "600", "700"], display: "swap" });
const sans = Inter({ variable: "--font-sans", subsets: ["latin"], display: "swap" });
const label = Poppins({ variable: "--font-label", subsets: ["latin"], weight: ["400", "500", "600"], display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const { settings, categories } = await getSiteData();
  const lead = plural((categories.find((c) => c.featured) ?? categories[0])?.name ?? "Desserts");
  const title = `iNdulgence — Premium ${lead} & Dessert Studio in ${settings.city}`;
  const description = `iNdulgence is a small-batch dessert studio in ${settings.city} crafting ${listJoin(categories.map((c) => plural(c.name).toLowerCase()))} with care and precision. A portion of every order nourishes stray animals. Order on WhatsApp.`;
  return {
    metadataBase: new URL(config.url),
    title: { default: title, template: "%s | iNdulgence" },
    description,
    applicationName: "iNdulgence",
    keywords: ["iNdulgence", "premium desserts", `${lead.toLowerCase()} in ${settings.city}`, `desserts in ${settings.city}`, `dessert studio ${settings.city}`, ...categories.map((c) => c.name.toLowerCase())],
    alternates: { canonical: "/" },
    openGraph: { type: "website", siteName: "iNdulgence", title, description, url: "/", locale: "en_IN" },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#8d1a1c",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const data = await getSiteData();
  const { settings, categories } = data;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Bakery",
    name: "iNdulgence",
    description: `Small-batch dessert studio in ${settings.city}.`,
    url: config.url,
    image: `${config.url}/opengraph-image`,
    telephone: `+${settings.whatsappNumber}`,
    address: { "@type": "PostalAddress", addressLocality: settings.city, addressRegion: settings.region, addressCountry: config.country, ...(settings.address ? { streetAddress: settings.address } : {}) },
    areaServed: settings.city,
    sameAs: [settings.instagramUrl],
    hasMenu: `${config.url}/menu`,
    currenciesAccepted: "INR",
    ...(settings.email ? { email: settings.email } : {}),
    servesCuisine: categories.map((c) => c.name),
  };
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${label.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:bg-paper focus:px-4 focus:py-3 focus:text-burgundy"
        >
          Skip to content
        </a>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
        <DataProvider data={data}>
          <SmoothScrollProvider>
          <PageTransitionProvider>
            <Loader />
            <CartProvider>
              <Header />
            <main id="main">{children}</main>
            <ScrollAnimations />
            <CartBar />
              <Cursor />
            </CartProvider>
          </PageTransitionProvider>
        </SmoothScrollProvider>
        </DataProvider>
      </body>
    </html>
  );
}
