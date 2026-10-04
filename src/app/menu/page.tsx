import type { Metadata } from "next";
import MenuHero from "@/components/site/MenuHero";
import MenuNav from "@/components/site/MenuNav";
import MenuCategory from "@/components/site/MenuCategory";
import OrderNotes from "@/components/site/OrderNotes";
import OrderCTA from "@/components/site/OrderCTA";
import Footer from "@/components/site/Footer";
import Button from "@/components/site/Button";
import { config } from "@/lib/config";
import { getSiteData } from "@/lib/data";
import { listJoin, plural, productsIn } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  const { categories, products } = await getSiteData();
  const kinds = categories.map((c) => plural(c.name));
  const description = `The complete iNdulgence menu — ${listJoin(kinds.map((k) => k.toLowerCase()))}. ${products.length} flavours with sizes and prices. Order on WhatsApp.`;
  const shortDescription = `${listJoin(kinds)} — every flavour, size and price. Order on WhatsApp.`;
  return {
    title: `Menu — ${kinds.slice(0, -1).join(", ")}${kinds.length > 1 ? " & " : ""}${kinds[kinds.length - 1]}`,
    description,
    alternates: { canonical: "/menu" },
    openGraph: {
      title: "The iNdulgence Menu",
      description: shortDescription,
      url: "/menu",
      type: "website",
      siteName: "iNdulgence",
      locale: "en_IN",
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "iNdulgence — small-batch dessert studio" }],
    },
    twitter: { card: "summary_large_image", title: "The iNdulgence Menu", description: shortDescription, images: ["/opengraph-image"] },
  };
}

export default async function MenuPage() {
  const { categories, products, settings } = await getSiteData();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: "iNdulgence Menu",
    url: `${config.url}/menu`,
    hasMenuSection: categories.map((c) => ({
      "@type": "MenuSection",
      name: c.name,
      hasMenuItem: productsIn(products, c.id).map((p) => ({
        "@type": "MenuItem",
        name: p.name,
        description: p.description ?? p.notes.join(", "),
        ...(p.image ? { image: `${config.url}${p.image.src}` } : {}),
        offers: p.variants.map((v) => ({
          "@type": "Offer",
          price: v.price,
          priceCurrency: "INR",
          ...(v.label ? { name: v.label } : {}),
        })),
      })),
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <MenuHero />
      <div data-theme="light">
        <MenuNav />
        {categories.map((c, i) => (
          <MenuCategory key={c.id} category={c} items={productsIn(products, c.id)} index={i} />
        ))}
        <div className="px-[var(--gutter)] pb-8 text-center" data-fade>
          <Button href={settings.menuPdfUrl} variant="outline" download external={settings.menuPdfIsExternal}>Download menu PDF</Button>
        </div>
        <OrderNotes />
      </div>
      <div data-theme="dark">
        <OrderCTA />
        <Footer />
      </div>
    </>
  );
}
